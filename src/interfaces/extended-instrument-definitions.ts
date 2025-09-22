import { InstrumentDefinition } from './instrument-definitions';

export interface MidiStandardInfo {
  standard: 'GM' | 'GM2' | 'GS' | 'XG';
  version?: string;
  detected?: boolean;
}

export interface ExtendedBankMapping {
  msb: number;
  lsb: number;
  bankId: number;
  standard: 'GM' | 'GM2' | 'GS' | 'XG';
  name: string;
  instruments?: Record<number, InstrumentDefinition>;
}

// General MIDI Level 2 - Variazioni degli strumenti GM1
export const gm2VariationInstruments: Record<number, Record<number, InstrumentDefinition>> = {
  // Bank 121: Piano variations
  121: {
    0: {
      name: 'European Grand',
      oscillatorType: 'triangle',
      harmonics: [
        { type: 'sine', ratio: 2, gain: 0.6 },
        { type: 'sine', ratio: 4, gain: 0.3 },
        { type: 'sine', ratio: 8, gain: 0.1 },
      ],
      envelope: {
        attack: 0.02,
        decay: 0.15,
        sustain: 0.8,
        release: 0.4,
      },
    },
    1: {
      name: 'Classical Grand',
      oscillatorType: 'triangle',
      harmonics: [
        { type: 'sine', ratio: 2, gain: 0.5 },
        { type: 'triangle', ratio: 3, gain: 0.3 },
        { type: 'sine', ratio: 4, gain: 0.2 },
      ],
      envelope: {
        attack: 0.025,
        decay: 0.12,
        sustain: 0.75,
        release: 0.35,
      },
    },
    2: {
      name: 'Studio Grand',
      oscillatorType: 'triangle',
      harmonics: [
        { type: 'sine', ratio: 2, gain: 0.7 },
        { type: 'sine', ratio: 4, gain: 0.4 },
        { type: 'sine', ratio: 6, gain: 0.15 },
      ],
      envelope: {
        attack: 0.015,
        decay: 0.1,
        sustain: 0.7,
        release: 0.3,
      },
    },
  },

  // Bank 122: Organ variations
  122: {
    16: {
      name: 'Jazz Organ 1',
      oscillatorType: 'square',
      harmonics: [
        { type: 'sine', ratio: 2, gain: 0.8 },
        { type: 'square', ratio: 3, gain: 0.4 },
        { type: 'sine', ratio: 4, gain: 0.2 },
      ],
      envelope: {
        attack: 0.01,
        decay: 0.05,
        sustain: 0.9,
        release: 0.1,
      },
    },
    17: {
      name: 'Jazz Organ 2',
      oscillatorType: 'square',
      harmonics: [
        { type: 'sine', ratio: 2, gain: 0.6 },
        { type: 'square', ratio: 3, gain: 0.6 },
        { type: 'triangle', ratio: 4, gain: 0.3 },
      ],
      envelope: {
        attack: 0.008,
        decay: 0.04,
        sustain: 0.95,
        release: 0.08,
      },
    },
  },

  // Bank 123: Guitar variations
  123: {
    24: {
      name: 'Classical Guitar',
      oscillatorType: 'triangle',
      harmonics: [
        { type: 'sine', ratio: 2, gain: 0.4 },
        { type: 'triangle', ratio: 3, gain: 0.2 },
        { type: 'sine', ratio: 5, gain: 0.1 },
      ],
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.4,
        release: 0.2,
      },
    },
    25: {
      name: 'Folk Guitar',
      oscillatorType: 'triangle',
      harmonics: [
        { type: 'sine', ratio: 2, gain: 0.5 },
        { type: 'triangle', ratio: 3, gain: 0.3 },
        { type: 'sine', ratio: 4, gain: 0.15 },
      ],
      envelope: {
        attack: 0.012,
        decay: 0.08,
        sustain: 0.45,
        release: 0.18,
      },
    },
  },
};

// Roland GS Instrument variations
export const gsVariationInstruments: Record<number, Record<number, InstrumentDefinition>> = {
  // Bank 1: GS Capital Tone variations
  1: {
    0: {
      name: 'GS Grand Piano',
      oscillatorType: 'triangle',
      harmonics: [
        { type: 'sine', ratio: 2, gain: 0.6 },
        { type: 'sine', ratio: 4, gain: 0.3 },
        { type: 'triangle', ratio: 6, gain: 0.1 },
      ],
      envelope: {
        attack: 0.02,
        decay: 0.12,
        sustain: 0.75,
        release: 0.35,
      },
    },
    1: {
      name: 'GS Bright Piano',
      oscillatorType: 'triangle',
      harmonics: [
        { type: 'sine', ratio: 2, gain: 0.8 },
        { type: 'sine', ratio: 4, gain: 0.5 },
        { type: 'sine', ratio: 8, gain: 0.2 },
      ],
      envelope: {
        attack: 0.015,
        decay: 0.1,
        sustain: 0.8,
        release: 0.3,
      },
    },
  },

  // Bank 8: GS Synthesizer bank
  8: {
    80: {
      name: 'GS Square Lead',
      oscillatorType: 'square',
      harmonics: [
        { type: 'square', ratio: 2, gain: 0.5 },
        { type: 'sawtooth', ratio: 3, gain: 0.3 },
      ],
      envelope: {
        attack: 0.005,
        decay: 0.02,
        sustain: 0.9,
        release: 0.05,
      },
    },
    81: {
      name: 'GS Saw Lead',
      oscillatorType: 'sawtooth',
      harmonics: [
        { type: 'sawtooth', ratio: 2, gain: 0.6 },
        { type: 'square', ratio: 4, gain: 0.2 },
      ],
      envelope: {
        attack: 0.003,
        decay: 0.015,
        sustain: 0.95,
        release: 0.03,
      },
    },
  },
};

// Yamaha XG Instrument variations
export const xgVariationInstruments: Record<number, Record<number, InstrumentDefinition>> = {
  // Bank 1: XG variations
  1: {
    0: {
      name: 'XG Grand Piano',
      oscillatorType: 'triangle',
      harmonics: [
        { type: 'sine', ratio: 2, gain: 0.65 },
        { type: 'sine', ratio: 4, gain: 0.35 },
        { type: 'triangle', ratio: 8, gain: 0.12 },
      ],
      envelope: {
        attack: 0.018,
        decay: 0.11,
        sustain: 0.78,
        release: 0.32,
      },
    },
  },

  // Bank 127: XG SFX Bank
  127: {
    120: {
      name: 'XG Cutting Noise',
      oscillatorType: 'square',
      harmonics: [
        { type: 'square', ratio: 1.5, gain: 0.8 },
        { type: 'sawtooth', ratio: 3.7, gain: 0.4 },
      ],
      envelope: {
        attack: 0.001,
        decay: 0.05,
        sustain: 0.1,
        release: 0.02,
      },
    },
    121: {
      name: 'XG Cutting Noise 2',
      oscillatorType: 'sawtooth',
      harmonics: [
        { type: 'square', ratio: 2.1, gain: 0.6 },
        { type: 'sawtooth', ratio: 4.3, gain: 0.3 },
      ],
      envelope: {
        attack: 0.002,
        decay: 0.03,
        sustain: 0.15,
        release: 0.015,
      },
    },
  },
};

// GM2 Drum kits aggiuntivi
export const gm2DrumKits: Record<number, Record<number, InstrumentDefinition>> = {
  // Bank 128 Program 1: Room Kit
  1: {
    36: {
      // Bass Drum
      name: 'Room Bass Drum',
      oscillatorType: 'sine',
      harmonics: [
        { type: 'sine', ratio: 0.5, gain: 0.8 },
        { type: 'triangle', ratio: 1, gain: 0.6 },
      ],
      envelope: {
        attack: 0.001,
        decay: 0.15,
        sustain: 0.1,
        release: 0.1,
      },
    },
    38: {
      // Snare Drum
      name: 'Room Snare',
      oscillatorType: 'square',
      harmonics: [
        { type: 'square', ratio: 2, gain: 0.7 },
        { type: 'sawtooth', ratio: 4, gain: 0.4 },
      ],
      envelope: {
        attack: 0.001,
        decay: 0.08,
        sustain: 0.2,
        release: 0.05,
      },
    },
  },

  // Bank 128 Program 9: Power Kit
  9: {
    36: {
      // Bass Drum
      name: 'Power Bass Drum',
      oscillatorType: 'sine',
      harmonics: [
        { type: 'sine', ratio: 0.5, gain: 1.0 },
        { type: 'triangle', ratio: 1, gain: 0.8 },
        { type: 'square', ratio: 2, gain: 0.3 },
      ],
      envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0.15,
        release: 0.12,
      },
    },
    38: {
      // Snare Drum
      name: 'Power Snare',
      oscillatorType: 'square',
      harmonics: [
        { type: 'square', ratio: 2, gain: 0.9 },
        { type: 'sawtooth', ratio: 4, gain: 0.6 },
        { type: 'square', ratio: 8, gain: 0.2 },
      ],
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0.25,
        release: 0.06,
      },
    },
  },
};

// Mapping dei bank per standard
export const bankMappings: Record<string, ExtendedBankMapping[]> = {
  GM2: [
    { msb: 120, lsb: 0, bankId: 120, standard: 'GM2', name: 'GM2 Variation 1' },
    {
      msb: 121,
      lsb: 0,
      bankId: 121,
      standard: 'GM2',
      name: 'GM2 Piano Variations',
      instruments: gm2VariationInstruments[121],
    },
    {
      msb: 122,
      lsb: 0,
      bankId: 122,
      standard: 'GM2',
      name: 'GM2 Organ Variations',
      instruments: gm2VariationInstruments[122],
    },
    {
      msb: 123,
      lsb: 0,
      bankId: 123,
      standard: 'GM2',
      name: 'GM2 Guitar Variations',
      instruments: gm2VariationInstruments[123],
    },
    { msb: 124, lsb: 0, bankId: 124, standard: 'GM2', name: 'GM2 Variation 5' },
    { msb: 125, lsb: 0, bankId: 125, standard: 'GM2', name: 'GM2 Variation 6' },
    { msb: 126, lsb: 0, bankId: 126, standard: 'GM2', name: 'GM2 Variation 7' },
    { msb: 127, lsb: 0, bankId: 127, standard: 'GM2', name: 'GM2 Variation 8' },
  ],

  GS: [
    {
      msb: 1,
      lsb: 0,
      bankId: 1,
      standard: 'GS',
      name: 'GS Capital Tone',
      instruments: gsVariationInstruments[1],
    },
    {
      msb: 8,
      lsb: 0,
      bankId: 8,
      standard: 'GS',
      name: 'GS Synthesizer',
      instruments: gsVariationInstruments[8],
    },
    { msb: 16, lsb: 0, bankId: 16, standard: 'GS', name: 'GS Electric Piano' },
    { msb: 24, lsb: 0, bankId: 24, standard: 'GS', name: 'GS Guitar' },
    { msb: 25, lsb: 0, bankId: 25, standard: 'GS', name: 'GS Distortion Guitar' },
    { msb: 32, lsb: 0, bankId: 32, standard: 'GS', name: 'GS Bass' },
    { msb: 40, lsb: 0, bankId: 40, standard: 'GS', name: 'GS Strings' },
    { msb: 48, lsb: 0, bankId: 48, standard: 'GS', name: 'GS Ensemble' },
    { msb: 56, lsb: 0, bankId: 56, standard: 'GS', name: 'GS Brass' },
    { msb: 64, lsb: 0, bankId: 64, standard: 'GS', name: 'GS Reed & Pipe' },
  ],

  XG: [
    {
      msb: 1,
      lsb: 0,
      bankId: 1,
      standard: 'XG',
      name: 'XG Piano',
      instruments: xgVariationInstruments[1],
    },
    { msb: 2, lsb: 0, bankId: 2, standard: 'XG', name: 'XG Chromatic Percussion' },
    { msb: 3, lsb: 0, bankId: 3, standard: 'XG', name: 'XG Organ' },
    { msb: 4, lsb: 0, bankId: 4, standard: 'XG', name: 'XG Guitar' },
    { msb: 5, lsb: 0, bankId: 5, standard: 'XG', name: 'XG Bass' },
    { msb: 6, lsb: 0, bankId: 6, standard: 'XG', name: 'XG Strings' },
    { msb: 7, lsb: 0, bankId: 7, standard: 'XG', name: 'XG Ensemble' },
    { msb: 8, lsb: 0, bankId: 8, standard: 'XG', name: 'XG Brass' },
    { msb: 9, lsb: 0, bankId: 9, standard: 'XG', name: 'XG Reed' },
    { msb: 10, lsb: 0, bankId: 10, standard: 'XG', name: 'XG Pipe' },
    { msb: 11, lsb: 0, bankId: 11, standard: 'XG', name: 'XG Synth Lead' },
    { msb: 12, lsb: 0, bankId: 12, standard: 'XG', name: 'XG Synth Pad' },
    { msb: 13, lsb: 0, bankId: 13, standard: 'XG', name: 'XG Synth Effects' },
    { msb: 14, lsb: 0, bankId: 14, standard: 'XG', name: 'XG Ethnic' },
    { msb: 15, lsb: 0, bankId: 15, standard: 'XG', name: 'XG Percussive' },
    {
      msb: 127,
      lsb: 0,
      bankId: 127,
      standard: 'XG',
      name: 'XG SFX',
      instruments: xgVariationInstruments[127],
    },
  ],
};

// SysEx messages for format detection
export const formatDetectionSysEx = {
  GM_RESET: [0xf0, 0x7e, 0x7f, 0x09, 0x01, 0xf7],
  GM2_ON: [0xf0, 0x7e, 0x7f, 0x09, 0x03, 0xf7],
  GS_RESET: [0xf0, 0x41, 0x10, 0x16, 0x12, 0x40, 0x00, 0x7f, 0x00, 0x41, 0xf7],
  XG_SYSTEM_ON: [0xf0, 0x43, 0x10, 0x4c, 0x00, 0x00, 0x7e, 0x00, 0xf7],
};
