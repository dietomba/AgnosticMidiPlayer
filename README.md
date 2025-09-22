# AgnosticMidiPlayer

Un Web Component per la riproduzione di file MIDI con sintetizzatore software integrato.

## Caratteristiche

### Controller e Automazione ⭐⭐ - IMPLEMENTATI ✅

| Controller | Codice | Status | Descrizione |
|------------|--------|---------|-------------|
| **Volume** | CC7 | ✅ | Controllo volume principale per canale |
| **Pan** | CC10 | ✅ | Posizionamento stereo (sinistra/centro/destra) |
| **Modulation** | CC1 | ✅ | Modulazione/vibrato |
| **Expression** | CC11 | ✅ | Controllo dinamico del volume |
| **Sustain Pedal** | CC64 | ✅ | Pedale sustain |
| **Portamento** | CC65 | ✅ | Transizioni fluide tra note |
| **Reverb Send** | CC91 | ✅ | Livello invio riverbero |
| **Chorus Send** | CC93 | ✅ | Livello invio chorus |
| **All Notes Off** | CC123 | ✅ | Ferma tutte le note |
| **Reset Controllers** | CC121 | ✅ | Reset tutti i controller |
| **Pitch Bend** | - | ✅ | Pitch bend con range ±2 semitoni |

### Implementazione Tecnica

#### Pan (CC10)
- Conversione valori MIDI (0-127) in range stereo (-1 a +1)
- 0 = completamente a sinistra
- 64 = centro
- 127 = completamente a destra
- Implementato sia per AudioWorklet che nodi standard

#### Modulation (CC1)
- Implementato come vibrato a 5Hz
- Intensità variabile da 0 a 10 cents di variazione
- Applicato dinamicamente alle note attive

#### Expression (CC11)
- Controllo dinamico del volume che si combina con il volume principale (CC7)
- Valore di default: 127 (massima expression)
- Permette controllo fine del volume senza interferire con CC7

#### Portamento (CC65)
- Placeholder per future transizioni fluide tra note
- Valori memorizzati per canale

#### Reverb/Chorus Send (CC91/CC93)
- Controlli per livelli di effetti
- Base per future implementazioni di effetti audio

#### All Notes Off (CC123)
- Ferma immediatamente tutte le note sul canale specificato
- Diverso dal normale note-off, bypassa sustain

#### Reset Controllers (CC121)
- Reset tutti i controller ai valori di default:
  - Pan: 64 (centro)
  - Modulation: 0
  - Expression: 127
  - Portamento: 0
  - Reverb: 0
  - Chorus: 0
  - Sustain: off
  - Pitch Bend: 0

## Test

Per testare i controller implementati, apri il file `test-controllers.html` in un browser moderno.

Il test include:
- Controlli interattivi per tutti i controller
- Test automatico di Pan, Modulation ed Expression
- Visualizzazione dello status AudioWorklet
- Pulsanti per test rapidi

## Utilizzo

```javascript
import { SimpleSynthesizer } from './src/utils/simple-synthesizer.js';

const synth = new SimpleSynthesizer();
await synth.waitForWorkletReady();

// Controllo Pan
synth.controlChange(0, 10, 0);   // Pan sinistro
synth.controlChange(0, 10, 64);  // Pan centro
synth.controlChange(0, 10, 127); // Pan destro

// Modulation
synth.controlChange(0, 1, 100);  // Modulation alta

// Expression
synth.controlChange(0, 11, 64);  // Expression media

// All Notes Off
synth.controlChange(0, 123, 0);

// Reset Controllers
synth.controlChange(0, 121, 0);
```

## Compatibilità

- ✅ AudioWorklet (Chrome, Firefox, Safari moderni)
- ✅ Fallback con nodi Web Audio standard
- ✅ Tutti i controller funzionano in entrambe le modalità