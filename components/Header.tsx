
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setShowDropdown(false);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const getUserAvatar = () => {
    if (currentUser?.photoURL) {
      return currentUser.photoURL;
    }
    const initials = currentUser?.displayName
      ?.split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase() || currentUser?.email?.[0].toUpperCase() || 'U';
    
    return `https://ui-avatars.com/api/?name=${initials}&background=3b82f6&color=fff&size=128`;
  };

  const navigationItems = [
    { path: '/dashboard', icon: 'fa-home', label: 'Dashboard', emoji: '🏠' },
    { path: '/image-intelligence', icon: 'fa-image', label: 'Image AI', emoji: '🖼️' },
    { path: '/text-intelligence', icon: 'fa-file-text', label: 'Text AI', emoji: '💬' },
    { path: '/analytics', icon: 'fa-chart-line', label: 'Analytics', emoji: '📊' },
    { path: '/settings', icon: 'fa-cog', label: 'Settings', emoji: '⚙️' },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <header className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
              <span className="text-2xl">🎨</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">Visora</h1>
              <p className="text-xs text-purple-100 hidden sm:block">AI Visual Intelligence</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  isActivePath(item.path)
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white text-2xl"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <i className={`fa-solid ${showMobileMenu ? 'fa-times' : 'fa-bars'}`}></i>
          </button>

          {/* User Profile Section */}
          {currentUser && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition duration-200 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-medium text-white">
                    {currentUser.displayName || 'User'}
                  </p>
                  <p className="text-xs text-purple-100">
                    {currentUser.email}
                  </p>
                </div>
                <img
                  src={getUserAvatar()}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                />
                <i className={`fa-solid fa-chevron-down text-white transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}></i>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 lg:hidden">
                    <p className="text-sm font-medium text-gray-900">
                      {currentUser.displayName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentUser.email}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <i className="fa-solid fa-user mr-3 text-gray-400"></i>
                    Profile Settings
                  </button>
                  
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <i className="fa-solid fa-cog mr-3 text-gray-400"></i>
                    Preferences
                  </button>
                  
                  <hr className="my-1" />
                  
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <i className="fa-solid fa-sign-out-alt mr-3 text-red-500"></i>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 pb-2">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setShowMobileMenu(false);
                  }}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all flex items-center gap-3 ${
                    isActivePath(item.path)
                      ? 'bg-white text-purple-600 shadow-md'
                      : 'text-white bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <span className="text-xl">{item.emoji}</span>
                  <span>{item.label}</span>
                </button>
              ))}
              
              {currentUser && (
                <>
                  <div className="border-t border-white/20 pt-2 mt-2">
                    <div className="flex items-center gap-3 px-4 py-2 text-white">
                      <img
                        src={getUserAvatar()}
                        alt="User Avatar"
                        className="w-10 h-10 rounded-full border-2 border-white"
                      />
                      <div>
                        <p className="font-medium">{currentUser.displayName || 'User'}</p>
                        <p className="text-xs text-purple-100">{currentUser.email}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-3 rounded-lg font-semibold bg-red-500/20 text-white hover:bg-red-500/30 flex items-center gap-3"
                  >
                    <i className="fa-solid fa-sign-out-alt"></i>
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
