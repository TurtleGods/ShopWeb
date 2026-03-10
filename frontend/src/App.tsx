import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import BuyerHomePage from './pages/BuyerHomePage';
import SellerHomePage from './pages/SellerHomePage';
import NotFoundPage from './pages/NotFoundPage';
import { useAuth } from './features/auth/AuthContext';
import { ProtectedRoute } from './shared/ProtectedRoute';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? (user.role === 'Seller' ? '/seller' : '/buyer') : '/login'} replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/buyer"
        element={
          <ProtectedRoute allowedRoles={['Buyer', 'Admin']}>
            <BuyerHomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller"
        element={
          <ProtectedRoute allowedRoles={['Seller', 'Admin']}>
            <SellerHomePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;

