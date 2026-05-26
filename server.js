const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
 
const app = express();
app.use(cors());
app.use(express.json());
 
const SF_URL = process.env.SF_URL || 'https://os1777496989777.lightning.force.com';
const SF_LOGIN_URL = process.env.SF_LOGIN_URL || 'https://login.salesforce.com';
const SF_USERNAME = process.env.SF_USERNAME || '';
const SF_PASSWORD = process.env.SF_PASSWORD || '';
 
let cachedToken = null;
let tokenExpiry = null;
 
// Auto-login con username/password
async function getSFToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  if (!SF_USERNAME || !SF_PASSWORD) return null;
 
  const params = new URLSearchParams({
    grant_type: 'password',
    client_id: '3MVG9pRzvMkjMb6lCMOCDnvFTBF0kNFm6RKqJfmFQRPVV3wDH2snnHPBNGfpMKRYkJ3yqe_j5kqm3NJlkQlA5',
    client_secret: '9208881602286020',
    username: SF_USERNAME,
    password: SF_PASSWORD
  });
 
  try {
    const r = await fetch(`${SF_LOGIN_URL}/services/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const d = await r.json();
    if (d.access_token) {
      cachedToken = d.access_token;
      tokenExpiry = Date.now() + (2 * 60 * 60 * 1000); // 2 horas
      console.log('SF token obtenido via username/password');
      return cachedToken;
    }
    console.error('SF login error:', d);
    return null;
  } catch(e) {
    console.error('SF login failed:', e.message);
    return null;
  }
}
 
// Health check
app.get('/', async (req, res) => {
  const hasCredentials = !!(SF_USERNAME && SF_PASSWORD);
  res.json({ status: 'MyBox Proxy OK', credentials: hasCredentials });
});
 
// GET SF Report
app.get('/report/:id', async (req, res) => {
  let token = req.headers['sf-token'] || await getSFToken();
  if (!token) return res.status(401).json({ error: 'Sin token SF' });
  try {
    const r = await fetch(
      `${SF_URL}/services/data/v64.0/analytics/reports/${req.params.id}?includeDetails=true`,
      { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json(d);
    const cols = d.reportMetadata?.detailColumns || [];
    const rows = d.factMap?.['T!T']?.rows || [];
    const contacts = rows.map(row => {
      const obj = {};
      cols.forEach((col, i) => {
        obj[col] = row.dataCells?.[i]?.value ?? row.dataCells?.[i]?.label ?? '';
      });
      return obj;
    });
    res.json({ total: contacts.length, columns: cols, contacts });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
 
// PATCH SF Contact
app.patch('/contact/:id', async (req, res) => {
  let token = req.headers['sf-token'] || await getSFToken();
  if (!tokenconst express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
 
const app = express();
app.use(cors());
app.use(express.json());
 
const SF_URL = process.env.SF_URL || 'https://os1777496989777.lightning.force.com';
const SF_LOGIN_URL = process.env.SF_LOGIN_URL || 'https://login.salesforce.com';
const SF_USERNAME = process.env.SF_USERNAME || '';
const SF_PASSWORD = process.env.SF_PASSWORD || '';
 
let cachedToken = null;
let tokenExpiry = null;
 
// Auto-login con username/password
async function getSFToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  if (!SF_USERNAME || !SF_PASSWORD) return null;
 
  const params = new URLSearchParams({
    grant_type: 'password',
    client_id: '3MVG9pRzvMkjMb6lCMOCDnvFTBF0kNFm6RKqJfmFQRPVV3wDH2snnHPBNGfpMKRYkJ3yqe_j5kqm3NJlkQlA5',
    client_secret: '9208881602286020',
    username: SF_USERNAME,
    password: SF_PASSWORD
  });
 
  try {
    const r = await fetch(`${SF_LOGIN_URL}/services/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const d = await r.json();
    if (d.access_token) {
      cachedToken = d.access_token;
      tokenExpiry = Date.now() + (2 * 60 * 60 * 1000); // 2 horas
      console.log('SF token obtenido via username/password');
      return cachedToken;
    }
    console.error('SF login error:', d);
    return null;
  } catch(e) {
    console.error('SF login failed:', e.message);
    return null;
  }
}
 
// Health check
app.get('/', async (req, res) => {
  const hasCredentials = !!(SF_USERNAME && SF_PASSWORD);
  res.json({ status: 'MyBox Proxy OK', credentials: hasCredentials });
});
 
// GET SF Report
app.get('/report/:id', async (req, res) => {
  let token = req.headers['sf-token'] || await getSFToken();
  if (!token) return res.status(401).json({ error: 'Sin token SF' });
  try {
    const r = await fetch(
      `${SF_URL}/services/data/v64.0/analytics/reports/${req.params.id}?includeDetails=true`,
      { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json(d);
    const cols = d.reportMetadata?.detailColumns || [];
    const rows = d.factMap?.['T!T']?.rows || [];
    const contacts = rows.map(row => {
      const obj = {};
      cols.forEach((col, i) => {
        obj[col] = row.dataCells?.[i]?.value ?? row.dataCells?.[i]?.label ?? '';
      });
      return obj;
    });
    res.json({ total: contacts.length, columns: cols, contacts });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
 
// PATCH SF Contact
app.patch('/contact/:id', async (req, res) => {
  let token = req.headers['sf-token'] || await getSFToken();
  if (!token) return res.status(401).json({ error: 'Sin token SF' });
  try {
    const r = await fetch(`${SF_URL}/services/data/v64.0/sobjects/Contact/${req.params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(req.body)
    });
    if (r.status === 204) return res.json({ success: true });
    const d = await r.json();
    res.status(r.status).json(d);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
 
// POST SF Opportunity
app.post('/opportunity', async (req, res) => {
  let token = req.headers['sf-token'] || await getSFToken();
  if (!token) return res.status(401).json({ error: 'Sin token SF' });
  try {
    const r = await fetch(`${SF_URL}/services/data/v64.0/sobjects/Opportunity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(req.body)
    });
    const d = await r.json();
    res.status(r.status).json(d);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MyBox Proxy en puerto ${PORT}`));) return res.status(401).json({ error: 'Sin token SF' });
  try {
    const r = await fetch(`${SF_URL}/services/data/v64.0/sobjects/Contact/${req.params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(req.body)
    });
    if (r.status === 204) return res.json({ success: true });
    const d = await r.json();
    res.status(r.status).json(d);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
 
// POST SF Opportunity
app.post('/opportunity', async (req, res) => {
  let token = req.headers['sf-token'] || await getSFToken();
  if (!token) return res.status(401).json({ error: 'Sin token SF' });
  try {
    const r = await fetch(`${SF_URL}/services/data/v64.0/sobjects/Opportunity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(req.body)
    });
    const d = await r.json();
    res.status(r.status).json(d);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MyBox Proxy en puerto ${PORT}`));
