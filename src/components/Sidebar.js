import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
  { path: '/products', label: 'Products', icon: '📦' },
  { path: '/orders', label: 'Orders', icon: '🛒' },
  { path: '/customers', label: 'Customers', icon: '👥' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

function Sidebar() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside className="w-64 bg-white shadow-lg h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">MyApp</h2>
        {user && (
          <div className="mt-2">
            <span className="text-sm text-gray-600">{user.email}</span>
          </div>
        )}
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
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
                <span className="text-xl mr-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        
        {/* Quick Action Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <NavLink
            to="/orders/create"
            className="flex items-center w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <span className="text-xl mr-3">➕</span>
            <span className="font-medium">Tạo đơn hàng</span>
          </NavLink>
        </div>
      </nav>
      
      {user && (
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout} 
            className="flex items-center w-full p-3 text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-200"
          >
            <span className="text-xl mr-3">🚪</span>
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
