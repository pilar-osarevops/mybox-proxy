# MyBox Proxy

Proxy para conectar el agente de prospección con Salesforce sin CORS.

## Deploy en Railway

1. Entrá a railway.app → New Project → Deploy from GitHub
   O: railway.app → New Project → Deploy from template → Node.js

2. Subí esta carpeta completa

3. Railway detecta automáticamente el package.json y corre npm start

4. Copiá la URL que te da Railway (ej: https://mybox-proxy.up.railway.app)

5. Pegala en el campo PROXY URL del agente HTML

## Variables de entorno (opcional)
SF_URL=https://os1777496989777.lightning.force.com
