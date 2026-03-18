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
    <main className="page admin-page">
      <section className="card">
        <h1>Super Admin</h1>
        <p className="sub-title">Public registration only creates buyers. Seller accounts are created here.</p>

        <form onSubmit={onCreateSeller} className="form admin-form">
          <h2>Create seller</h2>
          <label>
            Store name
            <input
              value={sellerForm.storeName}
              onChange={(event) => setSellerForm((current) => ({ ...current, storeName: event.target.value }))}
              placeholder="Northwind Studio"
              required
            />
          </label>
          <label>
            Full name
            <input
              value={sellerForm.fullName}
              onChange={(event) => setSellerForm((current) => ({ ...current, fullName: event.target.value }))}
              placeholder="Seller owner"
              required
            />
          </label>
          <label>
            Email
            <input
              value={sellerForm.email}
              onChange={(event) => setSellerForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="seller@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              value={sellerForm.password}
              type="password"
              onChange={(event) => setSellerForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="At least 6 characters"
              required
            />
          </label>
          <button type="submit">Create seller account</button>
        </form>

        {message ? <p className="message">{message}</p> : null}

        <section className="admin-section">
          <div className="admin-section-header">
            <h2>Users</h2>
            <button type="button" onClick={() => void loadUsers()}>
              Refresh
            </button>
          </div>
          {loading ? <p>Loading users...</p> : null}
          {!loading ? (
            <div className="user-list">
              {users.map((item) => (
                <article key={item.id} className="user-card">
                  <div>
                    <strong>{item.fullName}</strong>
                    <p>{item.email}</p>
                    <p>
                      {item.role}
                      {item.storeName ? ` | ${item.storeName}` : ''}
                      {item.isActive ? ' | Active' : ' | Disabled'}
                    </p>
                  </div>
                  <button type="button" onClick={() => void onToggleUser(item)} disabled={item.role === 'Admin'}>
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
