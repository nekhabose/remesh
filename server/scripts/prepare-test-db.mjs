import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '..');
const envPath = path.join(serverRoot, '.env');
const envValues = readEnvFile(envPath);

const baseDatabaseUrl = process.env.TEST_DATABASE_URL ?? envValues.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? envValues.DATABASE_URL;

if (!baseDatabaseUrl) {
  throw new Error('DATABASE_URL is required in server/.env before running backend tests.');
}

const testDatabaseUrl = process.env.TEST_DATABASE_URL ?? envValues.TEST_DATABASE_URL ?? deriveTestDatabaseUrl(baseDatabaseUrl);
const parsed = new URL(testDatabaseUrl);
const dbName = parsed.pathname.replace(/^\//, '');

if (!dbName) {
  throw new Error('Unable to derive a test database name from the database URL.');
}

ensureDatabaseExists(parsed, dbName);

execFileSync(
  path.resolve(serverRoot, '../node_modules/.bin/prisma'),
  ['migrate', 'deploy', '--schema', 'prisma/schema.prisma'],
  {
    cwd: serverRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: testDatabaseUrl
    }
  }
);

function ensureDatabaseExists(parsedUrl, dbName) {
  const adminDatabaseUrl = new URL(parsedUrl.toString());
  adminDatabaseUrl.pathname = '/postgres';

  const queryResult = runPsql(adminDatabaseUrl, [
    '-tc',
    `SELECT 1 FROM pg_database WHERE datname = '${dbName.replace(/'/g, "''")}';`
  ]);

  if (queryResult.trim() === '1') {
    return;
  }

  runPsql(adminDatabaseUrl, ['-c', `CREATE DATABASE "${dbName.replace(/"/g, '""')}"`]);
}

function runPsql(databaseUrl, extraArgs) {
  const args = [
    '-h',
    databaseUrl.hostname,
    '-p',
    databaseUrl.port || '5432',
    '-U',
    decodeURIComponent(databaseUrl.username),
    '-d',
    databaseUrl.pathname.replace(/^\//, ''),
    ...extraArgs
  ];

  return execFileSync('psql', args, {
    encoding: 'utf8',
    env: {
      ...process.env,
      PGPASSWORD: decodeURIComponent(databaseUrl.password)
    }
  });
}

function deriveTestDatabaseUrl(databaseUrl) {
  const parsedUrl = new URL(databaseUrl);
  const dbName = parsedUrl.pathname.replace(/^\//, '');
  parsedUrl.pathname = `/${dbName}_test`;
  return parsedUrl.toString();
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const contents = fs.readFileSync(filePath, 'utf8');
  const entries = {};

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const unquotedValue = rawValue.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
    entries[key] = unquotedValue;
  }

  return entries;
}
