import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../features/auth/authService';
import { useAuth } from '../features/auth/AuthContext';
import { getHomePath } from '../features/auth/roleUtils';

function LoginPage() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await login({ email, password });
    if (!result.succeeded || !result.token || !result.role || !result.email) {
      setMessage(result.message || 'Login failed');
      return;
    }
    setAuth(result.token, result.email, result.role as 'Buyer' | 'Seller' | 'Admin');
    navigate(getHomePath(result.role));
  };

  return (
    <main className="page">
      <section className="card">
        <h1>Shop Login</h1>
        <form onSubmit={onSubmit} className="form">
          <label>
            Email
            <input
              value={email}
              placeholder="Example@example.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input value={password} type="password" 
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {message && <p className="message">{message}</p>}
          <button type="submit">Continue</button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
