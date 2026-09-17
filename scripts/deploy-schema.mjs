/**
 * Deploy schema to Supabase using the Management API.
 * Requires SUPABASE_ACCESS_TOKEN env var (personal access token from dashboard).
 * Falls back to reading the schema and outputting instructions.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = path.resolve(__dirname, '../supabase/schema.sql');

const PROJECT_REF = 'ymbhdcoswbxgdvityveb';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');

// Split SQL into individual statements (skip empty and comment-only lines)
const statements = schema
  .split(/;\s*\n/)
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'));

console.log(`Found ${statements.length} SQL statements to execute.\n`);

// Use Supabase's pg endpoint (available on paid plans) or fall back to REST-based approach
// We'll use a creative workaround: create a temporary function to run DDL

async function executeSQL(sql) {
  // Try the Supabase SQL API endpoint
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SQL execution failed (${response.status}): ${text}`);
  }
  return response.json();
}

async function bootstrapExecFunction() {
  // First we need to create the exec_sql function using a raw approach
  // This won't work via PostgREST... we need another way
  console.log('Attempting to create exec_sql helper function...');
}

// Alternative: Execute schema as a single block using Supabase's query endpoint
async function deployViaQueryEndpoint() {
  console.log('Deploying full schema via Supabase query endpoint...\n');

  const response = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: schema }),
  });

  if (response.ok) {
    console.log('✅ Schema deployed successfully!');
    return true;
  }

  // If that doesn't work, try individual statements
  const text = await response.text();
  console.log(`Query endpoint returned ${response.status}: ${text}`);
  return false;
}

async function main() {
  // Try the direct query endpoint first
  const success = await deployViaQueryEndpoint();
  if (success) return;

  // If that fails, output instructions for manual deployment
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  MANUAL DEPLOYMENT REQUIRED');
  console.log('═══════════════════════════════════════════════════\n');
  console.log('The direct SQL endpoint is not available.');
  console.log('Please run the schema manually:\n');
  console.log('1. Go to: https://supabase.com/dashboard/project/ymbhdcoswbxgdvityveb/sql/new');
  console.log('2. Paste the contents of supabase/schema.sql');
  console.log('3. Click "Run"\n');
  console.log('Or use the Supabase CLI:');
  console.log('  npx supabase link --project-ref ymbhdcoswbxgdvityveb');
  console.log('  npx supabase db push\n');
}

main().catch(console.error);
