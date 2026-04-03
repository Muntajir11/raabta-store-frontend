export interface Review {
  id: string;
  productId: number;
  author: string;
  rating: number;
  date: string;
  content: string;
  helpful: number;
}

export const DUMMY_REVIEWS: Review[] = [
  {
    id: '1',
    productId: 1,
    author: 'Sarah M.',
    rating: 5,
    date: '2 weeks ago',
    content: 'Absolutely love the quality of this item! The material is incredibly soft and the fit is exactly as described. Will definitely be buying more.',
    helpful: 12
  },
  {
    id: '2',
    productId: 1,
    author: 'David K.',
    rating: 4,
    date: '1 month ago',
    content: 'Great product, nice quality. I took off one star because the shipping took a bit longer than expected to my area, but the item itself is flawless.',
    helpful: 5
  },
  {
    id: '3',
    productId: 1,
    author: 'Aisha T.',
    rating: 5,
    date: '2 months ago',
    content: 'The fit is perfect. It drapes really well and doesn\'t lose its shape after washing. Highly recommend for a relaxed everyday look.',
    helpful: 24
  },
  {
    id: '4',
    productId: 2,
    author: 'Michael B.',
    rating: 5,
    date: '3 weeks ago',
    content: 'This fits so well and looks great. The color is exactly as pictured.',
    helpful: 8
  }
];

export const getReviewsByProductId = (productId: number): Review[] => {
  const filtered = DUMMY_REVIEWS.filter(review => review.productId === productId);
  // Fallback to all reviews if no specific reviews found for demo purposes
  return filtered.length > 0 ? filtered : DUMMY_REVIEWS;
};
