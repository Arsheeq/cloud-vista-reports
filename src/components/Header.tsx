
import React, { useEffect, useState } from 'react';
import Logo from './Logo';
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';

const Header: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if the user has a preference stored in localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    // Check if the user prefers dark mode via OS settings
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Update the document with the current theme
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <header className="py-6 border-b border-border">
      <div className="container mx-auto flex justify-between items-center">
        <Logo size="medium" />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleDarkMode}
          className="rounded-full w-10 h-10"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 text-yellow-400" />
          ) : (
            <Moon className="h-5 w-5 text-nubinix-purple" />
          )}
        </Button>
      </div>
    </header>
  );
};

export default Header;
