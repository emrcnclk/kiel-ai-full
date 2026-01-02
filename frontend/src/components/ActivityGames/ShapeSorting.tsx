import { useState } from 'react';
import './ActivityGames.css';

interface ShapeSortingProps {
  onComplete: () => void;
}

const shapes = [
  { id: 1, shape: '🔴', name: 'Daire', size: 'small' },
  { id: 2, shape: '🔵', name: 'Daire', size: 'medium' },
  { id: 3, shape: '🟡', name: 'Daire', size: 'large' },
  { id: 4, shape: '🟢', name: 'Kare', size: 'small' },
  { id: 5, shape: '🟣', name: 'Kare', size: 'medium' },
  { id: 6, shape: '🟠', name: 'Kare', size: 'large' },
];

const ShapeSorting = ({ onComplete }: ShapeSortingProps) => {
  const [shapesList, setShapesList] = useState(shapes.sort(() => Math.random() - 0.5));
  const [sortedShapes, setSortedShapes] = useState<typeof shapes>([]);

  const handleDragStart = (e: React.DragEvent, shape: typeof shapes[0]) => {
    e.dataTransfer.setData('shape', JSON.stringify(shape));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const shapeData = JSON.parse(e.dataTransfer.getData('shape'));
    
    if (!sortedShapes.find(s => s.id === shapeData.id)) {
      setSortedShapes([...sortedShapes, shapeData]);
      setShapesList(shapesList.filter(s => s.id !== shapeData.id));
      
      if (sortedShapes.length + 1 === shapes.length) {
        setTimeout(() => onComplete(), 500);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="game-container">
      <h3>Şekil Sıralama Oyunu</h3>
      <p>Şekilleri büyükten küçüğe doğru sıralayın.</p>
      
      <div className="shape-sorting-area">
        <div className="shapes-source">
          <h4>Şekilleri buraya sürükleyin:</h4>
          <div className="shapes-list">
            {shapesList.map(shape => (
              <div
                key={shape.id}
                className="shape-item"
                draggable
                onDragStart={(e) => handleDragStart(e, shape)}
              >
                <div className="shape-icon">{shape.shape}</div>
                <div className="shape-name">{shape.name}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div
          className="sorting-zone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <h4>Sıralama Alanı:</h4>
          <div className="sorted-shapes">
            {sortedShapes.map(shape => (
              <div key={shape.id} className="shape-item sorted">
                <div className="shape-icon">{shape.shape}</div>
                <div className="shape-name">{shape.name}</div>
              </div>
            ))}
            {sortedShapes.length === 0 && (
              <div className="drop-hint">Şekilleri buraya sürükleyin</div>
            )}
          </div>
        </div>
      </div>
      
      {sortedShapes.length === shapes.length && (
        <div className="game-complete">
          <h2>🎉 Harika! Şekilleri doğru sıraladınız!</h2>
        </div>
      )}
    </div>
  );
};

export default ShapeSorting;

