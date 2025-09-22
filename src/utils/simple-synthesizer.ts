import { InstrumentDefinition, instruments } from '../interfaces/instrument-definitions';

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

  constructor() {
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.activeNotes = new Map();
    this.channelGains = new Map();
    this.programs = new Map();
    this.pitchBendValues = new Map();
    this.sustainPedals = new Map();

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
    }
  }

  public programChange(channel: number, program: number): void {
    this.programs.set(channel, program);
    // In futuro qui potremmo cambiare il tipo di oscillatore o aggiungere effetti
    // basati sul program number
  }

  public pitchBend(channel: number, value: number): void {
    // value va da -8192 a +8191
    this.pitchBendValues.set(channel, value);
    const semitones = (value / 8192) * 2; // ±2 semitoni di range

    // Applica il pitch bend a tutte le note attive sul canale
    this.activeNotes.get(channel)?.forEach((components, note) => {
      const baseFreq = 440 * Math.pow(2, (note - 69) / 12);
      const newFreq = baseFreq * Math.pow(2, semitones / 12);

      components.oscillators.forEach(osc => {
        osc.frequency.setValueAtTime(newFreq, this.ctx.currentTime);
      });
    });
  }

  public controlChange(channel: number, controller: number, value: number): void {
    switch (controller) {
      case 7: // Volume
        const channelGain = this.channelGains.get(channel);
        if (channelGain) {
          channelGain.gain.setValueAtTime(value / 127, this.ctx.currentTime);
        }
        break;

      case 64: // Sustain pedal
        this.sustainPedals.set(channel, value >= 64);
        break;

      // Altri controller possono essere aggiunti qui
    }
  }

  public channelAftertouch(channel: number, pressure: number): void {
    // Applica l'aftertouch a tutte le note attive sul canale
    this.activeNotes.get(channel)?.forEach((components) => {
      components.gain.gain.setValueAtTime(pressure / 127, this.ctx.currentTime);
    });
  }

  private getInstrumentDefinition(program: number): InstrumentDefinition {
    // Cerca la definizione dello strumento più vicina
    let currentProgram = program;
    while (currentProgram >= 0 && !instruments[currentProgram]) {
      currentProgram--;
    }
    return instruments[currentProgram] || instruments[0]; // Fallback su piano se non trovato
  }

  private createOscillator(frequency: number, type: OscillatorType, detune: number = 0): OscillatorNode {
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
    // Converti nota MIDI in frequenza (A4 = nota 69 = 440Hz)
    const frequency = 440 * Math.pow(2, (note - 69) / 12);

    // Prendi la definizione dello strumento per questo canale
    const program = this.programs.get(channel) || 0;
    const instrument = this.getInstrumentDefinition(program);

    // Crea il nodo per il guadagno dell'inviluppo
    const envelope = this.ctx.createGain();
    envelope.gain.setValueAtTime(0, this.ctx.currentTime);

    // Crea il nodo per il guadagno della velocity
    const gain = this.ctx.createGain();
    const velocityGain = Math.pow(velocity / 127, 2); // Risposta quadratica per la velocity
    gain.gain.setValueAtTime(velocityGain, this.ctx.currentTime);

    // Crea gli oscillatori
    const oscillators: OscillatorNode[] = [];

    // Oscillatore principale
    const mainOsc = this.createOscillator(frequency, instrument.oscillatorType);
    oscillators.push(mainOsc);

    // Aggiungi le armoniche se definite
    if (instrument.harmonics) {
      for (const harmonic of instrument.harmonics) {
        const harmonicOsc = this.createOscillator(
          frequency * harmonic.ratio,
          harmonic.type
        );
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
        filterEnvelope.gain.linearRampToValueAtTime(filterEnv.sustain, now + filterEnv.attack + filterEnv.decay);

        // Connetti l'envelope del filtro alla frequenza del filtro
        filterEnvelope.connect(filter.frequency);

        // Imposta la modulazione del filtro
        const baseFreq = instrument.filter.frequency;
        const modAmount = filterEnv.amount * baseFreq;
        filter.frequency.setValueAtTime(baseFreq + modAmount * filterEnv.sustain, this.ctx.currentTime);
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
              oscillators.forEach(osc => {
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
    oscillators.forEach(osc => osc.start());

    // Memorizza i componenti della nota
    this.activeNotes.get(channel)?.set(note, {
      oscillators,
      gain,
      envelope,
      filter,
      filterEnvelope,
      lfoOscillator,
      lfoGains
    });
  }

  public noteOff(channel: number, note: number): void {
    const noteComponents = this.activeNotes.get(channel)?.get(note);

    if (noteComponents) {
      // Se il sustain è attivo, mantieni la nota
      if (this.sustainPedals.get(channel)) {
        return;
      }

      const now = this.ctx.currentTime;
      const program = this.programs.get(channel) || 0;
      const instrument = this.getInstrumentDefinition(program);

      // Applica il release dell'inviluppo
      noteComponents.envelope.gain.setValueAtTime(
        noteComponents.envelope.gain.value,
        now
      );
      noteComponents.envelope.gain.linearRampToValueAtTime(
        0,
        now + instrument.envelope.release
      );

      // Applica il release del filtro se presente
      if (noteComponents.filterEnvelope && instrument.filter?.envelope) {
        noteComponents.filterEnvelope.gain.setValueAtTime(
          noteComponents.filterEnvelope.gain.value,
          now
        );
        noteComponents.filterEnvelope.gain.linearRampToValueAtTime(
          0,
          now + instrument.filter.envelope.release
        );
      }

      // Schedula lo stop degli oscillatori e del LFO
      setTimeout(() => {
        noteComponents.oscillators.forEach(osc => osc.stop());
        if (noteComponents.lfoOscillator) {
          noteComponents.lfoOscillator.stop();
        }
        this.activeNotes.get(channel)?.delete(note);
      }, instrument.envelope.release * 1000 + 50); // Aggiungi un piccolo margine
    }
  }

  public allNotesOff(): void {
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
}
