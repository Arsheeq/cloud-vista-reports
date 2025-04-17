
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-[#38bdf8] via-[#8250df] to-[#e11d48] text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-sm">
            &copy; 2025 Nubinix. All rights reserved.
          </div>
          <div>
            <a href="https://www.nubinix.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-opacity-80 transition-opacity">
              www.nubinix.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
