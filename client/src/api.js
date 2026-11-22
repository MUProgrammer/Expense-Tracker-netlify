const TOKEN_KEY = 'kharcha_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

async function request(method, url, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = 'Bearer ' + token;

  let res;
  try {
    res = await fetch('/api' + url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('Server se connect nahi ho paya. Kya backend chal raha hai?');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) window.dispatchEvent(new Event('kharcha:unauthorized'));
    throw new Error(data.message || 'Kuch masla aa gaya');
  }
  return data;
}

export const api = {
  get: (u) => request('GET', u),
  post: (u, b) => request('POST', u, b),
  patch: (u, b) => request('PATCH', u, b),
  del: (u, b) => request('DELETE', u, b),
};
