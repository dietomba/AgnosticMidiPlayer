export class MidiTiming {
  private ticksPerQuarterNote: number;
  private tempoChanges: Array<{ tick: number; tempo: number }> = [];
  private currentTempo: number = 500000; // Default: 120 BPM (500000 microseconds per quarter note)

  constructor(ticksPerQuarterNote: number) {
    this.ticksPerQuarterNote = ticksPerQuarterNote;
  }

  /**
   * Aggiunge un cambio di tempo
   * @param tick Posizione in ticks del cambio di tempo
   * @param tempo Tempo in microsecondi per quarter note
   */
  public addTempoChange(tick: number, tempo: number): void {
    this.tempoChanges.push({ tick, tempo });
    // Ordina i cambi di tempo per posizione
    this.tempoChanges.sort((a, b) => a.tick - b.tick);
  }

  /**
   * Converte una posizione in ticks in millisecondi
   * @param ticks Posizione in ticks
   * @returns Tempo in millisecondi
   */
  public ticksToMilliseconds(ticks: number): number {
    let milliseconds = 0;
    let currentTick = 0;
    let currentTempo = this.currentTempo;

    // Processa tutti i cambi di tempo fino alla posizione richiesta
    for (const change of this.tempoChanges) {
      if (change.tick >= ticks) break;

      // Calcola il tempo fino al cambio di tempo
      const deltaTicks = change.tick - currentTick;
      milliseconds += this.calculateTime(deltaTicks, currentTempo);

      currentTick = change.tick;
      currentTempo = change.tempo;
    }

    // Calcola il tempo rimanente con l'ultimo tempo
    const remainingTicks = ticks - currentTick;
    milliseconds += this.calculateTime(remainingTicks, currentTempo);

    return milliseconds;
  }

  /**
   * Converte millisecondi in ticks
   * @param milliseconds Tempo in millisecondi
   * @returns Posizione in ticks
   */
  public millisecondsToTicks(milliseconds: number): number {
    let ticks = 0;
    let currentMs = 0;
    let currentTempo = this.currentTempo;

    // Processa tutti i cambi di tempo
    for (const change of this.tempoChanges) {
      const changeMs = this.ticksToMilliseconds(change.tick);
      if (changeMs >= milliseconds) break;

      ticks = change.tick;
      currentMs = changeMs;
      currentTempo = change.tempo;
    }

    // Calcola i ticks rimanenti
    const remainingMs = milliseconds - currentMs;
    ticks += this.calculateTicks(remainingMs, currentTempo);

    return ticks;
  }

  private calculateTime(ticks: number, tempo: number): number {
    // Formula: (ticks * tempo) / (ticksPerQuarterNote * 1000)
    return (ticks * tempo) / (this.ticksPerQuarterNote * 1000);
  }

  private calculateTicks(milliseconds: number, tempo: number): number {
    // Formula: (ms * ticksPerQuarterNote * 1000) / tempo
    return (milliseconds * this.ticksPerQuarterNote * 1000) / tempo;
  }
}
