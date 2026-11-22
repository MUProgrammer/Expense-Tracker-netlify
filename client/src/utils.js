export const CATS_OUT = ['Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Education', 'Rent', 'Other'];
export const CATS_IN = ['Salary', 'Gift', 'Business', 'Other'];

export const CI = {
  Food: ['🍔', '#f59e0b'], Transport: ['🚌', '#3b82f6'], Bills: ['💡', '#eab308'],
  Shopping: ['🛍️', '#ec4899'], Health: ['💊', '#ef4444'], Education: ['📚', '#8b5cf6'],
  Rent: ['🏠', '#14b8a6'], Other: ['📦', '#94a3b8'], Salary: ['💼', '#22c55e'],
  Gift: ['🎁', '#f472b6'], Business: ['🏪', '#06b6d4'], Transfer: ['🔁', '#64748b'],
};
export const catStyle = (c) => CI[c] || CI.Other;

export function accStyle(n) {
  n = n.toLowerCase();
  if (/wallet|cash/.test(n)) return ['👛', '#f59e0b'];
  if (/bank|hbl|ubl|meezan|alfalah/.test(n)) return ['🏦', '#3b82f6'];
  if (/jazz|easy|nayapay|sadapay|mobile/.test(n)) return ['📱', '#ec4899'];
  return ['💳', '#8b5cf6'];
}

export const STAT_COLORS = {
  'Spent today': '#f59e0b',
  'Spent this week': '#ef4444',
  'Spent this month': '#8b5cf6',
  'Earned this month': '#22c55e',
};

export const THEMES = {
  teal: ['#0f766e', '#3fb8a8'],
  blue: ['#2b5be0', '#7da2ff'],
  purple: ['#7c3aed', '#b394ff'],
  orange: ['#d9600b', '#ffa05c'],
  pink: ['#d6336c', '#ff8fb3'],
};

export function applyTheme(name) {
  const dark = window.matchMedia('(prefers-color-scheme:dark)').matches;
  const t = THEMES[name] || THEMES.teal;
  const s = document.documentElement.style;
  s.setProperty('--acc', t[dark ? 1 : 0]);
  s.setProperty('--accink', dark ? '#10131a' : '#fff');
}

export const fmt = (n) => Math.round(n).toLocaleString('en-PK');
export const ds = (d) =>
  d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
export const today = () => ds(new Date());

export function balance(account, tx) {
  let b = account.start;
  for (const t of tx) {
    if (t.type === 'income' && t.acc === account.id) b += t.amt;
    if (t.type === 'expense' && t.acc === account.id) b -= t.amt;
    if (t.type === 'transfer') {
      if (t.acc === account.id) b -= t.amt;
      if (t.to === account.id) b += t.amt;
    }
  }
  return b;
}

export const sortTx = (list) =>
  [...list].sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''));
