import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <TopBar />
      <main className="px-4 py-8 md:px-6 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}
