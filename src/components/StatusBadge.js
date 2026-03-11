import React from 'react';

function StatusBadge({ color, children, className = '' }) {
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${color} ${className}`}>
      {children}
    </span>
  );
}

export default StatusBadge;
