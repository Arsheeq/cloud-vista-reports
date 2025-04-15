
import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

const Logo: React.FC<LogoProps> = ({ size = 'medium' }) => {
  const dimensions = {
    small: 'w-32',
    medium: 'w-48',
    large: 'w-64'
  };

  return (
    <div className={`${dimensions[size]} mx-auto`}>
      <img 
        src="/lovable-uploads/3416d038-01be-47dd-85da-562cb4346ba8.png" 
        alt="Nubinix Logo" 
        className="w-full h-auto"
      />
    </div>
  );
};

export default Logo;
