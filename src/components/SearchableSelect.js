import React, { useEffect, useRef, useState } from 'react';

function SearchableSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Chọn một mục',
  searchPlaceholder = 'Tìm kiếm...',
  emptyText = 'Không có dữ liệu',
  disabled = false,
  optional = false,
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

  const selectedOption = normalizedOptions.find((option) => option.value === value) || null;

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

  const handleSelect = (nextValue) => {
    onChange(nextValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (event) => {
    event.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {optional && <span className="text-gray-400 font-normal">(Tùy chọn)</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className="w-full px-3 py-2 pr-14 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </button>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400">
          {value && !disabled && (
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
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-3 py-2 text-left hover:bg-blue-50 ${
                    option.value === value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">{emptyText}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchableSelect;
