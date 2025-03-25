/**
 * Card Database - Manages the card data for the card matching game
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the database file
const DB_PATH = path.resolve(__dirname, '../data/cards.json');
const CATEGORIES_PATH = path.resolve(__dirname, '../data/categories.json');

/**
 * Initialize the database if it doesn't exist
 */
export const initDatabase = () => {
  const dataDir = path.resolve(__dirname, '../data');
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Create cards database if it doesn't exist
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
      cards: [],
      lastUpdated: new Date().toISOString()
    }, null, 2));
  }
  
  // Create categories database if it doesn't exist
  if (!fs.existsSync(CATEGORIES_PATH)) {
    fs.writeFileSync(CATEGORIES_PATH, JSON.stringify({
      categories: [
        { id: 'numbers', name: 'Numbers', description: 'Basic number cards' },
        { id: 'animals', name: 'Animals', description: 'Animal cards' },
        { id: 'colors', name: 'Colors', description: 'Color cards' }
      ]
    }, null, 2));
  }
};

/**
 * Get all cards
 * @returns {Array} Array of all cards
 */
export const getAllCards = () => {
  try {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    return data.cards || [];
  } catch (error) {
    console.error('Error reading cards database:', error);
    return [];
  }
};

/**
 * Get cards by category
 * @param {string} categoryId - Category ID
 * @returns {Array} Array of cards filtered by category
 */
export const getCardsByCategory = (categoryId) => {
  try {
    const cards = getAllCards();
    return cards.filter(card => card.categoryId === categoryId);
  } catch (error) {
    console.error(`Error getting cards by category ${categoryId}:`, error);
    return [];
  }
};

/**
 * Get random cards
 * @param {number} count - Number of cards to get
 * @param {string} categoryId - Optional category ID to filter by
 * @returns {Array} Array of random cards
 */
export const getRandomCards = (count, categoryId = null) => {
  try {
    let cards = getAllCards();
    
    // Filter by category if provided
    if (categoryId) {
      cards = cards.filter(card => card.categoryId === categoryId);
    }
    
    // Shuffle and return requested number of cards
    return cards
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  } catch (error) {
    console.error(`Error getting random cards:`, error);
    return [];
  }
};

/**
 * Add a new card
 * @param {Object} card - Card data
 * @returns {Object} The newly added card with ID
 */
export const addCard = (card) => {
  try {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    
    // Generate a unique ID
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    
    // Create new card with ID and creation timestamp
    const newCard = {
      id,
      ...card,
      createdAt: new Date().toISOString()
    };
    
    // Add to database
    data.cards.push(newCard);
    data.lastUpdated = new Date().toISOString();
    
    // Write back to file
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    
    return newCard;
  } catch (error) {
    console.error('Error adding card:', error);
    throw error;
  }
};

/**
 * Update an existing card
 * @param {string} id - Card ID
 * @param {Object} updatedData - Updated card data
 * @returns {Object} The updated card
 */
export const updateCard = (id, updatedData) => {
  try {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    
    // Find the card index
    const cardIndex = data.cards.findIndex(card => card.id === id);
    
    if (cardIndex === -1) {
      throw new Error(`Card with ID ${id} not found`);
    }
    
    // Update the card
    data.cards[cardIndex] = {
      ...data.cards[cardIndex],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    
    data.lastUpdated = new Date().toISOString();
    
    // Write back to file
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    
    return data.cards[cardIndex];
  } catch (error) {
    console.error(`Error updating card ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a card
 * @param {string} id - Card ID
 * @returns {boolean} Success status
 */
export const deleteCard = (id) => {
  try {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    
    // Filter out the card
    data.cards = data.cards.filter(card => card.id !== id);
    data.lastUpdated = new Date().toISOString();
    
    // Write back to file
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    
    return true;
  } catch (error) {
    console.error(`Error deleting card ${id}:`, error);
    throw error;
  }
};

/**
 * Get all categories
 * @returns {Array} Array of categories
 */
export const getAllCategories = () => {
  try {
    const data = JSON.parse(fs.readFileSync(CATEGORIES_PATH, 'utf8'));
    return data.categories || [];
  } catch (error) {
    console.error('Error reading categories:', error);
    return [];
  }
};

/**
 * Add a new category
 * @param {Object} category - Category data
 * @returns {Object} The newly added category with ID
 */
export const addCategory = (category) => {
  try {
    const data = JSON.parse(fs.readFileSync(CATEGORIES_PATH, 'utf8'));
    
    // Generate a unique ID if not provided
    const newCategory = {
      id: category.id || (Date.now().toString(36) + Math.random().toString(36).substring(2, 5)),
      ...category
    };
    
    // Add to database
    data.categories.push(newCategory);
    
    // Write back to file
    fs.writeFileSync(CATEGORIES_PATH, JSON.stringify(data, null, 2));
    
    return newCategory;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

// Initialize db when this module is imported
initDatabase();
