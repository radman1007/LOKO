const fs = require('fs');
const path = require('path');
const { createPool, getPool, closePool } = require('./connection');
const logger = require('../utils/logger');

function splitSqlStatements(sql) {
  const statements = [];
  let current = '';

  let inSingle = false;
  let inDouble = false;
  let inBacktick = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i += 1) {
    const ch = sql[i];
    const next = sql[i + 1];
    const prev = sql[i - 1];

    // Line comments: -- comment, # comment
    if (inLineComment) {
      if (ch === '\n') {
        inLineComment = false;
        current += ch;
      }
      continue;
    }

    // Block comments: /* ... */
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }

    // Detect comment starts only when not inside quotes
    if (!inSingle && !inDouble && !inBacktick) {
      if (ch === '-' && next === '-' && /\s/.test(sql[i + 2] || ' ')) {
        inLineComment = true;
        i += 1;
        continue;
      }
      if (ch === '#') {
        inLineComment = true;
        continue;
      }
      if (ch === '/' && next === '*') {
        inBlockComment = true;
        i += 1;
        continue;
      }
    }

    // Quote toggles
    if (ch === "'" && !inDouble && !inBacktick && prev !== '\\') {
      inSingle = !inSingle;
      current += ch;
      continue;
    }
    if (ch === '"' && !inSingle && !inBacktick && prev !== '\\') {
      inDouble = !inDouble;
      current += ch;
      continue;
    }
    if (ch === '`' && !inSingle && !inDouble) {
      inBacktick = !inBacktick;
      current += ch;
      continue;
    }

    // Statement separator
    if (ch === ';' && !inSingle && !inDouble && !inBacktick) {
      const trimmed = current.trim();
      if (trimmed) statements.push(trimmed);
      current = '';
      continue;
    }

    current += ch;
  }

  const trimmed = current.trim();
  if (trimmed) statements.push(trimmed);

  return statements;
}

function getMigrationVersion(file) {
  const match = file.match(/^(\d+)_/);
  if (!match) {
    throw new Error(`Invalid migration filename: ${file}. Expected format like 001_name.sql`);
  }
  return match[1];
}

async function ensureSchemaMigrationsTable(conn) {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
      version     VARCHAR(50) NOT NULL,
      name        VARCHAR(200) NOT NULL,
      applied_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_migration_version (version)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function runMigrations() {
  await createPool();
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    await ensureSchemaMigrationsTable(conn);

    const [appliedRows] = await conn.execute(
      'SELECT version FROM schema_migrations ORDER BY id'
    );
    const appliedVersions = new Set(appliedRows.map((row) => String(row.version)));

    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      throw new Error(`Migrations directory not found: ${migrationsDir}`);
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const version = getMigrationVersion(file);

      if (appliedVersions.has(version)) {
        logger.info(`Migration ${file} already applied, skipping`);
        continue;
      }

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      const statements = splitSqlStatements(sql);

      if (statements.length === 0) {
        logger.warn(`Migration ${file} is empty, skipping`);
        continue;
      }

      try {
        for (const statement of statements) {
          await conn.query(statement);
        }

        await conn.execute(
          'INSERT INTO schema_migrations (version, name) VALUES (?, ?)',
          [version, file]
        );

        appliedVersions.add(version);
        logger.info(`Migration ${file} applied successfully`);
      } catch (err) {
        logger.error(`Migration ${file} failed`, { error: err.message });
        throw err;
      }
    }

    logger.info('All migrations completed');
  } finally {
    conn.release();
    await closePool();
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runMigrations };