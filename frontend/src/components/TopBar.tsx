import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { getHomePath } from '../features/auth/roleUtils';

export function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <Link to="/" className="brand">
        Shop Web
      </Link>

      {user ? (
        <div className="topbar-actions">
          <span className="topbar-user">
            {user.email} · {user.role}
          </span>
          <Link to={getHomePath(user.role)} className="link-button">
            My Page
          </Link>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div className="topbar-actions">
          <Link to="/login" className="link-button">
            登入
          </Link>
          <Link to="/register" className="link-button">
            註冊
          </Link>
        </div>
      )}
    </header>
  );
}
