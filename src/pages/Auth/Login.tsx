import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const Login: React.FC = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">Log in</h1>
        <p className="auth-subtitle">Welcome back to raabta.</p>
        
        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Enter your email" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Enter your password" required />
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>
          
          <button type="submit" className="auth-submit-btn">Log in</button>
        </form>
        
        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
