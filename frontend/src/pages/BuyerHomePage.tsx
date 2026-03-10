import { useMemo } from 'react';
import { useAuth } from '../features/auth/AuthContext';

function BuyerHomePage() {
  const { logout, user } = useAuth();

  const greeting = useMemo(() => {
    return `Welcome ${user?.email ?? 'Buyer'}`;
  }, [user?.email]);

  return (
    <main className="page">
      <section className="card">
        <h1>Buyer Dashboard</h1>
        <p>{greeting}</p>
        <p>This area is for buyer-side browsing and order history.</p>
        <div className="actions">
          <button onClick={logout}>Logout</button>
        </div>
      </section>
    </main>
  );
}

export default BuyerHomePage;

