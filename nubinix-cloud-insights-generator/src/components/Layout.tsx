
import React from "react";
import { Link } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-gradient-to-r from-nubinix-blue via-nubinix-purple to-nubinix-pink text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/b0113d01-383e-48d7-b724-1271420a0792.png" 
              alt="Nubinix Logo" 
              className="h-10" 
            />
            <span className="ml-2 text-2xl font-bold text-white">Nubinix</span>
            <span className="ml-2 text-lg font-medium text-white opacity-80">Cloud Insights</span>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      
      <footer className="bg-gradient-to-r from-nubinix-blue via-nubinix-purple to-nubinix-pink text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              &copy; 2025 Nubinix. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm hover:text-opacity-80 transition-opacity">Documentation</a>
              <a href="#" className="text-sm hover:text-opacity-80 transition-opacity">Support</a>
              <a href="#" className="text-sm hover:text-opacity-80 transition-opacity">About</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
