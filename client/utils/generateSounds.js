/**
 * Sound Generator Utility
 * Generates mp3 sound files for a list of words using the system's text-to-speech
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate sound files for an array of words
 * @param {string[]} words - Array of words to convert to audio
 * @param {Object} options - Configuration options
 * @param {string} options.outputDir - Output directory for sound files (relative to public)
 * @param {string} options.voice - Voice to use for text-to-speech (e.g., "Alex", "Samantha")
 * @param {string} options.prefix - Prefix to add to filenames
 * @returns {Promise<Object>} - Object mapping words to their sound file paths
 */
export const generateSounds = async (words, options = {}) => {
  const outputDir = options.outputDir || 'sounds/words';
  const voice = options.voice || 'Alex';
  const prefix = options.prefix || '';
  
  // Ensure the output directory exists
  const publicDir = path.resolve(process.cwd(), 'public');
  const fullOutputDir = path.resolve(publicDir, outputDir);
  
  if (!fs.existsSync(fullOutputDir)) {
    fs.mkdirSync(fullOutputDir, { recursive: true });
  }
  
  console.log(`Generating sounds for ${words.length} words in ${fullOutputDir}`);
  
  const results = {};
  
  // Process each word
  for (const word of words) {
    const sanitizedWord = word.trim().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const fileName = prefix ? `${prefix}_${sanitizedWord}` : sanitizedWord;
    const outputPath = path.join(fullOutputDir, `${fileName}.mp3`);
    const relativePath = path.join(outputDir, `${fileName}.mp3`);
    
    try {
      // Create temporary AIFF file
      const tempFile = path.join(fullOutputDir, `${fileName}_temp.aiff`);
      
      await new Promise((resolve, reject) => {
        // Generate AIFF using say command
        exec(`say -v "${voice}" -o "${tempFile}" "${word}"`, (error) => {
          if (error) {
            reject(error);
            return;
          }
          
          // Convert AIFF to MP3 using ffmpeg
          exec(`ffmpeg -i "${tempFile}" -acodec libmp3lame -q:a 2 "${outputPath}"`, (error) => {
            if (error) {
              reject(error);
              return;
            }
            
            // Remove temp file
            fs.unlinkSync(tempFile);
            resolve();
          });
        });
      });
      
      results[word] = relativePath;
      console.log(`Generated sound for "${word}" at ${relativePath}`);
    } catch (error) {
      console.error(`Error generating sound for "${word}":`, error);
      results[word] = null;
    }
  }
  
  return results;
};

/**
 * Generate sounds from a comma-separated string
 * @param {string} wordString - Comma-separated list of words
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} - Object mapping words to their sound file paths
 */
export const generateSoundsFromString = async (wordString, options = {}) => {
  const words = wordString.split(',').map(word => word.trim()).filter(Boolean);
  return generateSounds(words, options);
};

// Command line usage
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node generateSounds.js "word1,word2,word3" [outputDir] [voice] [prefix]');
    process.exit(1);
  }
  
  const wordString = args[0];
  const options = {
    outputDir: args[1] || 'sounds/words',
    voice: args[2] || 'Alex',
    prefix: args[3] || ''
  };
  
  generateSoundsFromString(wordString, options)
    .then(() => console.log('Sound generation complete!'))
    .catch(error => {
      console.error('Error generating sounds:', error);
      process.exit(1);
    });
}