import { STAT_COLORS, catStyle, ds, fmt, today } from '../utils.js';

function Card({ label, value, sub, green }) {
  return (
    <div className="stat" style={{ borderTop: '4px solid ' + (STAT_COLORS[label] || 'var(--line)') }}>
      <span>{label}</span>
      <b style={green ? { color: 'var(--in)' } : undefined}>PKR {fmt(value)}</b>
      <small>{sub}</small>
    </div>
  );
}

// week ki shuruaat (Monday) aur is mahine ka key
function periods() {
  const now = new Date();
  const wd = (now.getDay() + 6) % 7;
  return {
    now,
    td: today(),
    m: today().slice(0, 7),
    ws: ds(new Date(now.getFullYear(), now.getMonth(), now.getDate() - wd)),
    pm: ds(new Date(now.getFullYear(), now.getMonth() - 1, 1)).slice(0, 7),
  };
}

export function SummaryCards({ tx }) {
  const { td, m, ws, pm } = periods();
  let sp = 0, inc = 0, tdy = 0, wk = 0, lm = 0;
  tx.forEach((t) => {
    if (t.type === 'income' && t.date.slice(0, 7) === m) inc += t.amt;
    if (t.type !== 'expense') return;
    if (t.date.slice(0, 7) === m) sp += t.amt;
    if (t.date.slice(0, 7) === pm) lm += t.amt;
    if (t.date === td) tdy += t.amt;
    if (t.date >= ws && t.date <= td) wk += t.amt;
  });
  const dif = lm ? Math.round(((sp - lm) / lm) * 100) : null;
  const monthSub =
    dif === null ? 'no data for last month' : (dif >= 0 ? dif + '% more' : -dif + '% less') + ' than last month';

  return (
    <div className="stats">
      <Card label="Spent today" value={tdy} sub="so far today" />
      <Card label="Spent this week" value={wk} sub="since Monday" />
      <Card label="Spent this month" value={sp} sub={monthSub} />
      <Card label="Earned this month" value={inc} sub="income" green />
    </div>
  );
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Last7Days({ tx }) {
  const { now, td } = periods();
  const days = [];
  let max = 1;
  for (let k = 6; k >= 0; k--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - k);
    const key = ds(d);
    const v = tx.reduce((s, t) => (t.type === 'expense' && t.date === key ? s + t.amt : s), 0);
    days.push({ key, v, name: DAY_NAMES[d.getDay()] });
    if (v > max) max = v;
  }
  return (
    <div className="panel">
      <div className="days">
        {days.map((d) => (
          <div key={d.key} className={'day' + (d.key === td ? ' today' : '')}>
            <em>{d.v ? fmt(d.v) : ''}</em>
            <i style={{ height: (d.v / max) * 80 + '%' }} />
            {d.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategoryBars({ tx, per, setPer }) {
  const { td, m, ws } = periods();
  const cm = {};
  tx.forEach((t) => {
    if (t.type !== 'expense') return;
    const ok =
      per === 'all' ||
      (per === 'month' && t.date.slice(0, 7) === m) ||
      (per === 'week' && t.date >= ws && t.date <= td);
    if (ok) cm[t.cat] = (cm[t.cat] || 0) + t.amt;
  });
  const keys = Object.keys(cm).sort((a, b) => cm[b] - cm[a]);
  const max = keys.length ? cm[keys[0]] : 1;

  return (
    <div className="panel">
      <div className="seg small">
        {[['week', 'This week'], ['month', 'This month'], ['all', 'All time']].map(([k, l]) => (
          <button key={k} className={per === k ? 'on' : ''} onClick={() => setPer(k)}>
            {l}
          </button>
        ))}
      </div>
      {keys.length ? (
        keys.map((k) => (
          <div className="bar" key={k}>
            <span>{k}</span>
            <i style={{ width: Math.max(3, (cm[k] / max) * 100) + '%', background: catStyle(k)[1] }} />
            <b>{fmt(cm[k])}</b>
          </div>
        ))
      ) : (
        <div className="empty">No expenses in this period yet.</div>
      )}
    </div>
  );
}
