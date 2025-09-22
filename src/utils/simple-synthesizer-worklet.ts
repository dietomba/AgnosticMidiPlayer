import { InstrumentDefinition, instruments } from '../interfaces/instrument-definitions';
import { ControllerType } from '../interfaces/midi-event-types';

interface NoteComponents {
  oscillators: OscillatorNode[];
  gain: GainNode;
  envelope: GainNode;
  filter?: BiquadFilterNode;
  filterEnvelope?: GainNode;
  lfoOscillator?: OscillatorNode;
  lfoGains?: Map<string, GainNode>;
}

export class SimpleSynthesizer {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private activeNotes: Map<number, Map<number, NoteComponents>>;
  private channelGains: Map<number, GainNode>;
  private programs: Map<number, number>;
  private pitchBendValues: Map<number, number>;
  private sustainPedals: Map<number, boolean>;
  // Bank Select support
  private bankSelectMSB: Map<number, number>; // CC0 values per channel
  private bankSelectLSB: Map<number, number>; // CC32 values per channel
  private currentBanks: Map<number, number>; // Current bank number per channel

  // AudioWorklet support
  private useAudioWorklet: boolean = false;
  private workletNode: AudioWorkletNode | null = null;
  private workletLoaded: boolean = false;

  constructor() {
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.activeNotes = new Map();
    this.channelGains = new Map();
    this.programs = new Map();
    this.pitchBendValues = new Map();
    this.sustainPedals = new Map();
    this.bankSelectMSB = new Map();
    this.bankSelectLSB = new Map();
    this.currentBanks = new Map();

    // Inizializza le mappe per ogni canale MIDI
    for (let channel = 0; channel < 16; channel++) {
      this.activeNotes.set(channel, new Map());

      // Inizializza i controlli per canale
      const channelGain = this.ctx.createGain();
      channelGain.connect(this.masterGain);
      this.channelGains.set(channel, channelGain);

      this.programs.set(channel, 0); // Program 0 è il default (piano)
      this.pitchBendValues.set(channel, 0); // 0 = no pitch bend
      this.sustainPedals.set(channel, false); // Sustain off

      // Inizializza Bank Select
      this.bankSelectMSB.set(channel, 0); // Bank 0 MSB (General MIDI)
      this.bankSelectLSB.set(channel, 0); // Bank 0 LSB
      this.currentBanks.set(channel, 0); // Bank 0 (General MIDI)
    }

    // Prova a inizializzare AudioWorklet
    this.initializeAudioWorklet();
  }

  private async initializeAudioWorklet(): Promise<void> {
    try {
      // Verifica il supporto per AudioWorklet
      if (!this.ctx.audioWorklet) {
        // eslint-disable-next-line no-console
        console.info('AudioWorklet non supportato, uso fallback con nodi standard');
        this.useAudioWorklet = false;
        return;
      }

      // Carica il modulo AudioWorklet
      const workletPath = new URL('./synthesizer-worklet.js', import.meta.url).href;
      await this.ctx.audioWorklet.addModule(workletPath);

      // Crea il nodo AudioWorklet
      this.workletNode = new AudioWorkletNode(this.ctx, 'synthesizer-worklet', {
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: [2], // Stereo output
      });

      // Connetti il worklet al master gain
      this.workletNode.connect(this.masterGain);

      this.workletLoaded = true;
      this.useAudioWorklet = true;
      // eslint-disable-next-line no-console
      console.info('AudioWorklet inizializzato con successo');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Errore nel caricamento AudioWorklet, uso fallback:', error);
      this.useAudioWorklet = false;
      this.workletNode = null;
    }
  }

  public async waitForWorkletReady(): Promise<void> {
    // Aspetta che l'AudioWorklet sia pronto o fallisca
    let attempts = 0;
    const maxAttempts = 50; // 5 secondi max

    // eslint-disable-next-line no-await-in-loop
    while (attempts < maxAttempts && !this.workletLoaded && this.ctx.audioWorklet) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 100);
      });
      attempts++;
    }
  }

  private sendToWorklet(message: { type: string; [key: string]: unknown }): void {
    if (this.useAudioWorklet && this.workletNode) {
      this.workletNode.port.postMessage(message);
    }
  }

  public programChange(channel: number, program: number): void {
    this.programs.set(channel, program);

    if (this.useAudioWorklet) {
      this.sendToWorklet({
        type: 'programChange',
        channel,
        program,
      });
    }
    // Il program change ora utilizzerà il bank corrente per determinare lo strumento finale
    // L'effettiva selezione dello strumento avviene in getInstrumentDefinition()
  }

  private updateCurrentBank(channel: number): void {
    // Calcola il bank number completo da MSB e LSB
    const msb = this.bankSelectMSB.get(channel) || 0;
    const lsb = this.bankSelectLSB.get(channel) || 0;
    const bank = (msb << 7) + lsb; // Combina MSB e LSB per il bank completo
    this.currentBanks.set(channel, bank);
  }

  public pitchBend(channel: number, value: number): void {
    // value va da -8192 a +8191
    this.pitchBendValues.set(channel, value);

    if (this.useAudioWorklet) {
      this.sendToWorklet({
        type: 'pitchBend',
        channel,
        value,
      });
    } else {
      // Logica originale per i nodi standard
      const semitones = (value / 8192) * 2; // ±2 semitoni di range

      // Applica il pitch bend a tutte le note attive sul canale
      this.activeNotes.get(channel)?.forEach((components, note) => {
        const baseFreq = 440 * 2 ** ((note - 69) / 12);
        const newFreq = baseFreq * 2 ** (semitones / 12);

        components.oscillators.forEach((osc) => {
          osc.frequency.setValueAtTime(newFreq, this.ctx.currentTime);
        });
      });
    }
  }

  public controlChange(channel: number, controller: number, value: number): void {
    switch (controller) {
      case ControllerType.BANK_SELECT_MSB: // CC0
        this.bankSelectMSB.set(channel, value);
        this.updateCurrentBank(channel);
        break;

      case ControllerType.MAIN_VOLUME: // CC7 - Volume
        if (this.useAudioWorklet) {
          this.sendToWorklet({
            type: 'controlChange',
            channel,
            controller,
            value,
          });
        } else {
          const channelGain = this.channelGains.get(channel);
          if (channelGain) {
            channelGain.gain.setValueAtTime(value / 127, this.ctx.currentTime);
          }
        }
        break;

      case ControllerType.BANK_SELECT_LSB: // CC32
        this.bankSelectLSB.set(channel, value);
        this.updateCurrentBank(channel);
        break;

      case ControllerType.SUSTAIN_PEDAL: // CC64 - Sustain pedal
        this.sustainPedals.set(channel, value >= 64);
        if (this.useAudioWorklet) {
          this.sendToWorklet({
            type: 'controlChange',
            channel,
            controller,
            value,
          });
        }
        break;

      // Altri controller possono essere aggiunti qui
      default:
        if (this.useAudioWorklet) {
          this.sendToWorklet({
            type: 'controlChange',
            channel,
            controller,
            value,
          });
        }
        // Per controller non gestiti, non facciamo nulla per ora
        break;
    }
  }

  public channelAftertouch(channel: number, pressure: number): void {
    if (this.useAudioWorklet) {
      this.sendToWorklet({
        type: 'channelAftertouch',
        channel,
        pressure,
      });
    } else {
      // Applica l'aftertouch a tutte le note attive sul canale
      this.activeNotes.get(channel)?.forEach((components) => {
        components.gain.gain.setValueAtTime(pressure / 127, this.ctx.currentTime);
      });
    }
  }

  private getInstrumentDefinition(channel: number): InstrumentDefinition {
    const program = this.programs.get(channel) || 0;
    const bank = this.currentBanks.get(channel) || 0;

    // Calcola l'ID dello strumento basato su bank e program
    // Per ora supportiamo solo la General MIDI (bank 0)
    // In futuro si possono aggiungere altri banchi (bank 1 = drum kits, ecc.)
    let instrumentId: number;

    if (bank === 0) {
      // Bank 0: General MIDI standard instruments
      instrumentId = program;
    } else if (bank === 128) {
      // Bank 128: Drum kits (Standard MIDI)
      // Per ora mappiamo tutto sui percussioni del program 0
      instrumentId = 0; // Fallback su piano per i drum kits non implementati
    } else {
      // Altri banchi non supportati, usa General MIDI
      instrumentId = program;
    }

    // Cerca la definizione dello strumento più vicina
    let currentProgram = instrumentId;
    while (currentProgram >= 0 && !instruments[currentProgram]) {
      currentProgram--;
    }
    return instruments[currentProgram] || instruments[0]; // Fallback su piano se non trovato
  }

  private createOscillator(
    frequency: number,
    type: OscillatorType,
    detune: number = 0,
  ): OscillatorNode {
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    if (detune !== 0) {
      osc.detune.setValueAtTime(detune, this.ctx.currentTime);
    }
    return osc;
  }

  private createFilter(filterDef: NonNullable<InstrumentDefinition['filter']>): BiquadFilterNode {
    const filter = this.ctx.createBiquadFilter();
    filter.type = filterDef.type;
    filter.frequency.setValueAtTime(filterDef.frequency, this.ctx.currentTime);
    filter.Q.setValueAtTime(filterDef.Q, this.ctx.currentTime);
    return filter;
  }

  private createLFO(lfoDef: NonNullable<InstrumentDefinition['lfo']>): {
    oscillator: OscillatorNode;
    gains: Map<string, GainNode>;
  } {
    const lfoOsc = this.ctx.createOscillator();
    lfoOsc.type = 'sine';
    lfoOsc.frequency.setValueAtTime(lfoDef.frequency, this.ctx.currentTime);

    const gains = new Map<string, GainNode>();

    for (const target of lfoDef.targets) {
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(lfoDef.amplitude * target.amount, this.ctx.currentTime);
      gains.set(target.parameter, lfoGain);
      lfoOsc.connect(lfoGain);
    }

    return { oscillator: lfoOsc, gains };
  }

  public noteOn(channel: number, note: number, velocity: number): void {
    if (this.useAudioWorklet) {
      this.sendToWorklet({
        type: 'noteOn',
        channel,
        note,
        velocity,
      });
      return;
    }

    // Logica originale per i nodi standard
    // Converti nota MIDI in frequenza (A4 = nota 69 = 440Hz)
    const frequency = 440 * 2 ** ((note - 69) / 12);

    // Prendi la definizione dello strumento per questo canale
    const instrument = this.getInstrumentDefinition(channel);

    // Crea il nodo per il guadagno dell'inviluppo
    const envelope = this.ctx.createGain();
    envelope.gain.setValueAtTime(0, this.ctx.currentTime);

    // Crea il nodo per il guadagno della velocity
    const gain = this.ctx.createGain();
    const velocityGain = (velocity / 127) ** 2; // Risposta quadratica per la velocity
    gain.gain.setValueAtTime(velocityGain, this.ctx.currentTime);

    // Crea gli oscillatori
    const oscillators: OscillatorNode[] = [];

    // Oscillatore principale
    const mainOsc = this.createOscillator(frequency, instrument.oscillatorType);
    oscillators.push(mainOsc);

    // Aggiungi le armoniche se definite
    if (instrument.harmonics) {
      for (const harmonic of instrument.harmonics) {
        const harmonicOsc = this.createOscillator(frequency * harmonic.ratio, harmonic.type);
        const harmonicGain = this.ctx.createGain();
        harmonicGain.gain.setValueAtTime(harmonic.gain * velocityGain, this.ctx.currentTime);

        harmonicOsc.connect(harmonicGain);
        harmonicGain.connect(gain);
        oscillators.push(harmonicOsc);
      }
    } else {
      // Se non ci sono armoniche, connetti l'oscillatore principale al gain
      mainOsc.connect(gain);
    }

    // Crea il filtro se definito
    let filter: BiquadFilterNode | undefined;
    let filterEnvelope: GainNode | undefined;
    if (instrument.filter) {
      filter = this.createFilter(instrument.filter);

      // Se c'è un envelope per il filtro, crealo
      if (instrument.filter.envelope) {
        filterEnvelope = this.ctx.createGain();
        filterEnvelope.gain.setValueAtTime(0, this.ctx.currentTime);

        // Applica l'envelope del filtro alla frequenza del filtro
        const now = this.ctx.currentTime;
        const filterEnv = instrument.filter.envelope;

        filterEnvelope.gain.setValueAtTime(0, now);
        filterEnvelope.gain.linearRampToValueAtTime(1, now + filterEnv.attack);
        filterEnvelope.gain.linearRampToValueAtTime(
          filterEnv.sustain,
          now + filterEnv.attack + filterEnv.decay,
        );

        // Connetti l'envelope del filtro alla frequenza del filtro
        filterEnvelope.connect(filter.frequency);

        // Imposta la modulazione del filtro
        const baseFreq = instrument.filter.frequency;
        const modAmount = filterEnv.amount * baseFreq;
        filter.frequency.setValueAtTime(
          baseFreq + modAmount * filterEnv.sustain,
          this.ctx.currentTime,
        );
      }

      gain.connect(filter);
      filter.connect(envelope);
    } else {
      gain.connect(envelope);
    }

    // Crea LFO se definito
    let lfoOscillator: OscillatorNode | undefined;
    let lfoGains: Map<string, GainNode> | undefined;
    if (instrument.lfo) {
      const lfo = this.createLFO(instrument.lfo);
      lfoOscillator = lfo.oscillator;
      lfoGains = lfo.gains;

      // Connetti il LFO ai vari parametri
      for (const target of instrument.lfo.targets) {
        const lfoGain = lfoGains.get(target.parameter);
        if (lfoGain) {
          switch (target.parameter) {
            case 'frequency':
              // Vibrato: modula la frequenza degli oscillatori
              oscillators.forEach((osc) => {
                lfoGain.connect(osc.frequency);
              });
              break;
            case 'gain':
              // Tremolo: modula l'ampiezza
              lfoGain.connect(gain.gain);
              break;
            case 'filter':
              // Filter sweep: modula la frequenza del filtro
              if (filter) {
                lfoGain.connect(filter.frequency);
              }
              break;
          }
        }
      }

      lfoOscillator.start();
    }

    // Connetti il tutto al canale
    envelope.connect(this.channelGains.get(channel) || this.masterGain);

    // Applica l'inviluppo ADSR
    const now = this.ctx.currentTime;
    const { attack, decay, sustain } = instrument.envelope;

    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(1, now + attack);
    envelope.gain.linearRampToValueAtTime(sustain, now + attack + decay);

    // Avvia tutti gli oscillatori
    oscillators.forEach((osc) => osc.start());

    // Memorizza i componenti della nota
    this.activeNotes.get(channel)?.set(note, {
      oscillators,
      gain,
      envelope,
      filter,
      filterEnvelope,
      lfoOscillator,
      lfoGains,
    });
  }

  public noteOff(channel: number, note: number): void {
    if (this.useAudioWorklet) {
      this.sendToWorklet({
        type: 'noteOff',
        channel,
        note,
      });
      return;
    }

    // Logica originale per i nodi standard
    const noteComponents = this.activeNotes.get(channel)?.get(note);

    if (noteComponents) {
      // Se il sustain è attivo, mantieni la nota
      if (this.sustainPedals.get(channel)) {
        return;
      }

      const now = this.ctx.currentTime;
      const instrument = this.getInstrumentDefinition(channel);

      // Applica il release dell'inviluppo
      noteComponents.envelope.gain.setValueAtTime(noteComponents.envelope.gain.value, now);
      noteComponents.envelope.gain.linearRampToValueAtTime(0, now + instrument.envelope.release);

      // Applica il release del filtro se presente
      if (noteComponents.filterEnvelope && instrument.filter?.envelope) {
        noteComponents.filterEnvelope.gain.setValueAtTime(
          noteComponents.filterEnvelope.gain.value,
          now,
        );
        noteComponents.filterEnvelope.gain.linearRampToValueAtTime(
          0,
          now + instrument.filter.envelope.release,
        );
      }

      // Schedula lo stop degli oscillatori e del LFO
      setTimeout(
        () => {
          noteComponents.oscillators.forEach((osc) => osc.stop());
          if (noteComponents.lfoOscillator) {
            noteComponents.lfoOscillator.stop();
          }
          this.activeNotes.get(channel)?.delete(note);
        },
        instrument.envelope.release * 1000 + 50,
      ); // Aggiungi un piccolo margine
    }
  }

  public allNotesOff(): void {
    if (this.useAudioWorklet) {
      this.sendToWorklet({
        type: 'allNotesOff',
      });
      return;
    }

    // Ferma tutte le note su tutti i canali
    for (let channel = 0; channel < 16; channel++) {
      const notes = this.activeNotes.get(channel);
      if (notes) {
        for (const note of notes.keys()) {
          this.noteOff(channel, note);
        }
      }
    }
  }

  public setVolume(value: number): void {
    this.masterGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.015);
  }

  public get audioContext(): AudioContext {
    return this.ctx;
  }

  public get isUsingAudioWorklet(): boolean {
    return this.useAudioWorklet;
  }

  // Debug methods for Bank Select
  public getBankInfo(channel: number): { msb: number; lsb: number; bank: number; program: number } {
    return {
      msb: this.bankSelectMSB.get(channel) || 0,
      lsb: this.bankSelectLSB.get(channel) || 0,
      bank: this.currentBanks.get(channel) || 0,
      program: this.programs.get(channel) || 0,
    };
  }

  public getAllBankInfo(): Map<
    number,
    { msb: number; lsb: number; bank: number; program: number }
  > {
    const info = new Map();
    for (let channel = 0; channel < 16; channel++) {
      info.set(channel, this.getBankInfo(channel));
    }
    return info;
  }

  // Metodo per forzare l'uso di AudioWorklet o fallback
  public async setUseAudioWorklet(use: boolean): Promise<void> {
    if (use && !this.useAudioWorklet && this.ctx.audioWorklet) {
      await this.initializeAudioWorklet();
    } else if (!use && this.useAudioWorklet) {
      this.useAudioWorklet = false;
      if (this.workletNode) {
        this.workletNode.disconnect();
        this.workletNode = null;
      }
    }
  }
}
