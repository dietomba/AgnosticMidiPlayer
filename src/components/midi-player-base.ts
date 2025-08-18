import { MidiPlayerOptions } from '../interfaces/midi-player-options';

export class MidiPlayerBase extends HTMLElement {
  protected midiAccess: WebMidi.MidiAccess | null = null;
  protected midiOutput: WebMidi.MidiOutput | null = null;
  protected isPlaying: boolean = false;
  protected currentTime: number = 0;
  protected duration: number = 0;
  protected options: MidiPlayerOptions = {};
  protected midiData: ArrayBuffer | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['src', 'autoplay', 'loop', 'volume'];
  }

  async connectedCallback() {
    try {
      // Richiedi accesso alle Web MIDI API
      this.midiAccess = await navigator.requestMIDIAccess();
      
      // Seleziona il primo output disponibile
      const outputs = Array.from(this.midiAccess.outputs.values());
      if (outputs.length > 0) {
        this.midiOutput = outputs[0];
      } else {
        throw new Error('Nessun dispositivo MIDI di output trovato');
      }

      // Se è stato fornito un src, carica il file MIDI
      const src = this.getAttribute('src');
      if (src) {
        await this.loadMidiFile(src);
      }

      // Se autoplay è attivo, inizia la riproduzione
      if (this.getAttribute('autoplay') !== null) {
        this.play();
      }
    } catch (error) {
      this.dispatchEvent(new CustomEvent('error', { detail: error }));
    }
  }

  disconnectedCallback() {
    // Ferma la riproduzione e pulisci le risorse
    this.stop();
    this.midiOutput?.close();
    this.midiAccess = null;
    this.midiOutput = null;
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'src':
        this.loadMidiFile(newValue);
        break;
      case 'autoplay':
        if (newValue !== null && this.midiData) {
          this.play();
        }
        break;
      case 'loop':
        this.options.loop = newValue !== null;
        break;
      case 'volume':
        this.options.volume = parseFloat(newValue);
        break;
    }
  }

  protected async loadMidiFile(src: string): Promise<void> {
    try {
      this.dispatchEvent(new CustomEvent('loadstart'));
      
      const response = await fetch(src);
      this.midiData = await response.arrayBuffer();
      
      // TODO: Implementare il parsing del file MIDI per ottenere la duration
      
      this.dispatchEvent(new CustomEvent('loadcomplete'));
    } catch (error) {
      this.dispatchEvent(new CustomEvent('error', { detail: error }));
    }
  }

  // API pubblica
  public async play(): Promise<void> {
    if (!this.midiData || !this.midiOutput) return;
    
    this.isPlaying = true;
    // TODO: Implementare la logica di riproduzione MIDI
    this.dispatchEvent(new CustomEvent('play'));
  }

  public pause(): void {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    // TODO: Implementare la logica di pausa
    this.dispatchEvent(new CustomEvent('pause'));
  }

  public stop(): void {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    this.currentTime = 0;
    // TODO: Implementare la logica di stop
    this.dispatchEvent(new CustomEvent('stop'));
  }

  public seek(time: number): void {
    // TODO: Implementare la logica di seek
    this.currentTime = Math.max(0, Math.min(time, this.duration));
  }

  // Getter pubblici
  public get currentTimeValue(): number {
    return this.currentTime;
  }

  public get durationValue(): number {
    return this.duration;
  }

  public get isPlayingValue(): boolean {
    return this.isPlaying;
  }
}
