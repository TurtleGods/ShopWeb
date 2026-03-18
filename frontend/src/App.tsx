import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainPage from './pages/MainPage';
import AdminHomePage from './pages/AdminHomePage';
import BuyerHomePage from './pages/BuyerHomePage';
import SellerHomePage from './pages/SellerHomePage';
import NotFoundPage from './pages/NotFoundPage';
import { AppLayout } from './components/AppLayout';
import { useAuth } from './features/auth/AuthContext';
import { getHomePath } from './features/auth/roleUtils';
import { ProtectedRoute } from './shared/ProtectedRoute';

function App() {
  const { user } = useAuth();
  const homePath = getHomePath(user?.role);

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={user ? <Navigate to={homePath} replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to={homePath} replace /> : <RegisterPage />} />
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
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminHomePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
