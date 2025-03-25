import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import GameLayout from '../layout/GameLayout';
import { preloadSounds, playSound } from '../../../utils/soundManager';
import './CardGame.css';

// Move config outside component to prevent circular dependency
const defaultConfig = {
  timerMode: 'none',
  timerDuration: 60,
  startingLevel: 1,
  maxLevel: 5,
  cardsPerLevel: level => level * 2,
  cardContent: (level, numPairs) => Array.from({ length: numPairs }, (_, i) => ({
  id: i,
  content: {
    type: 'text',
    text: `${i + 1}`,
    imageUrl: '',
    solution: `${i + 1}`,
    spelling: '',
    description: '',
    phonetic: '',
  }
}))
};

const CardGame = ({ config = defaultConfig }) => {
  const [level, setLevel] = useState(config.startingLevel);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [timer, setTimer] = useState(config.timerDuration);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameStats, setGameStats] = useState({
    startTime: null,
    moves: 0,
    flips: 0,
    matches: 0,
    errors: 0,
  });
  const [levelComplete, setLevelComplete] = useState(false);
  const [settings, setSettings] = useState({
    timerMode: config.timerMode,
    timerDuration: config.timerDuration,
    soundEnabled: true,
    showErrors: true,
    voice: 'Alex',
    customWords: ''
  });
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const [isGeneratingSounds, setIsGeneratingSounds] = useState(false);

  // Generate cards for current level
  const generateCards = useCallback((currentLevel) => {
    const numPairs = config.cardsPerLevel(currentLevel);
    const contentPairs = config.cardContent(currentLevel, numPairs);
    
    // Create pairs with the content
    const pairs = contentPairs.map(content => ({
      id: content.id,
      content: content.content,
      isFlipped: false,
      isMatched: false,
    }));
    
    // Duplicate cards to create pairs and shuffle
    const cards = [...pairs, ...pairs.map(card => ({...card, id: card.id + pairs.length}))]
      .sort(() => Math.random() - 0.5);
    
    setCards(cards);
    setFlippedCards([]);
    setMatchedPairs([]);
    setLevelComplete(false);
  }, [config]);

  // Initialize level
  useEffect(() => {
    generateCards(level);
  }, [level, generateCards]);
  
  // Preload sounds
  useEffect(() => {
    const loadNumberSounds = async () => {
      try {
        const numberSounds = {};
        for (let i = 1; i <= 10; i++) {
          numberSounds[`number${i}`] = `${i}.mp3`;
        }
        
        await preloadSounds(numberSounds);
        setSoundsLoaded(true);
      } catch (error) {
        console.error('Failed to load sounds:', error);
      }
    };
    
    loadNumberSounds();
  }, []);

  // Timer logic
  useEffect(() => {
    let interval;
    if (isPlaying && settings.timerMode === 'countdown' && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, settings.timerMode, timer]);

  // Reset timer when settings change
  useEffect(() => {
    if (!isPlaying) {
      setTimer(settings.timerDuration);
    }
  }, [settings.timerDuration, isPlaying]);

  // Handle card flip
  const handleCardClick = (clickedCard) => {
    if (!isPlaying) {
      setIsPlaying(true);
      setGameStats(prev => ({
        ...prev,
        startTime: Date.now(),
      }));
    }

    if (
      flippedCards.length === 2 || 
      clickedCard.isFlipped || 
      clickedCard.isMatched ||
      flippedCards.includes(clickedCard.id)
    ) return;

    setGameStats(prev => ({
      ...prev,
      flips: prev.flips + 1,
    }));

    setFlippedCards(prev => [...prev, clickedCard.id]);
    setCards(prev => 
      prev.map(card => 
        card.id === clickedCard.id ? { ...card, isFlipped: true } : card
      )
    );

    if (flippedCards.length === 1) {
      const firstCard = cards.find(card => card.id === flippedCards[0]);
      
      setGameStats(prev => ({
        ...prev,
        moves: prev.moves + 1,
      }));

      // Match based on content.solution instead of value
      if (firstCard.content.solution === clickedCard.content.solution) {
        // Play the number sound on successful match
        if (settings.soundEnabled && soundsLoaded) {
          const soundNumber = parseInt(firstCard.content.solution, 10);
          if (soundNumber >= 1 && soundNumber <= 10) {
            playSound(`number${soundNumber}`);
          }
        }
        
        setMatchedPairs(prev => [...prev, firstCard.content.solution]);
        setGameStats(prev => ({
          ...prev,
          matches: prev.matches + 1,
        }));
        setFlippedCards([]);
      } else {
        setGameStats(prev => ({
          ...prev,
          errors: prev.errors + 1,
        }));
        setTimeout(() => {
          setCards(prev => 
            prev.map(card => 
              flippedCards.includes(card.id) || card.id === clickedCard.id
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // Check for level completion
  useEffect(() => {
    if (matchedPairs.length === config.cardsPerLevel(level)) {
      setLevelComplete(true);
      
      // Play level complete sound
      if (settings.soundEnabled && soundsLoaded) {
        // Play a sequence of sounds for level complete
        setTimeout(() => {
          if (level < config.maxLevel) {
            // Play next number to indicate next level
            playSound(`number${level + 1}`);
          } else {
            // Play number 10 for game completion
            playSound('number10');
          }
        }, 500);
      }
      
      setTimeout(() => {
        if (level < config.maxLevel) {
          setLevel(prev => prev + 1);
        } else {
          // Game completed
          setIsPlaying(false);
        }
      }, 1500);
    }
  }, [matchedPairs, level, config, settings.soundEnabled, soundsLoaded]);

  const renderCardContent = (card) => {
    const { type, text, imageUrl, solution, description, spelling, phonetic } = card.content;
    return (
      <>
        <div className="card-content">
          {(type === 'image' || type === 'both') && imageUrl && (
            <div className="card-image">
              <img src={imageUrl} alt={text || 'Card'} />
            </div>
          )}
          {(type === 'text' || type === 'both') && text && (
            <div className="card-text">{text}</div>
          )}
          {description && (
            <div className="card-description">{description}</div>
          )}
        </div>
        <div className="card-solution">
          <div>{solution}</div>
          {spelling && (
            <div className="card-spelling">
              {spelling}
              {phonetic && <span className="phonetic">[{phonetic}]</span>}
            </div>
          )}
        </div>
      </>
    );
  };

  // Function to handle sound generation
  const handleGenerateSounds = async () => {
    if (!settings.customWords.trim()) {
      alert('Please enter words to generate sounds for');
      return;
    }
    
    setIsGeneratingSounds(true);
    
    try {
      // Call our backend API
      const response = await fetch('http://localhost:3001/api/generate-sounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          words: settings.customWords,
          voice: settings.voice
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate sounds');
      }
      
      setIsGeneratingSounds(false);
      alert(`Successfully generated ${Object.keys(data.results).length} sound files!`);
      
    } catch (error) {
      console.error('Error generating sounds:', error);
      alert('Failed to generate sounds: ' + error.message);
      setIsGeneratingSounds(false);
    }
  };

  const renderSettings = () => (
    <div className="game-settings">
      <div className="setting-item">
        <label>
          Timer Mode:
          <select 
            value={settings.timerMode}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              timerMode: e.target.value
            }))}
          >
            <option value="none">None</option>
            <option value="countdown">Countdown</option>
            <option value="stopwatch">Stopwatch</option>
          </select>
        </label>
      </div>

      {settings.timerMode === 'countdown' && (
        <div className="setting-item">
          <label>
            Timer Duration (seconds):
            <input 
              type="number"
              min="10"
              max="300"
              value={settings.timerDuration}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                timerDuration: parseInt(e.target.value, 10)
              }))}
            />
          </label>
        </div>
      )}

      <div className="setting-item">
        <label>
          <input 
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              soundEnabled: e.target.checked
            }))}
          />
          Enable Sound Effects
        </label>
      </div>

      <div className="setting-item">
        <label>
          <input 
            type="checkbox"
            checked={settings.showErrors}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              showErrors: e.target.checked
            }))}
          />
          Show Error Counter
        </label>
      </div>
      
      <hr />
      
      <h3>Sound Generator</h3>
      <div className="setting-item">
        <label>
          Voice:
          <select 
            value={settings.voice}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              voice: e.target.value
            }))}
          >
            <option value="Alex">Alex (US Male)</option>
            <option value="Samantha">Samantha (US Female)</option>
            <option value="Daniel">Daniel (UK Male)</option>
            <option value="Karen">Karen (AU Female)</option>
          </select>
        </label>
      </div>
      
      <div className="setting-item">
        <label>
          Words (comma-separated):
          <textarea 
            value={settings.customWords}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              customWords: e.target.value
            }))}
            placeholder="cat, dog, house, tree, book"
            rows={3}
            style={{ width: '100%', marginTop: '5px' }}
          />
        </label>
      </div>
      
      <div className="setting-item">
        <button 
          onClick={handleGenerateSounds}
          disabled={isGeneratingSounds || !settings.customWords.trim()}
          style={{ 
            padding: '8px 16px',
            backgroundColor: isGeneratingSounds ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isGeneratingSounds ? 'not-allowed' : 'pointer'
          }}
        >
          {isGeneratingSounds ? 'Generating...' : 'Generate Sound Files'}
        </button>
        <p style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
          Sounds will be saved to public/sounds/words/
        </p>
      </div>
    </div>
  );

  return (
    <GameLayout 
      title={`Memory Game - Level ${level}`}
      settingsContent={renderSettings()}
    >
      <div className="card-game">
        <div className="game-header">
          {settings.timerMode !== 'none' && (
            <div className="timer">Time: {timer}s</div>
          )}
          <div className="stats">
            <div className="stat-item">Moves: {gameStats.moves}</div>
            <div className="stat-item">Matches: {gameStats.matches}</div>
            {settings.showErrors && gameStats.errors > 0 && (
              <div className="stat-item">Errors: {gameStats.errors}</div>
            )}
          </div>
        </div>

        <div 
          className={`game-board ${levelComplete ? 'level-complete' : ''}`} 
          style={{
            gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(cards.length))}, 1fr)`
          }}
        >
          {cards.map(card => (
            <div
              key={card.id}
              className={`card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
              onClick={() => handleCardClick(card)}
            >
              <div className="card-inner">
                <div className="card-front"></div>
                <div className="card-back">
                  {renderCardContent(card)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {!isPlaying && (
          <button 
            className="start-button"
            onClick={() => {
              generateCards(level);
              setTimer(settings.timerDuration);
              setIsPlaying(true);
              setGameStats({
                startTime: Date.now(),
                moves: 0,
                flips: 0,
                matches: 0,
                errors: 0,
              });
              
              // Play starting sound
              if (settings.soundEnabled && soundsLoaded) {
                playSound(`number${level}`);
              }
            }}
          >
            {gameStats.startTime ? 'Play Again' : 'Start Game'}
          </button>
        )}
      </div>
    </GameLayout>
  );
};

CardGame.propTypes = {
  config: PropTypes.shape({
    timerMode: PropTypes.oneOf(['none', 'countdown', 'stopwatch']),
    timerDuration: PropTypes.number,
    startingLevel: PropTypes.number,
    maxLevel: PropTypes.number,
    cardsPerLevel: PropTypes.func,
    cardContent: PropTypes.func,
  }),
};

export default CardGame; 