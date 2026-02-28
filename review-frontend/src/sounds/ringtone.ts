// Simple ringtone generator using Web Audio API
export class RingtoneService {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  public startRingtone(): void {
    if (this.isPlaying) {
      return;
    }

    try {
      this.initAudioContext();
      if (!this.audioContext) return;

      this.isPlaying = true;
      this.playRingtoneLoop();
    } catch (error) {
    }
  }

  private playRingtoneLoop(): void {
    if (!this.audioContext || !this.isPlaying) return;

    // Create oscillator for the ringtone sound
    this.oscillator = this.audioContext.createOscillator();
    this.gainNode = this.audioContext.createGain();

    // Connect the audio nodes
    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    // Set ringtone frequency (like a phone ring)
    this.oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    this.oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.2);

    // Set volume
    this.gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + 0.4);

    // Start and stop the tone
    this.oscillator.start(this.audioContext.currentTime);
    this.oscillator.stop(this.audioContext.currentTime + 0.4);

    // Schedule next ring after a pause
    setTimeout(() => {
      if (this.isPlaying) {
        this.playRingtoneLoop();
      }
    }, 1000); // Ring every 1 second
  }

  public stopRingtone(): void {
    this.isPlaying = false;
    if (this.oscillator) {
      try {
        this.oscillator.stop();
      } catch (e) {
        // Oscillator might already be stopped
      }
      this.oscillator = null;
    }
    if (this.gainNode) {
      this.gainNode = null;
    }
  }
}

// Export singleton instance
export const ringtoneService = new RingtoneService();
