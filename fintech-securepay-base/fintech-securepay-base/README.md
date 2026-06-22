# 💳 Plataforma de Pagos Distribuidos - SecurePay

## 📌 Bitácora de Evaluación y Arquitectura de Software

Este repositorio contiene la refactorización, securización e instrumentación de la plataforma de pagos distribuidos **SecurePay** según los lineamientos técnicos corporativos del departamento.

---

## 🛠️ Fase 1: Git Branching & Refactorización SOLID (SRP & DIP)

El código monolítico heredado (`transaction.monolith.service.js`) mezclaba responsabilidades financieras, persistencia de estados, validaciones y envío de notificaciones. 

Para resolver este acoplamiento y cumplir estrictamente con los principios de diseño:
1. **Segregación de Responsabilidades (SRP)**:
   - [`account.repository.js`](file:///c:/Users/jnman/Downloads/Securepay-Distribuidas/fintech-securepay-base/fintech-securepay-base/src/services/account.repository.js): Única responsabilidad de leer/actualizar la fuente de datos (en memoria).
   - [`balance.validator.service.js`](file:///c:/Users/jnman/Downloads/Securepay-Distribuidas/fintech-securepay-base/fintech-securepay-base/src/services/balance.validator.service.js): Valida reglas financieras (existencia de cuenta, montos > 0, saldo suficiente).
   - [`ledger.service.js`](file:///c:/Users/jnman/Downloads/Securepay-Distribuidas/fintech-securepay-base/fintech-securepay-base/src/services/ledger.service.js): Ejecuta la deducción y acreditación matemática de saldos y estructura el objeto de transacción.
   - [`transaction.repository.js`](file:///c:/Users/jnman/Downloads/Securepay-Distribuidas/fintech-securepay-base/fintech-securepay-base/src/services/transaction.repository.js): Se encarga de la persistencia histórica de transacciones en memoria.
   - [`notification.service.js`](file:///c:/Users/jnman/Downloads/Securepay-Distribuidas/fintech-securepay-base/fintech-securepay-base/src/services/notification.service.js): Emisión limpia de correos simulados por consola.
   - [`transaction.service.js`](file:///c:/Users/jnman/Downloads/Securepay-Distribuidas/fintech-securepay-base/fintech-securepay-base/src/services/transaction.service.js): Orquestador principal de alto nivel.

2. **Inversión de Dependencias (DIP)**:
   - Las dependencias de bajo nivel se inyectan dinámicamente mediante el constructor de sus dependientes de alto nivel.
   - El constructor de [`transfer.controller.js`](file:///c:/Users/jnman/Downloads/Securepay-Distribuidas/fintech-securepay-base/fintech-securepay-base/src/controllers/transfer.controller.js) actúa como el ensamblador/inyector que compone el árbol completo de dependencias para el orquestador principal.

---

## 🔒 Fase 2: Seguridad & Autenticación Asimétrica Stateless (JWT RS256)

1. **Generación de Almacenes Criptográficos**:
   - Mediante el script `./keypair.sh` se generaron de forma local las llaves criptográficas:
     - `private.pem` (Llave Privada - Formato PKCS#8 - *Excluida en `.gitignore`*).
     - `public.pem` (Llave Pública - Formato PKCS#8 - *Excluida en `.gitignore`*).

2. **Firmado y Verificación Asimétrica**:
   - [`jwt.service.js`](file:///c:/Users/jnman/Downloads/Securepay-Distribuidas/fintech-securepay-base/fintech-securepay-base/src/services/jwt.service.js):
     - `signToken`: Lee la llave privada y genera el token firmado con claims `sub`, `name` y expiración `exp` fijada en **2 minutos**.
     - `verifyToken`: Verifica autónomamente la autenticidad usando únicamente la llave pública, permitiendo verificación distribuida stateless.
   - [`auth.middleware.js`](file:///c:/Users/jnman/Downloads/Securepay-Distribuidas/fintech-securepay-base/fintech-securepay-base/src/middlewares/auth.middleware.js):
     - Intercepta cabeceras HTTP `Authorization: Bearer <token>`.
     - Valida la firma del token y propaga la identidad en `req.user = decodedToken`.

---

## 📈 Fase 3: Observabilidad & Error Tracking Real-Time (Sentry)

1. **Inicialización Temprana**:
   - [`instrument.js`](file:///c:/Users/jnman/Downloads/Securepay-Distribuidas/fintech-securepay-base/fintech-securepay-base/src/instrument.js): Módulo cargado en la **línea 1** de [`index.js`](file:///c:/Users/jnman/Downloads/Securepay-Distribuidas/fintech-securepay-base/fintech-securepay-base/index.js) para garantizar que todo el entorno se encuentre monitoreado.

2. **Gestión Separada de Excepciones**:
   - **Excepción Lógica (No Alertar a Sentry)**: Si el JWT expira (`TokenExpiredError` -> HTTP 403) o es inválido (`JsonWebTokenError` -> HTTP 401), se intercepta en el middleware de autenticación y se responde un código de error controlado. Esto **NO** se propaga mediante `next(err)` para evitar alertas de crash innecesarias en el dashboard.
   - **Error Operacional (Alertar a Sentry)**: En el endpoint `POST /v1/transfer-beta/execute`, se simula un fallo de conexión a la base de datos de saldos lanzando un error 500. Antes del lanzamiento, se llama a `Sentry.setUser({ id: req.user.sub })` para adjuntar el identificador del usuario afectado en los Tags personalizados del reporte.

---

## 📊 Bitácora de Evidencias (Postman & Sentry)

### 1. Evidencia de Postman: Generación de JWT RS256
> *Adjunte aquí su captura de Postman donde realiza la petición `POST /v1/auth/token` y se retorna el token exitosamente.*
> 
> **Captura:** `(Arrastra o inserta tu imagen aquí)`

### 2. Evidencia de Postman: Acceso Autorizado (Token Válido)
> *Adjunte aquí su captura de Postman de `GET /v1/account-alpha/balance` con el token Bearer válido, mostrando respuesta HTTP 200.*
> 
> **Captura:** `(Arrastra o inserta tu imagen aquí)`

### 3. Evidencia de Postman: Acceso Rechazado (Token Expirado / Inválido)
> *Adjunte aquí su captura de Postman mostrando la respuesta controlada HTTP 401 o 403 al enviar un token expirado (mayor a 2 minutos) o malformado.*
> 
> **Captura:** `(Arrastra o inserta tu imagen aquí)`

### 4. Evidencia de Panel de Sentry: Error Operacional 500
> *Adjunte aquí la captura de pantalla de su dashboard de Sentry mostrando el issue de crash "Conexión interrumpida con el Clúster de Datos SecurePay" (HTTP 500), evidenciando que se capturó el Tag de Usuario (`user.id` o `id`) proveniente del JWT.*
> 
> **Captura:** `(Arrastra o inserta tu imagen aquí)`

---

## 🚀 Guía de Instalación y Ejecución

1. Clona el repositorio e instala las dependencias:
   ```bash
   git clone <enlace_del_repositorio>
   cd fintech-securepay-base
   npm install
   ```

2. Genera las llaves criptográficas:
   ```bash
   bash keypair.sh
   ```

3. Configura el archivo de variables de entorno:
   - Copia `.env.example` como `.env`
   - Configura tu DSN en la variable `SENTRY_DSN`

4. Levanta el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

5. Colección de Endpoints para Pruebas:
   - **Generar Token**: `POST http://localhost:3000/v1/auth/token`
     - Body JSON: `{"id": "usr_001", "email": "estudiante.alpha@espe.edu.ec"}`
   - **Consultar Balance (Microservicio Alpha)**: `GET http://localhost:3000/v1/account-alpha/balance?accountId=ACC-12345`
     - Header: `Authorization: Bearer <token>`
   - **Ejecutar Transferencia (Microservicio Beta - Simulación Error 500)**: `POST http://localhost:3000/v1/transfer-beta/execute`
     - Header: `Authorization: Bearer <token>`
     - Body JSON: `{"fromAccountId": "ACC-12345", "toAccountId": "ACC-67890", "amount": 100}`
