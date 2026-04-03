import React from 'react';
import { Star, ThumbsUp, MoreHorizontal } from 'lucide-react';
import { getReviewsByProductId } from '../../data/reviews';
import './ProductReviews.css';

interface ProductReviewsProps {
  productId?: number;
  rating?: number;
  reviewsCount?: number;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ rating = 4.8, reviewsCount = 124, productId }) => {
  const reviews = productId ? getReviewsByProductId(productId) : [];

  const renderStars = (ratingValue: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star 
        key={index}
        size={16} 
        fill={index < ratingValue ? "#00B852" : "none"} 
        color={index < ratingValue ? "#00B852" : "#E5E7EB"} 
        className="star-icon"
      />
    ));
  };

  return (
    <div className="product-reviews-container">
      <div className="reviews-header">
        <h2 className="reviews-title">Customer Reviews</h2>
        <div className="reviews-summary">
          <div className="average-rating">
            <span className="rating-number">{rating.toFixed(1)}</span>
            <div className="rating-stars">
              <div className="stars-row">
                {renderStars(Math.round(rating))}
              </div>
              <span className="total-reviews">Based on {reviewsCount} reviews</span>
            </div>
          </div>
          <form 
            className="write-review-form" 
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const textarea = form.querySelector('textarea');
              if (textarea) {
                textarea.value = '';
                textarea.style.height = '48px';
              }
            }}
          >
            <textarea 
              className="write-review-input" 
              placeholder="Write a review..."
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = '48px';
                target.style.height = `${Math.max(48, target.scrollHeight)}px`;
              }}
            />
            <button type="submit" className="submit-review-btn">Post</button>
          </form>
        </div>
      </div>

      <div className="reviews-list">
        {reviews.map(review => (
          <div key={review.id} className="review-card">
            <div className="review-card-header">
              <div className="review-author-info">
                <div className="author-avatar">{review.author.charAt(0)}</div>
                <div>
                  <h4 className="author-name">{review.author}</h4>
                  <span className="review-date">{review.date}</span>
                </div>
              </div>
              <div className="review-rating">
                {renderStars(review.rating)}
              </div>
            </div>
            <p className="review-content">{review.content}</p>
            <div className="review-actions">
              <button className="action-btn helpful-btn">
                <ThumbsUp size={14} /> Helpful ({review.helpful})
              </button>
              <button className="action-btn">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {reviewsCount > 3 && (
        <button className="load-more-btn">Load More Reviews</button>
      )}
    </div>
  );
};

export default ProductReviews;
