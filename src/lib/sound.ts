// Procedural Web Audio API sound synthesis engine
// Generates realistic mechanical switch clicks, toggle clicks, and chimes with zero external audio files.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = false;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kp_sound_enabled");
      this.soundEnabled = saved === "true"; // off unless the visitor opted in
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.soundEnabled && !this.isMuted;
  }

  public set(on: boolean) {
    this.soundEnabled = on;
    try {
      localStorage.setItem("kp_sound_enabled", String(on));
    } catch {}
    if (on) this.playToggleClick(true);
  }

  public toggle(): boolean {
    this.soundEnabled = !this.soundEnabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("kp_sound_enabled", String(this.soundEnabled));
    }
    // Play feedback if turning on
    if (this.soundEnabled) {
      this.playToggleClick(true);
    }
    return this.soundEnabled;
  }

  // Tactile Mechanical Keyboard / Relay Click (15ms physical tactile snap)
  public playMechanicalClick() {
    if (!this.isEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;

      // 1. High frequency mechanical transient snap (Noise burst)
      const bufferSize = Math.floor(ctx.sampleRate * 0.012); // 12ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.setValueAtTime(3200, t);
      bandpass.Q.setValueAtTime(3.0, t);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.28, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.012);

      noise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(t);

      // 2. Tactile bottom-out resonance (Short decayed thud)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(240, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.018);

      oscGain.gain.setValueAtTime(0.35, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.018);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.02);
    } catch {
      // Ignore audio synthesis errors on restricted environments
    }
  }

  // Two-tone hardware rocker switch click
  public playToggleClick(on: boolean) {
    if (!this.isEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      const startFreq = on ? 600 : 900;
      const endFreq = on ? 1200 : 450;

      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.035);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.04);
    } catch {
      // Ignore audio error
    }
  }

  // Harmonic success chime (Two-tone chord)
  public playSuccessChime() {
    if (!this.isEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const freqs = [659.25, 830.61]; // E5, G#5

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t + idx * 0.05);

        gain.gain.setValueAtTime(0.18, t + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.05 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t + idx * 0.05);
        osc.stop(t + idx * 0.05 + 0.36);
      });
    } catch {
      // Ignore audio error
    }
  }

  // Paper crunch: a short burst of low-passed noise that falls in pitch.
  public playCrunch() {
    if (!this.isEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      const len = Math.floor(ctx.sampleRate * 0.22);
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (Math.random() > 0.6 ? 1 : 0.25) * (1 - i / len);
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(2400, t);
      lp.frequency.exponentialRampToValueAtTime(500, t + 0.22);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      src.connect(lp);
      lp.connect(gain);
      gain.connect(ctx.destination);
      src.start(t);
    } catch {
      // Ignore audio error
    }
  }

  // Springy "boing" when something pops back out.
  public playPop() {
    if (!this.isEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.09);
      osc.frequency.exponentialRampToValueAtTime(520, t + 0.2);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    } catch {
      // Ignore audio error
    }
  }
}

export const sound = new SoundEngine();
