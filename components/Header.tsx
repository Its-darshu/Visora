
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 md:px-8">
        <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-graduation-cap text-2xl text-white"></i>
            </div>
            <div>
                 <h1 className="text-2xl font-bold text-slate-800">Multimodal Personal Tutor</h1>
                 <p className="text-slate-500">Your AI-powered learning companion</p>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
