// Template for reusable form component
// Replace ENTITY_NAME with actual entity name
// Replace entity_name with lowercase version

import React from 'react';

function ENTITY_NAMEInfoForm({ entityForm, onChange, disabled = false }) {
  const handleFieldChange = (field, value) => {
    onChange({
      ...entityForm,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày tạo *
          </label>
          <input
            type="date"
            value={entityForm.createDate}
            onChange={(e) => handleFieldChange('createDate', e.target.value)}
            disabled={disabled}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            required
          />
        </div>
        
        {/* Add more form fields here */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên *
          </label>
          <input
            type="text"
            value={entityForm.name || ''}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            disabled={disabled}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="Nhập tên..."
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả
        </label>
        <textarea
          value={entityForm.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          disabled={disabled}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          rows={3}
          placeholder="Nhập mô tả..."
        />
      </div>
    </div>
  );
}

export default ENTITY_NAMEInfoForm;
