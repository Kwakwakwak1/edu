/**
 * Express server to handle sound generation and card database requests
 */
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSoundsFromString } from './utils/generateSounds.js';
import { 
  getAllCards, 
  getCardsByCategory, 
  getRandomCards, 
  addCard, 
  updateCard, 
  deleteCard,
  getAllCategories,
  addCategory
} from './utils/cardDatabase.js';

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

// =======================================================================
// Card Database API Endpoints
// =======================================================================

// Get all cards
app.get('/api/cards', (req, res) => {
  try {
    const cards = getAllCards();
    res.json({ success: true, cards });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get cards by category
app.get('/api/cards/category/:categoryId', (req, res) => {
  try {
    const { categoryId } = req.params;
    const cards = getCardsByCategory(categoryId);
    res.json({ success: true, cards });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get random cards
app.get('/api/cards/random', (req, res) => {
  try {
    const { count = 10, categoryId } = req.query;
    const cards = getRandomCards(parseInt(count, 10), categoryId || null);
    res.json({ success: true, cards });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add a new card
app.post('/api/cards', (req, res) => {
  try {
    const card = req.body;
    
    if (!card || !card.text || !card.solution || !card.categoryId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields (text, solution, categoryId)' 
      });
    }
    
    const newCard = addCard(card);
    res.status(201).json({ success: true, card: newCard });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update an existing card
app.put('/api/cards/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    
    const card = updateCard(id, updatedData);
    res.json({ success: true, card });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a card
app.delete('/api/cards/:id', (req, res) => {
  try {
    const { id } = req.params;
    deleteCard(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = getAllCategories();
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add a new category
app.post('/api/categories', (req, res) => {
  try {
    const category = req.body;
    
    if (!category || !category.name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields (name)' 
      });
    }
    
    const newCategory = addCategory(category);
    res.status(201).json({ success: true, category: newCategory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a card with sound file in one request
app.post('/api/cards/with-sound', async (req, res) => {
  try {
    const { 
      cardData,
      generateSound = false,
      voice = 'Alex' 
    } = req.body;

    if (!cardData || !cardData.text || !cardData.solution || !cardData.categoryId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required card fields (text, solution, categoryId)' 
      });
    }

    // Generate sound if requested
    if (generateSound) {
      console.log(`Generating sound for card: ${cardData.text}`);
      
      const soundResults = await generateSoundsFromString(cardData.text, {
        voice,
        outputDir: 'sounds/words'
      });
      
      // Add sound path to card data
      if (soundResults[cardData.text]) {
        cardData.soundPath = soundResults[cardData.text];
      }
    }
    
    // Add card to database
    const newCard = addCard(cardData);
    
    res.status(201).json({ 
      success: true, 
      card: newCard,
      soundGenerated: generateSound && !!cardData.soundPath 
    });
  } catch (error) {
    console.error('Error creating card with sound:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});