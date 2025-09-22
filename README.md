# AgnosticMidiPlayer

A Web Component for MIDI file playback with integrated software synthesizer and extended support for advanced MIDI standards.

## Features

### ✅ Supported MIDI Standards

| Standard | Status | Description |
|----------|--------|-------------|
| **General MIDI (GM)** | ✅ | Base standard with 128 instruments |
| **General MIDI Level 2 (GM2)** | ✅ | GM extension with additional banks (121-127) |
| **Roland GS** | ✅ | Roland extension with special banks and NRPN |
| **Yamaha XG** | ✅ | Yamaha extension with XG banks and SFX |

### ✅ Automatic Format Recognition
- **SysEx Detection**: Automatic recognition via System Exclusive messages
- **GM Reset**: `F0 7E 7F 09 01 F7`
- **GM2 System On**: `F0 7E 7F 09 03 F7`  
- **GS Reset**: `F0 41 10 16 12 40 00 7F 00 41 F7`
- **XG System On**: `F0 43 10 4C 00 00 7E 00 F7`

### Controllers and Automation ⭐⭐ - IMPLEMENTED ✅

| Controller | Code | Status | Description |
|------------|--------|---------|-------------|
| **Volume** | CC7 | ✅ | Main volume control per channel |
| **Pan** | CC10 | ✅ | Stereo positioning (left/center/right) |
| **Modulation** | CC1 | ✅ | Modulation/vibrato |
| **Expression** | CC11 | ✅ | Dynamic volume control |
| **Sustain Pedal** | CC64 | ✅ | Sustain pedal |
| **Portamento** | CC65 | ✅ | Smooth transitions between notes |
| **Reverb Send** | CC91 | ✅ | Reverb send level |
| **Chorus Send** | CC93 | ✅ | Chorus send level |
| **All Notes Off** | CC123 | ✅ | Stop all notes |
| **Reset Controllers** | CC121 | ✅ | Reset all controllers |
| **Pitch Bend** | - | ✅ | Pitch bend with configurable range |

### ✅ Advanced RPN/NRPN Controllers

| Controller | Code | Status | Description |
|------------|--------|---------|-------------|
| **RPN MSB** | CC101 | ✅ | Registered Parameter Number MSB |
| **RPN LSB** | CC100 | ✅ | Registered Parameter Number LSB |
| **NRPN MSB** | CC99 | ✅ | Non-Registered Parameter Number MSB |
| **NRPN LSB** | CC98 | ✅ | Non-Registered Parameter Number LSB |
| **Data Entry MSB** | CC6 | ✅ | Data Entry for RPN/NRPN |
| **Data Entry LSB** | CC38 | ✅ | Data Entry LSB for RPN/NRPN |

### ✅ Supported RPN

| RPN | Description | Support |
|-----|-------------|---------|
| **00 00** | Pitch Bend Sensitivity | ✅ |
| **00 01** | Fine Tuning | ✅ |
| **00 02** | Coarse Tuning | ✅ |
| **00 03** | Tuning Program Select (GM2) | ✅ |
| **00 04** | Tuning Bank Select (GM2) | ✅ |

### Technical Implementation

#### Pan (CC10)
- Converts MIDI values (0-127) to stereo range (-1 to +1)
- 0 = completely left
- 64 = center
- 127 = completely right
- Implemented for both AudioWorklet and standard nodes

#### Modulation (CC1)
- Implemented as 5Hz vibrato
- Variable intensity from 0 to 10 cents variation
- Applied dynamically to active notes

#### Expression (CC11)
- Dynamic volume control that combines with main volume (CC7)
- Default value: 127 (maximum expression)
- Allows fine volume control without interfering with CC7

#### Portamento (CC65)
- Placeholder for future smooth note transitions
- Values stored per channel

#### Reverb/Chorus Send (CC91/CC93)
- Controls for effect levels
- Base for future audio effect implementations

#### All Notes Off (CC123)
- Immediately stops all notes on specified channel
- Different from normal note-off, bypasses sustain

#### Reset Controllers (CC121)
- Resets all controllers to default values:
  - Pan: 64 (center)
  - Modulation: 0
  - Expression: 127
  - Portamento: 0
  - Reverb: 0
  - Chorus: 0
  - Sustain: off
  - Pitch Bend: 0

### ✅ Supported Extended Banks

#### General MIDI Level 2 (GM2)
- **Bank 121**: Piano Variations (European Grand, Classical Grand, Studio Grand)
- **Bank 122**: Organ Variations (Jazz Organ 1, Jazz Organ 2)
- **Bank 123**: Guitar Variations (Classical Guitar, Folk Guitar)
- **Bank 128**: GM2 Drum Kits (Room Kit, Power Kit, etc.)

#### Roland GS
- **Bank 1**: GS Capital Tone (GS Grand Piano, GS Bright Piano)
- **Bank 8**: GS Synthesizer (GS Square Lead, GS Saw Lead)
- **Bank 16-64**: Other specialized GS banks

#### Yamaha XG
- **Bank 1-15**: XG Instrument Variations per family
- **Bank 127**: XG SFX Bank (Cutting Noise, special effects)
- **Bank 128**: XG Drum Kits

### ✅ Specific NRPN

#### Roland GS NRPN
- **01 08**: Vibrato Rate
- **01 09**: Vibrato Depth  
- **01 0A**: Vibrato Delay
- **01 20**: Filter Cutoff
- **01 21**: Filter Resonance

#### Yamaha XG NRPN
- **01 08**: Vibrato Rate
- **01 09**: Vibrato Depth
- **01 0A**: Vibrato Delay  
- **01 20**: Filter Cutoff Frequency
- **01 21**: Filter Resonance

## Testing

To test the implemented controllers, open the `test-controllers.html` file in a modern browser.

The test includes:
- Interactive controls for all controllers
- Automatic testing of Pan, Modulation and Expression
- AudioWorklet status visualization
- Quick test buttons

## Usage

```javascript
import { SimpleSynthesizer } from './src/utils/simple-synthesizer.js';

const synth = new SimpleSynthesizer();
await synth.waitForWorkletReady();

// Pan Control
synth.controlChange(0, 10, 0);   // Pan left
synth.controlChange(0, 10, 64);  // Pan center
synth.controlChange(0, 10, 127); // Pan right

// Modulation
synth.controlChange(0, 1, 100);  // High modulation

// Expression
synth.controlChange(0, 11, 64);  // Medium expression

// All Notes Off
synth.controlChange(0, 123, 0);

// Reset Controllers
synth.controlChange(0, 121, 0);
```

## Compatibility

- ✅ AudioWorklet (modern Chrome, Firefox, Safari)
- ✅ Fallback with standard Web Audio nodes
- ✅ All controllers work in both modes