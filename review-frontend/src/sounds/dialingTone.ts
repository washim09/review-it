// Dialing tone generator using Web Audio API
export class DialingToneService {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  public startDialingTone(): void {
    if (this.isPlaying) {
      return;
    }

    try {
      this.initAudioContext();
      if (!this.audioContext) return;

      this.isPlaying = true;
      this.playDialingToneLoop();
    } catch (error) {
    }
  }

  private playDialingToneLoop(): void {
    if (!this.audioContext || !this.isPlaying) return;

    // Create oscillator for the dialing tone sound (standard dialing tone)
    this.oscillator = this.audioContext.createOscillator();
    this.gainNode = this.audioContext.createGain();

    // Connect the audio nodes
    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    // Set dialing tone frequency (standard 350Hz + 440Hz mix - like US dialing tone)
    this.oscillator.frequency.setValueAtTime(350, this.audioContext.currentTime);

    // Set volume (quieter than ringtone)
    this.gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);

    // Start and stop the tone
    this.oscillator.start(this.audioContext.currentTime);
    this.oscillator.stop(this.audioContext.currentTime + 0.5); // 0.5 second tone

    // Schedule next tone after a pause
    setTimeout(() => {
      if (this.isPlaying) {
        // Create second frequency for authentic dialing tone
        this.playSecondFrequency();
      }
    }, 500); // 0.5 second tone

    setTimeout(() => {
      if (this.isPlaying) {
        this.playDialingToneLoop(); // Repeat every 1 second
      }
    }, 1000);
  }

  private playSecondFrequency(): void {
    if (!this.audioContext || !this.isPlaying) return;

    // Create second oscillator for 440Hz
    const oscillator2 = this.audioContext.createOscillator();
    const gainNode2 = this.audioContext.createGain();

    oscillator2.connect(gainNode2);
    gainNode2.connect(this.audioContext.destination);

    oscillator2.frequency.setValueAtTime(440, this.audioContext.currentTime);
    gainNode2.gain.setValueAtTime(0.1, this.audioContext.currentTime);

    oscillator2.start(this.audioContext.currentTime);
    oscillator2.stop(this.audioContext.currentTime + 0.5);
  }

  public stopDialingTone(): void {
    this.isPlaying = false;
    if (this.oscillator) {
      try {
        this.oscillator.stop();
      } catch (e) {
      }
      this.oscillator = null;
    }
    if (this.gainNode) {
      this.gainNode = null;
    }
  }
}

// Export singleton instance
export const dialingToneService = new DialingToneService();
