import React from 'react';
import FloatingLabelInput from './FloatingLabelInput';

const BrandingSection = ({ yourCompany, handleInputChange, branding, setBranding }) => {
  const handleBrandingChange = (field, value) => {
    setBranding(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleInputChange({ target: { name: 'logo', value: event.target.result } });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-4">Your Company & Branding</h2>
      
      {/* Company Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <FloatingLabelInput
          id="yourCompanyName"
          label="Company Name"
          value={yourCompany.name}
          onChange={handleInputChange}
          name="name"
        />
        <FloatingLabelInput
          id="yourCompanyPhone"
          label="Phone"
          value={yourCompany.phone}
          onChange={handleInputChange}
          name="phone"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <FloatingLabelInput
          id="yourCompanyEmail"
          label="Email"
          value={yourCompany.email}
          onChange={handleInputChange}
          name="email"
        />
        <FloatingLabelInput
          id="yourCompanyWebsite"
          label="Website"
          value={yourCompany.website}
          onChange={handleInputChange}
          name="website"
        />
      </div>
      
      <FloatingLabelInput
        id="yourCompanyAddress"
        label="Address"
        value={yourCompany.address}
        onChange={handleInputChange}
        name="address"
        className="mb-4"
      />

      {/* Logo Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Company Logo</label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {yourCompany.logo && (
            <div className="flex items-center gap-2">
              <img 
                src={yourCompany.logo} 
                alt="Company Logo" 
                className="w-12 h-12 object-contain border rounded"
              />
              <button
                type="button"
                onClick={() => handleInputChange({ target: { name: 'logo', value: '' } })}
                className="text-red-500 text-sm hover:text-red-700"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Branding Options */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-3">Brand Colors & Style</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={branding.primaryColor}
                onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                className="w-12 h-8 rounded border"
              />
              <input
                type="text"
                value={branding.primaryColor}
                onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                className="flex-1 p-2 border rounded text-sm"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Secondary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={branding.secondaryColor}
                onChange={(e) => handleBrandingChange('secondaryColor', e.target.value)}
                className="w-12 h-8 rounded border"
              />
              <input
                type="text"
                value={branding.secondaryColor}
                onChange={(e) => handleBrandingChange('secondaryColor', e.target.value)}
                className="flex-1 p-2 border rounded text-sm"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Accent Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={branding.accentColor}
                onChange={(e) => handleBrandingChange('accentColor', e.target.value)}
                className="w-12 h-8 rounded border"
              />
              <input
                type="text"
                value={branding.accentColor}
                onChange={(e) => handleBrandingChange('accentColor', e.target.value)}
                className="flex-1 p-2 border rounded text-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Font Family</label>
            <select
              value={branding.fontFamily}
              onChange={(e) => handleBrandingChange('fontFamily', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="Inter">Inter (Modern)</option>
              <option value="Arial">Arial (Classic)</option>
              <option value="Helvetica">Helvetica (Clean)</option>
              <option value="Times New Roman">Times New Roman (Traditional)</option>
              <option value="Georgia">Georgia (Elegant)</option>
              <option value="Roboto">Roboto (Technical)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Logo Position</label>
            <select
              value={branding.logoPosition}
              onChange={(e) => handleBrandingChange('logoPosition', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>

        <div className="mt-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={branding.showLogo}
              onChange={(e) => handleBrandingChange('showLogo', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show logo on invoices</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default BrandingSection; 