import { useState, useEffect } from 'react';
import './ActivityGames.css';

interface ColorMatchingProps {
  onComplete: () => void;
}

const colors = ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠'];

const ColorMatching = ({ onComplete }: ColorMatchingProps) => {
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [shuffledColors, setShuffledColors] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    // Create pairs and shuffle
    const pairs = [...colors, ...colors];
    const shuffled = pairs.sort(() => Math.random() - 0.5);
    setShuffledColors(shuffled);
  }, []);

  const handleCardClick = (index: number) => {
    if (selectedCards.length === 2 || matchedPairs.includes(index)) return;

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newSelected;
      
      if (shuffledColors[first] === shuffledColors[second]) {
        setMatchedPairs([...matchedPairs, first, second]);
        setSelectedCards([]);
        
        if (matchedPairs.length + 2 === shuffledColors.length) {
          setTimeout(() => onComplete(), 500);
        }
      } else {
        setTimeout(() => setSelectedCards([]), 1000);
      }
    }
  };

  return (
    <div className="game-container">
      <h3>Renk Eşleştirme Oyunu</h3>
      <p>Hafızanızı test edin! Aynı renkleri eşleştirin.</p>
      <div className="moves-counter">Hamle: {moves}</div>
      <div className="color-grid">
        {shuffledColors.map((color, index) => {
          const isSelected = selectedCards.includes(index);
          const isMatched = matchedPairs.includes(index);
          
          return (
            <div
              key={index}
              className={`color-card ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleCardClick(index)}
            >
              {isSelected || isMatched ? color : '❓'}
            </div>
          );
        })}
      </div>
      {matchedPairs.length === shuffledColors.length && (
        <div className="game-complete">
          <h2>🎉 Tebrikler! Tüm renkleri eşleştirdiniz!</h2>
        </div>
      )}
    </div>
  );
};

export default ColorMatching;

