import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { THEMES, balance, fmt, sortTx } from '../utils.js';
import { CategoryBars, Last7Days, SummaryCards } from './Stats.jsx';
import AccountsPanel from './AccountsPanel.jsx';
import TxForm from './TxForm.jsx';
import TxList from './TxList.jsx';
import History from './History.jsx';
import Settings from './Settings.jsx';

export default function Dashboard() {
  const { user, logout, setTheme } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [tx, setTx] = useState([]);
  const [filter, setFilter] = useState(null);
  const [per, setPer] = useState('month');
  const [view, setView] = useState('home');
  const [status, setStatus] = useState('Loading…');

  useEffect(() => {
    Promise.all([api.get('/accounts'), api.get('/transactions')])
      .then(([a, t]) => {
        setAccounts(a);
        setTx(t);
        setStatus('Saved to your account ✓');
      })
      .catch((e) => setStatus(e.message));
  }, []);

  const go = (v) => {
    setView(v);
    window.scrollTo(0, 0);
  };

  const total = accounts.reduce((s, a) => s + balance(a, tx), 0);

  const run = async (fn) => {
    setStatus('Saving…');
    try {
      const r = await fn();
      setStatus('Saved to your account ✓');
      return r;
    } catch (e) {
      setStatus('Save failed: ' + e.message);
      alert(e.message);
      return null;
    }
  };

  const saveTx = async (body) => {
    const t = await run(() => api.post('/transactions', body));
    if (!t) return false;
    setTx((list) => sortTx([...list, t]));
    return true;
  };

  const deleteTx = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    const r = await run(() => api.del('/transactions/' + id));
    if (r) setTx((list) => list.filter((t) => t.id !== id));
  };

  const addAccount = async () => {
    const name = prompt('Account name (e.g. HBL, Easypaisa, Savings)');
    if (!name) return;
    const start = parseFloat(prompt('Current balance in PKR', '0')) || 0;
    const a = await run(() => api.post('/accounts', { name: name.trim(), start }));
    if (a) setAccounts((list) => [...list, a]);
  };

  const renameAccount = async (acc) => {
    const name = prompt('Naya naam', acc.name);
    if (!name || !name.trim() || name.trim() === acc.name) return;
    const a = await run(() => api.patch('/accounts/' + acc.id, { name: name.trim() }));
    if (a) setAccounts((list) => list.map((x) => (x.id === a.id ? a : x)));
  };

  const setBalance = async (acc) => {
    const cur = balance(acc, tx);
    const v = prompt('Abhi "' + acc.name + '" mein kitne paise hain? (PKR)', Math.round(cur));
    if (v === null) return;
    const n = parseFloat(v);
    if (isNaN(n)) return;
    // opening balance ko itna adjust karo ke current balance n ho jaye
    const a = await run(() => api.patch('/accounts/' + acc.id, { start: acc.start + (n - cur) }));
    if (a) setAccounts((list) => list.map((x) => (x.id === a.id ? a : x)));
  };

  return (
    <main>
      <div className="topbar">
        <span>Hi, {user.name}</span>
        <button className="edit" onClick={logout}>Log out</button>
      </div>

      <div className="seg">
        {[['home', 'Home'], ['history', 'History'], ['settings', 'Settings']].map(([k, l]) => (
          <button key={k} className={view === k ? 'on' : ''} onClick={() => go(k)}>{l}</button>
        ))}
      </div>

      {view === 'home' && (
        <>
          <h1>Total across all accounts</h1>
          <div className="total"><small>PKR</small>{fmt(total)}</div>

          <SummaryCards tx={tx} />

          <div className="themes">
            <span className="hint" style={{ padding: '0 4px 0 0', alignSelf: 'center' }}>Color scheme</span>
            {Object.keys(THEMES).map((k) => (
              <button
                key={k}
                className={'sw' + (user.theme === k ? ' on' : '')}
                style={{ '--c': THEMES[k][0] }}
                aria-label={k + ' color scheme'}
                onClick={() => setTheme(k)}
              />
            ))}
          </div>
          <div className="hint" style={{ marginTop: 8 }}>{status}</div>

          <AccountsPanel
            accounts={accounts}
            tx={tx}
            filter={filter}
            setFilter={setFilter}
            onAdd={addAccount}
            onSetBalance={setBalance}
          />

          <TxForm accounts={accounts} onSave={saveTx} />

          <h2>Last 7 days</h2>
          <Last7Days tx={tx} />

          <h2>Spending by category</h2>
          <CategoryBars tx={tx} per={per} setPer={setPer} />

          <TxList tx={tx} accounts={accounts} filter={filter} onDelete={deleteTx} onViewAll={() => go('history')} />
        </>
      )}

      {view === 'history' && <History tx={tx} accounts={accounts} onDelete={deleteTx} />}
      {view === 'settings' && <Settings accounts={accounts} onRename={renameAccount} />}
    </main>
  );
}
