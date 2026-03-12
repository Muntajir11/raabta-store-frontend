import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import './FAQ.css';

const FAQ_DATA = [
  {
    question: "Do you ship internationally?",
    answer: "Yes, we ship our products worldwide. Shipping costs will apply, and will be added at checkout."
  },
  {
    question: "How long does shipping take?",
    answer: "It depends on where you are. Orders processed here will take 5-7 business days to arrive. Overseas deliveries can take anywhere from 7-16 days."
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 14-day return policy for unworn items in their original packaging. Please contact our support team to initiate a return."
  },
  {
    question: "How do I care for my printed t-shirts?",
    answer: "Machine wash cold inside out with like colors. Tumble dry low. Do not iron directly on the print."
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="container faq-container">
        <h2 className="faq-heading">Frequently Asked Questions</h2>
        <div className="faq-list">
          {FAQ_DATA.map((item, index) => (
            <div 
              key={index} 
              className={`faq-item ${openIndex === index ? 'open' : ''}`}
            >
              <button 
                className="faq-question-btn" 
                onClick={() => toggleFAQ(index)}
              >
                <span className="faq-question">{item.question}</span>
                <span className="faq-icon">
                  {openIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                </span>
              </button>
              <div 
                className="faq-answer-container"
                style={{ maxHeight: openIndex === index ? '200px' : '0' }}
              >
                <div className="faq-answer">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
