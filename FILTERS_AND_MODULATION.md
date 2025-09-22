# Audio Filters and Modulation

The AgnosticMidiPlayer Web Component now supports advanced audio filters and LFO modulation to create more expressive and realistic sounds.

## Audio Filters

### Supported Filter Types

1. **Low-pass Filter** (`lowpass`)
   - Allows low frequencies to pass through and attenuates high frequencies
   - Useful for removing harshness from sounds
   - Example: soft brass sounds, atmospheric pads

2. **High-pass Filter** (`highpass`)
   - Allows high frequencies to pass through and attenuates low frequencies
   - Useful for bright and cutting sounds
   - Example: synthetic leads, percussive effects

3. **Band-pass Filter** (`bandpass`)
   - Allows a specific frequency band to pass through
   - Useful for creating "telephone" sounds or emphasizing specific ranges
   - Example: filtered voices, special effects

### Filter Configuration

```typescript
filter: {
  type: 'lowpass' | 'highpass' | 'bandpass',
  frequency: number, // Cutoff frequency in Hz
  Q: number, // Resonance factor (1-30)
  envelope?: { // Optional envelope for the filter
    attack: number,
    decay: number,
    sustain: number,
    release: number,
    amount: number // Modulation amount (-1 to 1)
  }
}
```

## LFO Modulation (Low Frequency Oscillator)

### Supported Features

1. **Vibrato** - Frequency modulation
   - Creates oscillations in note frequency
   - Simulates natural instrument expressiveness

2. **Tremolo** - Amplitude modulation
   - Creates oscillations in sound volume
   - Adds rhythmic movement

3. **Filter Sweep** - Filter modulation
   - Creates oscillations in filter frequency
   - Automatic "wah-wah" effects

### LFO Configuration

```typescript
lfo: {
  frequency: number, // LFO frequency in Hz (typically 0.1-20)
  amplitude: number, // Modulation amplitude (0-1)
  targets: Array<{
    parameter: 'frequency' | 'gain' | 'filter',
    amount: number // Effect intensity (0-1)
  }>
}
```

## Usage Examples

### Instrument with Low-pass Filter and Vibrato

```typescript
// Trumpet with low-pass filter and vibrato
{
  name: 'Trumpet',
  oscillatorType: 'square',
  envelope: { /* ... */ },
  filter: {
    type: 'lowpass',
    frequency: 2000,
    Q: 1.5,
    envelope: {
      attack: 0.02,
      decay: 0.05,
      sustain: 0.7,
      release: 0.1,
      amount: 0.8
    }
  },
  lfo: {
    frequency: 5,
    amplitude: 0.3,
    targets: [
      { parameter: 'frequency', amount: 0.1 } // Light vibrato
    ]
  }
}
```

### Synth Lead with High-pass Filter and Complex Modulation

```typescript
// Synthetic lead with high-pass filter, vibrato and filter sweep
{
  name: 'Lead Synth',
  oscillatorType: 'sawtooth',
  envelope: { /* ... */ },
  filter: {
    type: 'highpass',
    frequency: 400,
    Q: 1.8,
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.6,
      release: 0.2,
      amount: -0.5 // Negative modulation
    }
  },
  lfo: {
    frequency: 4.5,
    amplitude: 0.5,
    targets: [
      { parameter: 'frequency', amount: 0.15 }, // Vibrato
      { parameter: 'filter', amount: 0.4 } // Filter sweep
    ]
  }
}
```

### Trombone with Band-pass Filter, Tremolo and Filter Sweep

```typescript
// Trombone with band-pass filter and multiple modulation
{
  name: 'Trombone',
  oscillatorType: 'square',
  envelope: { /* ... */ },
  filter: {
    type: 'bandpass',
    frequency: 800,
    Q: 2.0
  },
  lfo: {
    frequency: 6,
    amplitude: 0.4,
    targets: [
      { parameter: 'gain', amount: 0.2 }, // Tremolo
      { parameter: 'filter', amount: 0.3 } // Filter sweep
    ]
  }
}
```

## Recommended Parameters

### Filter Cutoff Frequencies
- **Low-pass**: 800-5000 Hz (acoustic instruments), 200-2000 Hz (pads)
- **High-pass**: 100-800 Hz (bass cleanup), 400-1200 Hz (brightness)
- **Band-pass**: Center band 200-2000 Hz

### Q Factor
- **Low Q (0.5-2)**: Smooth transition, natural sound
- **Medium Q (2-8)**: Moderate emphasis, distinctive character
- **High Q (8-30)**: Marked resonance, special effects

### LFO Frequencies
- **Vibrato**: 4-8 Hz (natural), 8-15 Hz (expressive)
- **Tremolo**: 3-10 Hz (musical), 10-20 Hz (effect)
- **Filter Sweep**: 0.1-2 Hz (slow), 2-8 Hz (rhythmic)

## Compatibility

The new features are fully backward compatible:
- Existing instruments will continue to work normally
- The `filter` and `lfo` parameters are optional
- Default behavior remains unchanged