export interface MidiEvent {
  type: number;
  subtype?: number;
  channel?: number;
  deltaTime: number;
  data?: number[];
  absoluteTime: number;
}
