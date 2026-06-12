/**
 * ui/sound.js — Ambient soundscape toggle
 *
 * Provides an optional ambient audio loop using the Web Audio API.
 * AudioContext + GainNode for volume control with 500ms fade transitions.
 * State persisted to localStorage. Handles autoplay-block gracefully.
 *
 * @module SoundToggle
 */

/**
 * @typedef {Object} SoundState
 * @property {boolean} enabled - Whether sound is currently active
 * @property {number} volume - Current volume level (0.0–1.0)
 */

const STORAGE_KEY = 'bynoor-sound';
const FADE_DURATION = 0.5; // 500ms
const DEFAULT_VOLUME = 0.15;
const AUDIO_PATH = '/src/assets/audio/ambient-loop.mp3';

export class SoundToggle {
  /** @type {AudioContext | null} */
  #context = null;

  /** @type {GainNode | null} */
  #gainNode = null;

  /** @type {AudioBufferSourceNode | null} */
  #source = null;

  /** @type {AudioBuffer | null} */
  #buffer = null;

  /** @type {boolean} */
  #enabled = false;

  /** @type {number} */
  #volume = DEFAULT_VOLUME;

  /** @type {boolean} */
  #initialized = false;

  /** @type {boolean} */
  #loading = false;

  /**
   * Initialize the sound system — create AudioContext, load audio buffer,
   * and restore persisted state. Handles autoplay policy silently.
   */
  async init() {
    try {
      this.#context = new (window.AudioContext || /** @type {any} */ (window).webkitAudioContext)();
    } catch {
      // AudioContext not supported — remain muted silently
      return;
    }

    // Set up GainNode
    this.#gainNode = this.#context.createGain();
    this.#gainNode.gain.value = 0;
    this.#gainNode.connect(this.#context.destination);

    // Restore persisted preference
    this.#restoreState();

    // Load audio buffer in background
    await this.#loadAudio();

    this.#initialized = true;

    // If user previously had sound enabled, attempt to resume
    if (this.#enabled) {
      await this.#startPlayback();
    }
  }

  /**
   * Toggle sound on/off. Fades in over 500ms when enabling,
   * fades out over 500ms when disabling.
   */
  async toggle() {
    if (!this.#initialized || !this.#context || !this.#gainNode) return;

    if (this.#enabled) {
      await this.#fadeOut();
      this.#enabled = false;
    } else {
      this.#enabled = true;
      await this.#startPlayback();
    }

    this.#persistState();
  }

  /**
   * Return the current sound state.
   * @returns {SoundState}
   */
  getState() {
    return {
      enabled: this.#enabled,
      volume: this.#volume,
    };
  }

  /**
   * Tear down audio context, stop playback, and clean up resources.
   */
  destroy() {
    if (this.#source) {
      try {
        this.#source.stop();
      } catch {
        // Source may already be stopped
      }
      this.#source.disconnect();
      this.#source = null;
    }

    if (this.#gainNode) {
      this.#gainNode.disconnect();
      this.#gainNode = null;
    }

    if (this.#context) {
      this.#context.close().catch(() => {});
      this.#context = null;
    }

    this.#buffer = null;
    this.#enabled = false;
    this.#initialized = false;
  }

  // ─── Private Methods ─────────────────────────────────────────────

  /**
   * Fetch and decode the ambient audio file.
   */
  async #loadAudio() {
    if (this.#loading || !this.#context) return;
    this.#loading = true;

    try {
      const response = await fetch(AUDIO_PATH);
      if (!response.ok) {
        this.#loading = false;
        return;
      }
      const arrayBuffer = await response.arrayBuffer();
      this.#buffer = await this.#context.decodeAudioData(arrayBuffer);
    } catch {
      // Audio load/decode failed — remain muted silently
    }

    this.#loading = false;
  }

  /**
   * Start audio playback with fade-in. Handles autoplay policy by
   * attempting to resume the context.
   */
  async #startPlayback() {
    if (!this.#context || !this.#gainNode || !this.#buffer) return;

    // Handle suspended context (autoplay block)
    if (this.#context.state === 'suspended') {
      try {
        await this.#context.resume();
      } catch {
        // Browser blocked resume — keep muted state
        this.#enabled = false;
        this.#persistState();
        return;
      }
    }

    // If context is still not running after resume attempt, bail
    if (this.#context.state !== 'running') {
      this.#enabled = false;
      this.#persistState();
      return;
    }

    // Stop any existing source before creating a new one
    if (this.#source) {
      try {
        this.#source.stop();
      } catch {
        // Already stopped
      }
      this.#source.disconnect();
    }

    // Create and configure source node
    this.#source = this.#context.createBufferSource();
    this.#source.buffer = this.#buffer;
    this.#source.loop = true;
    this.#source.connect(this.#gainNode);
    this.#source.start(0);

    // Fade in
    this.#fadeIn();
  }

  /**
   * Fade gain from 0 to target volume over 500ms using linearRampToValueAtTime.
   */
  #fadeIn() {
    if (!this.#context || !this.#gainNode) return;

    const now = this.#context.currentTime;
    this.#gainNode.gain.cancelScheduledValues(now);
    this.#gainNode.gain.setValueAtTime(0, now);
    this.#gainNode.gain.linearRampToValueAtTime(this.#volume, now + FADE_DURATION);
  }

  /**
   * Fade gain from current volume to 0 over 500ms, then suspend context.
   * @returns {Promise<void>}
   */
  #fadeOut() {
    return new Promise((resolve) => {
      if (!this.#context || !this.#gainNode) {
        resolve();
        return;
      }

      const now = this.#context.currentTime;
      this.#gainNode.gain.cancelScheduledValues(now);
      this.#gainNode.gain.setValueAtTime(this.#gainNode.gain.value, now);
      this.#gainNode.gain.linearRampToValueAtTime(0, now + FADE_DURATION);

      // Wait for fade to complete, then stop source and suspend
      setTimeout(() => {
        if (this.#source) {
          try {
            this.#source.stop();
          } catch {
            // Already stopped
          }
          this.#source.disconnect();
          this.#source = null;
        }

        if (this.#context && this.#context.state === 'running') {
          this.#context.suspend().catch(() => {});
        }

        resolve();
      }, FADE_DURATION * 1000);
    });
  }

  /**
   * Persist current sound state to localStorage.
   */
  #persistState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ enabled: this.#enabled, volume: this.#volume })
      );
    } catch {
      // localStorage unavailable (private browsing) — ignore silently
    }
  }

  /**
   * Restore sound state from localStorage.
   */
  #restoreState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.enabled === 'boolean') {
          this.#enabled = parsed.enabled;
        }
        if (typeof parsed.volume === 'number' && parsed.volume >= 0 && parsed.volume <= 1) {
          this.#volume = parsed.volume;
        }
      }
    } catch {
      // localStorage unavailable or corrupted — use defaults
    }
  }
}
