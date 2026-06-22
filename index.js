// ⚠️ CRÍTICO: instrument.js DEBE ser la primera importación absoluta del backend.
// Sentry necesita cargarse antes que Express para instrumentar todas las peticiones.
const Sentry = require('./src/instrument');

require('dotenv').config();
const express = require('express');
const routes  = require('./src/routes');

const app  = express();
const PORT = process.env.PORT || 3000;

// Configuración básica para parsear JSON en las peticiones HTTP
app.use(express.json());

// Montar el enrutador principal en /v1
app.use('/v1', routes);

// Endpoint base informativo
app.get('/', (req, res) => {
  res.status(200).json({
    name:        'fintech-securepay-base',
    description: 'API base para evaluaciones de aplicaciones distribuidas (ESPE)',
    status:      'ONLINE'
  });
});

// ── Sentry Error Handler ──────────────────────────────────────────────────────
// DEBE instalarse después de las rutas y ANTES del error handler genérico.
// Captura automáticamente todos los errores propagados con next(err).
Sentry.setupExpressErrorHandler(app);

// ── Error Handler Genérico (500) ─────────────────────────────────────────────
// Responde al cliente con un mensaje de error estructurado.
// Los errores operacionales ya fueron enviados a Sentry por el handler anterior.
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]:', err.message);
  res.status(500).json({
    error:   'Error interno del servidor',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Servidor Fintech ejecutándose en: http://localhost:${PORT}`);
  console.log(`   - Auth Token:          POST http://localhost:${PORT}/v1/auth/token`);
  console.log(`   - Balance Alpha:       GET  http://localhost:${PORT}/v1/account-alpha/balance`);
  console.log(`   - Transferencia Beta:  POST http://localhost:${PORT}/v1/transfer-beta/execute`);
  console.log(`======================================================\n`);
});
