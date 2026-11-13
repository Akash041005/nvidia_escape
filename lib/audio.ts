// Web Audio API procedural sound synthesizer and retro synthwave music generator
class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmPlaying: boolean = false;
  private musicInterval: any = null;
  private bgmGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private currentStep: number = 0;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        this.bgmGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Silicon Wafer pickup sound (high crisp dual chime)
  public playWafer() {
    this.initContext();
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sine";
    osc2.type = "triangle";

    // Pleasant high arpeggio
    const freqs = [880, 1174.66, 1318.51, 1760];
    const baseFreq = freqs[Math.floor(Math.random() * freqs.length)];
    osc1.frequency.setValueAtTime(baseFreq, t);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.12);

    osc2.frequency.setValueAtTime(baseFreq * 2, t);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.16);
    osc2.stop(t + 0.16);
  }

  // Jump swoosh
  public playJump() {
    this.initContext();
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(650, t + 0.22);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  // Slide sound (air swoosh)
  public playSlide() {
    this.initContext();
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.2);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.23);
  }

  // Minor stumble sound
  public playStumble() {
    this.initContext();
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.linearRampToValueAtTime(80, t + 0.2);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.21);
  }

  // Crash / Game Over impact
  public playCrash() {
    this.initContext();
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // Noise + low boom
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.6);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.65);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.66);
  }

  // Powerup pickup
  public playPowerup() {
    this.initContext();
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + i * 0.08;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.35, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(start);
      osc.stop(start + 0.16);
    });
  }

  // Shield blast obstacle
  public playShieldBlast() {
    this.initContext();
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(1100, t + 0.15);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.19);
  }

  // Rocket boost pulse
  public playRocketPulse() {
    this.initContext();
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(90 + Math.random() * 30, t);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  // Dynamic procedural synthwave music loop (tempo, bassline, synth arpeggio, kick/hihat)
  public startBGM() {
    if (this.bgmPlaying) return;
    this.initContext();
    this.bgmPlaying = true;
    this.currentStep = 0;

    const bassNotes = [110, 110, 130.81, 146.83, 110, 110, 164.81, 146.83];
    const synthNotes = [440, 523.25, 659.25, 523.25, 587.33, 440, 523.25, 659.25];

    const stepDuration = 135; // 133 BPM approx
    this.musicInterval = setInterval(() => {
      if (!this.ctx || !this.bgmGain || this.isMuted) return;

      const t = this.ctx.currentTime;
      const step = this.currentStep % 16;
      this.currentStep++;

      // Kick on 0, 4, 8, 12
      if (step % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = "sine";
        kickOsc.frequency.setValueAtTime(140, t);
        kickOsc.frequency.exponentialRampToValueAtTime(35, t + 0.12);
        kickGain.gain.setValueAtTime(0.5, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
        kickOsc.connect(kickGain);
        kickGain.connect(this.bgmGain);
        kickOsc.start(t);
        kickOsc.stop(t + 0.14);
      }

      // Snare / clap on 4, 12
      if (step % 8 === 4) {
        const snareOsc = this.ctx.createOscillator();
        const snareGain = this.ctx.createGain();
        snareOsc.type = "triangle";
        snareOsc.frequency.setValueAtTime(260, t);
        snareGain.gain.setValueAtTime(0.2, t);
        snareGain.gain.linearRampToValueAtTime(0.001, t + 0.08);
        snareOsc.connect(snareGain);
        snareGain.connect(this.bgmGain);
        snareOsc.start(t);
        snareOsc.stop(t + 0.09);
      }

      // Bassline every step
      const bassIndex = Math.floor(step / 2) % bassNotes.length;
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = "sawtooth";
      bassOsc.frequency.setValueAtTime(bassNotes[bassIndex] / 2, t);
      bassGain.gain.setValueAtTime(0.18, t);
      bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      bassOsc.connect(bassGain);
      bassGain.connect(this.bgmGain);
      bassOsc.start(t);
      bassOsc.stop(t + 0.13);

      // Cyber Arpeggio synth lead
      if (step % 2 === 0) {
        const leadIndex = (step / 2) % synthNotes.length;
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = "sine";
        leadOsc.frequency.setValueAtTime(synthNotes[leadIndex], t);
        leadGain.gain.setValueAtTime(0.08, t);
        leadGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        leadOsc.connect(leadGain);
        leadGain.connect(this.bgmGain);
        leadOsc.start(t);
        leadOsc.stop(t + 0.11);
      }
    }, stepDuration);
  }

  public stopBGM() {
    this.bgmPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const sound = new SoundManager();

