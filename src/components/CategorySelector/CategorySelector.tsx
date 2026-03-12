import React from 'react';
import './CategorySelector.css';

interface CategorySelectorProps {
  activeCategory: 'normal' | 'islamic';
  onSelect: (category: 'normal' | 'islamic') => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ activeCategory, onSelect }) => {
  return (
    <section className="category-selector-section">
      <div className="container">
        <div className="category-container">
          
          {/* Normal T-Shirts (Black Box) */}
          <div 
            className={`category-box black-box ${activeCategory === 'normal' ? 'active' : ''}`}
            onClick={() => onSelect('normal')}
          >
            <div className="box-content">
              <h2 className="box-logo">raabta.</h2>
              <p className="box-subtext">YOUR CONCEPT, OUR CRAFT.</p>
            </div>
          </div>

          {/* Islamic T-Shirts (White Box) */}
          <div 
            className={`category-box white-box ${activeCategory === 'islamic' ? 'active' : ''}`}
            onClick={() => onSelect('islamic')}
          >
            <div className="box-content">
              <h2 className="box-logo">raabta.</h2>
              <p className="box-subtext">FAITH MEETS LIFESTYLE</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CategorySelector;
