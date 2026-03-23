import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../features/auth/authService';
import { useAuth } from '../features/auth/AuthContext';
import { getHomePath } from '../features/auth/roleUtils';

function RegisterPage() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await register({
      email,
      password,
      fullName
    });

    if (!result.succeeded || !result.token || !result.role || !result.email) {
      setMessage(result.message || 'Register failed');
      return;
    }

    setAuth(result.token, result.email, result.role as 'Buyer' | 'Seller' | 'Admin');
    navigate(getHomePath(result.role));
  };

  return (
    <main className="mx-auto max-w-md">
      <section className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">註冊</h1>
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
            全名
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Full Name"
              required
            />
          </label>
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
