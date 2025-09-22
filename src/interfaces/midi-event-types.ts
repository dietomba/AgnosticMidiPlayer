export enum MidiEventType {
  NOTE_OFF = 0x80,
  NOTE_ON = 0x90,
  NOTE_AFTERTOUCH = 0xa0,
  CONTROLLER = 0xb0,
  PROGRAM_CHANGE = 0xc0,
  CHANNEL_AFTERTOUCH = 0xd0,
  PITCH_BEND = 0xe0,
  SYSTEM_EXCLUSIVE = 0xf0,
  META = 0xff,
}

// Alias for convenience
export const SYSEX = MidiEventType.SYSTEM_EXCLUSIVE;

export enum MetaEventType {
  SEQUENCE_NUMBER = 0x00,
  TEXT = 0x01,
  COPYRIGHT = 0x02,
  TRACK_NAME = 0x03,
  INSTRUMENT_NAME = 0x04,
  LYRICS = 0x05,
  MARKER = 0x06,
  CUE_POINT = 0x07,
  PROGRAM_NAME = 0x08,
  DEVICE_NAME = 0x09,
  MIDI_CHANNEL_PREFIX = 0x20,
  MIDI_PORT = 0x21,
  END_OF_TRACK = 0x2f,
  SET_TEMPO = 0x51,
  SMPTE_OFFSET = 0x54,
  TIME_SIGNATURE = 0x58,
  KEY_SIGNATURE = 0x59,
  SEQUENCER_SPECIFIC = 0x7f,
}

export enum ControllerType {
  BANK_SELECT_MSB = 0, // CC0 - Bank Select MSB
  MODULATION_WHEEL = 1, // CC1 - Modulation Wheel
  BREATH_CONTROLLER = 2, // CC2 - Breath Controller
  FOOT_CONTROLLER = 4, // CC4 - Foot Controller
  PORTAMENTO_TIME = 5, // CC5 - Portamento Time
  DATA_ENTRY_MSB = 6, // CC6 - Data Entry MSB
  MAIN_VOLUME = 7, // CC7 - Main Volume
  BALANCE = 8, // CC8 - Balance
  PAN = 10, // CC10 - Pan
  EXPRESSION = 11, // CC11 - Expression
  BANK_SELECT_LSB = 32, // CC32 - Bank Select LSB
  DATA_ENTRY_LSB = 38, // CC38 - Data Entry LSB
  SUSTAIN_PEDAL = 64, // CC64 - Sustain Pedal
  PORTAMENTO = 65, // CC65 - Portamento
  SOSTENUTO = 66, // CC66 - Sostenuto
  SOFT_PEDAL = 67, // CC67 - Soft Pedal
  LEGATO_FOOTSWITCH = 68, // CC68 - Legato Footswitch
  HOLD_2 = 69, // CC69 - Hold 2
  SOUND_CONTROLLER_1 = 70, // CC70 - Sound Controller 1 (default: Sound Variation)
  SOUND_CONTROLLER_2 = 71, // CC71 - Sound Controller 2 (default: Timbre/Harmonic Intens.)
  SOUND_CONTROLLER_3 = 72, // CC72 - Sound Controller 3 (default: Release Time)
  SOUND_CONTROLLER_4 = 73, // CC73 - Sound Controller 4 (default: Attack Time)
  SOUND_CONTROLLER_5 = 74, // CC74 - Sound Controller 5 (default: Brightness)
  SOUND_CONTROLLER_6 = 75, // CC75 - Sound Controller 6 (default: Decay Time)
  SOUND_CONTROLLER_7 = 76, // CC76 - Sound Controller 7 (default: Vibrato Rate)
  SOUND_CONTROLLER_8 = 77, // CC77 - Sound Controller 8 (default: Vibrato Depth)
  SOUND_CONTROLLER_9 = 78, // CC78 - Sound Controller 9 (default: Vibrato Delay)
  SOUND_CONTROLLER_10 = 79, // CC79 - Sound Controller 10 (default: Undefined)
  EFFECTS_1_DEPTH = 91, // CC91 - Effects 1 Depth (default: Reverb Send Level)
  EFFECTS_2_DEPTH = 92, // CC92 - Effects 2 Depth (default: Tremolo Level)
  EFFECTS_3_DEPTH = 93, // CC93 - Effects 3 Depth (default: Chorus Send Level)
  EFFECTS_4_DEPTH = 94, // CC94 - Effects 4 Depth (default: Celeste Level)
  EFFECTS_5_DEPTH = 95, // CC95 - Effects 5 Depth (default: Phaser Level)
  ALL_SOUND_OFF = 120, // CC120 - All Sound Off
  RESET_ALL_CONTROLLERS = 121, // CC121 - Reset All Controllers
  LOCAL_CONTROL = 122, // CC122 - Local Control
  ALL_NOTES_OFF = 123, // CC123 - All Notes Off
}
