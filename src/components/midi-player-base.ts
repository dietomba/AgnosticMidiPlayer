import { MidiPlayerOptions } from "../interfaces/midi-player-options";
import { MidiEvent } from "../interfaces/midi-event";
import { MidiEventType, MetaEventType } from "../interfaces/midi-event-types";
import { MidiParser } from "../utils/midi-parser";
import { SimpleSynthesizer } from "../utils/simple-synthesizer";

export class MidiPlayerBase extends HTMLElement {
  protected synth: SimpleSynthesizer;
  protected isPlaying: boolean = false;
  protected currentTime: number = 0;
  protected duration: number = 0;
  protected options: MidiPlayerOptions = {};
  protected midiData: ArrayBuffer | null = null;
  protected parsedMidiEvents: MidiEvent[] = [];
  protected playbackStartTime: number = 0;
  protected schedulerInterval: number | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.synth = new SimpleSynthesizer();
  }

  static get observedAttributes() {
    return ["src", "autoplay", "loop", "volume"];
  }

  async connectedCallback() {
    // Se src è fornito, carica il file MIDI
    const src = this.getAttribute("src");
    if (src) {
      await this.loadMidiFile(src);
    }

    // Se autoplay è attivo, inizia la riproduzione
    if (this.getAttribute("autoplay") !== null) {
      this.play();
    }
  }

  disconnectedCallback() {
    // Ferma la riproduzione e pulisci le risorse
    this.stop();
    this.synth.allNotesOff();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    switch (name) {
      case "src":
        this.loadMidiFile(newValue);
        break;
      case "autoplay":
        if (newValue !== null && this.midiData) {
          this.play();
        }
        break;
      case "loop":
        this.options.loop = newValue !== null;
        break;
      case "volume":
        const volume = parseFloat(newValue);
        this.options.volume = volume;
        this.synth.setVolume(volume);
        break;
    }
  }

  protected async loadMidiFile(src: string): Promise<void> {
    try {
      this.dispatchEvent(new CustomEvent("loadstart"));

      const response = await fetch(src);
      this.midiData = await response.arrayBuffer();

      // Resetta lo stato corrente
      this.stop();
      this.currentTime = 0;
      this.duration = 0;
      this.parsedMidiEvents = [];

      // Parsa il file MIDI
      this.parsedMidiEvents = this.parseMidiFile(this.midiData);

      // Calcola la durata totale
      if (this.parsedMidiEvents.length > 0) {
        const lastEvent =
          this.parsedMidiEvents[this.parsedMidiEvents.length - 1];
        this.duration = lastEvent.absoluteTime;
      }

      this.dispatchEvent(
        new CustomEvent("loadcomplete", {
          detail: { duration: this.duration },
        })
      );

      // Se autoplay è attivo, inizia la riproduzione
      if (this.options.autoplay) {
        this.play();
      }
    } catch (error) {
      this.dispatchEvent(new CustomEvent("error", { detail: error }));
    }
  }

  public async play(): Promise<void> {
    if (!this.midiData || this.isPlaying) return;

    this.isPlaying = true;
    this.playbackStartTime = performance.now() - this.currentTime;
    this.startScheduler();
    this.dispatchEvent(new CustomEvent("play"));
  }

  public pause(): void {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    this.currentTime = performance.now() - this.playbackStartTime;
    this.stopScheduler();
    this.synth.allNotesOff();
    this.dispatchEvent(new CustomEvent("pause"));
  }

  public stop(): void {
    if (!this.isPlaying && this.currentTime === 0) return;

    this.isPlaying = false;
    this.currentTime = 0;
    this.stopScheduler();
    this.synth.allNotesOff();
    this.dispatchEvent(new CustomEvent("stop"));
  }

  public seek(time: number): void {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) {
      this.pause();
    }

    this.currentTime = Math.max(0, Math.min(time, this.duration));

    if (wasPlaying) {
      this.play();
    }

    this.dispatchEvent(
      new CustomEvent("timeupdate", {
        detail: { currentTime: this.currentTime, duration: this.duration },
      })
    );
  }

  protected parseMidiFile(data: ArrayBuffer): MidiEvent[] {
    const parser = new MidiParser(data);
    const events: MidiEvent[] = [];
    let absoluteTime = 0;

    // Leggi l'header MIDI
    const headerChunk = parser.readString(4);
    if (headerChunk !== "MThd") {
      throw new Error("Invalid MIDI file: missing MThd header");
    }

    const headerLength = parser.readUint32();
    const format = parser.readUint16();
    const trackCount = parser.readUint16();
    const timeDivision = parser.readUint16();

    // Per ogni traccia
    for (let track = 0; track < trackCount; track++) {
      const trackChunk = parser.readString(4);
      if (trackChunk !== "MTrk") {
        throw new Error(
          `Invalid MIDI file: missing MTrk header for track ${track}`
        );
      }

      const trackLength = parser.readUint32();
      const trackEnd = parser.position + trackLength;

      // Leggi gli eventi della traccia
      while (parser.position < trackEnd) {
        const deltaTime = parser.readVarInt();
        absoluteTime += deltaTime;

        let eventType = parser.readUint8();

        // Gestione Running Status
        if ((eventType & 0x80) === 0) {
          parser.position--;
          eventType = events[events.length - 1].type;
        }

        if (eventType === MidiEventType.META) {
          const metaType = parser.readUint8();
          const length = parser.readVarInt();
          const data = new Uint8Array(length);

          for (let i = 0; i < length; i++) {
            data[i] = parser.readUint8();
          }

          events.push({
            type: eventType,
            subtype: metaType,
            deltaTime,
            absoluteTime,
            data: Array.from(data),
          });

          if (metaType === MetaEventType.END_OF_TRACK) {
            break;
          }
        } else if (eventType === MidiEventType.SYSTEM_EXCLUSIVE) {
          const length = parser.readVarInt();
          parser.skip(length);
        } else {
          // Eventi MIDI Channel
          const channel = eventType & 0x0f;
          const command = eventType & 0xf0;

          const data = [command | channel];

          // Leggi i dati in base al tipo di comando
          switch (command) {
            case MidiEventType.NOTE_OFF:
            case MidiEventType.NOTE_ON:
            case MidiEventType.NOTE_AFTERTOUCH:
            case MidiEventType.CONTROLLER:
            case MidiEventType.PITCH_BEND:
              data.push(parser.readUint8()); // nota/controller
              data.push(parser.readUint8()); // velocity/valore
              break;

            case MidiEventType.PROGRAM_CHANGE:
            case MidiEventType.CHANNEL_AFTERTOUCH:
              data.push(parser.readUint8()); // program/pressure
              break;
          }

          events.push({
            type: command,
            channel,
            deltaTime,
            absoluteTime,
            data,
          });
        }
      }
    }

    return events.sort((a, b) => a.absoluteTime - b.absoluteTime);
  }

  protected startScheduler(): void {
    if (this.schedulerInterval !== null) return;

    const lookAhead = 100; // ms
    const scheduleAhead = 200; // ms

    this.schedulerInterval = window.setInterval(() => {
      const currentTime = performance.now() - this.playbackStartTime;
      const endTime = currentTime + scheduleAhead;

      // Trova e schedula gli eventi nel range di tempo
      for (const event of this.parsedMidiEvents) {
        if (event.absoluteTime >= currentTime && event.absoluteTime < endTime) {
          this.scheduleEvent(event);
        }
      }

      // Aggiorna il tempo corrente
      this.currentTime = currentTime;
      this.dispatchEvent(
        new CustomEvent("timeupdate", {
          detail: { currentTime: this.currentTime, duration: this.duration },
        })
      );

      // Controlla se la riproduzione è finita
      if (currentTime >= this.duration) {
        if (this.options.loop) {
          this.seek(0);
        } else {
          this.stop();
          this.dispatchEvent(new CustomEvent("ended"));
        }
      }
    }, lookAhead);
  }

  protected stopScheduler(): void {
    if (this.schedulerInterval !== null) {
      window.clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
  }

  protected scheduleEvent(event: MidiEvent): void {
    const delay =
      event.absoluteTime - (performance.now() - this.playbackStartTime);

    setTimeout(() => {
      if (!this.isPlaying) return;

      // Processa l'evento MIDI
      if (event.type === MidiEventType.NOTE_ON && event.data) {
        const [, note, velocity] = event.data;
        if (velocity > 0) {
          this.synth.noteOn(event.channel!, note, velocity);
        } else {
          this.synth.noteOff(event.channel!, note);
        }
      } else if (event.type === MidiEventType.NOTE_OFF && event.data) {
        const [, note] = event.data;
        this.synth.noteOff(event.channel!, note);
      }
    }, delay);
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
