export class AudioSynth {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.chordsInterval = null;

    // Harmonious romantic frequencies (Cmaj7, Am9, Fmaj7, G9)
    this.chordProgression = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7 (C4, E4, G4, B4)
      [220.00, 261.63, 329.63, 392.00], // Am7 (A3, C4, E4, G4)
      [174.61, 220.00, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
      [196.00, 246.94, 293.66, 349.23]  // G7 (G3, B3, D4, F4)
    ];

    this.currentChordIndex = 0;
  }

  initAudio() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  start() {
    this.initAudio();
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.masterGain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 1);

    // Play initial chord immediately
    this.playChord(this.chordProgression[this.currentChordIndex]);

    // Schedule chord progression loop every 4 seconds
    this.chordsInterval = setInterval(() => {
      this.currentChordIndex = (this.currentChordIndex + 1) % this.chordProgression.length;
      this.playChord(this.chordProgression[this.currentChordIndex]);
    }, 4000);
  }

  stop() {
    if (!this.isPlaying || !this.ctx) return;
    this.isPlaying = false;
    if (this.chordsInterval) clearInterval(this.chordsInterval);

    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
    }
  }

  playChord(frequencies) {
    if (!this.ctx || !this.isPlaying) return;

    const now = this.ctx.currentTime;

    frequencies.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Soft sine + warm triangle wave for romantic rhodes/piano tone
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      // Envelope: gentle attack, long warm release
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.12);
      osc.stop(now + 4.0);
    });
  }

  // Interactive Chime Sound Effect on Click
  playChime() {
    this.initAudio();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [1046.50, 1318.51, 1567.98, 2093.00]; // High C6, E6, G6, C7 bell chime
    const freq = freqs[Math.floor(Math.random() * freqs.length)];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.2);
  }
}
