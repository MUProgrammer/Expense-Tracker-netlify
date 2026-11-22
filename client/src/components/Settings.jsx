import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

function Msg({ m }) {
  if (!m) return null;
  return m.err ? <div className="error">{m.text}</div> : <div className="hint" style={{ color: 'var(--in)', paddingTop: 10 }}>{m.text}</div>;
}

export default function Settings({ accounts, onRename }) {
  const { user, updateProfile, changePassword, deleteAccount } = useAuth();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [pm, setPm] = useState(null);

  const [cur, setCur] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [wm, setWm] = useState(null);

  const [dp, setDp] = useState('');
  const [dm, setDm] = useState(null);

  const saveProfile = async () => {
    setPm(null);
    if (!name.trim()) return setPm({ err: 1, text: 'Enter your name' });
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setPm({ err: 1, text: 'Enter a valid email' });
    try {
      await updateProfile(name.trim(), email.trim());
      setPm({ text: 'Profile update ho gaya ✓' });
    } catch (e) {
      setPm({ err: 1, text: e.message });
    }
  };

  const savePassword = async () => {
    setWm(null);
    if (pw.length < 6) return setWm({ err: 1, text: 'New password kam az kam 6 characters ka ho' });
    if (pw !== pw2) return setWm({ err: 1, text: 'Dono new passwords match nahi karte' });
    try {
      await changePassword(cur, pw);
      setCur(''); setPw(''); setPw2('');
      setWm({ text: 'Password badal gaya ✓' });
    } catch (e) {
      setWm({ err: 1, text: e.message });
    }
  };

  const remove = async () => {
    setDm(null);
    if (!dp) return setDm({ err: 1, text: 'Password likhein' });
    if (!confirm('Account aur saara data hamesha ke liye delete ho jayega. Pakka?')) return;
    try {
      await deleteAccount(dp);
    } catch (e) {
      setDm({ err: 1, text: e.message });
    }
  };

  return (
    <>
      <h2>Profile</h2>
      <div className="panel">
        <div className="grid">
          <label className="full">Name<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
          <label className="full">Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
        </div>
        <Msg m={pm} />
        <button className="go" onClick={saveProfile}>Save profile</button>
      </div>

      <h2>Change password</h2>
      <div className="panel">
        <div className="grid">
          <label className="full">Current password<input type="password" value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" /></label>
          <label>New password<input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" placeholder="At least 6 characters" /></label>
          <label>Confirm new password<input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" /></label>
        </div>
        <Msg m={wm} />
        <button className="go" onClick={savePassword}>Update password</button>
      </div>

      <h2>Account names</h2>
      <div className="panel">
        {accounts.map((a) => (
          <div className="row" key={a.id}>
            <div>{a.name}</div>
            <button className="edit" onClick={() => onRename(a)}>Rename</button>
          </div>
        ))}
      </div>

      <h2>Delete my account</h2>
      <div className="panel">
        <div className="hint">Aap ka profile, saare accounts aur saari transactions hamesha ke liye hat jayengi.</div>
        <label>Password<input type="password" value={dp} onChange={(e) => setDp(e.target.value)} autoComplete="current-password" /></label>
        <Msg m={dm} />
        <button className="go" style={{ background: 'var(--out)', color: '#fff' }} onClick={remove}>Delete account</button>
      </div>
    </>
  );
}
