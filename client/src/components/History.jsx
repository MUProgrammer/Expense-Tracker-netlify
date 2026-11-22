import { useState } from 'react';
import { CATS_IN, CATS_OUT, catStyle, fmt, sortTx } from '../utils.js';

const ALL_CATS = [...new Set([...CATS_OUT, ...CATS_IN])];
const PAGE = 50;

export default function History({ tx, accounts, onDelete }) {
  const [f, setF] = useState({ q: '', type: '', acc: '', cat: '', from: '', to: '' });
  const [limit, setLimit] = useState(PAGE);
  const set = (k) => (e) => {
    setF({ ...f, [k]: e.target.value });
    setLimit(PAGE);
  };
  const nm = (id) => (accounts.find((a) => a.id === id) || {}).name || 'Deleted account';
  const dirty = Object.values(f).some(Boolean);

  const q = f.q.trim().toLowerCase();
  const list = sortTx(tx).filter((t) => {
    if (f.type && t.type !== f.type) return false;
    if (f.acc && t.acc !== f.acc && t.to !== f.acc) return false;
    if (f.cat && t.cat !== f.cat) return false;
    if (f.from && t.date < f.from) return false;
    if (f.to && t.date > f.to) return false;
    if (q && !(t.note + ' ' + t.cat + ' ' + nm(t.acc)).toLowerCase().includes(q)) return false;
    return true;
  });

  let spent = 0, earned = 0;
  list.forEach((t) => {
    if (t.type === 'expense') spent += t.amt;
    if (t.type === 'income') earned += t.amt;
  });

  const shown = list.slice(0, limit);
  let lastDate = '';

  return (
    <>
      <h2>Transaction history</h2>
      <div className="panel">
        <div className="grid">
          <label className="full">
            Search
            <input type="text" placeholder="note, category ya account" value={f.q} onChange={set('q')} />
          </label>
          <label>
            Type
            <select value={f.type} onChange={set('type')}>
              <option value="">All</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="transfer">Transfer</option>
            </select>
          </label>
          <label>
            Account
            <select value={f.acc} onChange={set('acc')}>
              <option value="">All</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
          <label>
            Category
            <select value={f.cat} onChange={set('cat')}>
              <option value="">All</option>
              {ALL_CATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <span />
          <label>
            From
            <input type="date" value={f.from} onChange={set('from')} />
          </label>
          <label>
            To
            <input type="date" value={f.to} onChange={set('to')} />
          </label>
        </div>
        {dirty && (
          <div style={{ paddingTop: 10 }}>
            <button className="link" onClick={() => { setF({ q: '', type: '', acc: '', cat: '', from: '', to: '' }); setLimit(PAGE); }}>
              Clear filters
            </button>
          </div>
        )}
      </div>

      <div className="stats">
        <div className="stat"><span>Transactions</span><b style={{ color: 'var(--ink)' }}>{list.length}</b><small>{dirty ? 'filter ke mutabiq' : 'total'}</small></div>
        <div className="stat"><span>Spent</span><b>PKR {fmt(spent)}</b><small>in list</small></div>
        <div className="stat"><span>Earned</span><b style={{ color: 'var(--in)' }}>PKR {fmt(earned)}</b><small>in list</small></div>
      </div>

      <div className="panel" style={{ marginTop: 10 }}>
        {shown.length ? shown.map((t) => {
          const sign = t.type === 'expense' ? '-' : t.type === 'income' ? '+' : '';
          const cls = t.type === 'expense' ? 'out' : t.type === 'income' ? 'in' : '';
          const sub = t.type === 'transfer' ? nm(t.acc) + ' → ' + nm(t.to) : t.cat + ' · ' + nm(t.acc);
          const [icon, color] = catStyle(t.type === 'transfer' ? 'Transfer' : t.cat);
          const head = t.date !== lastDate ? t.date : null;
          lastDate = t.date;
          return (
            <div key={t.id}>
              {head && <div className="hint" style={{ paddingTop: 10, fontWeight: 600 }}>{head}</div>}
              <div className="row">
                <div className="rowl">
                  <em className="ic" style={{ '--c': color }}>{icon}</em>
                  <div>
                    {t.note || (t.type === 'transfer' ? 'Transfer' : t.cat)}
                    <small>{sub}</small>
                    <button className="del" onClick={() => onDelete(t.id)}>Delete</button>
                  </div>
                </div>
                <div className={'amt ' + cls}>{sign}PKR {fmt(t.amt)}</div>
              </div>
            </div>
          );
        }) : (
          <div className="empty">{dirty ? 'Is filter mein koi transaction nahi mili.' : 'Abhi koi transaction nahi hai.'}</div>
        )}
        {list.length > limit && (
          <div style={{ paddingTop: 12, textAlign: 'center' }}>
            <button className="edit" onClick={() => setLimit(limit + PAGE)}>
              Show more ({list.length - limit} baqi)
            </button>
          </div>
        )}
      </div>
    </>
  );
}
