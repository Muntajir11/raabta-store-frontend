import React from 'react';
import { useParams } from 'react-router-dom';
import ProductCards from '../../components/ProductCards/ProductCards';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  
  // Render placeholder segment collection using our updated ProductCards
  return (
    <div className="category-page">
      <ProductCards category={categoryId || 'anime'} />
    </div>
  );
};

export default CategoryPage;
