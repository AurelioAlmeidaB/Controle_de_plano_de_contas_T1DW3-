// ./database/databaseconfig.js

const { Pool, types } = require('pg');

// Faz o campo do tipo DATE (oid 1082) voltar como texto 'AAAA-MM-DD',
// evitando que o fuso horário altere o dia da data.
types.setTypeParser(1082, (valor) => valor);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
