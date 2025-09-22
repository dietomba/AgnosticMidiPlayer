// synthesizer-worklet.js
// AudioWorkletProcessor per il sintetizzatore MIDI
class SynthesizerWorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    // Stati del sintetizzatore
    this.activeNotes = new Map(); // channel -> note -> noteState
    this.sampleRate = globalThis.sampleRate;
    this.currentTime = 0;

    // Parametri MIDI per canale
    this.programs = new Map(); // channel -> program number
    this.channelVolumes = new Map(); // channel -> volume (0-1)
    this.pitchBends = new Map(); // channel -> pitch bend (-1 to 1)
    this.sustainPedals = new Map(); // channel -> boolean

    // Bank Select support
    this.bankSelectMSB = new Map(); // channel -> MSB value
    this.bankSelectLSB = new Map(); // channel -> LSB value
    this.currentBanks = new Map(); // channel -> bank number

    // Inizializza canali MIDI
    for (let channel = 0; channel < 16; channel++) {
      this.activeNotes.set(channel, new Map());
      this.programs.set(channel, 0);
      this.channelVolumes.set(channel, 1.0);
      this.pitchBends.set(channel, 0);
      this.sustainPedals.set(channel, false);
      this.bankSelectMSB.set(channel, 0);
      this.bankSelectLSB.set(channel, 0);
      this.currentBanks.set(channel, 0);
    }

    // Ascolta messaggi dal thread principale
    this.port.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    // Definizioni degli strumenti (versione semplificata per l'AudioWorklet)
    this.instruments = this.initializeInstruments();
  }

  initializeInstruments() {
    // Definizioni semplificate degli strumenti per uso nell'AudioWorklet
    return {
      0: {
        // Piano
        oscillatorType: 'sawtooth',
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.7, release: 1.0 },
        harmonics: [
          { ratio: 1.0, gain: 1.0, type: 'sine' },
          { ratio: 2.0, gain: 0.3, type: 'sine' },
          { ratio: 3.0, gain: 0.1, type: 'sine' },
        ],
        filter: {
          type: 'lowpass',
          frequency: 2000,
          Q: 1.0,
          envelope: {
            attack: 0.01,
            decay: 0.2,
            sustain: 0.5,
            release: 0.5,
            amount: 0.8,
          },
        },
      },
      // Altri strumenti possono essere aggiunti qui...
      // Per ora usiamo il piano come fallback per tutti
    };
  }

  handleMessage(data) {
    const { type } = data;

    switch (type) {
      case 'noteOn':
        this.noteOn(data.channel, data.note, data.velocity);
        break;
      case 'noteOff':
        this.noteOff(data.channel, data.note);
        break;
      case 'programChange':
        this.programChange(data.channel, data.program);
        break;
      case 'controlChange':
        this.controlChange(data.channel, data.controller, data.value);
        break;
      case 'pitchBend':
        this.pitchBend(data.channel, data.value);
        break;
      case 'channelAftertouch':
        this.channelAftertouch(data.channel, data.pressure);
        break;
      case 'allNotesOff':
        this.allNotesOff();
        break;
    }
  }

  noteOn(channel, note, velocity) {
    const frequency = 440 * Math.pow(2, (note - 69) / 12);
    const instrument = this.getInstrument(channel);

    const noteState = {
      frequency,
      velocity: velocity / 127,
      phase: 0,
      envelopePhase: 0,
      envelopeState: 'attack', // attack, decay, sustain, release
      envelopeValue: 0,
      filterEnvelopePhase: 0,
      filterEnvelopeState: 'attack',
      filterEnvelopeValue: 0,
      harmonicPhases: instrument.harmonics ? instrument.harmonics.map(() => 0) : [0],
      lfoPhase: 0,
      startTime: this.currentTime,
      instrument,
    };

    this.activeNotes.get(channel)?.set(note, noteState);
  }

  noteOff(channel, note) {
    const noteState = this.activeNotes.get(channel)?.get(note);
    if (noteState && !this.sustainPedals.get(channel)) {
      noteState.envelopeState = 'release';
      noteState.filterEnvelopeState = 'release';
    }
  }

  programChange(channel, program) {
    this.programs.set(channel, program);
  }

  controlChange(channel, controller, value) {
    switch (controller) {
      case 0: // Bank Select MSB
        this.bankSelectMSB.set(channel, value);
        this.updateCurrentBank(channel);
        break;
      case 7: // Main Volume
        this.channelVolumes.set(channel, value / 127);
        break;
      case 32: // Bank Select LSB
        this.bankSelectLSB.set(channel, value);
        this.updateCurrentBank(channel);
        break;
      case 64: // Sustain Pedal
        this.sustainPedals.set(channel, value >= 64);
        if (value < 64) {
          // Release di tutte le note in sustain
          this.activeNotes.get(channel)?.forEach((noteState, note) => {
            if (noteState.envelopeState === 'sustain') {
              this.noteOff(channel, note);
            }
          });
        }
        break;
    }
  }

  updateCurrentBank(channel) {
    const msb = this.bankSelectMSB.get(channel) || 0;
    const lsb = this.bankSelectLSB.get(channel) || 0;
    const bank = (msb << 7) + lsb;
    this.currentBanks.set(channel, bank);
  }

  pitchBend(channel, value) {
    // value da -8192 a +8191, convertiamo a -1 a +1
    this.pitchBends.set(channel, value / 8192);
  }

  channelAftertouch(channel, pressure) {
    // Applica pressure a tutte le note attive del canale
    this.activeNotes.get(channel)?.forEach((noteState) => {
      noteState.aftertouch = pressure / 127;
    });
  }

  allNotesOff() {
    for (let channel = 0; channel < 16; channel++) {
      this.activeNotes.get(channel)?.forEach((noteState, note) => {
        this.noteOff(channel, note);
      });
    }
  }

  getInstrument(channel) {
    const program = this.programs.get(channel) || 0;
    return this.instruments[program] || this.instruments[0];
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const blockSize = output[0].length;

    // Aggiorna il tempo corrente
    this.currentTime += blockSize / this.sampleRate;

    // Azzera i buffer di output
    for (let channel = 0; channel < output.length; channel++) {
      output[channel].fill(0);
    }

    // Processa ogni canale MIDI
    for (let midiChannel = 0; midiChannel < 16; midiChannel++) {
      const notes = this.activeNotes.get(midiChannel);
      if (!notes || notes.size === 0) continue;

      const channelVolume = this.channelVolumes.get(midiChannel) || 1.0;
      const pitchBend = this.pitchBends.get(midiChannel) || 0;

      // Processa ogni nota attiva
      notes.forEach((noteState, noteNumber) => {
        this.processNote(noteState, output, blockSize, channelVolume, pitchBend);

        // Rimuovi note che hanno completato il release
        if (noteState.envelopeState === 'release' && noteState.envelopeValue <= 0.001) {
          notes.delete(noteNumber);
        }
      });
    }

    return true;
  }

  processNote(noteState, output, blockSize, channelVolume, pitchBend) {
    const { instrument } = noteState;
    const sampleRate = this.sampleRate;

    for (let i = 0; i < blockSize; i++) {
      // Calcola frequenza con pitch bend
      const pitchBendSemitones = pitchBend * 2; // ±2 semitoni
      const frequency = noteState.frequency * Math.pow(2, pitchBendSemitones / 12);

      // Aggiorna envelope
      this.updateEnvelope(noteState, instrument.envelope, 1 / sampleRate);

      // Aggiorna filter envelope se presente
      if (instrument.filter?.envelope) {
        this.updateFilterEnvelope(noteState, instrument.filter.envelope, 1 / sampleRate);
      }

      // Genera il campione audio
      let sample = 0;

      if (instrument.harmonics) {
        // Genera armoniche
        instrument.harmonics.forEach((harmonic, index) => {
          const harmonicFreq = frequency * harmonic.ratio;
          const phase = noteState.harmonicPhases[index];

          sample += this.generateOscillator(harmonicFreq, phase, harmonic.type) * harmonic.gain;

          // Aggiorna fase
          noteState.harmonicPhases[index] =
            (phase + (harmonicFreq * 2 * Math.PI) / sampleRate) % (2 * Math.PI);
        });
      } else {
        // Oscillatore singolo
        sample = this.generateOscillator(frequency, noteState.phase, instrument.oscillatorType);
        noteState.phase =
          (noteState.phase + (frequency * 2 * Math.PI) / sampleRate) % (2 * Math.PI);
      }

      // Applica filtro se presente
      if (instrument.filter) {
        sample = this.applyFilter(sample, noteState, instrument.filter);
      }

      // Applica envelope
      sample *= noteState.envelopeValue * noteState.velocity * channelVolume;

      // Applica aftertouch se presente
      if (noteState.aftertouch !== undefined) {
        sample *= noteState.aftertouch;
      }

      // Aggiungi ai canali di output (mono -> stereo)
      for (let channel = 0; channel < output.length; channel++) {
        output[channel][i] += sample * 0.1; // Scaling per evitare clipping
      }
    }
  }

  generateOscillator(frequency, phase, type) {
    switch (type) {
      case 'sine':
        return Math.sin(phase);
      case 'sawtooth':
        return 2 * (phase / (2 * Math.PI)) - 1;
      case 'square':
        return phase < Math.PI ? 1 : -1;
      case 'triangle':
        const t = phase / (2 * Math.PI);
        return t < 0.5 ? 4 * t - 1 : 3 - 4 * t;
      default:
        return Math.sin(phase);
    }
  }

  updateEnvelope(noteState, envelope, deltaTime) {
    const { attack, decay, sustain, release } = envelope;

    switch (noteState.envelopeState) {
      case 'attack':
        noteState.envelopePhase += deltaTime;
        if (noteState.envelopePhase >= attack) {
          noteState.envelopeValue = 1.0;
          noteState.envelopeState = 'decay';
          noteState.envelopePhase = 0;
        } else {
          noteState.envelopeValue = noteState.envelopePhase / attack;
        }
        break;

      case 'decay':
        noteState.envelopePhase += deltaTime;
        if (noteState.envelopePhase >= decay) {
          noteState.envelopeValue = sustain;
          noteState.envelopeState = 'sustain';
        } else {
          noteState.envelopeValue = 1.0 - (noteState.envelopePhase / decay) * (1.0 - sustain);
        }
        break;

      case 'sustain':
        noteState.envelopeValue = sustain;
        break;

      case 'release':
        noteState.envelopePhase += deltaTime;
        if (noteState.envelopePhase >= release) {
          noteState.envelopeValue = 0;
        } else {
          const startValue = noteState.envelopeValue || sustain;
          noteState.envelopeValue = startValue * (1 - noteState.envelopePhase / release);
        }
        break;
    }
  }

  updateFilterEnvelope(noteState, filterEnvelope, deltaTime) {
    const { attack, decay, sustain, release } = filterEnvelope;

    switch (noteState.filterEnvelopeState) {
      case 'attack':
        noteState.filterEnvelopePhase += deltaTime;
        if (noteState.filterEnvelopePhase >= attack) {
          noteState.filterEnvelopeValue = 1.0;
          noteState.filterEnvelopeState = 'decay';
          noteState.filterEnvelopePhase = 0;
        } else {
          noteState.filterEnvelopeValue = noteState.filterEnvelopePhase / attack;
        }
        break;

      case 'decay':
        noteState.filterEnvelopePhase += deltaTime;
        if (noteState.filterEnvelopePhase >= decay) {
          noteState.filterEnvelopeValue = sustain;
          noteState.filterEnvelopeState = 'sustain';
        } else {
          noteState.filterEnvelopeValue =
            1.0 - (noteState.filterEnvelopePhase / decay) * (1.0 - sustain);
        }
        break;

      case 'sustain':
        noteState.filterEnvelopeValue = sustain;
        break;

      case 'release':
        noteState.filterEnvelopePhase += deltaTime;
        if (noteState.filterEnvelopePhase >= release) {
          noteState.filterEnvelopeValue = 0;
        } else {
          const startValue = noteState.filterEnvelopeValue || sustain;
          noteState.filterEnvelopeValue =
            startValue * (1 - noteState.filterEnvelopePhase / release);
        }
        break;
    }
  }

  applyFilter(sample, noteState, filterDef) {
    // Implementazione semplificata di un filtro lowpass
    // In una implementazione completa si userebbe un filtro IIR appropriato
    if (!noteState.filterState) {
      noteState.filterState = { y1: 0, y2: 0, x1: 0, x2: 0 };
    }

    const { frequency, Q } = filterDef;
    const fs = this.sampleRate;

    // Modula la frequenza del filtro con l'envelope
    let cutoffFreq = frequency;
    if (filterDef.envelope) {
      cutoffFreq += filterDef.envelope.amount * frequency * noteState.filterEnvelopeValue;
    }

    // Coefficienti del filtro lowpass biquad
    const omega = (2 * Math.PI * cutoffFreq) / fs;
    const sin = Math.sin(omega);
    const cos = Math.cos(omega);
    const alpha = sin / (2 * Q);

    const b0 = (1 - cos) / 2;
    const b1 = 1 - cos;
    const b2 = (1 - cos) / 2;
    const a0 = 1 + alpha;
    const a1 = -2 * cos;
    const a2 = 1 - alpha;

    // Normalizza i coefficienti
    const normB0 = b0 / a0;
    const normB1 = b1 / a0;
    const normB2 = b2 / a0;
    const normA1 = a1 / a0;
    const normA2 = a2 / a0;

    // Applica il filtro
    const output =
      normB0 * sample +
      normB1 * noteState.filterState.x1 +
      normB2 * noteState.filterState.x2 -
      normA1 * noteState.filterState.y1 -
      normA2 * noteState.filterState.y2;

    // Aggiorna lo stato del filtro
    noteState.filterState.x2 = noteState.filterState.x1;
    noteState.filterState.x1 = sample;
    noteState.filterState.y2 = noteState.filterState.y1;
    noteState.filterState.y1 = output;

    return output;
  }
}

// Registra il processore
registerProcessor('synthesizer-worklet', SynthesizerWorkletProcessor);
