export interface MidiPlayerOptions {
  // Source del file MIDI (URL o ArrayBuffer)
  source?: string | ArrayBuffer;
  
  // Opzioni di riproduzione
  autoplay?: boolean;
  loop?: boolean;
  volume?: number;
  
  // Eventi
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}
