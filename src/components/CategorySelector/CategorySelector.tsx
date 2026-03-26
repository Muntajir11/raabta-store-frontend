import React from 'react';
import './CategorySelector.css';
import studioImg from '../../assets/raabta/studio-segment.jpg';
import lifestyleImg from '../../assets/raabta/lifestyle-segment.jpg';

interface CategorySelectorProps {
  activeCategory: 'normal' | 'islamic';
  onSelect: (category: 'normal' | 'islamic') => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ activeCategory, onSelect }) => {
  const studioSelected = activeCategory === 'normal';
  const lifestyleSelected = activeCategory === 'islamic';

  return (
    <section className="category-selector-section" aria-label="Choose product segment">
      <div className="container">
        <div className="category-container" role="group" aria-label="Studio or Lifestyle">
          <button
            type="button"
            className={`category-box ${studioSelected ? 'active' : ''}`}
            aria-pressed={studioSelected}
            aria-label={
              studioSelected
                ? 'Studio segment, currently viewing'
                : 'Studio segment, select to view products'
            }
            onClick={() => onSelect('normal')}
          >
            <span className="category-segment-title">Raabta Studio</span>
            {!studioSelected && (
              <span className="category-segment-hint" aria-hidden="true">
                Tap to select Studio segment
              </span>
            )}
            <div className="image-wrapper">
              <img src={studioImg} alt="" className="category-bg-img" />
            </div>
          </button>

          <button
            type="button"
            className={`category-box ${lifestyleSelected ? 'active' : ''}`}
            aria-pressed={lifestyleSelected}
            aria-label={
              lifestyleSelected
                ? 'Lifestyle segment, currently viewing'
                : 'Lifestyle segment, select to view products'
            }
            onClick={() => onSelect('islamic')}
          >
            <span className="category-segment-title">Raabta Lifestyle</span>
            {!lifestyleSelected && (
              <span className="category-segment-hint" aria-hidden="true">
                Tap to select Lifestyle segment
              </span>
            )}
            <div className="image-wrapper">
              <img src={lifestyleImg} alt="" className="category-bg-img" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategorySelector;
