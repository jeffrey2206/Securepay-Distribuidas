const jwt  = require('jsonwebtoken');
const fs   = require('fs');
const path = require('path');

/**
 * Genera un Token JWT firmado asimétricamente con el algoritmo RS256.
 *
 * Payload incluye:
 *   - sub  : ID único del usuario
 *   - name : Nombre / email del usuario
 *   - exp  : Tiempo de expiración configurado a 2 minutos desde la emisión
 *
 * La clave privada se lee en tiempo de ejecución desde el archivo private.pem
 * ubicado en la raíz del proyecto (nunca se expone en variables de entorno).
 *
 * @param {Object} user - Objeto con la información del usuario { id, email }.
 * @returns {string} JWT Token firmado con RS256.
 */
function signToken(user) {
  const privateKey = fs.readFileSync(
    path.join(__dirname, '../../private.pem'),
    'utf8'
  );

  const payload = {
    sub:  user.id,
    name: user.email
  };

  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: '2m'   // Expira en exactamente 2 minutos
  });
}

/**
 * Verifica y decodifica un Token JWT usando únicamente la clave pública (RS256).
 * Los microservicios simulados (Alpha y Beta) pueden validar tokens de forma autónoma
 * sin necesidad de contactar al emisor, ya que sólo requieren la clave pública.
 *
 * @param {string} token - Token JWT a verificar.
 * @returns {Object} Payload decodificado si la firma y la expiración son válidas.
 * @throws {jwt.TokenExpiredError} Si el token ha expirado.
 * @throws {jwt.JsonWebTokenError} Si el token está malformado o la firma es inválida.
 */
function verifyToken(token) {
  const publicKey = fs.readFileSync(
    path.join(__dirname, '../../public.pem'),
    'utf8'
  );

  return jwt.verify(token, publicKey, {
    algorithms: ['RS256']   // Forzar exclusivamente RS256; rechaza HS256 y otros
  });
}

module.exports = {
  signToken,
  verifyToken
};
