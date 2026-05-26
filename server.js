const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const SF_URL = process.env.SF_URL || 'https://os1777496989777.lightning.force.com';
const SF_LOGIN_URL = process.env.SF_LOGIN_URL || 'https://login.salesforce.com';
const SF_USERNAME = process.env.SF_USERNAME || '';
const SF_PASSWORD = process.env.SF_PASSWORD || '';

let cachedToken = null;
let tokenExpiry = null;

async function getSFToken(headerToken) {
  if (headerToken) return headerToken;
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) return cachedToken;
  if (!SF_USERNAME || !SF_PASSWORD) return null;

  const params = `grant_type=password&client_id=3MVG9pRzvMkjMb6lCMOCDnvFTBF0kNFm6RKqJfmFQRPVV3wDH2snnHPBNGfpMKRYkJ3yqe_j5kqm3NJlkQlA5&client_secret=9208881602286020&username=${encodeURIComponent(SF_USERNAME)}&password=${encodeURIComponent(SF_PASSWORD)}`;

  try {
    const https = require('https');
    const loginUrl = new URL(`${SF_LOGIN_URL}/services/oauth2/token`);
    const result = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: loginUrl.hostname,
        path: loginUrl.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(params) }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      });
      req.on('error', reject);
      req.write(params);
      req.end();
    });
    if (result.access_token) {
      cachedToken = result.access_token;
      tokenExpiry = Date.now() + (2 * 60 * 60 * 1000);
      console.log('SF token OK');
      return cachedToken;
    }
    console.error('Login error:', JSON.stringify(result));
    return null;
  } catch(e) {
    console.error('Login failed:', e.message);
    return null;
  }
}

async function sfRequest(method, path, body, headerToken) {
  const token = await getSFToken(headerToken);
  if (!token) throw new Error('Sin token SF');
  const https = require('https');
  const url = new URL(`${SF_URL}${path}`);
  const bodyStr = body ? JSON.stringify(body) : null;
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    };
    if (bodyStr) opts.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} }));
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

app.get('/', (req, res) => res.json({ status: 'MyBox Proxy OK', credentials: !!(SF_USERNAME && SF_PASSWORD) }));

app.get('/report/:id', async (req, res) => {
  try {
    const r = await sfRequest('GET', `/services/data/v64.0/analytics/reports/${req.params.id}?includeDetails=true`, null, req.headers['sf-token']);
    const cols = r.body.reportMetadata?.detailColumns || [];
    const rows = r.body.factMap?.['T!T']?.rows || [];
    const contacts = rows.map(row => {
      const obj = {};
      cols.forEach((col, i) => { obj[col] = row.dataCells?.[i]?.value ?? row.dataCells?.[i]?.label ?? ''; });
      return obj;
    });
    res.json({ total: contacts.length, columns: cols, contacts });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.patch('/contact/:id', async (req, res) => {
  try {
    const r = await sfRequest('PATCH', `/services/data/v64.0/sobjects/Contact/${req.params.id}`, req.body, req.headers['sf-token']);
    if (r.status === 204) return res.json({ success: true });
    res.status(r.status).json(r.body);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/opportunity', async (req, res) => {
  try {
    const r = await sfRequest('POST', `/services/data/v64.0/sobjects/Opportunity`, req.body, req.headers['sf-token']);
    res.status(r.status).json(r.body);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MyBox Proxy OK en puerto ${PORT}`));
