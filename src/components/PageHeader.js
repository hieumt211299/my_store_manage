import React from 'react';
import { Link } from 'react-router-dom';

function PageHeader({
  title,
  subtitle,
  backTo,
  backLabel = '← Quay lại',
  actions,
  badge,
}) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        {backTo && (
          <Link to={backTo} className="text-gray-500 hover:text-gray-700">
            {backLabel}
          </Link>
        )}
        <div>
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {badge && (
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center space-x-4">{actions}</div>}
    </div>
  );
}

export default PageHeader;
