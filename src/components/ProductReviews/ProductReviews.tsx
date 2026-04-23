import { useEffect, useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import { ApiRequestError, reviewsList, type ReviewItem } from '../../lib/api';
import './ProductReviews.css';

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    void reviewsList(productId)
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg =
          err instanceof ApiRequestError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Unable to load reviews';
        setError(msg);
        setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const rating = useMemo(() => {
    if (!items.length) return 0;
    const avg = items.reduce((sum, r) => sum + r.rating, 0) / items.length;
    return Number(avg.toFixed(1));
  }, [items]);

  const renderStars = (ratingValue: number) =>
    Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={16}
        fill={index < Math.round(ratingValue) ? '#00B852' : 'none'}
        color={index < Math.round(ratingValue) ? '#00B852' : '#E5E7EB'}
        className="star-icon"
      />
    ));

  if (!items.length) return null;

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
              <span className="total-reviews">Based on {items.length} reviews</span>
            </div>
          </div>
        </div>
      </div>

      <div className="reviews-list">
        {error ? <p className="cart-error">{error}</p> : null}
        {items.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-card-header">
              <div className="review-author-info">
                <div className="author-avatar">U</div>
                <div>
                  <h4 className="author-name">Verified buyer</h4>
                  <span className="review-date">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
              <div className="review-rating">{renderStars(review.rating)}</div>
            </div>
            {review.comment ? <p className="review-content">{review.comment}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;
