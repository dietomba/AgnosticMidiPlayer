import { MidiPlayerOptions } from '../interfaces/midi-player-options';
import { MidiEvent } from '../interfaces/midi-event';
import { MidiEventType, MetaEventType } from '../interfaces/midi-event-types';
import { MidiParser } from '../utils/midi-parser';
import { SimpleSynthesizer } from '../utils/simple-synthesizer';
import { MidiTiming } from '../utils/midi-timing';

export class MidiPlayerBase extends HTMLElement {
  protected synth: SimpleSynthesizer;
  protected isPlaying: boolean = false;
  protected currentTick: number = 0; // Posizione corrente in ticks
  protected currentTime: number = 0; // Posizione corrente in ms
  protected duration: number = 0; // Durata totale in ms
  protected options: MidiPlayerOptions = {};
  protected midiData: ArrayBuffer | null = null;
  protected parsedMidiEvents: MidiEvent[] = [];
  protected playbackStartTime: number = 0;
  protected schedulerInterval: number | null = null;
  protected timing: MidiTiming | null = null;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.synth = new SimpleSynthesizer();

    // Aspetta che l'AudioWorklet sia pronto se disponibile
    this.initializeAudioWorklet();
  }

  private async initializeAudioWorklet(): Promise<void> {
    try {
      await this.synth.waitForWorkletReady();
      if (this.synth.isUsingAudioWorklet) {
        // eslint-disable-next-line no-console
        console.info('Web Component: AudioWorklet caricato e pronto');
      } else {
        // eslint-disable-next-line no-console
        console.info('Web Component: Uso fallback con nodi standard');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("Web Component: Errore nell'inizializzazione AudioWorklet:", error);
    }
  }

  static get observedAttributes() {
    return ['src', 'autoplay', 'loop', 'volume'];
  }

  async connectedCallback() {
    // Se src è fornito, carica il file MIDI
    const src = this.getAttribute('src');
    if (src) {
      await this.loadMidiFile(src);
    }

    // Se autoplay è attivo, inizia la riproduzione
    if (this.getAttribute('autoplay') !== null) {
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
        const volume = parseFloat(newValue);
        this.options.volume = volume;
        this.synth.setVolume(volume);
        break;
    }
  }

  protected async loadMidiFile(src: string): Promise<void> {
    try {
      this.dispatchEvent(new CustomEvent('loadstart'));

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
        const lastEvent = this.parsedMidiEvents[this.parsedMidiEvents.length - 1];
        this.duration = lastEvent.absoluteTime || 0;
      }

      this.dispatchEvent(
        new CustomEvent('loadcomplete', {
          detail: { duration: this.duration },
        }),
      );

      // Se autoplay è attivo, inizia la riproduzione
      if (this.options.autoplay) {
        this.play();
      }
    } catch (error) {
      this.dispatchEvent(new CustomEvent('error', { detail: error }));
    }
  }

  public async play(): Promise<void> {
    if (!this.midiData || this.isPlaying) return;

    this.isPlaying = true;
    this.playbackStartTime = performance.now() - this.currentTime;
    this.startScheduler();
    this.dispatchEvent(new CustomEvent('play'));
  }

  public pause(): void {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    this.currentTime = performance.now() - this.playbackStartTime;
    this.stopScheduler();
    this.synth.allNotesOff();
    this.dispatchEvent(new CustomEvent('pause'));
  }

  public stop(): void {
    if (!this.isPlaying && this.currentTime === 0) return;

    this.isPlaying = false;
    this.currentTime = 0;
    this.stopScheduler();
    this.synth.allNotesOff();
    this.dispatchEvent(new CustomEvent('stop'));
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
      new CustomEvent('timeupdate', {
        detail: { currentTime: this.currentTime, duration: this.duration },
      }),
    );
  }

  protected parseMidiFile(data: ArrayBuffer): MidiEvent[] {
    const parser = new MidiParser(data);
    const events: MidiEvent[] = [];
    let absoluteTick = 0;

    // Leggi l'header MIDI
    const headerChunk = parser.readString(4);
    if (headerChunk !== 'MThd') {
      throw new Error('Invalid MIDI file: missing MThd header');
    }

    parser.readUint32(); // headerLength
    parser.readUint16(); // format
    const trackCount = parser.readUint16();
    const timeDivision = parser.readUint16();

    // Inizializza il sistema di timing
    this.timing = new MidiTiming(timeDivision);

    // Per ogni traccia
    for (let track = 0; track < trackCount; track++) {
      const trackChunk = parser.readString(4);
      if (trackChunk !== 'MTrk') {
        throw new Error(`Invalid MIDI file: missing MTrk header for track ${track}`);
      }

      const trackLength = parser.readUint32();
      const trackEnd = parser.position + trackLength;
      absoluteTick = 0; // Reset per ogni traccia

      // Leggi gli eventi della traccia
      while (parser.position < trackEnd) {
        const deltaTime = parser.readVarInt();
        absoluteTick += deltaTime;

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

          // Se è un evento di tempo, aggiornalo nel timing
          if (metaType === MetaEventType.SET_TEMPO) {
            const tempo = (data[0] << 16) | (data[1] << 8) | data[2];
            this.timing.addTempoChange(absoluteTick, tempo);
          }

          events.push({
            type: eventType,
            subtype: metaType,
            deltaTime,
            absoluteTick,
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
              data.push(parser.readUint8());
              data.push(parser.readUint8());
              break;

            case MidiEventType.PROGRAM_CHANGE:
            case MidiEventType.CHANNEL_AFTERTOUCH:
              data.push(parser.readUint8());
              break;
          }

          events.push({
            type: command,
            channel,
            deltaTime,
            absoluteTick,
            data,
          });
        }
      }
    }

    // Ordina gli eventi per tick e calcola i tempi assoluti
    const sortedEvents = events.sort((a, b) => a.absoluteTick - b.absoluteTick);

    // Calcola i tempi assoluti per tutti gli eventi
    for (const event of sortedEvents) {
      event.absoluteTime = this.timing.ticksToMilliseconds(event.absoluteTick);
    }

    return sortedEvents; // Per ogni traccia
    for (let track = 0; track < trackCount; track++) {
      const trackChunk = parser.readString(4);
      if (trackChunk !== 'MTrk') {
        throw new Error(`Invalid MIDI file: missing MTrk header for track ${track}`);
      }

      const trackLength = parser.readUint32();
      const trackEnd = parser.position + trackLength;

      // Leggi gli eventi della traccia
      while (parser.position < trackEnd) {
        const deltaTime = parser.readVarInt();
        absoluteTick += deltaTime;

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
            absoluteTick,
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
            absoluteTick,
            data,
          });
        }
      }
    }

    // Ordina gli eventi per absoluteTick
    events.sort((a, b) => a.absoluteTick - b.absoluteTick);

    // Calcola absoluteTime per ogni evento usando il timing MIDI
    for (const event of events) {
      event.absoluteTime = this.timing?.ticksToMilliseconds(event.absoluteTick) || 0;
    }

    return events;
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
        const eventTime = event.absoluteTime || 0;
        if (eventTime >= currentTime && eventTime < endTime) {
          this.scheduleEvent(event);
        }
      }

      // Aggiorna il tempo corrente
      this.currentTime = currentTime;
      this.dispatchEvent(
        new CustomEvent('timeupdate', {
          detail: { currentTime: this.currentTime, duration: this.duration },
        }),
      );

      // Controlla se la riproduzione è finita
      if (currentTime >= this.duration) {
        if (this.options.loop) {
          this.seek(0);
        } else {
          this.stop();
          this.dispatchEvent(new CustomEvent('ended'));
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
    const delay = (event.absoluteTime ?? 0) - (performance.now() - this.playbackStartTime);

    setTimeout(() => {
      if (!this.isPlaying) return;

      // Processa l'evento MIDI solo se abbiamo i dati necessari
      if (!event.data || !event.channel) return;

      switch (event.type) {
        case MidiEventType.NOTE_ON: {
          const [, note, velocity] = event.data;
          if (velocity > 0) {
            this.synth.noteOn(event.channel, note, velocity);
          } else {
            this.synth.noteOff(event.channel, note);
          }
          break;
        }

        case MidiEventType.NOTE_OFF: {
          const [, note] = event.data;
          this.synth.noteOff(event.channel, note);
          break;
        }

        case MidiEventType.PROGRAM_CHANGE: {
          const [, program] = event.data;
          this.synth.programChange(event.channel, program);
          break;
        }

        case MidiEventType.CONTROLLER: {
          const [, controller, value] = event.data;
          this.synth.controlChange(event.channel, controller, value);
          break;
        }

        case MidiEventType.PITCH_BEND: {
          const [, lsb, msb] = event.data;
          const value = (msb << 7) + lsb - 8192; // Converte in range -8192 a +8191
          this.synth.pitchBend(event.channel, value);
          break;
        }

        case MidiEventType.CHANNEL_AFTERTOUCH: {
          const [, pressure] = event.data;
          this.synth.channelAftertouch(event.channel, pressure);
          break;
        }
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

  public get isUsingAudioWorklet(): boolean {
    return this.synth.isUsingAudioWorklet;
  }

  public async setUseAudioWorklet(use: boolean): Promise<void> {
    await this.synth.setUseAudioWorklet(use);
  }
}
