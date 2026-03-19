import { FormEvent, useEffect, useState } from 'react';
import { createSeller, getAdminUsers, updateUserStatus, UserSummary } from '../features/auth/authService';
import { useAuth } from '../features/auth/AuthContext';

function AdminHomePage() {
  const { user } = useAuth();
  const token = user?.token ?? '';
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sellerForm, setSellerForm] = useState({
    email: '',
    password: '',
    fullName: '',
    storeName: ''
  });

  const loadUsers = async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    try {
      const data = await getAdminUsers(token);
      setUsers(data);
    } catch (error) {
      setMessage((error as Error).message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [token]);

  const onCreateSeller = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await createSeller(sellerForm, token);
      setSellerForm({
        email: '',
        password: '',
        fullName: '',
        storeName: ''
      });
      setMessage('Seller account created.');
      await loadUsers();
    } catch (error) {
      setMessage((error as Error).message || 'Failed to create seller.');
    }
  };

  const onToggleUser = async (target: UserSummary) => {
    try {
      await updateUserStatus(target.id, !target.isActive, token);
      setMessage(`Updated ${target.email}.`);
      await loadUsers();
    } catch (error) {
      setMessage((error as Error).message || 'Failed to update user status.');
    }
  };

  return (
    <main className="mx-auto max-w-6xl">
      <section className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Super Admin</h1>
        <p className="mt-2 text-sm text-slate-500">Public registration only creates buyers. Seller accounts are created here.</p>

        <form onSubmit={onCreateSeller} className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
          <h2 className="text-xl font-semibold text-slate-900">Create seller</h2>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Store name
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              value={sellerForm.storeName}
              onChange={(event) => setSellerForm((current) => ({ ...current, storeName: event.target.value }))}
              placeholder="Northwind Studio"
              required
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Full name
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              value={sellerForm.fullName}
              onChange={(event) => setSellerForm((current) => ({ ...current, fullName: event.target.value }))}
              placeholder="Seller owner"
              required
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Email
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              value={sellerForm.email}
              onChange={(event) => setSellerForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="seller@example.com"
              required
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Password
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              value={sellerForm.password}
              type="password"
              onChange={(event) => setSellerForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="At least 6 characters"
              required
            />
          </label>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Create seller account
          </button>
        </form>

        {message ? <p className="mt-4 text-sm font-medium text-emerald-700">{message}</p> : null}

        <section className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Users</h2>
            <button
              type="button"
              onClick={() => void loadUsers()}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Refresh
            </button>
          </div>
          {loading ? <p className="mt-4 text-sm text-slate-500">Loading users...</p> : null}
          {!loading ? (
            <div className="mt-4 grid gap-3">
              {users.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center"
                >
                  <div>
                    <strong className="text-base font-semibold text-slate-900">{item.fullName}</strong>
                    <p className="mt-1 text-sm text-slate-600">{item.email}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.role}
                      {item.storeName ? ` | ${item.storeName}` : ''}
                      {item.isActive ? ' | Active' : ' | Disabled'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void onToggleUser(item)}
                    disabled={item.role === 'Admin'}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {item.isActive ? 'Disable' : 'Enable'}
                  </button>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}

export default AdminHomePage;
