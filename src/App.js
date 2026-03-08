import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import ProductList from './pages/ProductList';
import OrderList from './pages/OrderList';
import OrderDetail from './pages/OrderDetail';
import CreateOrder from './pages/CreateOrder';
import CustomerList from './pages/CustomerList';
import CreateWarranty from './pages/CreateWarranty';
import PrintWarranty from './pages/PrintWarranty';
import ReportsLayout from './pages/ReportsLayout';
import RevenueReport from './pages/RevenueReport';
import ProductSalesReport from './pages/ProductSalesReport';
import Login from './pages/Login';
import './App.css';

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/orders/create" element={<CreateOrder />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/warranty/create" element={<CreateWarranty />} />
            <Route path="/warranty/print" element={<PrintWarranty />} />
            <Route path="/reports" element={<ReportsLayout />}>
              <Route index element={<Navigate to="/reports/revenue" replace />} />
              <Route path="revenue" element={<RevenueReport />} />
              <Route path="products" element={<ProductSalesReport />} />
            </Route>
            <Route path="/settings" element={<PagePlaceholder title="Settings" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

function PagePlaceholder({ title }) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
      <p className="text-gray-500">Trang này đang được phát triển...</p>
    </div>
  );
}

export default App;
