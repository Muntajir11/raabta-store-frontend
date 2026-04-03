import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './SizeGuideModal.css';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    // Add logic to prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="size-guide-overlay" onClick={onClose}>
      <div 
        className="size-guide-content" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className="close-btn" onClick={onClose} aria-label="Close size guide">
          <X size={24} />
        </button>
        
        <div className="size-guide-header">
          <h2>Size Guide</h2>
          <p>Find your perfect fit. Measurements are in inches.</p>
        </div>

        <div className="table-container">
          <table className="size-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Chest</th>
                <th>Length</th>
                <th>Shoulder</th>
                <th>Sleeve Length</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="size-col">S</td>
                <td>38"</td>
                <td>27"</td>
                <td>17"</td>
                <td>8"</td>
              </tr>
              <tr>
                <td className="size-col">M</td>
                <td>40"</td>
                <td>28"</td>
                <td>18"</td>
                <td>8.5"</td>
              </tr>
              <tr>
                <td className="size-col">L</td>
                <td>42"</td>
                <td>29"</td>
                <td>19"</td>
                <td>9"</td>
              </tr>
              <tr>
                <td className="size-col">XL</td>
                <td>44"</td>
                <td>30"</td>
                <td>20"</td>
                <td>9.5"</td>
              </tr>
              <tr>
                <td className="size-col">XXL</td>
                <td>46"</td>
                <td>31"</td>
                <td>21"</td>
                <td>10"</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="size-guide-footer">
          <p><strong>How to Measure:</strong></p>
          <ul>
            <li><strong>Chest:</strong> Wrap tape under armpits and around the fullest part of your chest.</li>
            <li><strong>Length:</strong> Measure from the highest point of the shoulder to the bottom hem.</li>
            <li><strong>Shoulder:</strong> Measure from one shoulder point to the other across the back.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SizeGuideModal;
