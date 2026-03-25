import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../features/auth/authService';
import { useAuth } from '../features/auth/AuthContext';

function RegisterPage() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [publicUserId, setPublicUserId] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await register({
      email,
      password,
      publicUserId
    });

    if (!result.succeeded || !result.token || !result.role || !result.email || !result.publicUserId) {
      setMessage(result.message || 'Register failed');
      return;
    }

    setAuth(result.token, result.email, result.role as 'Seller' | 'Admin', result.publicUserId);
    navigate(`/${result.publicUserId}`);
  };

  return (
    <main className="mx-auto max-w-md">
      <section className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">註冊</h1>
        <p className="mt-2 text-sm text-slate-500">Create your account and claim your public page.</p>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Email
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Example@example.com"
              required
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            密碼
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              value={password}
              type="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            ID
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              value={publicUserId}
              onChange={(event) => setPublicUserId(event.target.value.toLowerCase())}
              placeholder="ID"
              required
            />
          </label>
          <p className="text-xs text-slate-500">Your public page will be available at /{publicUserId || 'your-id'}.</p>
          {message && <p className="text-sm font-medium text-red-600">{message}</p>}
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            確認
          </button>
        </form>
      </section>
    </main>
  );
}

export default RegisterPage;
