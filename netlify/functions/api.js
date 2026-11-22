const serverless = require('serverless-http');
const app = require('../../server/app');

const run = serverless(app);

// Netlify ka function path (/.netlify/functions/api/...) hata kar /api/... bana dete hain
exports.handler = (event, context) => {
  let p = (event.path || '/').replace(/^\/\.netlify\/functions\/api/, '');
  if (!p.startsWith('/api')) p = '/api' + (p.startsWith('/') ? p : '/' + p);
  event.path = p;
  delete event.requestPath;
  return run(event, context);
};
