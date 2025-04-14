
import React from 'react';
import { FileText, HelpCircle, Info } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="py-6 border-t mt-auto">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className="mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Nubinix. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="flex items-center hover:text-nubinix-purple transition-colors">
              <FileText size={16} className="mr-1" />
              Documentation
            </a>
            <a href="#" className="flex items-center hover:text-nubinix-purple transition-colors">
              <HelpCircle size={16} className="mr-1" />
              Support
            </a>
            <a href="#" className="flex items-center hover:text-nubinix-purple transition-colors">
              <Info size={16} className="mr-1" />
              About
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
