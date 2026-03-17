import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../features/auth/authService';
import { useAuth } from '../features/auth/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const [email, setEmail] = useState('seller@example.com');
  const [password, setPassword] = useState('password');
  const [message, setMessage] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await login({ email, password });
    if (!result.succeeded || !result.token || !result.role || !result.email) {
      setMessage(result.message || 'Login failed');
      return;
    }
    setAuth(result.token, result.email, result.role as 'Buyer' | 'Seller' | 'Admin');
    navigate(result.role === 'Seller' ? '/seller' : '/buyer');
  };

  return (
    <main className="page">
      <section className="card">
        <h1>Shop Login</h1>
        <form onSubmit={onSubmit} className="form">
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Password
            <input value={password} type="password" onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {message && <p className="message">{message}</p>}
          <button type="submit">Continue</button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
