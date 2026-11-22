import { useState } from 'react';
import { CATS_IN, CATS_OUT, today } from '../utils.js';

export default function TxForm({ accounts, onSave }) {
  const [type, setType] = useState('expense');
  const [amt, setAmt] = useState('');
  const [date, setDate] = useState(today());
  const [acc, setAcc] = useState('');
  const [to, setTo] = useState('');
  const [cat, setCat] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  // select ki value agar abhi valid nahi to pehli option use karo
  const ids = accounts.map((a) => a.id);
  const accVal = ids.includes(acc) ? acc : ids[0] || '';
  const toVal = ids.includes(to) ? to : ids.find((i) => i !== accVal) || ids[0] || '';
  const cats = type === 'expense' ? CATS_OUT : CATS_IN;
  const catVal = cats.includes(cat) ? cat : cats[0];

  const submit = async () => {
    const a = parseFloat(amt);
    if (!(a > 0)) return alert('Enter an amount greater than 0.');
    if (type === 'transfer' && accVal === toVal) return alert('Pick two different accounts.');
    setBusy(true);
    const ok = await onSave({
      type,
      amt: a,
      acc: accVal,
      to: type === 'transfer' ? toVal : null,
      cat: type === 'transfer' ? '' : catVal,
      note: note.trim(),
      date: date || today(),
    });
    setBusy(false);
    if (ok) {
      setAmt('');
      setNote('');
    }
  };

  return (
    <>
      <h2>Add transaction</h2>
      <div className="panel">
        <div className="seg">
          {['expense', 'income', 'transfer'].map((t) => (
            <button key={t} className={type === t ? 'on' : ''} onClick={() => setType(t)}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="grid">
          <label>
            Amount (PKR)
            <input type="number" inputMode="decimal" min="0" placeholder="0" value={amt} onChange={(e) => setAmt(e.target.value)} />
          </label>
          <label>
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>
            {type === 'transfer' ? 'From account' : 'Account'}
            <select value={accVal} onChange={(e) => setAcc(e.target.value)}>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
          {type === 'transfer' ? (
            <label>
              To account
              <select value={toVal} onChange={(e) => setTo(e.target.value)}>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </label>
          ) : (
            <label>
              Category
              <select value={catVal} onChange={(e) => setCat(e.target.value)}>
                {cats.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          )}
          <label className="full">
            Note (optional)
            <input type="text" placeholder="e.g. lunch, rickshaw" value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
        </div>
        <button className="go" onClick={submit} disabled={busy}>
          {busy ? 'Saving…' : 'Save transaction'}
        </button>
      </div>
    </>
  );
}
