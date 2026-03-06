import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import ProductList from './pages/ProductList';
import Login from './pages/Login';
import './App.css';

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/orders" element={<PagePlaceholder title="Orders" />} />
          <Route path="/customers" element={<PagePlaceholder title="Customers" />} />
          <Route path="/settings" element={<PagePlaceholder title="Settings" />} />
        </Routes>
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
    <div style={{ padding: 32 }}>
      <h1>{title}</h1>
      <p style={{ color: '#888' }}>Trang này đang được phát triển...</p>
    </div>
  );
}

export default App;
