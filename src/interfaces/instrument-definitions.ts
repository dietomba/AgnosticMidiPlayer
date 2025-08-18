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

// Definizioni base degli strumenti MIDI General MIDI Level 1
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

  // Organ (16-23)
  16: {
    name: 'Hammond Organ',
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

  // Guitar (24-31)
  24: {
    name: 'Acoustic Guitar',
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

  // Bass (32-39)
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

  // Ensemble (48-55)
  48: {
    name: 'Strings Ensemble',
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

  // Synth Lead (80-87)
  80: {
    name: 'Square Lead',
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
};
