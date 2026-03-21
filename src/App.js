import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/Sidebar';
import NotificationBanner from './components/NotificationBanner';
import ProductList from './pages/ProductList';
import { ImportOrderList, CreateImport, ImportOrderDetail } from './pages/imports';
import { ImportOrderResaleList, ImportOrderResaleDetail, CreateImportOrderResale } from './pages/import-order-resales';
import { OrderList, OrderDetail, CreateOrder } from './pages/orders';
import { OrderResaleList, OrderResaleDetail, CreateOrderResale } from './pages/order-resales';
import { EmployeeList, EmployeeDetail, CreateEmployee } from './pages/employees';
import CustomerList from './pages/CustomerList';
import CustomerDetail from './pages/CustomerDetail';
import CreateWarranty from './pages/CreateWarranty';
import PrintWarranty from './pages/PrintWarranty';
import { ReportsLayout, RevenueReport, DueSoonReport } from './pages/reports';
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
            <Route path="/imports" element={<ImportOrderList />} />
            <Route path="/imports/create" element={<CreateImport />} />
            <Route path="/imports/:id" element={<ImportOrderDetail />} />
            <Route path="/import-order-resales" element={<ImportOrderResaleList />} />
            <Route path="/import-order-resales/create" element={<CreateImportOrderResale />} />
            <Route path="/import-order-resales/:id" element={<ImportOrderResaleDetail />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/orders/create" element={<CreateOrder />} />
            <Route path="/order-resales" element={<OrderResaleList />} />
            <Route path="/order-resales/create" element={<CreateOrderResale />} />
            <Route path="/order-resales/:id" element={<OrderResaleDetail />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employees/create" element={<CreateEmployee />} />
            <Route path="/employees/:id" element={<EmployeeDetail />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/warranty/create" element={<CreateWarranty />} />
            <Route path="/warranty/print" element={<PrintWarranty />} />
            <Route path="/reports" element={<ReportsLayout />}>
              <Route index element={<Navigate to="/reports/revenue" replace />} />
              <Route path="revenue" element={<RevenueReport />} />
              <Route path="due-soon" element={<DueSoonReport />} />
            </Route>
            <Route path="/settings" element={<PagePlaceholder title="Settings" />} />
          </Routes>
        </div>
      </main>
      <NotificationBanner />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
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
