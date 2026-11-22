import { fmt, sortTx } from '../utils.js';

export default function TxList({ tx, accounts, filter, onDelete, onViewAll }) {
  const nm = (id) => (accounts.find((a) => a.id === id) || {}).name || 'Deleted account';
  const list = sortTx(tx.filter((t) => !filter || t.acc === filter || t.to === filter)).slice(0, 40);

  return (
    <>
      <h2>{filter ? 'Transactions: ' + nm(filter) : 'Recent transactions'}</h2>
      <div className="panel">
        {list.length ? (
          list.map((t) => {
            const sign = t.type === 'expense' ? '-' : t.type === 'income' ? '+' : '';
            const cls = t.type === 'expense' ? 'out' : t.type === 'income' ? 'in' : '';
            const sub = t.type === 'transfer' ? nm(t.acc) + ' → ' + nm(t.to) : t.cat + ' · ' + nm(t.acc);
            return (
              <div className="row" key={t.id}>
                <div>
                  {t.note || (t.type === 'transfer' ? 'Transfer' : t.cat)}
                  <small>{sub} · {t.date}</small>
                  <button className="del" onClick={() => onDelete(t.id)}>Delete</button>
                </div>
                <div className={'amt ' + cls}>{sign}PKR {fmt(t.amt)}</div>
              </div>
            );
          })
        ) : (
          <div className="empty">Nothing here yet. Add your first transaction above.</div>
        )}
        {tx.length > 0 && (
          <div style={{ paddingTop: 12, textAlign: 'center' }}>
            <button className="link" onClick={onViewAll}>View full history</button>
          </div>
        )}
      </div>
    </>
  );
}
