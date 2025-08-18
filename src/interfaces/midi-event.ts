export interface MidiEvent {
  type: number;
  subtype?: number;
  channel?: number;
  deltaTime: number;
  data?: number[];
  absoluteTick: number; // Posizione assoluta in ticks
  absoluteTime?: number; // Posizione assoluta in ms (calcolata dal timing)
}
