import React from 'react';
import './CategorySelector.css';
import studioImg from '../../assets/raabta/studio-segment.jpg';
import lifestyleImg from '../../assets/raabta/lifestyle-segment.jpg';

interface CategorySelectorProps {
  activeCategory: 'normal' | 'islamic';
  onSelect: (category: 'normal' | 'islamic') => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ activeCategory, onSelect }) => {
  return (
    <section className="category-selector-section">
      <div className="container">
        <div className="category-container">
          
          {/* Normal T-Shirts (Black Box -> Studio Image) */}
          <div 
            className={`category-box ${activeCategory === 'normal' ? 'active' : ''}`}
            onClick={() => onSelect('normal')}
          >
            <div className="image-wrapper">
              <img src={studioImg} alt="raabta. Studio - YOUR CONCEPT, OUR CRAFT." className="category-bg-img" />
            </div>
          </div>

          {/* Islamic T-Shirts (White Box -> Lifestyle Image) */}
          <div 
            className={`category-box ${activeCategory === 'islamic' ? 'active' : ''}`}
            onClick={() => onSelect('islamic')}
          >
            <div className="image-wrapper">
              <img src={lifestyleImg} alt="raabta. Lifestyle - FAITH MEETS LIFESTYLE" className="category-bg-img" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CategorySelector;
