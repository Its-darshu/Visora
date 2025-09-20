
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white mt-8 py-4">
      <div className="container mx-auto px-4 text-center text-slate-500">
        <p>&copy; {new Date().getFullYear()} Multimodal Personal Tutor. AI-powered learning for everyone.</p>
      </div>
    </footer>
  );
};

export default Footer;
