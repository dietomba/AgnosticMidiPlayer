# MIDI Controller Implementation - Technical Documentation

## Implemented Controllers

This document describes the implementation of missing MIDI controllers in the AgnosticMidiPlayer Web Component.

### 1. Pan (CC10) ✅

**Implementation:**
- MIDI value (0-127) converted to Web Audio range (-1 to +1)
- Formula: `panValue = (value - 64) / 64`
- Uses `StereoPannerNode` for actual panning
- Full support in both AudioWorklet and standard nodes

**Audio chain:**
```
ChannelGain → StereoPanner → MasterGain → Destination
```

### 2. Modulation (CC1) ✅

**Implementation:**
- Vibrato implemented as frequency modulation
- LFO frequency: 5Hz (standard for musical vibrato)
- Maximum depth: 10 cents variation
- Real-time application to active notes

**Vibrato formula:**
```javascript
const vibratoAmount = modulation * 0.1 * Math.sin(currentTime * 2 * Math.PI * 5);
const frequency = baseFrequency * Math.pow(2, vibratoAmount / 12);
```

### 3. Expression (CC11) ✅

**Implementation:**
- Multiplicative controller for channel volume
- Combines with CC7 (Main Volume): `finalVolume = volume * expression`
- Does not interfere with main volume
- Allows fine dynamic control of intensity

### 4. Portamento (CC65) ✅

**Implementation:**
- Values stored per channel for future implementations
- Structure ready for slide/glissando between notes
- Placeholder for smooth frequency transitions

### 5. Reverb Send (CC91) e Chorus Send (CC93) ✅

**Implementation:**
- Values stored per channel
- Structure ready for effects chain
- Foundation for future implementations of:
  - Convolution reverb
  - Chorus with modulated delay

### 6. All Notes Off (CC123) ✅

**Implementation:**
- Stops all notes on a specific channel
- Bypasses sustain pedal
- Implementation for both AudioWorklet and standard nodes

```javascript
public allNotesOffChannel(channel: number): void {
  const notes = this.activeNotes.get(channel);
  if (notes) {
    for (const note of notes.keys()) {
      this.noteOff(channel, note);
    }
  }
}
```

### 7. Reset Controllers (CC121) ✅

**Implementation:**
- Reset all controllers to default values:
  - Pan: 64 (center)
  - Modulation: 0
  - Expression: 127 (full intensity)
  - Portamento: 0
  - Reverb/Chorus: 0
  - Sustain: false
  - Pitch Bend: 0

## Architettura Dual-Mode

### AudioWorklet Mode
- Processing in separate thread
- Better performance for real-time audio
- Controller state management in worklet
- Communication via MessagePort

### Standard Nodes Fallback
- Broader browser compatibility
- Identical logic but in main thread
- Uses standard Web Audio API
- Adequate performance for most use cases

## Performance Considerations

### AudioWorklet
- All controllers processed in audio thread
- Zero latency for modulation and panning
- Perfect synchronization with sample rate

### Standard Nodes
- Controllers applied via automation
- `setValueAtTime()` for smooth transitions
- Optimized envelope and modulation handling

## Future Extensions

### Reverb Implementation
```javascript
// Possible implementation with ConvolverNode
const convolver = ctx.createConvolver();
convolver.buffer = reverbImpulseResponse;
channelGain.connect(reverbSend);
reverbSend.connect(convolver);
convolver.connect(reverbReturn);
```

### Chorus Implementation
```javascript
// Possible implementation with modulated DelayNode
const chorusDelay = ctx.createDelay();
const chorusLFO = ctx.createOscillator();
chorusLFO.connect(chorusDelay.delayTime);
```

## Test Coverage

The `test-controllers.html` file verifies:
- ✅ All controller functionality
- ✅ Correct interaction between controllers
- ✅ Reset and All Notes Off
- ✅ AudioWorklet/Standard Nodes compatibility
- ✅ Accurate stereo panning
- ✅ Real-time modulation

## Standard MIDI Compliance

The implementation follows MIDI standard specifications:
- CC1: Modulation Wheel (0-127)
- CC7: Main Volume (0-127)
- CC10: Pan (0=left, 64=center, 127=right)
- CC11: Expression (0-127)
- CC64: Sustain Pedal (0-63=off, 64-127=on)
- CC65: Portamento (0-127)
- CC91: Reverb Send (0-127)
- CC93: Chorus Send (0-127)
- CC121: Reset All Controllers
- CC123: All Notes Off