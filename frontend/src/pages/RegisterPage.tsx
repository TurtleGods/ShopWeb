import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../features/auth/authService';
import { useAuth } from '../features/auth/AuthContext';

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
    navigate(result.role === 'Seller' ? '/seller' : '/buyer');
  };

  return (
    <main className="page">
      <section className="card">
        <h1>Register</h1>
        <form onSubmit={onSubmit} className="form">
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Example@example.com" required />
          </label>
          <label>
            Password
            <input
              value={password}
              type="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
            />
          </label>
          <label>
            Full name
            <input value={fullName}  onChange={(event) => setFullName(event.target.value)} placeholder="Full Name" required />
          </label>
          {message && <p className="message">{message}</p>}
          <button type="submit">Continue</button>
        </form>
      </section>
    </main>
  );
}

export default RegisterPage;
