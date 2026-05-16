import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppSelector } from './store';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage/LoginPage';
import GoodsPage from './pages/GoodsPage/GoodsPage';
import OrdersPage from './pages/OrdersPage/OrdersPage';
import ReferencesPage from './pages/ReferencesPage/ReferencesPage';
import SuppliersPage from './pages/SuppliersPage/SuppliersPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAppSelector(st => st.auth.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/admin/goods" replace />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="goods"      element={<GoodsPage />} />
        <Route path="orders"     element={<OrdersPage />} />
        <Route path="references" element={<ReferencesPage />} />
        <Route path="suppliers"  element={<SuppliersPage />} />
        <Route index element={<Navigate to="goods" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin/goods" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}