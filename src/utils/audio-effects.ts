/**
 * Sistema di effetti audio per il sintetizzatore MIDI
 * Implementa Reverb, Chorus, Delay e Distortion/Overdrive
 */

export interface EffectParameters {
  bypass?: boolean;
  wetLevel?: number; // 0-1, wet/dry mix
  dryLevel?: number; // 0-1, dry signal level
}

export interface ReverbParameters extends EffectParameters {
  roomSize?: number; // 0-1, dimensione della stanza
  damping?: number; // 0-1, smorzamento delle alte frequenze
  width?: number; // 0-1, larghezza stereo
  preDelay?: number; // 0-100ms, pre-ritardo
}

export interface ChorusParameters extends EffectParameters {
  rate?: number; // 0.1-10 Hz, velocità dell'LFO
  depth?: number; // 0-1, profondità della modulazione
  feedback?: number; // 0-0.95, feedback del ritardo
  delay?: number; // 1-50ms, ritardo base
}

export interface DelayParameters extends EffectParameters {
  time?: number; // 0-2000ms, tempo di ritardo
  feedback?: number; // 0-0.95, feedback
  highCut?: number; // 20-20000Hz, filtro passa-basso
  sync?: boolean; // sincronizzazione al tempo
}

export interface DistortionParameters extends EffectParameters {
  drive?: number; // 0-1, intensità della distorsione
  tone?: number; // 0-1, controllo tonale
  level?: number; // 0-1, livello di uscita
  type?: 'soft' | 'hard' | 'tube' | 'fuzz'; // tipo di distorsione
}

/**
 * Effetto Reverb algoritmico basato su Freeverb
 */
export class ReverbEffect {
  private ctx: AudioContext;
  private input: GainNode;
  private output: GainNode;
  private wetGain: GainNode;
  private dryGain: GainNode;
  private combFilters: BiquadFilterNode[] = [];
  private allpassFilters: GainNode[] = [];
  private delayNodes: DelayNode[] = [];
  private gainNodes: GainNode[] = [];
  private parameters: Required<ReverbParameters>;

  constructor(ctx: AudioContext, params: ReverbParameters = {}) {
    this.ctx = ctx;
    this.parameters = {
      bypass: params.bypass ?? false,
      wetLevel: params.wetLevel ?? 0.3,
      dryLevel: params.dryLevel ?? 0.7,
      roomSize: params.roomSize ?? 0.5,
      damping: params.damping ?? 0.5,
      width: params.width ?? 1.0,
      preDelay: params.preDelay ?? 0,
    };

    this.input = ctx.createGain();
    this.output = ctx.createGain();
    this.wetGain = ctx.createGain();
    this.dryGain = ctx.createGain();

    this.initializeReverb();
    this.updateParameters();
  }

  private initializeReverb(): void {
    // Pre-delay
    const preDelayNode = this.ctx.createDelay(0.1);
    preDelayNode.delayTime.setValueAtTime(this.parameters.preDelay / 1000, this.ctx.currentTime);

    // Comb filters (8 paralleli per simulare riflessioni multiple)
    const combDelayTimes = [0.025, 0.026, 0.028, 0.029, 0.03, 0.031, 0.032, 0.033];

    for (let i = 0; i < combDelayTimes.length; i++) {
      const delay = this.ctx.createDelay(0.1);
      const gain = this.ctx.createGain();
      const damping = this.ctx.createBiquadFilter();

      delay.delayTime.setValueAtTime(combDelayTimes[i], this.ctx.currentTime);
      damping.type = 'lowpass';
      damping.frequency.setValueAtTime(5000, this.ctx.currentTime);

      // Configurazione feedback per riverbero
      preDelayNode.connect(delay);
      delay.connect(damping);
      damping.connect(gain);
      gain.connect(delay); // feedback
      gain.connect(this.wetGain);

      this.delayNodes.push(delay);
      this.gainNodes.push(gain);
      this.combFilters.push(damping);
    }

    // Allpass filters (4 in serie per diffusione)
    const allpassDelayTimes = [0.005, 0.0017, 0.0128, 0.0093];
    let currentNode: AudioNode = this.wetGain;

    for (let i = 0; i < allpassDelayTimes.length; i++) {
      const delay = this.ctx.createDelay(0.05);
      const gain = this.ctx.createGain();
      const feedbackGain = this.ctx.createGain();

      delay.delayTime.setValueAtTime(allpassDelayTimes[i], this.ctx.currentTime);
      gain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      feedbackGain.gain.setValueAtTime(-0.7, this.ctx.currentTime);

      // Allpass configuration
      currentNode.connect(gain);
      gain.connect(delay);
      delay.connect(feedbackGain);
      feedbackGain.connect(gain); // feedback

      currentNode = delay;
      this.allpassFilters.push(gain);
    }

    // Final connections
    this.input.connect(preDelayNode);
    this.input.connect(this.dryGain);
    currentNode.connect(this.output);
    this.dryGain.connect(this.output);
  }

  public updateParameters(params?: Partial<ReverbParameters>): void {
    if (params) {
      Object.assign(this.parameters, params);
    }

    this.wetGain.gain.setValueAtTime(this.parameters.wetLevel, this.ctx.currentTime);
    this.dryGain.gain.setValueAtTime(this.parameters.dryLevel, this.ctx.currentTime);

    // Update comb filter feedback (room size)
    this.gainNodes.forEach((gain) => {
      gain.gain.setValueAtTime(this.parameters.roomSize * 0.84, this.ctx.currentTime);
    });

    // Update damping filters
    this.combFilters.forEach((filter) => {
      const cutoff = 20000 * (1 - this.parameters.damping);
      filter.frequency.setValueAtTime(cutoff, this.ctx.currentTime);
    });
  }

  public connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  public disconnect(): void {
    this.output.disconnect();
  }

  public get inputNode(): AudioNode {
    return this.input;
  }

  public get outputNode(): AudioNode {
    return this.output;
  }
}

/**
 * Effetto Chorus con modulazione LFO
 */
export class ChorusEffect {
  private ctx: AudioContext;
  private input: GainNode;
  private output: GainNode;
  private wetGain: GainNode;
  private dryGain: GainNode;
  private delayNode!: DelayNode;
  private feedbackGain!: GainNode;
  private lfoOscillator!: OscillatorNode;
  private lfoGain!: GainNode;
  private parameters: Required<ChorusParameters>;

  constructor(ctx: AudioContext, params: ChorusParameters = {}) {
    this.ctx = ctx;
    this.parameters = {
      bypass: params.bypass ?? false,
      wetLevel: params.wetLevel ?? 0.5,
      dryLevel: params.dryLevel ?? 0.5,
      rate: params.rate ?? 0.5,
      depth: params.depth ?? 0.5,
      feedback: params.feedback ?? 0.2,
      delay: params.delay ?? 15,
    };

    this.input = ctx.createGain();
    this.output = ctx.createGain();
    this.wetGain = ctx.createGain();
    this.dryGain = ctx.createGain();

    this.initializeChorus();
    this.updateParameters();
  }

  private initializeChorus(): void {
    this.delayNode = this.ctx.createDelay(0.1);
    this.feedbackGain = this.ctx.createGain();
    this.lfoOscillator = this.ctx.createOscillator();
    this.lfoGain = this.ctx.createGain();

    // LFO setup
    this.lfoOscillator.type = 'sine';
    this.lfoOscillator.connect(this.lfoGain);
    this.lfoGain.connect(this.delayNode.delayTime);
    this.lfoOscillator.start();

    // Signal chain
    this.input.connect(this.delayNode);
    this.input.connect(this.dryGain);

    this.delayNode.connect(this.feedbackGain);
    this.feedbackGain.connect(this.delayNode); // feedback
    this.delayNode.connect(this.wetGain);

    this.wetGain.connect(this.output);
    this.dryGain.connect(this.output);
  }

  public updateParameters(params?: Partial<ChorusParameters>): void {
    if (params) {
      Object.assign(this.parameters, params);
    }

    this.wetGain.gain.setValueAtTime(this.parameters.wetLevel, this.ctx.currentTime);
    this.dryGain.gain.setValueAtTime(this.parameters.dryLevel, this.ctx.currentTime);
    this.feedbackGain.gain.setValueAtTime(this.parameters.feedback, this.ctx.currentTime);

    this.lfoOscillator.frequency.setValueAtTime(this.parameters.rate, this.ctx.currentTime);

    const baseDelay = this.parameters.delay / 1000;
    const modDepth = (this.parameters.depth * this.parameters.delay) / 2 / 1000;

    this.delayNode.delayTime.setValueAtTime(baseDelay, this.ctx.currentTime);
    this.lfoGain.gain.setValueAtTime(modDepth, this.ctx.currentTime);
  }

  public connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  public disconnect(): void {
    this.output.disconnect();
  }

  public get inputNode(): AudioNode {
    return this.input;
  }

  public get outputNode(): AudioNode {
    return this.output;
  }
}

/**
 * Effetto Delay configurabile
 */
export class DelayEffect {
  private ctx: AudioContext;
  private input: GainNode;
  private output: GainNode;
  private wetGain: GainNode;
  private dryGain: GainNode;
  private delayNode!: DelayNode;
  private feedbackGain!: GainNode;
  private highCutFilter!: BiquadFilterNode;
  private parameters: Required<DelayParameters>;

  constructor(ctx: AudioContext, params: DelayParameters = {}) {
    this.ctx = ctx;
    this.parameters = {
      bypass: params.bypass ?? false,
      wetLevel: params.wetLevel ?? 0.3,
      dryLevel: params.dryLevel ?? 0.7,
      time: params.time ?? 250,
      feedback: params.feedback ?? 0.4,
      highCut: params.highCut ?? 8000,
      sync: params.sync ?? false,
    };

    this.input = ctx.createGain();
    this.output = ctx.createGain();
    this.wetGain = ctx.createGain();
    this.dryGain = ctx.createGain();

    this.initializeDelay();
    this.updateParameters();
  }

  private initializeDelay(): void {
    this.delayNode = this.ctx.createDelay(2.0);
    this.feedbackGain = this.ctx.createGain();
    this.highCutFilter = this.ctx.createBiquadFilter();

    this.highCutFilter.type = 'lowpass';

    // Signal chain
    this.input.connect(this.delayNode);
    this.input.connect(this.dryGain);

    this.delayNode.connect(this.highCutFilter);
    this.highCutFilter.connect(this.feedbackGain);
    this.feedbackGain.connect(this.delayNode); // feedback
    this.delayNode.connect(this.wetGain);

    this.wetGain.connect(this.output);
    this.dryGain.connect(this.output);
  }

  public updateParameters(params?: Partial<DelayParameters>): void {
    if (params) {
      Object.assign(this.parameters, params);
    }

    this.wetGain.gain.setValueAtTime(this.parameters.wetLevel, this.ctx.currentTime);
    this.dryGain.gain.setValueAtTime(this.parameters.dryLevel, this.ctx.currentTime);
    this.feedbackGain.gain.setValueAtTime(this.parameters.feedback, this.ctx.currentTime);

    this.delayNode.delayTime.setValueAtTime(this.parameters.time / 1000, this.ctx.currentTime);
    this.highCutFilter.frequency.setValueAtTime(this.parameters.highCut, this.ctx.currentTime);
  }

  public connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  public disconnect(): void {
    this.output.disconnect();
  }

  public get inputNode(): AudioNode {
    return this.input;
  }

  public get outputNode(): AudioNode {
    return this.output;
  }
}

/**
 * Effetto Distortion/Overdrive
 */
export class DistortionEffect {
  private ctx: AudioContext;
  private input: GainNode;
  private output: GainNode;
  private wetGain: GainNode;
  private dryGain: GainNode;
  private preGain!: GainNode;
  private postGain!: GainNode;
  private waveshaper!: WaveShaperNode;
  private toneFilter!: BiquadFilterNode;
  private parameters: Required<DistortionParameters>;

  constructor(ctx: AudioContext, params: DistortionParameters = {}) {
    this.ctx = ctx;
    this.parameters = {
      bypass: params.bypass ?? false,
      wetLevel: params.wetLevel ?? 1.0,
      dryLevel: params.dryLevel ?? 0.0,
      drive: params.drive ?? 0.5,
      tone: params.tone ?? 0.5,
      level: params.level ?? 0.7,
      type: params.type ?? 'soft',
    };

    this.input = ctx.createGain();
    this.output = ctx.createGain();
    this.wetGain = ctx.createGain();
    this.dryGain = ctx.createGain();

    this.initializeDistortion();
    this.updateParameters();
  }

  private initializeDistortion(): void {
    this.preGain = this.ctx.createGain();
    this.postGain = this.ctx.createGain();
    this.waveshaper = this.ctx.createWaveShaper();
    this.toneFilter = this.ctx.createBiquadFilter();

    this.toneFilter.type = 'lowpass';
    this.waveshaper.oversample = '4x';

    // Signal chain
    this.input.connect(this.preGain);
    this.input.connect(this.dryGain);

    this.preGain.connect(this.waveshaper);
    this.waveshaper.connect(this.toneFilter);
    this.toneFilter.connect(this.postGain);
    this.postGain.connect(this.wetGain);

    this.wetGain.connect(this.output);
    this.dryGain.connect(this.output);
  }

  private generateWaveShapingCurve(type: string, amount: number): Float32Array {
    const samples = 44100;
    const curve = new Float32Array(samples);

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      let y: number;

      switch (type) {
        case 'soft':
          // Soft clipping (tanh)
          y = Math.tanh(amount * 5 * x);
          break;
        case 'hard':
          // Hard clipping
          y = Math.max(-1, Math.min(1, amount * 10 * x));
          break;
        case 'tube':
          // Tube-style warm saturation
          y = x < 0 ? -(Math.abs(x) ** (1 + amount)) : x ** (1 + amount);
          break;
        case 'fuzz': {
          // Fuzz distortion
          const fuzzAmount = amount * 50;
          y = x > 0 ? Math.min(1, fuzzAmount * x) : Math.max(-1, fuzzAmount * x);
          y = Math.sign(y) * Math.abs(y) ** 0.5;
          break;
        }
        default:
          y = x;
      }

      curve[i] = y;
    }

    return curve;
  }

  public updateParameters(params?: Partial<DistortionParameters>): void {
    if (params) {
      Object.assign(this.parameters, params);
    }

    this.wetGain.gain.setValueAtTime(this.parameters.wetLevel, this.ctx.currentTime);
    this.dryGain.gain.setValueAtTime(this.parameters.dryLevel, this.ctx.currentTime);
    this.postGain.gain.setValueAtTime(this.parameters.level, this.ctx.currentTime);

    // Update drive
    this.preGain.gain.setValueAtTime(1 + this.parameters.drive * 9, this.ctx.currentTime);

    // Update tone control
    const toneFreq = 300 + this.parameters.tone * 4700; // 300Hz to 5kHz
    this.toneFilter.frequency.setValueAtTime(toneFreq, this.ctx.currentTime);

    // Update waveshaping curve
    const curve = this.generateWaveShapingCurve(this.parameters.type, this.parameters.drive);
    this.waveshaper.curve = new Float32Array(curve);
  }

  public connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  public disconnect(): void {
    this.output.disconnect();
  }

  public get inputNode(): AudioNode {
    return this.input;
  }

  public get outputNode(): AudioNode {
    return this.output;
  }
}

/**
 * Manager per tutti gli effetti audio
 */
export class AudioEffectsManager {
  private ctx: AudioContext;
  private input: GainNode;
  private output: GainNode;

  public reverb: ReverbEffect;
  public chorus: ChorusEffect;
  public delay: DelayEffect;
  public distortion: DistortionEffect;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.input = ctx.createGain();
    this.output = ctx.createGain();

    // Crea tutti gli effetti
    this.reverb = new ReverbEffect(ctx);
    this.chorus = new ChorusEffect(ctx);
    this.delay = new DelayEffect(ctx);
    this.distortion = new DistortionEffect(ctx);

    // Catena degli effetti: Input -> Distortion -> Chorus -> Delay -> Reverb -> Output
    this.setupEffectChain();
  }

  private setupEffectChain(): void {
    this.input.connect(this.distortion.inputNode);
    this.distortion.connect(this.chorus.inputNode);
    this.chorus.connect(this.delay.inputNode);
    this.delay.connect(this.reverb.inputNode);
    this.reverb.connect(this.output);
  }

  public connect(destination: AudioNode): void {
    this.output.connect(destination);
  }

  public disconnect(): void {
    this.output.disconnect();
  }

  public get inputNode(): AudioNode {
    return this.input;
  }

  public get outputNode(): AudioNode {
    return this.output;
  }

  // Metodi di convenienza per controllare gli effetti
  public setReverbLevel(level: number): void {
    this.reverb.updateParameters({ wetLevel: level, dryLevel: 1 - level });
  }

  public setChorusLevel(level: number): void {
    this.chorus.updateParameters({ wetLevel: level, dryLevel: 1 - level });
  }

  public setDelayLevel(level: number): void {
    this.delay.updateParameters({ wetLevel: level, dryLevel: 1 - level });
  }

  public setDistortionLevel(level: number): void {
    this.distortion.updateParameters({ wetLevel: level, dryLevel: 1 - level });
  }
}
