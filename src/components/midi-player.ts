import { MidiPlayerBase } from './midi-player-base';

export class MidiPlayer extends MidiPlayerBase {
  private container: HTMLDivElement;
  private playButton: HTMLButtonElement;
  private progressBar: HTMLProgressElement;
  private timeDisplay: HTMLSpanElement;

  constructor() {
    super();

    // Crea l'interfaccia utente
    this.container = document.createElement('div');
    this.container.classList.add('midi-player');

    this.playButton = document.createElement('button');
    this.playButton.innerHTML = '▶';
    this.playButton.addEventListener('click', () => this.togglePlay());

    this.progressBar = document.createElement('progress');
    this.progressBar.value = 0;
    this.progressBar.addEventListener('click', (e) => this.handleProgressBarClick(e));

    this.timeDisplay = document.createElement('span');
    this.timeDisplay.classList.add('time-display');
    this.timeDisplay.textContent = '0:00 / 0:00';

    // Aggiungi gli elementi al container
    this.container.appendChild(this.playButton);
    this.container.appendChild(this.progressBar);
    this.container.appendChild(this.timeDisplay);

    // Aggiungi stili
    const style = document.createElement('style');
    style.textContent = `
      .midi-player {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: #f5f5f5;
        border-radius: 4px;
      }

      button {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background: #2196f3;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
      }

      progress {
        flex: 1;
        height: 8px;
        border-radius: 4px;
      }

      .time-display {
        font-family: monospace;
        min-width: 100px;
      }
    `;

    // Aggiungi elementi al shadow DOM
    this.shadowRoot?.appendChild(style);
    this.shadowRoot?.appendChild(this.container);

    // Aggiungi listener per gli eventi
    this.addEventListener('play', () => this.updatePlayButton());
    this.addEventListener('pause', () => this.updatePlayButton());
    this.addEventListener('stop', () => this.updatePlayButton());
    this.addEventListener('timeupdate', () => this.updateProgress());
  }

  private togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  private updatePlayButton(): void {
    this.playButton.innerHTML = this.isPlaying ? '⏸' : '▶';
  }

  private updateProgress(): void {
    if (this.duration > 0) {
      this.progressBar.value = (this.currentTime / this.duration) * 100;
      this.timeDisplay.textContent = `${this.formatTime(this.currentTime)} / ${this.formatTime(this.duration)}`;
    }
  }

  private handleProgressBarClick(event: MouseEvent): void {
    const rect = this.progressBar.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    this.seek(pos * this.duration);
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

// Registra il componente
customElements.define('midi-player', MidiPlayer);
