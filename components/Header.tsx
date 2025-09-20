
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

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
    // Generate a gradient avatar based on user's initials
    const initials = currentUser?.displayName
      ?.split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase() || currentUser?.email?.[0].toUpperCase() || 'U';
    
    return `https://ui-avatars.com/api/?name=${initials}&background=3b82f6&color=fff&size=128`;
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-graduation-cap text-2xl text-white"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Multimodal Personal Tutor</h1>
              <p className="text-slate-500">Your AI-powered learning companion</p>
            </div>
          </div>

          {/* User Profile Section */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {currentUser.displayName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {currentUser.email}
                  </p>
                </div>
                <img
                  src={getUserAvatar()}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full border-2 border-gray-200"
                />
                <i className={`fa-solid fa-chevron-down text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}></i>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
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
      </div>
    </header>
  );
};

export default Header;
