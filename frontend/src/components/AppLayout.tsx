import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';

export function AppLayout() {
  return (
    <div className="app-shell">
      <TopBar />
      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
}
