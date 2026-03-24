import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminHomePage from './pages/AdminHomePage';
import NotFoundPage from './pages/NotFoundPage';
import { AppLayout } from './components/AppLayout';
import { useAuth } from './features/auth/AuthContext';
import { ProtectedRoute } from './shared/ProtectedRoute';
import MainPage from './pages/MainPage';
import UserStorePage from './pages/UserStorePage';

function App() {
  const { user } = useAuth();
  const homePath = user ? (user.role === 'Admin' ? '/admin' : `/${user.publicUserId}`) : '/';

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={user ? <Navigate to={homePath} replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to={homePath} replace /> : <RegisterPage />} />
        <Route
          path="/seller"
          element={user && user.role !== 'Admin' ? <Navigate to={`/${user.publicUserId}`} replace /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminHomePage />
            </ProtectedRoute>
          }
        />
        <Route path="/:publicUserId" element={<UserStorePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
