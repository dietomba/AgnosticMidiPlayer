import { InstrumentDefinition, instruments } from '../interfaces/instrument-definitions';

interface NoteComponents {
  oscillators: OscillatorNode[];
  gain: GainNode;
  envelope: GainNode;
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
    while (program >= 0 && !instruments[program]) {
      program--;
    }
    return instruments[program] || instruments[0]; // Fallback su piano se non trovato
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
        harmonicGain.connect(envelope);
        oscillators.push(harmonicOsc);
      }
    }
    
    // Connetti tutto insieme
    mainOsc.connect(gain);
    gain.connect(envelope);
    envelope.connect(this.channelGains.get(channel) || this.masterGain);
    
    // Applica l'inviluppo ADSR
    const now = this.ctx.currentTime;
    const { attack, decay, sustain, release } = instrument.envelope;
    
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(1, now + attack);
    envelope.gain.linearRampToValueAtTime(sustain, now + attack + decay);
    
    // Avvia tutti gli oscillatori
    oscillators.forEach(osc => osc.start());
    
    // Memorizza i componenti della nota
    this.activeNotes.get(channel)?.set(note, {
      oscillators,
      gain,
      envelope
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

      // Schedula lo stop degli oscillatori
      setTimeout(() => {
        noteComponents.oscillators.forEach(osc => osc.stop());
        this.activeNotes.get(channel)?.delete(note);
      }, instrument.envelope.release * 1000 + 50); // Aggiungi un piccolo margine
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
