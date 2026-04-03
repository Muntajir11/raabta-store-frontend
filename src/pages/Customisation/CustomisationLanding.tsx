import React from 'react';
import { Link } from 'react-router-dom';
import './CustomisationLanding.css';

const CustomisationLanding: React.FC = () => {
  return (
    <section className="customisation-landing" aria-labelledby="customisation-landing-title">
      <div className="container customisation-landing-inner">
        <div className="customisation-poster">
          <div className="customisation-poster-frame">
            <p className="customisation-poster-eyebrow">Raabta studio</p>
            <h1 id="customisation-landing-title" className="customisation-poster-title">
              Customisation
            </h1>
            <p className="customisation-poster-line" aria-hidden="true" />
            <p className="customisation-poster-sub">
              Build your T-shirt from scratch — upload art, set your message, pick fabric weight, size, and colour. One
              canvas, your story.
            </p>
            <div className="customisation-poster-cta">
              <Link to="/customisation/design" className="customisation-poster-btn">
                Customize Yours
              </Link>
            </div>
            <ul className="customisation-poster-hints" aria-label="What you can customize">
              <li>Your artwork</li>
              <li>Typography &amp; placement</li>
              <li>Size, colour &amp; GSM</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomisationLanding;
