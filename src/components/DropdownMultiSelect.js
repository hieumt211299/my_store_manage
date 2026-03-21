import React, { useEffect, useRef, useState } from 'react';

function DropdownMultiSelect({
  label,
  values = [],
  onChange,
  options = [],
  placeholder = 'Chọn các mục',
  searchPlaceholder = 'Tìm kiếm...',
  emptyText = 'Không có dữ liệu',
  disabled = false,
  className = '',
}) {
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const normalizedOptions = options.map((option) => ({
    ...option,
    searchableText: `${option.label} ${option.keywords || ''}`.toLowerCase(),
  }));

  const selectedOptions = normalizedOptions.filter((option) => values.includes(option.value));
  const filteredOptions = normalizedOptions.filter((option) =>
    option.searchableText.includes(searchTerm.trim().toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;

    setIsOpen((prev) => {
      const next = !prev;
      if (!next) setSearchTerm('');
      return next;
    });
  };

  const handleOptionToggle = (value) => {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value));
      return;
    }

    onChange([...values, value]);
  };

  const handleClear = (event) => {
    event.stopPropagation();
    onChange([]);
    setSearchTerm('');
  };

  const handleRemoveValue = (event, value) => {
    event.stopPropagation();
    onChange(values.filter((item) => item !== value));
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}

      <div className="relative">
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={handleToggle}
          onKeyDown={(event) => {
            if (disabled) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleToggle();
            }
          }}
          className={`w-full px-3 py-2 pr-14 border border-gray-300 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'
          }`}
        >
          {selectedOptions.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                >
                  <span>{option.label}</span>
                  <button
                    type="button"
                    onClick={(event) => handleRemoveValue(event, option.value)}
                    className="text-blue-500 hover:text-blue-700"
                    aria-label={`Xóa ${option.label}`}
                    disabled={disabled}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400">
          {values.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="hover:text-gray-600"
              aria-label="Xóa lựa chọn"
            >
              ✕
            </button>
          )}
          <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const checked = values.includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionToggle(option.value)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-blue-50 ${
                      checked ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    }`}
                  >
                    <span>{option.label}</span>
                    <span className={`text-sm ${checked ? 'text-blue-700' : 'text-gray-300'}`}>✓</span>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">{emptyText}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DropdownMultiSelect;
