import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import '../styles/AuthPage.css';

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
    role: 'customer'
  });
  const [message, setMessage] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();
  
  // Prevent logged-in users from seeing the login page
  React.useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('loggedIn');
    const role = localStorage.getItem('role');
    if (isLoggedIn === 'true') {
      navigate(role === 'customer' ? '/customer-map' : '/seller-dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"|,.<>/?]/.test(password);
    
    return {
      isValid: password.length >= minLength && hasUpper && hasLower && hasDigit && hasSpecial,
      requirements: {
        minLength: password.length >= minLength,
        hasUpper,
        hasLower,
        hasDigit,
        hasSpecial
      }
    };
  };

  const startResendTimer = () => {
    setResendDisabled(true);
    let timer = 30;
    setResendTimer(timer);
    
    const interval = setInterval(() => {
      timer -= 1;
      setResendTimer(timer);
      
      if (timer <= 0) {
        clearInterval(interval);
        setResendDisabled(false);
      }
    }, 1000);
  };

  const handleResendCode = async () => {
    setMessage('Sending new verification email...');
    try {
      const response = await fetch('/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      });
  
      const result = await response.json();
      
      if (response.ok) {
        setMessage(result.message);
        startResendTimer();
      } else {
        setMessage(result.error || 'Failed to resend verification');
      }
    } catch (err) {
      setMessage('Failed to connect to server');
    }
  };

  const handleSendVerificationCode = async () => {
    try {
      const passwordValidation = validatePassword(form.password);
      if (!passwordValidation.isValid) {
        setMessage('Password must meet all requirements');
        return;
      }
  
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
  
      const result = await response.json();
      
      if (response.ok) {
        setIsEmailSent(true);
        setMessage(result.message);
        startResendTimer();
      } else {
        setMessage(result.error || 'Registration failed');
      }
    } catch (err) {
      setMessage('Failed to connect to server');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await handleSendVerificationCode();
      } else {
        // Use the api.js login function instead of direct fetch
        const result = await login({ email: form.email, password: form.password });
        
        sessionStorage.setItem('loggedIn', 'true');
        navigate(result.role === 'customer' ? '/customer-map' : '/seller-dashboard');
      }
    } catch (error) {
      setMessage(error.message || 'Login failed');
    }
  };

  const passwordValidation = validatePassword(form.password);

  return (
    <div className="auth-container">
      <h2>Welcome To HasthaVeedhi</h2>
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <>
            <input 
              name="username" 
              placeholder="Username" 
              onChange={handleChange} 
              required 
            />
            <input 
              name="phone" 
              placeholder="Phone" 
              onChange={handleChange} 
              required 
            />
          </>
        )}
        <input 
          name="email" 
          type="email" 
          placeholder="Email" 
          onChange={handleChange} 
          required 
        />
        
        <div className="password-field">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="show-password-btn"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        {isRegister && (
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="customer">Customer</option>
            <option value="seller">Seller</option>
          </select>
        )}

        {isRegister && form.password && (
          <div className="password-requirements">
            <h5>Password must contain:</h5>
            <ul>
              <li className={passwordValidation.requirements.minLength ? 'valid' : 'invalid'}>
                At least 8 characters
              </li>
              <li className={passwordValidation.requirements.hasUpper ? 'valid' : 'invalid'}>
                At least one uppercase letter
              </li>
              <li className={passwordValidation.requirements.hasLower ? 'valid' : 'invalid'}>
                At least one lowercase letter
              </li>
              <li className={passwordValidation.requirements.hasDigit ? 'valid' : 'invalid'}>
                At least one number
              </li>
              <li className={passwordValidation.requirements.hasSpecial ? 'valid' : 'invalid'}>
                At least one special character
              </li>
            </ul>
          </div>
        )}

        <button type="submit" className="btn btn-primary submit-btn">
          {isRegister ? 'Register' : 'Login'}
        </button>
      </form>

      {message && (
        <p className={message.includes('failed') ? 'error-message' : 'success-message'}>
          {message}
        </p>
      )}

      {isRegister && isEmailSent && (
        <div className="resend-container">
          <p>Didn't receive the email?</p>
          <button
            onClick={handleResendCode}
            disabled={resendDisabled}
            className="resend-btn"
          >
            {resendDisabled ? `Resend in ${resendTimer}s` : 'Resend Email'}
          </button>
        </div>
      )}

      <button
        onClick={() => {
          setIsRegister(!isRegister);
          setIsEmailSent(false);
          setMessage('');
        }}
        className="btn btn-outline-primary toggle-btn"
      >
        {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
      </button>
    </div>
  );
};

export default AuthPage;