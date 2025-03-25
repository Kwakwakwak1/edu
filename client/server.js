/**
 * Simple Express server to handle sound generation requests
 */
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSoundsFromString } from './utils/generateSounds.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for generating sounds
app.post('/api/generate-sounds', async (req, res) => {
  try {
    const { words, voice = 'Alex', outputDir = 'sounds/words', prefix = '' } = req.body;
    
    if (!words) {
      return res.status(400).json({ error: 'No words provided' });
    }
    
    console.log(`Generating sounds for: ${words} with voice ${voice}`);
    
    const results = await generateSoundsFromString(words, {
      voice,
      outputDir,
      prefix
    });
    
    res.json({
      success: true,
      results,
      message: `Generated ${Object.keys(results).length} sound files`
    });
  } catch (error) {
    console.error('Error generating sounds:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate sounds'
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Sound server listening on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});