export interface InstrumentDefinition {
  name: string;
  oscillatorType: OscillatorType;
  // Harmonics è un array di oggetti che definiscono le armoniche addizionali
  harmonics?: Array<{
    type: OscillatorType;
    ratio: number; // Rapporto di frequenza rispetto alla fondamentale
    gain: number; // Guadagno relativo (0-1)
  }>;
  // Inviluppo ADSR (Attack, Decay, Sustain, Release)
  envelope: {
    attack: number; // Tempo in secondi
    decay: number; // Tempo in secondi
    sustain: number; // Livello (0-1)
    release: number; // Tempo in secondi
  };
}

// Definizioni complete degli strumenti MIDI General MIDI Level 1
export const instruments: Record<number, InstrumentDefinition> = {
  // Piano Family (0-7)
  0: {
    name: 'Acoustic Grand Piano',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.5 },
      { type: 'sine', ratio: 4, gain: 0.2 },
    ],
    envelope: {
      attack: 0.02,
      decay: 0.1,
      sustain: 0.7,
      release: 0.3,
    },
  },
  1: {
    name: 'Bright Acoustic Piano',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.7 },
      { type: 'sine', ratio: 4, gain: 0.4 },
      { type: 'sine', ratio: 8, gain: 0.1 },
    ],
    envelope: {
      attack: 0.01,
      decay: 0.08,
      sustain: 0.6,
      release: 0.25,
    },
  },
  2: {
    name: 'Electric Grand Piano',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.6 },
      { type: 'square', ratio: 4, gain: 0.15 },
    ],
    envelope: {
      attack: 0.02,
      decay: 0.15,
      sustain: 0.8,
      release: 0.4,
    },
  },
  3: {
    name: 'Honky-tonk Piano',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'triangle', ratio: 1.01, gain: 0.8 }, // Detune per il suono "scordato"
      { type: 'sine', ratio: 2, gain: 0.4 },
    ],
    envelope: {
      attack: 0.02,
      decay: 0.12,
      sustain: 0.65,
      release: 0.35,
    },
  },
  4: {
    name: 'Electric Piano 1',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.3 },
      { type: 'triangle', ratio: 3, gain: 0.2 },
    ],
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.5,
      release: 0.6,
    },
  },
  5: {
    name: 'Electric Piano 2',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'triangle', ratio: 2, gain: 0.4 },
      { type: 'sine', ratio: 4, gain: 0.1 },
    ],
    envelope: {
      attack: 0.01,
      decay: 0.15,
      sustain: 0.4,
      release: 0.8,
    },
  },
  6: {
    name: 'Harpsichord',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'square', ratio: 2, gain: 0.3 },
      { type: 'sawtooth', ratio: 4, gain: 0.1 },
    ],
    envelope: {
      attack: 0.005,
      decay: 0.05,
      sustain: 0.3,
      release: 0.1,
    },
  },
  7: {
    name: 'Clavi',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sawtooth', ratio: 2, gain: 0.2 },
      { type: 'square', ratio: 4, gain: 0.1 },
    ],
    envelope: {
      attack: 0.005,
      decay: 0.03,
      sustain: 0.2,
      release: 0.05,
    },
  },

  // Chromatic Percussion (8-15)
  8: {
    name: 'Celesta',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 3, gain: 0.3 },
      { type: 'sine', ratio: 5, gain: 0.1 },
    ],
    envelope: {
      attack: 0.01,
      decay: 0.05,
      sustain: 0.5,
      release: 0.1,
    },
  },
  9: {
    name: 'Glockenspiel',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.8 },
      { type: 'sine', ratio: 4, gain: 0.4 },
      { type: 'sine', ratio: 8, gain: 0.2 },
    ],
    envelope: {
      attack: 0.005,
      decay: 0.02,
      sustain: 0.3,
      release: 0.05,
    },
  },
  10: {
    name: 'Music Box',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.6 },
      { type: 'sine', ratio: 3, gain: 0.3 },
    ],
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.4,
      release: 0.2,
    },
  },
  11: {
    name: 'Vibraphone',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.5 },
      { type: 'sine', ratio: 4, gain: 0.2 },
    ],
    envelope: {
      attack: 0.02,
      decay: 0.3,
      sustain: 0.7,
      release: 0.5,
    },
  },
  12: {
    name: 'Marimba',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.4 },
      { type: 'triangle', ratio: 3, gain: 0.2 },
    ],
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.3,
      release: 0.15,
    },
  },
  13: {
    name: 'Xylophone',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.6 },
      { type: 'triangle', ratio: 4, gain: 0.3 },
    ],
    envelope: {
      attack: 0.005,
      decay: 0.05,
      sustain: 0.2,
      release: 0.08,
    },
  },
  14: {
    name: 'Tubular Bells',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.7 },
      { type: 'sine', ratio: 3, gain: 0.4 },
      { type: 'sine', ratio: 5, gain: 0.2 },
    ],
    envelope: {
      attack: 0.02,
      decay: 0.5,
      sustain: 0.6,
      release: 1.5,
    },
  },
  15: {
    name: 'Dulcimer',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.5 },
      { type: 'triangle', ratio: 3, gain: 0.3 },
    ],
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.5,
      release: 0.3,
    },
  },

  // Organ Family (16-23)
  16: {
    name: 'Drawbar Organ',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.7 },
      { type: 'sine', ratio: 3, gain: 0.5 },
      { type: 'sine', ratio: 4, gain: 0.3 },
    ],
    envelope: {
      attack: 0.05,
      decay: 0.1,
      sustain: 1.0,
      release: 0.1,
    },
  },
  17: {
    name: 'Percussive Organ',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.6 },
      { type: 'sine', ratio: 4, gain: 0.3 },
    ],
    envelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.4,
      release: 0.2,
    },
  },
  18: {
    name: 'Rock Organ',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.8 },
      { type: 'square', ratio: 3, gain: 0.4 },
    ],
    envelope: {
      attack: 0.02,
      decay: 0.05,
      sustain: 0.9,
      release: 0.1,
    },
  },
  19: {
    name: 'Church Organ',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.8 },
      { type: 'sine', ratio: 3, gain: 0.6 },
      { type: 'sine', ratio: 4, gain: 0.4 },
      { type: 'sine', ratio: 5, gain: 0.2 },
    ],
    envelope: {
      attack: 0.1,
      decay: 0.2,
      sustain: 1.0,
      release: 0.3,
    },
  },
  20: {
    name: 'Reed Organ',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.5 },
      { type: 'sawtooth', ratio: 3, gain: 0.3 },
    ],
    envelope: {
      attack: 0.08,
      decay: 0.15,
      sustain: 0.8,
      release: 0.2,
    },
  },
  21: {
    name: 'Accordion',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.6 },
      { type: 'square', ratio: 4, gain: 0.3 },
    ],
    envelope: {
      attack: 0.05,
      decay: 0.1,
      sustain: 0.9,
      release: 0.15,
    },
  },
  22: {
    name: 'Harmonica',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.4 },
      { type: 'sawtooth', ratio: 3, gain: 0.2 },
    ],
    envelope: {
      attack: 0.03,
      decay: 0.1,
      sustain: 0.7,
      release: 0.2,
    },
  },
  23: {
    name: 'Tango Accordion',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.7 },
      { type: 'square', ratio: 3, gain: 0.4 },
    ],
    envelope: {
      attack: 0.04,
      decay: 0.08,
      sustain: 0.85,
      release: 0.12,
    },
  },

  // Guitar Family (24-31)
  24: {
    name: 'Acoustic Guitar (nylon)',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.4 },
      { type: 'triangle', ratio: 3, gain: 0.2 },
    ],
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.6,
      release: 0.2,
    },
  },
  25: {
    name: 'Acoustic Guitar (steel)',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.5 },
      { type: 'triangle', ratio: 3, gain: 0.3 },
      { type: 'sine', ratio: 4, gain: 0.1 },
    ],
    envelope: {
      attack: 0.008,
      decay: 0.08,
      sustain: 0.5,
      release: 0.15,
    },
  },
  26: {
    name: 'Electric Guitar (jazz)',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.3 },
      { type: 'triangle', ratio: 3, gain: 0.2 },
    ],
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.7,
      release: 0.3,
    },
  },
  27: {
    name: 'Electric Guitar (clean)',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.4 },
      { type: 'square', ratio: 3, gain: 0.15 },
    ],
    envelope: {
      attack: 0.005,
      decay: 0.15,
      sustain: 0.6,
      release: 0.25,
    },
  },
  28: {
    name: 'Electric Guitar (muted)',
    oscillatorType: 'triangle',
    harmonics: [{ type: 'sine', ratio: 2, gain: 0.2 }],
    envelope: {
      attack: 0.005,
      decay: 0.05,
      sustain: 0.3,
      release: 0.1,
    },
  },
  29: {
    name: 'Overdriven Guitar',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sawtooth', ratio: 2, gain: 0.6 },
      { type: 'square', ratio: 3, gain: 0.4 },
    ],
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.7,
      release: 0.2,
    },
  },
  30: {
    name: 'Distortion Guitar',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'square', ratio: 2, gain: 0.8 },
      { type: 'sawtooth', ratio: 3, gain: 0.5 },
    ],
    envelope: {
      attack: 0.005,
      decay: 0.08,
      sustain: 0.8,
      release: 0.15,
    },
  },
  31: {
    name: 'Guitar Harmonics',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.7 },
      { type: 'sine', ratio: 4, gain: 0.5 },
      { type: 'sine', ratio: 8, gain: 0.3 },
    ],
    envelope: {
      attack: 0.02,
      decay: 0.3,
      sustain: 0.4,
      release: 0.5,
    },
  },

  // Bass Family (32-39)
  32: {
    name: 'Acoustic Bass',
    oscillatorType: 'triangle',
    harmonics: [{ type: 'sine', ratio: 2, gain: 0.3 }],
    envelope: {
      attack: 0.05,
      decay: 0.3,
      sustain: 0.8,
      release: 0.4,
    },
  },
  33: {
    name: 'Electric Bass (finger)',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.4 },
      { type: 'triangle', ratio: 3, gain: 0.2 },
    ],
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.7,
      release: 0.3,
    },
  },
  34: {
    name: 'Electric Bass (pick)',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'triangle', ratio: 2, gain: 0.3 },
      { type: 'sawtooth', ratio: 3, gain: 0.15 },
    ],
    envelope: {
      attack: 0.005,
      decay: 0.15,
      sustain: 0.6,
      release: 0.25,
    },
  },
  35: {
    name: 'Fretless Bass',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.5 },
      { type: 'triangle', ratio: 3, gain: 0.3 },
    ],
    envelope: {
      attack: 0.02,
      decay: 0.25,
      sustain: 0.8,
      release: 0.4,
    },
  },
  36: {
    name: 'Slap Bass 1',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'square', ratio: 2, gain: 0.6 },
      { type: 'sawtooth', ratio: 3, gain: 0.3 },
    ],
    envelope: {
      attack: 0.005,
      decay: 0.1,
      sustain: 0.4,
      release: 0.2,
    },
  },
  37: {
    name: 'Slap Bass 2',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sawtooth', ratio: 2, gain: 0.7 },
      { type: 'square', ratio: 4, gain: 0.3 },
    ],
    envelope: {
      attack: 0.003,
      decay: 0.08,
      sustain: 0.3,
      release: 0.15,
    },
  },
  38: {
    name: 'Synth Bass 1',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'square', ratio: 2, gain: 0.5 },
      { type: 'sawtooth', ratio: 1.5, gain: 0.3 },
    ],
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.6,
      release: 0.2,
    },
  },
  39: {
    name: 'Synth Bass 2',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sawtooth', ratio: 2, gain: 0.6 },
      { type: 'square', ratio: 0.5, gain: 0.4 },
    ],
    envelope: {
      attack: 0.005,
      decay: 0.12,
      sustain: 0.7,
      release: 0.25,
    },
  },

  // Strings (40-47)
  40: {
    name: 'Violin',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.4 },
      { type: 'sine', ratio: 3, gain: 0.2 },
    ],
    envelope: {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.7,
      release: 0.3,
    },
  },
  41: {
    name: 'Viola',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.5 },
      { type: 'sine', ratio: 3, gain: 0.25 },
    ],
    envelope: {
      attack: 0.12,
      decay: 0.25,
      sustain: 0.8,
      release: 0.35,
    },
  },
  42: {
    name: 'Cello',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.6 },
      { type: 'sine', ratio: 3, gain: 0.3 },
    ],
    envelope: {
      attack: 0.15,
      decay: 0.3,
      sustain: 0.85,
      release: 0.4,
    },
  },
  43: {
    name: 'Contrabass',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.7 },
      { type: 'sine', ratio: 3, gain: 0.4 },
    ],
    envelope: {
      attack: 0.2,
      decay: 0.35,
      sustain: 0.9,
      release: 0.5,
    },
  },
  44: {
    name: 'Tremolo Strings',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'sawtooth', ratio: 1.01, gain: 0.5 }, // Tremolo effect
      { type: 'sine', ratio: 2, gain: 0.3 },
    ],
    envelope: {
      attack: 0.08,
      decay: 0.15,
      sustain: 0.75,
      release: 0.25,
    },
  },
  45: {
    name: 'Pizzicato Strings',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.3 },
      { type: 'triangle', ratio: 3, gain: 0.15 },
    ],
    envelope: {
      attack: 0.005,
      decay: 0.1,
      sustain: 0.3,
      release: 0.2,
    },
  },
  46: {
    name: 'Orchestral Harp',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.6 },
      { type: 'sine', ratio: 4, gain: 0.3 },
      { type: 'sine', ratio: 8, gain: 0.1 },
    ],
    envelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.4,
      release: 0.8,
    },
  },
  47: {
    name: 'Timpani',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 1.5, gain: 0.7 },
      { type: 'triangle', ratio: 2, gain: 0.4 },
    ],
    envelope: {
      attack: 0.02,
      decay: 0.2,
      sustain: 0.6,
      release: 1.0,
    },
  },

  // Ensemble (48-55)
  48: {
    name: 'String Ensemble 1',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.5 },
      { type: 'sawtooth', ratio: 1.01, gain: 0.3 }, // Leggero detune per effetto chorus
    ],
    envelope: {
      attack: 0.2,
      decay: 0.3,
      sustain: 0.8,
      release: 0.4,
    },
  },
  49: {
    name: 'String Ensemble 2',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.6 },
      { type: 'sawtooth', ratio: 1.02, gain: 0.4 },
    ],
    envelope: {
      attack: 0.25,
      decay: 0.35,
      sustain: 0.85,
      release: 0.5,
    },
  },
  50: {
    name: 'SynthStrings 1',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'square', ratio: 2, gain: 0.4 },
      { type: 'sawtooth', ratio: 1.5, gain: 0.3 },
    ],
    envelope: {
      attack: 0.15,
      decay: 0.2,
      sustain: 0.7,
      release: 0.3,
    },
  },
  51: {
    name: 'SynthStrings 2',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'square', ratio: 2, gain: 0.5 },
      { type: 'sawtooth', ratio: 0.5, gain: 0.3 },
    ],
    envelope: {
      attack: 0.18,
      decay: 0.25,
      sustain: 0.75,
      release: 0.35,
    },
  },
  52: {
    name: 'Choir Aahs',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.7 },
      { type: 'sine', ratio: 3, gain: 0.4 },
      { type: 'sine', ratio: 5, gain: 0.2 },
    ],
    envelope: {
      attack: 0.3,
      decay: 0.2,
      sustain: 0.9,
      release: 0.4,
    },
  },
  53: {
    name: 'Voice Oohs',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.6 },
      { type: 'sine', ratio: 4, gain: 0.3 },
    ],
    envelope: {
      attack: 0.25,
      decay: 0.15,
      sustain: 0.8,
      release: 0.3,
    },
  },
  54: {
    name: 'Synth Voice',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.5 },
      { type: 'sawtooth', ratio: 3, gain: 0.3 },
    ],
    envelope: {
      attack: 0.2,
      decay: 0.1,
      sustain: 0.7,
      release: 0.25,
    },
  },
  55: {
    name: 'Orchestra Hit',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sawtooth', ratio: 2, gain: 0.8 },
      { type: 'square', ratio: 3, gain: 0.6 },
    ],
    envelope: {
      attack: 0.01,
      decay: 0.05,
      sustain: 0.3,
      release: 0.1,
    },
  },

  // Brass (56-63)
  56: {
    name: 'Trumpet',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.5 },
      { type: 'sine', ratio: 3, gain: 0.3 },
    ],
    envelope: {
      attack: 0.05,
      decay: 0.1,
      sustain: 0.8,
      release: 0.1,
    },
  },
  57: {
    name: 'Trombone',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.6 },
      { type: 'sine', ratio: 3, gain: 0.4 },
    ],
    envelope: {
      attack: 0.08,
      decay: 0.15,
      sustain: 0.85,
      release: 0.2,
    },
  },
  58: {
    name: 'Tuba',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.7 },
      { type: 'sine', ratio: 3, gain: 0.5 },
    ],
    envelope: {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.9,
      release: 0.3,
    },
  },
  59: {
    name: 'Muted Trumpet',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.3 },
      { type: 'triangle', ratio: 3, gain: 0.2 },
    ],
    envelope: {
      attack: 0.03,
      decay: 0.08,
      sustain: 0.6,
      release: 0.15,
    },
  },
  60: {
    name: 'French Horn',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.6 },
      { type: 'sine', ratio: 3, gain: 0.4 },
      { type: 'sine', ratio: 4, gain: 0.2 },
    ],
    envelope: {
      attack: 0.12,
      decay: 0.18,
      sustain: 0.8,
      release: 0.25,
    },
  },
  61: {
    name: 'Brass Section',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.7 },
      { type: 'square', ratio: 3, gain: 0.5 },
    ],
    envelope: {
      attack: 0.06,
      decay: 0.12,
      sustain: 0.85,
      release: 0.18,
    },
  },
  62: {
    name: 'SynthBrass 1',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'square', ratio: 2, gain: 0.6 },
      { type: 'sawtooth', ratio: 3, gain: 0.4 },
    ],
    envelope: {
      attack: 0.04,
      decay: 0.1,
      sustain: 0.7,
      release: 0.15,
    },
  },
  63: {
    name: 'SynthBrass 2',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'square', ratio: 2, gain: 0.7 },
      { type: 'sawtooth', ratio: 1.5, gain: 0.5 },
    ],
    envelope: {
      attack: 0.03,
      decay: 0.08,
      sustain: 0.65,
      release: 0.12,
    },
  },

  // Reed (64-71)
  64: {
    name: 'Soprano Sax',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.6 },
      { type: 'sine', ratio: 3, gain: 0.4 },
    ],
    envelope: {
      attack: 0.05,
      decay: 0.1,
      sustain: 0.7,
      release: 0.2,
    },
  },
  65: {
    name: 'Alto Sax',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.7 },
      { type: 'sine', ratio: 3, gain: 0.5 },
    ],
    envelope: {
      attack: 0.06,
      decay: 0.12,
      sustain: 0.75,
      release: 0.25,
    },
  },
  66: {
    name: 'Tenor Sax',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.8 },
      { type: 'sine', ratio: 3, gain: 0.6 },
    ],
    envelope: {
      attack: 0.07,
      decay: 0.15,
      sustain: 0.8,
      release: 0.3,
    },
  },
  67: {
    name: 'Baritone Sax',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.85 },
      { type: 'sine', ratio: 3, gain: 0.65 },
    ],
    envelope: {
      attack: 0.08,
      decay: 0.18,
      sustain: 0.85,
      release: 0.35,
    },
  },
  68: {
    name: 'Oboe',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.5 },
      { type: 'sawtooth', ratio: 3, gain: 0.3 },
    ],
    envelope: {
      attack: 0.04,
      decay: 0.08,
      sustain: 0.7,
      release: 0.15,
    },
  },
  69: {
    name: 'English Horn',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.6 },
      { type: 'sawtooth', ratio: 3, gain: 0.4 },
    ],
    envelope: {
      attack: 0.06,
      decay: 0.12,
      sustain: 0.75,
      release: 0.2,
    },
  },
  70: {
    name: 'Bassoon',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.7 },
      { type: 'sawtooth', ratio: 3, gain: 0.5 },
    ],
    envelope: {
      attack: 0.08,
      decay: 0.15,
      sustain: 0.8,
      release: 0.25,
    },
  },
  71: {
    name: 'Clarinet',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sine', ratio: 3, gain: 0.6 },
      { type: 'sine', ratio: 5, gain: 0.3 },
    ],
    envelope: {
      attack: 0.05,
      decay: 0.1,
      sustain: 0.8,
      release: 0.2,
    },
  },

  // Pipe (72-79)
  72: {
    name: 'Piccolo',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.4 },
      { type: 'sine', ratio: 4, gain: 0.2 },
    ],
    envelope: {
      attack: 0.02,
      decay: 0.05,
      sustain: 0.6,
      release: 0.1,
    },
  },
  73: {
    name: 'Flute',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.3 },
      { type: 'sine', ratio: 3, gain: 0.15 },
    ],
    envelope: {
      attack: 0.03,
      decay: 0.08,
      sustain: 0.7,
      release: 0.15,
    },
  },
  74: {
    name: 'Recorder',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.4 },
      { type: 'triangle', ratio: 3, gain: 0.2 },
    ],
    envelope: {
      attack: 0.02,
      decay: 0.06,
      sustain: 0.65,
      release: 0.12,
    },
  },
  75: {
    name: 'Pan Flute',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.5 },
      { type: 'sine', ratio: 4, gain: 0.2 },
    ],
    envelope: {
      attack: 0.04,
      decay: 0.1,
      sustain: 0.8,
      release: 0.2,
    },
  },
  76: {
    name: 'Blown Bottle',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 1.5, gain: 0.6 },
      { type: 'sine', ratio: 3, gain: 0.3 },
    ],
    envelope: {
      attack: 0.05,
      decay: 0.15,
      sustain: 0.7,
      release: 0.3,
    },
  },
  77: {
    name: 'Shakuhachi',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.4 },
      { type: 'triangle', ratio: 1.5, gain: 0.3 },
    ],
    envelope: {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.6,
      release: 0.4,
    },
  },
  78: {
    name: 'Whistle',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.6 },
      { type: 'sine', ratio: 4, gain: 0.3 },
    ],
    envelope: {
      attack: 0.01,
      decay: 0.03,
      sustain: 0.8,
      release: 0.05,
    },
  },
  79: {
    name: 'Ocarina',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.5 },
      { type: 'triangle', ratio: 3, gain: 0.25 },
    ],
    envelope: {
      attack: 0.03,
      decay: 0.08,
      sustain: 0.75,
      release: 0.15,
    },
  },

  // Synth Lead (80-87)
  80: {
    name: 'Lead 1 (square)',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sawtooth', ratio: 1.01, gain: 0.5 }, // Leggero detune
    ],
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.6,
      release: 0.2,
    },
  },
  81: {
    name: 'Lead 2 (sawtooth)',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'square', ratio: 2, gain: 0.4 },
      { type: 'sawtooth', ratio: 1.02, gain: 0.3 },
    ],
    envelope: {
      attack: 0.005,
      decay: 0.08,
      sustain: 0.7,
      release: 0.15,
    },
  },
  82: {
    name: 'Lead 3 (calliope)',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.6 },
      { type: 'square', ratio: 4, gain: 0.3 },
    ],
    envelope: {
      attack: 0.02,
      decay: 0.05,
      sustain: 0.8,
      release: 0.1,
    },
  },
  83: {
    name: 'Lead 4 (chiff)',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'square', ratio: 2, gain: 0.5 },
      { type: 'sawtooth', ratio: 3, gain: 0.3 },
    ],
    envelope: {
      attack: 0.001,
      decay: 0.03,
      sustain: 0.5,
      release: 0.08,
    },
  },
  84: {
    name: 'Lead 5 (charang)',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'square', ratio: 1.5, gain: 0.7 },
      { type: 'sawtooth', ratio: 2.5, gain: 0.4 },
    ],
    envelope: {
      attack: 0.008,
      decay: 0.06,
      sustain: 0.6,
      release: 0.12,
    },
  },
  85: {
    name: 'Lead 6 (voice)',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.5 },
      { type: 'sine', ratio: 3, gain: 0.3 },
    ],
    envelope: {
      attack: 0.15,
      decay: 0.1,
      sustain: 0.8,
      release: 0.2,
    },
  },
  86: {
    name: 'Lead 7 (fifths)',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'sawtooth', ratio: 1.5, gain: 0.8 }, // Perfect fifth
      { type: 'square', ratio: 2, gain: 0.4 },
    ],
    envelope: {
      attack: 0.01,
      decay: 0.08,
      sustain: 0.7,
      release: 0.15,
    },
  },
  87: {
    name: 'Lead 8 (bass + lead)',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'square', ratio: 0.5, gain: 0.6 }, // Sub-octave
      { type: 'sawtooth', ratio: 2, gain: 0.4 },
    ],
    envelope: {
      attack: 0.005,
      decay: 0.1,
      sustain: 0.8,
      release: 0.2,
    },
  },

  // Synth Pad (88-95)
  88: {
    name: 'Pad 1 (new age)',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.6 },
      { type: 'sine', ratio: 3, gain: 0.4 },
      { type: 'sine', ratio: 5, gain: 0.2 },
    ],
    envelope: {
      attack: 0.5,
      decay: 0.3,
      sustain: 0.8,
      release: 1.0,
    },
  },
  89: {
    name: 'Pad 2 (warm)',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.5 },
      { type: 'sawtooth', ratio: 1.01, gain: 0.3 },
    ],
    envelope: {
      attack: 0.4,
      decay: 0.2,
      sustain: 0.9,
      release: 0.8,
    },
  },
  90: {
    name: 'Pad 3 (polysynth)',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'square', ratio: 2, gain: 0.4 },
      { type: 'sawtooth', ratio: 1.5, gain: 0.3 },
    ],
    envelope: {
      attack: 0.3,
      decay: 0.25,
      sustain: 0.85,
      release: 0.6,
    },
  },
  91: {
    name: 'Pad 4 (choir)',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.7 },
      { type: 'sine', ratio: 3, gain: 0.5 },
      { type: 'sine', ratio: 4, gain: 0.3 },
    ],
    envelope: {
      attack: 0.6,
      decay: 0.2,
      sustain: 0.9,
      release: 1.2,
    },
  },
  92: {
    name: 'Pad 5 (bowed)',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.6 },
      { type: 'sawtooth', ratio: 3, gain: 0.3 },
    ],
    envelope: {
      attack: 0.8,
      decay: 0.3,
      sustain: 0.8,
      release: 1.0,
    },
  },
  93: {
    name: 'Pad 6 (metallic)',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.5 },
      { type: 'square', ratio: 4, gain: 0.4 },
      { type: 'sine', ratio: 8, gain: 0.2 },
    ],
    envelope: {
      attack: 0.2,
      decay: 0.4,
      sustain: 0.7,
      release: 0.8,
    },
  },
  94: {
    name: 'Pad 7 (halo)',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.8 },
      { type: 'sine', ratio: 4, gain: 0.6 },
      { type: 'sine', ratio: 8, gain: 0.3 },
    ],
    envelope: {
      attack: 1.0,
      decay: 0.5,
      sustain: 0.9,
      release: 1.5,
    },
  },
  95: {
    name: 'Pad 8 (sweep)',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'square', ratio: 2, gain: 0.6 },
      { type: 'sawtooth', ratio: 1.5, gain: 0.4 },
    ],
    envelope: {
      attack: 0.3,
      decay: 0.8,
      sustain: 0.6,
      release: 1.2,
    },
  },

  // Synth Effects (96-103)
  96: {
    name: 'FX 1 (rain)',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 1.5, gain: 0.7 },
      { type: 'sine', ratio: 2.3, gain: 0.5 },
    ],
    envelope: {
      attack: 0.1,
      decay: 2.0,
      sustain: 0.3,
      release: 3.0,
    },
  },
  97: {
    name: 'FX 2 (soundtrack)',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'square', ratio: 2, gain: 0.5 },
      { type: 'sawtooth', ratio: 0.5, gain: 0.4 },
    ],
    envelope: {
      attack: 0.5,
      decay: 1.0,
      sustain: 0.7,
      release: 2.0,
    },
  },
  98: {
    name: 'FX 3 (crystal)',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.8 },
      { type: 'sine', ratio: 4, gain: 0.6 },
      { type: 'sine', ratio: 8, gain: 0.4 },
    ],
    envelope: {
      attack: 0.02,
      decay: 0.5,
      sustain: 0.6,
      release: 1.5,
    },
  },
  99: {
    name: 'FX 4 (atmosphere)',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 1.2, gain: 0.6 },
      { type: 'sine', ratio: 1.8, gain: 0.4 },
    ],
    envelope: {
      attack: 1.5,
      decay: 2.0,
      sustain: 0.8,
      release: 3.0,
    },
  },
  100: {
    name: 'FX 5 (brightness)',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.7 },
      { type: 'square', ratio: 4, gain: 0.5 },
    ],
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.9,
      release: 0.5,
    },
  },
  101: {
    name: 'FX 6 (goblins)',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'square', ratio: 1.3, gain: 0.8 },
      { type: 'sawtooth', ratio: 2.7, gain: 0.5 },
    ],
    envelope: {
      attack: 0.3,
      decay: 0.8,
      sustain: 0.5,
      release: 1.0,
    },
  },
  102: {
    name: 'FX 7 (echoes)',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.6 },
      { type: 'sine', ratio: 3, gain: 0.3 },
    ],
    envelope: {
      attack: 0.05,
      decay: 1.5,
      sustain: 0.4,
      release: 2.5,
    },
  },
  103: {
    name: 'FX 8 (sci-fi)',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sawtooth', ratio: 1.7, gain: 0.7 },
      { type: 'square', ratio: 3.2, gain: 0.4 },
    ],
    envelope: {
      attack: 0.2,
      decay: 0.6,
      sustain: 0.6,
      release: 1.5,
    },
  },

  // Ethnic (104-111)
  104: {
    name: 'Sitar',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.6 },
      { type: 'sawtooth', ratio: 3, gain: 0.4 },
      { type: 'sine', ratio: 5, gain: 0.2 },
    ],
    envelope: {
      attack: 0.02,
      decay: 0.3,
      sustain: 0.5,
      release: 0.8,
    },
  },
  105: {
    name: 'Banjo',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.5 },
      { type: 'triangle', ratio: 3, gain: 0.3 },
    ],
    envelope: {
      attack: 0.005,
      decay: 0.08,
      sustain: 0.3,
      release: 0.15,
    },
  },
  106: {
    name: 'Shamisen',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.4 },
      { type: 'triangle', ratio: 4, gain: 0.2 },
    ],
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.4,
      release: 0.2,
    },
  },
  107: {
    name: 'Koto',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.6 },
      { type: 'triangle', ratio: 3, gain: 0.3 },
    ],
    envelope: {
      attack: 0.02,
      decay: 0.3,
      sustain: 0.4,
      release: 0.5,
    },
  },
  108: {
    name: 'Kalimba',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.7 },
      { type: 'sine', ratio: 4, gain: 0.3 },
    ],
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.5,
      release: 0.4,
    },
  },
  109: {
    name: 'Bag pipe',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.8 },
      { type: 'square', ratio: 3, gain: 0.4 },
    ],
    envelope: {
      attack: 0.1,
      decay: 0.1,
      sustain: 1.0,
      release: 0.2,
    },
  },
  110: {
    name: 'Fiddle',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.5 },
      { type: 'sawtooth', ratio: 3, gain: 0.3 },
    ],
    envelope: {
      attack: 0.08,
      decay: 0.15,
      sustain: 0.7,
      release: 0.25,
    },
  },
  111: {
    name: 'Shanai',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.7 },
      { type: 'square', ratio: 3, gain: 0.5 },
    ],
    envelope: {
      attack: 0.06,
      decay: 0.12,
      sustain: 0.8,
      release: 0.2,
    },
  },

  // Percussive (112-119)
  112: {
    name: 'Tinkle Bell',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.8 },
      { type: 'sine', ratio: 4, gain: 0.6 },
      { type: 'sine', ratio: 8, gain: 0.3 },
    ],
    envelope: {
      attack: 0.005,
      decay: 0.1,
      sustain: 0.3,
      release: 0.5,
    },
  },
  113: {
    name: 'Agogo',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.6 },
      { type: 'triangle', ratio: 4, gain: 0.3 },
    ],
    envelope: {
      attack: 0.003,
      decay: 0.05,
      sustain: 0.2,
      release: 0.1,
    },
  },
  114: {
    name: 'Steel Drums',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.7 },
      { type: 'sine', ratio: 3, gain: 0.4 },
    ],
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.4,
      release: 0.3,
    },
  },
  115: {
    name: 'Woodblock',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'square', ratio: 2, gain: 0.3 },
      { type: 'triangle', ratio: 4, gain: 0.2 },
    ],
    envelope: {
      attack: 0.001,
      decay: 0.02,
      sustain: 0.1,
      release: 0.05,
    },
  },
  116: {
    name: 'Taiko Drum',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 0.5, gain: 0.8 },
      { type: 'triangle', ratio: 1.5, gain: 0.4 },
    ],
    envelope: {
      attack: 0.005,
      decay: 0.1,
      sustain: 0.3,
      release: 0.2,
    },
  },
  117: {
    name: 'Melodic Tom',
    oscillatorType: 'triangle',
    harmonics: [
      { type: 'sine', ratio: 1.5, gain: 0.7 },
      { type: 'triangle', ratio: 2, gain: 0.3 },
    ],
    envelope: {
      attack: 0.01,
      decay: 0.15,
      sustain: 0.2,
      release: 0.3,
    },
  },
  118: {
    name: 'Synth Drum',
    oscillatorType: 'square',
    harmonics: [
      { type: 'sawtooth', ratio: 0.5, gain: 0.6 },
      { type: 'square', ratio: 2, gain: 0.3 },
    ],
    envelope: {
      attack: 0.003,
      decay: 0.08,
      sustain: 0.1,
      release: 0.12,
    },
  },
  119: {
    name: 'Reverse Cymbal',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'square', ratio: 2, gain: 0.5 },
      { type: 'sawtooth', ratio: 4, gain: 0.3 },
    ],
    envelope: {
      attack: 1.0,
      decay: 0.2,
      sustain: 0.3,
      release: 0.1,
    },
  },

  // Sound Effects (120-127)
  120: {
    name: 'Guitar Fret Noise',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'square', ratio: 2, gain: 0.4 },
      { type: 'sawtooth', ratio: 4, gain: 0.2 },
    ],
    envelope: {
      attack: 0.001,
      decay: 0.03,
      sustain: 0.1,
      release: 0.05,
    },
  },
  121: {
    name: 'Breath Noise',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'sine', ratio: 1.3, gain: 0.6 },
      { type: 'sawtooth', ratio: 2.7, gain: 0.3 },
    ],
    envelope: {
      attack: 0.02,
      decay: 0.5,
      sustain: 0.3,
      release: 0.8,
    },
  },
  122: {
    name: 'Seashore',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 1.2, gain: 0.7 },
      { type: 'sine', ratio: 1.8, gain: 0.5 },
    ],
    envelope: {
      attack: 2.0,
      decay: 3.0,
      sustain: 0.6,
      release: 4.0,
    },
  },
  123: {
    name: 'Bird Tweet',
    oscillatorType: 'sine',
    harmonics: [
      { type: 'sine', ratio: 2, gain: 0.8 },
      { type: 'sine', ratio: 4, gain: 0.4 },
    ],
    envelope: {
      attack: 0.01,
      decay: 0.05,
      sustain: 0.8,
      release: 0.1,
    },
  },
  124: {
    name: 'Telephone Ring',
    oscillatorType: 'sine',
    harmonics: [{ type: 'sine', ratio: 2, gain: 0.9 }],
    envelope: {
      attack: 0.001,
      decay: 0.02,
      sustain: 0.9,
      release: 0.02,
    },
  },
  125: {
    name: 'Helicopter',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'square', ratio: 0.3, gain: 0.8 },
      { type: 'sawtooth', ratio: 0.7, gain: 0.6 },
    ],
    envelope: {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.9,
      release: 0.3,
    },
  },
  126: {
    name: 'Applause',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'square', ratio: 1.5, gain: 0.6 },
      { type: 'sawtooth', ratio: 2.3, gain: 0.4 },
    ],
    envelope: {
      attack: 0.05,
      decay: 1.0,
      sustain: 0.7,
      release: 2.0,
    },
  },
  127: {
    name: 'Gunshot',
    oscillatorType: 'sawtooth',
    harmonics: [
      { type: 'square', ratio: 2, gain: 0.9 },
      { type: 'sawtooth', ratio: 4, gain: 0.6 },
    ],
    envelope: {
      attack: 0.001,
      decay: 0.01,
      sustain: 0.1,
      release: 0.02,
    },
  },
};
