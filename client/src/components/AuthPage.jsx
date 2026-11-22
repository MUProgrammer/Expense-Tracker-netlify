import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const reg = mode === 'register';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (reg) {
      if (!name.trim()) return setError('Enter your name');
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email');
      if (password.length < 6) return setError('Password must be at least 6 characters');
    }
    setBusy(true);
    try {
      if (reg) await register(name.trim(), email.trim(), password);
      else await login(email.trim(), password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const switchMode = () => {
    setMode(reg ? 'login' : 'register');
    setError('');
  };

  return (
    <main className="auth">
      <h1 className="brand">Kharcha</h1>
      <p className="hint">
        {reg
          ? 'Apna account banayein. Aap ka data sirf aap ko nazar aayega.'
          : 'Apne account mein login karein.'}
      </p>
      <form className="panel" onSubmit={submit}>
        {reg && (
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Ali Khan" />
          </label>
        )}
        <label style={reg ? { marginTop: 10 } : undefined}>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ali@example.com" />
        </label>
        <label style={{ marginTop: 10 }}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            autoComplete={reg ? 'new-password' : 'current-password'}
          />
        </label>
        {error && <div className="error">{error}</div>}
        <button className="go" style={{ marginTop: 14 }} disabled={busy}>
          {busy ? 'Please wait…' : reg ? 'Create account' : 'Log in'}
        </button>
      </form>
      <p className="hint" style={{ textAlign: 'center', marginTop: 14 }}>
        {reg ? 'Pehle se account hai?' : 'Naya account chahiye?'}{' '}
        <button type="button" className="link" onClick={switchMode}>
          {reg ? 'Log in' : 'Sign up'}
        </button>
      </p>
    </main>
  );
}
