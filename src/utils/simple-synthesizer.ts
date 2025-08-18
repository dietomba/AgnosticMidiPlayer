export class SimpleSynthesizer {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private activeOscillators: Map<number, Map<number, OscillatorNode>>;
  private activeGains: Map<number, Map<number, GainNode>>;
  private channelGains: Map<number, GainNode>;
  private programs: Map<number, number>;
  private pitchBendValues: Map<number, number>;
  private sustainPedals: Map<number, boolean>;

  constructor() {
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.activeOscillators = new Map();
    this.activeGains = new Map();
    this.channelGains = new Map();
    this.programs = new Map();
    this.pitchBendValues = new Map();
    this.sustainPedals = new Map();

    // Inizializza le mappe per ogni canale MIDI
    for (let channel = 0; channel < 16; channel++) {
      this.activeOscillators.set(channel, new Map());
      this.activeGains.set(channel, new Map());

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
    this.activeOscillators.get(channel)?.forEach((osc, note) => {
      const baseFreq = 440 * Math.pow(2, (note - 69) / 12);
      const newFreq = baseFreq * Math.pow(2, semitones / 12);
      osc.frequency.setValueAtTime(newFreq, this.ctx.currentTime);
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
    this.activeGains.get(channel)?.forEach((gain) => {
      gain.gain.setValueAtTime(pressure / 127, this.ctx.currentTime);
    });
  }

  public noteOn(channel: number, note: number, velocity: number): void {
    // Converti nota MIDI in frequenza (A4 = nota 69 = 440Hz)
    const frequency = 440 * Math.pow(2, (note - 69) / 12);

    // Crea e configura l'oscillatore
    const osc = this.ctx.createOscillator();
    osc.type = 'sine'; // Forma d'onda sinusoidale per un suono base
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

    // Crea e configura il gain per la velocity
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity / 127, this.ctx.currentTime);

    // Connetti l'oscillatore al gain e il gain al master
    osc.connect(gain);
    gain.connect(this.masterGain);

    // Avvia l'oscillatore
    osc.start();

    // Memorizza gli oscillatori e i gain attivi
    this.activeOscillators.get(channel)?.set(note, osc);
    this.activeGains.get(channel)?.set(note, gain);
  }

  public noteOff(channel: number, note: number): void {
    const oscillator = this.activeOscillators.get(channel)?.get(note);
    const gain = this.activeGains.get(channel)?.get(note);

    if (oscillator && gain) {
      // Fade out veloce per evitare click
      gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.015);

      // Ferma e disconnetti dopo il fade
      setTimeout(() => {
        oscillator.stop();
        oscillator.disconnect();
        gain.disconnect();

        // Rimuovi dalle mappe
        this.activeOscillators.get(channel)?.delete(note);
        this.activeGains.get(channel)?.delete(note);
      }, 50);
    }
  }

  public allNotesOff(): void {
    for (let channel = 0; channel < 16; channel++) {
      const oscillators = this.activeOscillators.get(channel);
      if (oscillators) {
        for (const note of oscillators.keys()) {
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
