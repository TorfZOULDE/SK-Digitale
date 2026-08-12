const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // ex: postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require
  ssl: { rejectUnauthorized: false },
});

/**
 * Convertit une requête écrite avec des '?' (style mysql2) en requête PostgreSQL ($1, $2...)
 * et exécute la requête. Retourne [rows] pour rester compatible avec ton code existant
 * qui fait: const [rows] = await db.execute(...)
 */
async function execute(sql, params = []) {
  let index = 0;
  const pgSql = sql.replace(/\?/g, () => `$${++index}`);

  const result = await pool.query(pgSql, params);

  // Compatibilité avec le code existant écrit pour mysql2 :
  // result.affectedRows fonctionnait sur un DELETE/UPDATE avec mysql2.
  // On l'attache ici sur le tableau rows pour ne pas avoir à changer ce code.
  result.rows.affectedRows = result.rowCount;

  return [result.rows, result.fields];
}

// Équivalent simple de db.getConnection() (mysql2) pour tester la connexion au démarrage
async function testConnection() {
  const client = await pool.connect();
  client.release();
  return true;
}

module.exports = { execute, pool, testConnection };