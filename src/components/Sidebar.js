import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaBoxOpen, 
  FaBars,
  FaShoppingCart, 
  FaUsers, 
  FaChartBar, 
  FaCog, 
  FaPlus, 
  FaSignOutAlt,
  FaChevronRight,
  FaTimes,
  FaWarehouse,
  FaUserTie,
  FaExchangeAlt
} from 'react-icons/fa';

const menuItems = [
  { path: '/products', label: 'Sản phẩm', icon: FaBoxOpen },
  { path: '/imports', label: 'Nhập kho', icon: FaWarehouse },
  { path: '/import-order-resales', label: 'Bán lại Ancarat', icon: FaExchangeAlt },
  { path: '/orders', label: 'Đơn hàng', icon: FaShoppingCart },
  { path: '/order-resales', label: 'Khách bán lại', icon: FaExchangeAlt },
  { path: '/customers', label: 'Khách hàng', icon: FaUsers },
  { path: '/employees', label: 'Nhân viên', icon: FaUserTie },
  { 
    key: 'reports',
    label: 'Báo cáo', 
    icon: FaChartBar,
    submenu: [
      { path: '/reports/revenue', label: 'Báo cáo doanh thu' },
      { path: '/reports/due-soon', label: 'Sắp tới hạn' }
    ]
  },
  { path: '/settings', label: 'Cài đặt', icon: FaCog },
];

function Sidebar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Toggle expand/collapse for menu items with submenu
  const toggleSubmenu = (key) => {
    setExpandedMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Check if current path is within a submenu
  const isSubmenuActive = useCallback((submenu) => {
    return submenu.some(item => location.pathname.startsWith(item.path));
  }, [location.pathname]);

  useEffect(() => {
    const nextExpandedMenus = {};
    menuItems.forEach((item) => {
      if (item.submenu && isSubmenuActive(item.submenu)) {
        nextExpandedMenus[item.key] = true;
      }
    });

    setExpandedMenus((prev) => ({ ...prev, ...nextExpandedMenus }));
    setIsMobileOpen(false);
  }, [location.pathname, isSubmenuActive]);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm md:hidden">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700"
          aria-label="Mở menu"
          aria-expanded={isMobileOpen}
          aria-controls="mobile-sidebar"
        >
          <FaBars className="text-lg" />
        </button>
        <h2 className="text-lg font-bold text-gray-800">MyApp</h2>
        <div className="w-10" />
      </div>

      {isMobileOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          className="fixed inset-0 z-30 bg-gray-900/40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside id="mobile-sidebar" className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col bg-white shadow-lg transition-transform duration-300 md:static md:translate-x-0 md:flex-shrink-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between border-b border-gray-200 p-6 md:justify-start">
          <div>
            <h2 className="text-xl font-bold text-gray-800">MyApp</h2>
            {user && (
              <div className="mt-2">
                <span className="break-all text-sm text-gray-600">{user.email}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 md:hidden"
            aria-label="Đóng menu"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path || item.key}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.key)}
                      className={`flex w-full items-center rounded-lg p-3 transition-colors duration-200 ${
                        isSubmenuActive(item.submenu) 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="mr-3 text-xl" />
                      <span className="flex-1 text-left font-medium">{item.label}</span>
                      <FaChevronRight className={`transform transition-transform duration-200 ${
                        expandedMenus[item.key] ? 'rotate-90' : ''
                      }`} />
                    </button>
                    
                    <div className={`mt-1 ml-8 overflow-hidden transition-all duration-200 ease-in-out ${
                      expandedMenus[item.key] ? 'max-h-40' : 'max-h-0'
                    }`}>
                      <ul className="space-y-1 py-2">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.path}>
                            <NavLink
                              to={subItem.path}
                              className={({ isActive }) =>
                                `flex items-center rounded-lg p-2 pl-4 text-sm transition-colors duration-200 ${
                                  isActive 
                                    ? 'border-l-4 border-blue-700 bg-blue-100 text-blue-800' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                              }
                            >
                              {subItem.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center rounded-lg p-3 transition-colors duration-200 ${
                        isActive 
                          ? 'border-r-4 border-blue-700 bg-blue-50 text-blue-700' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <item.icon className="mr-3 text-xl" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
          
          <div className="mt-6 space-y-3 border-t border-gray-200 pt-4">
            <NavLink
              to="/orders/create"
              className="flex w-full items-center rounded-lg bg-blue-600 p-3 text-white transition-colors duration-200 hover:bg-blue-700"
            >
              <FaPlus className="mr-3 text-xl" />
              <span className="font-medium">Tạo đơn hàng</span>
            </NavLink>
          </div>
        </nav>
        
        {user && (
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <button 
              onClick={handleLogout} 
              className="flex w-full items-center rounded-lg p-3 text-gray-600 transition-colors duration-200 hover:bg-red-50 hover:text-red-700"
            >
              <FaSignOutAlt className="mr-3 text-xl" />
              <span className="font-medium">Đăng xuất</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export default Sidebar;
