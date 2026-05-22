const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
 
const app = express();
app.use(cors());
app.use(express.json());
 
const SF_URL = process.env.SF_URL || 'https://os1777496989777.lightning.force.com';
 
// Health check
app.get('/', (req, res) => res.json({ status: 'MyBox Proxy OK' }));
 
// GET SF Report — lee los contactos del reporte en tiempo real
app.get('/report/:id', async (req, res) => {
  const token = req.headers['sf-token'];
  if (!token) return res.status(401).json({ error: 'Sin SF token' });
  try {
    const r = await fetch(
      `${SF_URL}/services/data/v64.0/analytics/reports/${req.params.id}?includeDetails=true`,
      { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json(d);
 
    // Parsear el reporte y devolver contactos limpios
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
  const token = req.headers['sf-token'];
  if (!token) return res.status(401).json({ error: 'Sin SF token' });
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
  const token = req.headers['sf-token'];
  if (!token) return res.status(401).json({ error: 'Sin SF token' });
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
app.listen(PORT, () => console.log(`MyBox Proxy corriendo en puerto ${PORT}`));
