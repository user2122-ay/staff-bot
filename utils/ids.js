const crypto = require('crypto');

function generateCaseId(tipo) {
  const prefix = tipo === 'advertencia' ? 'ADV' : 'SAN';
  const random = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
  return `${prefix}-${random}`;
}

module.exports = { generateCaseId };
