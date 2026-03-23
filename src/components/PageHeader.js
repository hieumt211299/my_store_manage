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
    <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:space-x-4 sm:gap-0">
        {backTo && (
          <Link to={backTo} className="text-gray-500 hover:text-gray-700">
            {backLabel}
          </Link>
        )}
        <div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-4 sm:gap-0">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
            {badge && (
              <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex w-full flex-wrap items-center gap-3 md:w-auto md:justify-end">{actions}</div>}
    </div>
  );
}

export default PageHeader;
