# Extended MIDI ### Additional drum kits**: 9 standard drum kits in bank 128

### GM2 Banks Implemented

#### Bank 121 - Piano Variationsards Implementation

## Overview

The **AgnosticMidiPlayer** now fully supports the following extended MIDI standards:

- **General MIDI Level 2 (GM2)**
- **Roland GS**  
- **Yamaha XG**

## General MIDI Level 2 (GM2)

### New Features
- **24 MIDI channels** (extended compatibility)
- **Bank 120-127**: GM1 instrument variations
- **Extended RPN**: Master tuning, configurable pitch bend sensitivity
- **Additional drum kits**: 9 standard drum kits in bank 128

### Bank GM2 Implementati

#### Bank 121 - Piano Variations
```
Program 0: European Grand
Program 1: Classical Grand  
Program 2: Studio Grand
```

#### Bank 122 - Organ Variations
```
Program 16: Jazz Organ 1
Program 17: Jazz Organ 2
```

#### Bank 123 - Guitar Variations
```
Program 24: Classical Guitar
Program 25: Folk Guitar
```

#### Bank 128 - GM2 Drum Kits
```
Program 1: Room Kit (Room Bass Drum, Room Snare)
Program 9: Power Kit (Power Bass Drum, Power Snare)
```

### SysEx GM2
```
GM2 System On: F0 7E 7F 09 03 F7
```

## Roland GS

### Specific Features
- **Capital Tone Bank**: Roland instrument variations
- **Extended NRPN**: Vibrato and filter controls
- **GS Effects**: Roland-specific Reverb and Chorus

### GS Banks Implemented

#### Bank 1 - GS Capital Tone
```
Program 0: GS Grand Piano
Program 1: GS Bright Piano
```

#### Bank 8 - GS Synthesizer
```
Program 80: GS Square Lead
Program 81: GS Saw Lead
```

### NRPN Roland GS
```
01 08 (MSB 01, LSB 08): Vibrato Rate
01 09 (MSB 01, LSB 09): Vibrato Depth
01 0A (MSB 01, LSB 0A): Vibrato Delay
01 20 (MSB 01, LSB 20): Filter Cutoff
01 21 (MSB 01, LSB 21): Filter Resonance
```

### SysEx GS
```
GS Reset: F0 41 10 16 12 40 00 7F 00 41 F7
```

## Yamaha XG

### Specific Features
- **Family-specific Banks**: Banks 1-15 for instrument families
- **SFX Bank 127**: Special sound effects
- **XG NRPN**: XG-specific filter and modulation controls

### XG Banks Implemented

#### Bank 1 - XG Piano
```
Program 0: XG Grand Piano
```

#### Bank 127 - XG SFX
```
Program 120: XG Cutting Noise
Program 121: XG Cutting Noise 2
```

### NRPN Yamaha XG
```
01 08 (MSB 01, LSB 08): Vibrato Rate
01 09 (MSB 01, LSB 09): Vibrato Depth
01 0A (MSB 01, LSB 0A): Vibrato Delay
01 20 (MSB 01, LSB 20): Filter Cutoff Frequency
01 21 (MSB 01, LSB 21): Filter Resonance
```

### SysEx XG
```
XG System On: F0 43 10 4C 00 00 7E 00 F7
```

## RPN (Registered Parameter Numbers)

### RPN Standard Supportati

#### RPN 00 00 - Pitch Bend Sensitivity
- **MSB**: Semitones (default: 2)
- **LSB**: Cents (default: 0)
- **Range**: 0-24 semitones

#### RPN 00 01 - Fine Tuning
- **14-bit value**: -100 to +100 cents
- **Center**: 8192 (0 cents)
- **Resolution**: 100/8192 cents per step

#### RPN 00 02 - Coarse Tuning
- **MSB**: Semitones (-64 to +63)
- **Center**: 64 (0 semitones)

#### RPN 00 03 - Tuning Program Select (GM2)
- **MSB**: Tuning program number (0-127)
- **Specific**: GM2 only

#### RPN 00 04 - Tuning Bank Select (GM2)
- **MSB**: Tuning bank number (0-127)
- **Specific**: GM2 only

## Technical Implementation

### Automatic Detection
The system automatically detects the MIDI format based on received SysEx messages:

```typescript
// Detection example
const formatInfo = midiPlayer.synth.getMidiStandardInfo();
console.log(formatInfo.standard); // 'GM', 'GM2', 'GS', or 'XG'
console.log(formatInfo.detected); // true if detected via SysEx
```

### Bank Selection
```typescript
// GM2 Piano Variations
CC0 (Bank MSB): 121
CC32 (Bank LSB): 0  
Program Change: 0 // European Grand

// Roland GS Capital Tone
CC0 (Bank MSB): 1
CC32 (Bank LSB): 0
Program Change: 0 // GS Grand Piano

// Yamaha XG SFX
CC0 (Bank MSB): 127
CC32 (Bank LSB): 0
Program Change: 120 // XG Cutting Noise
```

### RPN/NRPN Programming
```typescript
// Set Pitch Bend Sensitivity to 12 semitones
CC101: 0    // RPN MSB
CC100: 0    // RPN LSB  
CC6: 12     // Data Entry MSB (12 semitones)

// Roland GS Vibrato Rate
CC99: 1     // NRPN MSB
CC98: 8     // NRPN LSB (01 08)
CC6: 64     // Data Entry MSB (vibrato value)
```

## Compatibility

### Backward Compatibility
- **General MIDI**: Fully compatible
- **Standard MIDI**: All standard controllers work
- **Bank 0**: Always available with standard GM instruments

### Future Extensions
The architecture easily supports:
- New custom banks
- Additional NRPN
- Other proprietary MIDI standards
- Advanced audio effects

## Testing

To test extended features:

1. **GM2 MIDI files**: Use banks 120-127
2. **GS MIDI files**: Contains GS Reset SysEx
3. **XG MIDI files**: Contains XG System On SysEx
4. **RPN/NRPN**: Files with controllers 98-101

The system will automatically detect the format and activate appropriate features.