class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private purrInterval: any = null;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopPurrLoop();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // 1. 저주파 힐링 골골송 (32Hz 캐리어 + 16Hz 떨림 모듈레이션)
  public playPurr() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // 32Hz 골골송 기본 주파수
    osc.type = 'sine';
    osc.frequency.setValueAtTime(32, now);

    // 가르랑거리는 떨림 LFO (초당 16회)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(16, now);
    lfoGain.gain.setValueAtTime(12, now);

    lfo.connect(osc.frequency);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.25);
    gain.gain.linearRampToValueAtTime(0.01, now + 1.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 1.15);
    osc.stop(now + 1.15);
  }

  // 휴식 시간 동안 주기적으로 골골송 루프 재생
  public startPurrLoop() {
    if (this.purrInterval || this.isMuted) return;
    this.playPurr();
    this.purrInterval = setInterval(() => {
      if (!this.isMuted) {
        this.playPurr();
      }
    }, 2800);
  }

  public stopPurrLoop() {
    if (this.purrInterval) {
      clearInterval(this.purrInterval);
      this.purrInterval = null;
    }
  }

  // 2. 세션 전환 맑은 차임벨 (휴식 시작 / 집중 시작)
  public playChime(isBreak: boolean = false) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // 휴식: 포근한 장조 아르페지오 (C5, E5, G5, C6)
    // 집중: 맑은 집중 알림음 (E5, G#5, B5, E6)
    const freqs = isBreak ? [523.25, 659.25, 783.99, 1046.5] : [659.25, 830.61, 987.77, 1318.5];

    freqs.forEach((freq, idx) => {
      const startTime = now + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }

  // 3. 사랑스러운 고양이 울음소리 (야옹 / Meow)
  public playMeow() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(640, now);
    osc.frequency.linearRampToValueAtTime(840, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.35);

    // 부드러운 필터
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  // 4. 가벼운 UI 팝 소리
  public playPop() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const sounds = new SoundEngine();
