/**
 * Sound Manager for handling audio playback
 * Provides caching, error handling, and basic audio controls
 */

// Cache to store loaded audio objects
const soundCache = new Map();

/**
 * Load and cache a sound file
 * @param {string} soundId - Unique identifier for the sound
 * @param {string} soundPath - Path to the sound file relative to public/sounds
 * @returns {Promise<HTMLAudioElement>} - Promise resolving to the loaded audio element
 */
export const loadSound = async (soundId, soundPath) => {
  try {
    if (soundCache.has(soundId)) {
      return soundCache.get(soundId);
    }

    const audio = new Audio(`/sounds/${soundPath}`);
    
    // Wait for the audio to be loaded
    await new Promise((resolve, reject) => {
      audio.addEventListener('canplaythrough', resolve, { once: true });
      audio.addEventListener('error', (e) => reject(new Error(`Failed to load sound: ${e.message}`)), { once: true });
      audio.load();
    });

    soundCache.set(soundId, audio);
    return audio;
  } catch (error) {
    console.error(`Error loading sound ${soundId}:`, error);
    throw error;
  }
};

/**
 * Play a sound by its ID
 * @param {string} soundId - The ID of the sound to play
 * @param {Object} options - Playback options
 * @param {number} [options.volume=1] - Volume level (0.0 to 1.0)
 * @param {boolean} [options.loop=false] - Whether to loop the sound
 * @returns {Promise<void>}
 */
export const playSound = async (soundId, options = {}) => {
  try {
    const audio = soundCache.get(soundId);
    if (!audio) {
      throw new Error(`Sound ${soundId} not loaded. Call loadSound first.`);
    }

    // Reset the audio to start
    audio.currentTime = 0;
    
    // Apply options
    audio.volume = options.volume ?? 1;
    audio.loop = options.loop ?? false;

    await audio.play();
  } catch (error) {
    console.error(`Error playing sound ${soundId}:`, error);
    throw error;
  }
};

/**
 * Stop a currently playing sound
 * @param {string} soundId - The ID of the sound to stop
 */
export const stopSound = (soundId) => {
  try {
    const audio = soundCache.get(soundId);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  } catch (error) {
    console.error(`Error stopping sound ${soundId}:`, error);
  }
};

/**
 * Set the volume for a specific sound
 * @param {string} soundId - The ID of the sound
 * @param {number} volume - Volume level (0.0 to 1.0)
 */
export const setSoundVolume = (soundId, volume) => {
  try {
    const audio = soundCache.get(soundId);
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume));
    }
  } catch (error) {
    console.error(`Error setting volume for sound ${soundId}:`, error);
  }
};

/**
 * Preload multiple sounds at once
 * @param {Object.<string, string>} sounds - Object mapping sound IDs to their paths
 * @returns {Promise<void>}
 */
export const preloadSounds = async (sounds) => {
  try {
    const loadPromises = Object.entries(sounds).map(
      ([id, path]) => loadSound(id, path)
    );
    await Promise.all(loadPromises);
  } catch (error) {
    console.error('Error preloading sounds:', error);
    throw error;
  }
};

/**
 * Clean up and remove a sound from the cache
 * @param {string} soundId - The ID of the sound to remove
 */
export const unloadSound = (soundId) => {
  try {
    const audio = soundCache.get(soundId);
    if (audio) {
      audio.pause();
      audio.src = '';
      soundCache.delete(soundId);
    }
  } catch (error) {
    console.error(`Error unloading sound ${soundId}:`, error);
  }
};

/**
 * Check if a sound is currently playing
 * @param {string} soundId - The ID of the sound to check
 * @returns {boolean} - Whether the sound is playing
 */
export const isSoundPlaying = (soundId) => {
  const audio = soundCache.get(soundId);
  return audio ? !audio.paused : false;
}; 