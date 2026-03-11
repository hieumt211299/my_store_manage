import React, { useRef, useCallback, useEffect } from 'react';

function SearchInput({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = 'Tìm kiếm...',
  label,
  type = 'text',
  debounceMs = 500,
  className = '',
}) {
  const debounceTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (debounceMs > 0 && onSubmit) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        onSubmit(newValue.trim());
      }, debounceMs);
    }
  }, [onChange, onSubmit, debounceMs]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (onSubmit) onSubmit(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className={`flex items-center space-x-4 ${className}`}>
      <div className="flex-1 max-w-md">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="flex">
          <input
            type={type}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors"
          >
            Tìm
          </button>
        </div>
      </div>
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className={`text-gray-500 hover:text-gray-700 ${label ? 'mt-7' : ''}`}
        >
          ✕ Xóa
        </button>
      )}
    </form>
  );
}

export default SearchInput;
