import React from 'react';
import { useParams } from 'react-router-dom';
import ProductCards from '../../components/ProductCards/ProductCards';
import CustomisationLanding from '../Customisation/CustomisationLanding';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();

  if (categoryId === 'customisation') {
    return (
      <div className="category-page">
        <CustomisationLanding />
      </div>
    );
  }

  return (
    <div className="category-page">
      <ProductCards category={categoryId || 'anime'} />
    </div>
  );
};

export default CategoryPage;
