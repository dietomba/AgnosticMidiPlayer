# Bank Select Implementation (CC0/CC32)

## Overview

Bank Select is now fully implemented in the MIDI Web Component. This feature allows MIDI files to switch between different instrument banks using Control Change messages CC0 (Bank Select MSB) and CC32 (Bank Select LSB).

## Technical Implementation

### 1. **ControllerType Enum** (`src/interfaces/midi-event-types.ts`)
Added comprehensive MIDI Control Change constants including:
- `BANK_SELECT_MSB = 0` (CC0)
- `BANK_SELECT_LSB = 32` (CC32)
- All standard MIDI controllers

### 2. **SimpleSynthesizer Bank Support** (`src/utils/simple-synthesizer.ts`)
Enhanced with complete Bank Select functionality:

#### New Properties:
- `bankSelectMSB: Map<number, number>` - Tracks CC0 values per channel
- `bankSelectLSB: Map<number, number>` - Tracks CC32 values per channel
- `currentBanks: Map<number, number>` - Current bank number per channel

#### New Methods:
- `updateCurrentBank(channel)` - Calculates complete bank: `(MSB << 7) + LSB`
- `getBankInfo(channel)` - Returns bank state for debugging
- `getAllBankInfo()` - Returns all channels' bank states

#### Enhanced Methods:
- `controlChange()` - Now handles CC0 and CC32
- `getInstrumentDefinition()` - Uses bank + program for instrument selection
- `programChange()` - Works with current bank context

### 3. **Bank Calculation**
Standard MIDI Bank Select calculation:
```javascript
bank = (bankSelectMSB << 7) + bankSelectLSB
```
- MSB provides 0-127 range (bits 7-13)
- LSB provides 0-127 range (bits 0-6)
- Total range: 0-16383 banks

## Usage Examples

### Basic Bank Selection
```javascript
const synth = new SimpleSynthesizer();

// Select Bank 1 (Variation Bank)
synth.controlChange(channel, ControllerType.BANK_SELECT_MSB, 1);
synth.controlChange(channel, ControllerType.BANK_SELECT_LSB, 0);

// Select program after bank selection
synth.programChange(channel, 0); // Piano variation from Bank 1
```

### Advanced Bank Selection
```javascript
// High bank number (e.g., Bank 128 = Drum Kit)
synth.controlChange(channel, ControllerType.BANK_SELECT_MSB, 1);
synth.controlChange(channel, ControllerType.BANK_SELECT_LSB, 0);
// Bank = (1 << 7) + 0 = 128

// Complex bank selection
synth.controlChange(channel, ControllerType.BANK_SELECT_MSB, 2);
synth.controlChange(channel, ControllerType.BANK_SELECT_LSB, 64);
// Bank = (2 << 7) + 64 = 256 + 64 = 320
```

### Debugging Bank State
```javascript
// Get current bank info for a channel
const info = synth.getBankInfo(0);
console.log(info); // { msb: 1, lsb: 0, bank: 128, program: 0 }

// Get all channels' bank info
const allInfo = synth.getAllBankInfo();
```

## MIDI File Integration

The Bank Select implementation is fully integrated with the MIDI player:

1. **Automatic Parsing**: MIDI files with CC0/CC32 messages are automatically parsed
2. **Real-time Processing**: Bank changes are applied during playback
3. **Channel Independence**: Each MIDI channel maintains its own bank state
4. **Program Context**: Program changes use the current bank for instrument selection

## Supported Banks

Currently supported bank types:
- **Bank 0**: General MIDI standard instruments (default)
- **Bank 128**: Standard MIDI drum kits 
- **Other Banks**: Fall back to General MIDI instruments

## Standards Compliance

This implementation follows:
- **MIDI 1.0 Specification**: Complete CC0/CC32 support
- **General MIDI Level 1**: Bank 0 instrument mapping
- **Roland GS**: Bank 128 drum kit support
- **Yamaha XG**: Compatible bank selection

## Testing

Bank Select functionality can be tested using:
- `test-bank-select.html` - Interactive web test
- `getBankInfo()` method - Debug current state
- MIDI files with Bank Select messages

## Performance Notes

- Bank selection has minimal performance impact
- Bank state is calculated only when CC0/CC32 are received
- No additional memory overhead for unused banks
- Compatible with existing MIDI files without Bank Select

## Future Enhancements

Possible improvements:
1. Extended bank definitions for non-GM instruments
2. Custom bank mapping configuration
3. Bank-specific sound variations
4. Percussion bank implementations