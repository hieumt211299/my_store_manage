import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaBoxOpen, 
  FaShoppingCart, 
  FaUsers, 
  FaChartBar, 
  FaCog, 
  FaPlus, 
  FaShieldAlt, 
  FaSignOutAlt,
  FaChevronRight,
  FaWarehouse
} from 'react-icons/fa';

const menuItems = [
  { path: '/products', label: 'Sản phẩm', icon: FaBoxOpen },
  { path: '/imports', label: 'Nhập kho', icon: FaWarehouse },
  { path: '/orders', label: 'Đơn hàng', icon: FaShoppingCart },
  { path: '/customers', label: 'Khách hàng', icon: FaUsers },
  { 
    key: 'reports',
    label: 'Báo cáo', 
    icon: FaChartBar,
    submenu: [
      { path: '/reports/revenue', label: 'Báo cáo doanh thu' },
      { path: '/reports/products', label: 'Báo cáo sản phẩm' },
      {path: '/reports/imports', label: 'Báo cáo nhập hàng' }
    ]
  },
  { path: '/settings', label: 'Cài đặt', icon: FaCog },
];

function Sidebar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

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
  const isSubmenuActive = (submenu) => {
    return submenu.some(item => location.pathname.startsWith(item.path));
  };

  return (
    <aside className="w-64 bg-white shadow-lg h-screen flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-800">MyApp</h2>
        {user && (
          <div className="mt-2">
            <span className="text-sm text-gray-600">{user.email}</span>
          </div>
        )}
      </div>
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path || item.key}>
              {item.submenu ? (
                // Collapsible menu item with submenu
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.key)}
                    className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 ${
                      isSubmenuActive(item.submenu) 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="text-xl mr-3" />
                    <span className="font-medium flex-1 text-left">{item.label}</span>
                    <FaChevronRight className={`transform transition-transform duration-200 ${
                      expandedMenus[item.key] ? 'rotate-90' : ''
                    }`} />
                  </button>
                  
                  {/* Submenu items */}
                  <div className={`mt-1 ml-8 overflow-hidden transition-max-height duration-200 ease-in-out ${
                    expandedMenus[item.key] ? 'max-h-40' : 'max-h-0'
                  }`}>
                    <ul className="space-y-1 py-2">
                      {item.submenu.map((subItem) => (
                        <li key={subItem.path}>
                          <NavLink
                            to={subItem.path}
                            className={({ isActive }) =>
                              `flex items-center p-2 pl-4 rounded-lg transition-colors duration-200 text-sm ${
                                isActive 
                                  ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-700' 
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
                // Regular menu item
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center p-3 rounded-lg transition-colors duration-200 ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="text-xl mr-3" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
        
        {/* Quick Action Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
          <NavLink
            to="/orders/create"
            className="flex items-center w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <FaPlus className="text-xl mr-3" />
            <span className="font-medium">Tạo đơn hàng</span>
          </NavLink>
          
          <NavLink
            to="/warranty/create"
            className="flex items-center w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <FaShieldAlt className="text-xl mr-3" />
            <span className="font-medium">Tạo phiếu đảm bảo</span>
          </NavLink>
        </div>
      </nav>
      
      {user && (
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <button 
            onClick={handleLogout} 
            className="flex items-center w-full p-3 text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-200"
          >
            <FaSignOutAlt className="text-xl mr-3" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
