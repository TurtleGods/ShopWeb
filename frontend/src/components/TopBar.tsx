import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { getHomePath } from '../features/auth/roleUtils';

export function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
        <Link to="/" className="text-lg font-semibold tracking-tight text-slate-900 transition hover:text-blue-600">
          Shop Web
        </Link>

        {user ? (
          <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
              {user.email} | {user.role}
            </span>
            <Link
              to={getHomePath(user.role)}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              My Page
            </Link>
            <button
              onClick={logout}
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
            <Link
              to="/login"
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
