type AudioContextConstructor = typeof AudioContext;

class MatchAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private crowdSource: AudioBufferSourceNode | null = null;
  private crowdGain: GainNode | null = null;
  private started = false;

  private getContext(): AudioContext | null {
    if (this.context) return this.context;
    const Context = (window.AudioContext || (window as Window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext);
    if (!Context) return null;
    this.context = new Context();
    this.master = this.context.createGain();
    this.master.gain.value = 0.2;
    this.master.connect(this.context.destination);
    return this.context;
  }

  private createCrowdBuffer(context: AudioContext) {
    const length = context.sampleRate * 3;
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      const swell = 0.45 + 0.25 * Math.sin(i / context.sampleRate * 1.7);
      data[i] = (Math.random() * 2 - 1) * swell;
    }
    return buffer;
  }

  start() {
    const context = this.getContext();
    if (!context || !this.master) return;
    void context.resume();
    if (this.started) return;

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = this.createCrowdBuffer(context);
    source.loop = true;
    filter.type = 'bandpass';
    filter.frequency.value = 850;
    filter.Q.value = 0.55;
    gain.gain.value = 0.055;
    source.connect(filter).connect(gain).connect(this.master);
    source.start();
    this.crowdSource = source;
    this.crowdGain = gain;
    this.started = true;
  }

  stop() {
    if (!this.crowdSource) return;
    try { this.crowdSource.stop(); } catch { /* already stopped */ }
    this.crowdSource.disconnect();
    this.crowdSource = null;
    this.crowdGain = null;
    this.started = false;
  }

  cheer(intensity = 1) {
    const context = this.getContext();
    if (!context || !this.master) return;
    const now = context.currentTime;
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    const source = context.createBufferSource();
    source.buffer = this.createCrowdBuffer(context);
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.7;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18 * intensity, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    source.connect(filter).connect(gain).connect(this.master);
    source.start(now);
    source.stop(now + 1.6);
  }

  speak(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = window.speechSynthesis.getVoices().find(candidate => candidate.lang.toLowerCase().startsWith('en'));
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang ?? 'en-US';
    utterance.rate = 0.94;
    utterance.pitch = 0.9;
    utterance.volume = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  announce(message: string) {
    if (!message) return;
    if (message.startsWith('GOAL!')) {
      this.cheer(1.7);
      this.speak('Goal! What a finish!');
    } else if (message.startsWith('HALF TIME')) {
      this.speak('Half time. The teams head to the dressing rooms.');
    } else if (message.startsWith('SECOND HALF')) {
      this.speak('The second half is underway.');
    } else if (message.startsWith('FULL TIME')) {
      this.cheer(0.5);
      this.speak('Full time.');
    } else if (message === 'OFFSIDE') {
      this.speak('Offside.');
    }
  }
}

export const matchAudio = new MatchAudio();
