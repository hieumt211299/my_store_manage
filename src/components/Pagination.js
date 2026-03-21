import React, { useCallback, useMemo } from 'react';

const Pagination = React.memo(function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemLabel = 'mục',
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevPage = useCallback(() => {
    onPageChange(currentPage - 1);
  }, [currentPage, onPageChange]);

  const handleNextPage = useCallback(() => {
    onPageChange(currentPage + 1);
  }, [currentPage, onPageChange]);

  const handlePageClick = useCallback((page) => {
    onPageChange(page);
  }, [onPageChange]);

  const pageButtons = useMemo(() => {
    const buttons = [];
    
    for (let i = 1; i <= totalPages; i++) {
      const page = i;
      const isCurrentPage = page === currentPage;
      const shouldShow = 
        page === 1 || 
        page === totalPages || 
        (page >= currentPage - 1 && page <= currentPage + 1);

      if (!shouldShow) {
        if (page === currentPage - 2 || page === currentPage + 2) {
          buttons.push(
            <span key={page} className="px-3 py-2 text-gray-500">
              ...
            </span>
          );
        }
        continue;
      }

      buttons.push(
        <button
          key={page}
          onClick={() => handlePageClick(page)}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            isCurrentPage
              ? 'bg-blue-600 text-white'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      );
    }
    
    return buttons;
  }, [currentPage, totalPages, handlePageClick]);

  // Conditional rendering after all hooks are called
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-between">
      <div className="text-sm text-gray-500">
        Trang {currentPage} / {totalPages} - 
        Hiển thị {startItem}-{endItem} trong tổng số {totalItems} {itemLabel}
      </div>
      
      <div className="flex space-x-1">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            currentPage === 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          ← Trước
        </button>

        {pageButtons}

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            currentPage === totalPages
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Tiếp →
        </button>
      </div>
    </div>
  );
});

export default Pagination;
