import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '../..');

config({ path: path.join(serverRoot, '.env') });

if (process.env.DATABASE_URL) {
  process.env.TEST_DATABASE_URL ??= deriveTestDatabaseUrl(process.env.DATABASE_URL);
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

function deriveTestDatabaseUrl(databaseUrl: string) {
  const parsedUrl = new URL(databaseUrl);
  const dbName = parsedUrl.pathname.replace(/^\//, '');
  parsedUrl.pathname = `/${dbName}_test`;
  return parsedUrl.toString();
}
