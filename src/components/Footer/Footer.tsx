import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        
        <div className="footer-brand">
          <h2 className="footer-logo">raabta.</h2>
          <p className="footer-tagline">
            Your concept, our craft.
            <br />
            Faith meets lifestyle.
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4 className="footer-col-heading">Shop</h4>
            <ul>
              <li><a href="#">Normal Prints</a></li>
              <li><a href="#">Islamic Prints</a></li>
              <li><a href="#">New Arrivals</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-heading">Support</h4>
            <ul>
              <li>
                <Link to="/contact" target="_blank" rel="noreferrer noopener">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shipping" target="_blank" rel="noreferrer noopener">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/returns" target="_blank" rel="noreferrer noopener">
                  Returns &amp; Refunds
                </Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-heading">Legal</h4>
            <ul>
              <li>
                <Link to="/privacy" target="_blank" rel="noreferrer noopener">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" target="_blank" rel="noreferrer noopener">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-heading">Social</h4>
            <div className="social-icons">
              <a
                href="https://www.instagram.com/raabta.studio_?igsh=MWxqbjJiYXg1dDBsYw=="
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer noopener"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.facebook.com/share/18MbF2x5AT/?mibextid=wwXIfr"
                aria-label="Facebook"
                target="_blank"
                rel="noreferrer noopener"
              >
                <Facebook size={20} />
              </a>
              <a href="https://x.com/raabtastore" aria-label="Twitter" target="_blank" rel="noreferrer noopener">
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>

      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} raabta. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
