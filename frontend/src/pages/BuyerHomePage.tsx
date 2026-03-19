import { useMemo } from 'react';
import { useAuth } from '../features/auth/AuthContext';

function BuyerHomePage() {
  const { user } = useAuth();

  const greeting = useMemo(() => {
    return `Welcome ${user?.email ?? 'Buyer'}`;
  }, [user?.email]);

  return (
    <main className="mx-auto max-w-4xl">
      <section className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Buyer Dashboard</h1>
        <p className="mt-3 text-base text-slate-700">{greeting}</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">This area is for buyer-side browsing and order history.</p>
      </section>
    </main>
  );
}

export default BuyerHomePage;
