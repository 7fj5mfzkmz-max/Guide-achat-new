const http = require('node:http');
const resolver = require('./resolve');
const { resolve, resolveModel } = resolver;
const PORT = Number(process.env.PORT || 8787);
function json(res, status, body) { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': process.env.ALLOWED_ORIGIN || '*' }); res.end(JSON.stringify(body)); }
const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  if (req.method === 'GET' && req.url === '/api/health') return json(res, 200, { ok: true, service: 'guide-achat-resolver' });
  if (req.method !== 'POST' || req.url !== '/api/resolve') return json(res, 404, { error: 'Not found' });
  let body = '';
  try {
    for await (const chunk of req) {
      body += chunk;
      if (Buffer.byteLength(body, 'utf8') > 64 * 1024) return json(res, 413, { error: 'Requête trop volumineuse.' });
    }
    const data = JSON.parse(body || '{}');
    if (!data.url && !data.model) return json(res, 400, { error: 'URL ou modèle manquant.' });
    const result = data.model
      ? await resolveModel(data.model, { category: data.category || 'smartphones', timeout: 8000 })
      : await resolve(data.url, { category: data.category || 'smartphones' });
    return json(res, result.ok ? 200 : 502, result);
  } catch (error) { return json(res, 500, { error: 'Erreur interne.', detail: error.message }); }
});
server.listen(PORT, () => console.log(`Guide-Achat resolver: http://localhost:${PORT}`));
