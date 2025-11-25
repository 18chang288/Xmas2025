import { createClient } from '@supabase/supabase-js';
import { generatePairings } from './pairing.js';

// pairing_service.js
// Usage: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars, then:
//   node pairing_service.js
// This script fetches users from the `users` table, runs the pairing algorithm,
// and writes pairings into the `pairings` table inside a transaction.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function run() {
  // 1) fetch users
  const { data: users, error } = await supabase
    .from('users')
    .select('id, username, role, auth_uid')
    .order('username', { ascending: true });

  if (error) {
    console.error('Failed to fetch users:', error);
    process.exit(1);
  }

  // transform to expected format for generatePairings
  const inputUsers = users.map(u => ({ id: u.id, name: u.username, role: u.role }));

  // Basic validation
  const adults = inputUsers.filter(u => u.role === 'adult');
  if (adults.length === 0) {
    console.error('There must be at least one adult (buyer) to run pairing.');
    process.exit(1);
  }

  // 2) generate pairings
  let result;
  try {
    result = generatePairings(inputUsers, 2000);
  } catch (err) {
    console.error('Pairing failed:', err.message);
    process.exit(1);
  }

  const { pairings } = result;

  // 3) Persist pairings atomically using an RPC `replace_pairings(new_pairings jsonb)`
  const toInsert = pairings.map(p => ({ giver_id: p.giverId, receiver_id: p.receiverId }));

  // Call the RPC with JSON string (jsonb param)
  const rpc = await supabase.rpc('replace_pairings', { new_pairings: JSON.stringify(toInsert) });
  if (rpc.error) {
    console.error('Failed to replace pairings via RPC:', rpc.error);
    process.exit(1);
  }

  console.log('Pairings replaced atomically via RPC. Result sample:');
  console.table(rpc.data.slice(0, 20));
  process.exit(0);
}

if (require.main === module) run();
