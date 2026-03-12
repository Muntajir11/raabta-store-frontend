import React from 'react';
import './Hero.css';

const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="container hero-container">
        <h1 className="hero-title">
          <span className="hero-word-normal">Design</span>
          <br />
          <span className="hero-word-italic">the future</span>
        </h1>
      </div>
    </section>
  );
};

export default Hero;
