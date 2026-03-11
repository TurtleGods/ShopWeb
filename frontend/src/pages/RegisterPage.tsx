import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginRequest, register } from '../features/auth/authService';
import { useAuth } from '../features/auth/AuthContext';

function RegisterPage() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const [email, setEmail] = useState('buyer@example.com');
  const [password, setPassword] = useState('password');
  const [fullName, setFullName] = useState('New User');
  const [storeName, setStoreName] = useState('');
  const [role, setRole] = useState<LoginRequest['role']>('Buyer');
  const [message, setMessage] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await register({
      email,
      password,
      fullName,
      role,
      storeName: role === 'Seller' ? storeName : undefined
    });

    if (!result.succeeded || !result.token || !result.role || !result.email) {
      setMessage(result.message || 'Register failed');
      return;
    }

    setAuth(result.token, result.email, result.role as 'Buyer' | 'Seller' | 'Admin');
    navigate(result.role === 'Seller' ? '/seller' : '/buyer');
  };

  return (
    <main className="page">
      <section className="card">
        <h1>Register</h1>
        <form onSubmit={onSubmit} className="form">
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Password
            <input
              value={password}
              type="password"
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <label>
            Full name
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
          </label>
          <label>
            Register as
            <select value={role} onChange={(event) => setRole(event.target.value as LoginRequest['role'])}>
              <option value="Buyer">Buyer</option>
              <option value="Seller">Seller</option>
            </select>
          </label>
          {role === 'Seller' ? (
            <label>
              Store name
              <input value={storeName} onChange={(event) => setStoreName(event.target.value)} required />
            </label>
          ) : null}
          {message && <p className="message">{message}</p>}
          <button type="submit">Continue</button>
        </form>
      </section>
    </main>
  );
}

export default RegisterPage;
