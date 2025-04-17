import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-[#38bdf8] via-[#8250df] to-[#e11d48] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img
            src="/lovable-uploads/3416d038-01be-47dd-85da-562cb4346ba8.png"
            alt="Nubinix Logo"
            className="h-10"
          />
          <span className="ml-2 text-2xl font-bold text-white">Nubinix</span>
          <span className="ml-2 text-lg font-medium text-white opacity-80">
            Cloud Insights
          </span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
