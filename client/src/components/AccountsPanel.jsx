import { accStyle, balance, fmt } from '../utils.js';

export default function AccountsPanel({ accounts, tx, filter, setFilter, onAdd, onSetBalance }) {
  return (
    <>
      <h2>Accounts</h2>
      <div className="accs">
        {accounts.map((a) => {
          const [icon, color] = accStyle(a.name);
          return (
            <button
              key={a.id}
              className={'acc' + (filter === a.id ? ' on' : '')}
              onClick={() => setFilter(filter === a.id ? null : a.id)}
            >
              <em className="ic" style={{ '--c': color }}>{icon}</em>
              <span>{a.name}</span>
              <b>{fmt(balance(a, tx))}</b>
            </button>
          );
        })}
        <button className="acc add" onClick={onAdd}>+ New account</button>
      </div>

      <div className="panel" style={{ marginTop: 10 }}>
        <div className="hint">Wallet ya kisi account mein abhi jitne paise hain woh yahan set karein.</div>
        {accounts.map((a) => (
          <div className="row" key={a.id}>
            <div>
              {a.name}
              <small>Abhi: PKR {fmt(balance(a, tx))}</small>
            </div>
            <button className="edit" onClick={() => onSetBalance(a)}>Set balance</button>
          </div>
        ))}
      </div>
    </>
  );
}
