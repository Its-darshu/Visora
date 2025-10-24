import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Local images from public folder
const imgLoginImage = "/images/login image.svg";
const imgGoogleLogo = "/images/googe logo.svg"; // Note: filename has typo "googe"

const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { loginWithGoogle, signup, login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      navigate('/visual-intelligence');
    } catch (err: any) {
      console.error('Google login error:', err);
      setError('Failed to sign in with Google. Please try again.');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      // Validation for sign up
      if (!formData.email.trim()) {
        setError('Please enter your email address');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setLoading(true);
      try {
        // Extract username from email for display name
        const displayName = formData.email.split('@')[0];
        await signup(formData.email, formData.password, displayName);
        navigate('/visual-intelligence');
      } catch (err: any) {
        console.error('Signup error:', err);
        setError(err.message || 'Failed to create account. Please try again.');
      }
      setLoading(false);
    } else {
      // Sign in validation
      if (!formData.email.trim()) {
        setError('Please enter your email address');
        return;
      }
      if (!formData.password) {
        setError('Please enter your password');
        return;
      }

      setLoading(true);
      try {
        await login(formData.email, formData.password);
        navigate('/visual-intelligence');
      } catch (err: any) {
        console.error('Login error:', err);
        setError(err.message || 'Failed to sign in. Please check your credentials.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full bg-white overflow-hidden">
      {/* Left Panel - Illustration */}
      <div className="hidden lg:flex lg:w-[40%] relative items-start justify-start overflow-hidden">
        <img 
          src={imgLoginImage} 
          alt="Student illustration" 
          className="h-[775px] w-[565px] object-cover"
          style={{ marginLeft: '-29px', marginTop: '0px' }}
        />
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[505px]">
          <div className="flex flex-col items-center gap-6">
            {/* Title */}
            <h1 
              className="text-[48px] text-black text-center leading-tight"
              style={{ fontFamily: "'Silkscreen', monospace" }}
            >
              {isSignUp ? 'WELCOME ! GET STARTED' : 'WELCOME'}
            </h1>

            {error && (
              <div className="w-full bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3">
                <p className="text-sm" style={{ fontFamily: "'Silkscreen', monospace" }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
              {/* Email Field */}
              <div className="flex flex-col gap-1.5">
                <label 
                  className="text-[24px] text-black"
                  style={{ fontFamily: "'Silkscreen', monospace" }}
                >
                  EMAIL
                </label>
                <div className="relative overflow-hidden" style={{ filter: 'drop-shadow(5px 4px 0px #000000)' }}>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full h-[66px] bg-black text-white px-4 focus:outline-none"
                    style={{ 
                      fontFamily: "'Silkscreen', monospace"
                    }}
                  />
                  <div 
                    className="absolute top-0 right-0 bottom-0 w-[150px] pointer-events-none"
                    style={{
                      background: 'linear-gradient(to left, #ffa500 0%, rgba(255, 165, 0, 0.8) 40%, transparent 100%)'
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1.5">
                <label 
                  className="text-[24px] text-black"
                  style={{ fontFamily: "'Silkscreen', monospace" }}
                >
                  PASSWORD
                </label>
                <div className="relative overflow-hidden" style={{ filter: 'drop-shadow(5px 4px 0px #000000)' }}>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full h-[66px] bg-black text-white px-4 focus:outline-none"
                    style={{ 
                      fontFamily: "'Silkscreen', monospace"
                    }}
                  />
                  <div 
                    className="absolute top-0 right-0 bottom-0 w-[150px] pointer-events-none"
                    style={{
                      background: 'linear-gradient(to left, #ffa500 0%, rgba(255, 165, 0, 0.8) 40%, transparent 100%)'
                    }}
                  />
                </div>
              </div>

              {/* Confirm Password Field - Only for Sign Up */}
              {isSignUp && (
                <div className="flex flex-col gap-1.5">
                  <label 
                    className="text-[24px] text-black"
                    style={{ fontFamily: "'Silkscreen', monospace" }}
                  >
                    CONFIRM PASSWORD
                  </label>
                  <div className="relative overflow-hidden" style={{ filter: 'drop-shadow(5px 4px 0px #000000)' }}>
                    <input
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full h-[66px] bg-black text-white px-4 focus:outline-none"
                      style={{ 
                        fontFamily: "'Silkscreen', monospace"
                      }}
                    />
                    <div 
                      className="absolute top-0 right-0 bottom-0 w-[150px] pointer-events-none"
                      style={{
                        background: 'linear-gradient(to left, #ffa500 0%, rgba(255, 165, 0, 0.8) 40%, transparent 100%)'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full h-[66px] bg-black text-white overflow-hidden hover:bg-gray-900 transition-colors disabled:opacity-50"
                style={{ 
                  boxShadow: '5px 5px 0px 0px #000000',
                  fontFamily: "'Silkscreen', monospace"
                }}
              >
                <span className="relative z-10 text-[36px]">
                  {loading ? 'LOADING...' : 'SUBMIT'}
                </span>
                <div 
                  className="absolute top-0 right-0 bottom-0 w-[150px] pointer-events-none"
                  style={{
                    background: 'linear-gradient(to left, #ffa500 0%, rgba(255, 165, 0, 0.8) 40%, transparent 100%)'
                  }}
                />
              </button>

              {/* OR Divider */}
              <p 
                className="text-[24px] text-black text-center"
                style={{ fontFamily: "'Silkscreen', monospace" }}
              >
                OR
              </p>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="relative w-full h-[66px] bg-black text-white overflow-hidden hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-6"
                style={{ 
                  boxShadow: '5px 5px 0px 0px #000000',
                  fontFamily: "'Silkscreen', monospace"
                }}
              >
                <img src={imgGoogleLogo} alt="Google" className="w-[55px] h-[55px] z-10" />
                <span className="text-[20px] z-10">SIGNUP WITH GOOGLE</span>
                <div 
                  className="absolute top-0 right-0 bottom-0 w-[180px] pointer-events-none"
                  style={{
                    background: 'linear-gradient(to left, #ffa500 0%, rgba(255, 165, 0, 0.8) 40%, transparent 100%)'
                  }}
                />
              </button>

              {/* Toggle Sign Up / Sign In */}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-[24px] text-black text-center hover:underline"
                style={{ fontFamily: "'Silkscreen', monospace" }}
              >
                {isSignUp ? "ALL HAVE AN ACCOUNT? LOGIN" : "DON'T HAVE ACCOUNT? SIGNUP"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap');
      `}</style>
    </div>
  );
};

export default AuthPage;
