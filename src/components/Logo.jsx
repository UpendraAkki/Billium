import React from 'react';

const Logo = ({ yourCompany, branding, className = "" }) => {
  if (!branding?.showLogo || !yourCompany?.logo) {
    return null;
  }

  const positionClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={`flex ${positionClasses[branding.logoPosition] || positionClasses.left} ${className}`}>
      <img 
        src={yourCompany.logo} 
        alt={yourCompany.name || "Company Logo"} 
        className="max-w-32 max-h-16 object-contain"
        style={{ 
          filter: `drop-shadow(0 2px 4px ${branding.primaryColor}20)` 
        }}
      />
    </div>
  );
};

export default Logo; 