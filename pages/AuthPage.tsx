import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const { loginWithGoogle, signup, login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      if (!formData.fullName.trim()) {
        setError('Please enter your full name');
        return;
      }
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
      if (!formData.agreeToTerms) {
        setError('Please agree to the Terms and Privacy Policy');
        return;
      }

      setLoading(true);
      try {
        await signup(formData.email, formData.password, formData.fullName);
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
    <div className="relative flex min-h-screen w-full">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-[#1a1122] p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a1a3e] to-[#1a1122] opacity-50"></div>
        
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: 'rgba(127,19,236,0.2)', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: 'rgba(236,72,153,0)', stopOpacity: 1}} />
              </linearGradient>
              <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: 'rgba(37,99,235,0.2)', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: 'rgba(37,99,235,0)', stopOpacity: 1}} />
              </linearGradient>
            </defs>
            <rect fill="transparent" height="100%" width="100%" />
            <path d="M0,150 Q200,50 400,150 T800,150" fill="none" stroke="url(#grad1)" strokeWidth="2">
              <animate 
                attributeName="d" 
                dur="10s" 
                repeatCount="indefinite" 
                values="M0,150 Q200,50 400,150 T800,150; M0,150 Q200,250 400,150 T800,150; M0,150 Q200,50 400,150 T800,150"
              />
            </path>
            <path d="M0,300 Q150,400 300,300 T600,300" fill="none" stroke="url(#grad2)" strokeWidth="2">
              <animate 
                attributeName="d" 
                dur="12s" 
                repeatCount="indefinite" 
                values="M0,300 Q150,400 300,300 T600,300; M0,300 Q150,200 300,300 T600,300; M0,300 Q150,400 300,300 T600,300"
              />
            </path>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <h1 className="text-5xl font-bold mb-4">Visora</h1>
          <p className="text-xl text-gray-300">See. Understand. Create.</p>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#191022]">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl p-8 border border-white/10">
            <div className="flex flex-col items-center">
              <p className="text-white text-3xl font-black mb-8 text-center">
                {isSignUp ? 'Create Your Visora Account' : 'Welcome Back to Visora'}
              </p>

              {error && (
                <div className="w-full bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
                  <div className="flex items-center">
                    <span className="material-symbols-outlined mr-2">error</span>
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="w-full space-y-6">
                {isSignUp && (
                  <div>
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-white text-sm font-medium leading-normal pb-2">Full Name</p>
                      <input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#7f13ec]/50 border border-white/10 bg-[#362348]/50 h-14 placeholder:text-[#ad92c9]/70 p-4 text-base font-normal leading-normal transition-all"
                        placeholder="Enter your full name"
                      />
                    </label>
                  </div>
                )}

                <div>
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-white text-sm font-medium leading-normal pb-2">Email Address</p>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#7f13ec]/50 border border-white/10 bg-[#362348]/50 h-14 placeholder:text-[#ad92c9]/70 p-4 text-base font-normal leading-normal transition-all"
                      placeholder="Enter your email address"
                    />
                  </label>
                </div>

                <div>
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-white text-sm font-medium leading-normal pb-2">Password</p>
                    <div className="flex w-full flex-1 items-stretch rounded-lg border border-white/10 focus-within:ring-2 focus-within:ring-[#7f13ec]/50 transition-all">
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleInputChange}
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-white focus:outline-none border-none bg-[#362348]/50 h-14 placeholder:text-[#ad92c9]/70 p-4 rounded-l-lg text-base font-normal leading-normal"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[#ad92c9] flex bg-[#362348]/50 items-center justify-center px-4 rounded-r-lg hover:text-white transition-colors"
                      >
                        <span className="material-symbols-outlined">
                          {showPassword ? 'visibility' : 'visibility_off'}
                        </span>
                      </button>
                    </div>
                  </label>
                </div>

                {isSignUp && (
                  <div>
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-white text-sm font-medium leading-normal pb-2">Confirm Password</p>
                      <div className="flex w-full flex-1 items-stretch rounded-lg border border-white/10 focus-within:ring-2 focus-within:ring-[#7f13ec]/50 transition-all">
                        <input
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-white focus:outline-none border-none bg-[#362348]/50 h-14 placeholder:text-[#ad92c9]/70 p-4 rounded-l-lg text-base font-normal leading-normal"
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-[#ad92c9] flex bg-[#362348]/50 items-center justify-center px-4 rounded-r-lg hover:text-white transition-colors"
                        >
                          <span className="material-symbols-outlined">
                            {showConfirmPassword ? 'visibility' : 'visibility_off'}
                          </span>
                        </button>
                      </div>
                    </label>
                  </div>
                )}

                {isSignUp && (
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        type="checkbox"
                        className="w-4 h-4 border border-gray-600 rounded bg-gray-700 focus:ring-3 focus:ring-[#7f13ec] ring-offset-gray-800"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label className="font-light text-gray-400">
                        I agree to the <a className="font-medium text-[#7f13ec] hover:underline cursor-pointer">Terms and Privacy Policy</a>
                      </label>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white bg-gradient-to-r from-[#7f13ec] to-fuchsia-600 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-[#7f13ec]/50 font-medium rounded-lg text-sm px-5 py-3.5 text-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                    </div>
                  ) : (
                    <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full text-white bg-transparent border border-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-800 font-medium rounded-lg text-sm px-5 py-3.5 text-center flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 18 19" xmlns="http://www.w3.org/2000/svg">
                    <path clipRule="evenodd" d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-5.2 5.74.5.5 0 0 1-1.02.055 6.882 6.882 0 0 1 6.22-6.218 6.945 6.945 0 0 1 6.885 6.885.5.5 0 0 1-.482.551A5.591 5.591 0 0 0 9.09 14.5a5.9 5.9 0 0 0 5.66-4.664H9.23a.5.5 0 0 1 0-1h6.36a.5.5 0 0 1 .5.5 6.923 6.923 0 0 1-2.015 4.93A8.464 8.464 0 0 1 9.09 18.1Z" fillRule="evenodd"/>
                  </svg>
                  Continue with Google
                </button>

                <p className="text-sm font-light text-gray-400 text-center">
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError('');
                    }}
                    className="font-medium text-[#7f13ec] hover:underline"
                  >
                    {isSignUp ? 'Sign in here' : 'Sign up here'}
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-size: 20px;
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
