// pairing_edge.ts — Deno / Supabase Edge Function version
// This file is Deno-compatible and can be deployed as a Supabase Edge Function.
// It performs the same pairing logic and writes to the `pairings` table using the service role key.

import { serve } from 'https://deno.land/std@0.201.0/http/server.ts';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Copy of the generatePairings function (small adaptation for in-file use)
function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function generatePairings(users: { id: string; name: string; role: string }[], maxAttempts = 1000) {
  const recipients = users.slice();
  const buyers = users.filter(u => u.role === 'adult');

  if (buyers.length === 0) throw new Error('No buyers available');

  const totalRecipients = recipients.length;
  const minCapacity = buyers.length;
  const extraNeeded = totalRecipients - minCapacity;
  if (extraNeeded < 0) throw new Error('More buyers than recipients');
  if (extraNeeded > buyers.length) throw new Error('Not enough buyer capacity');

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const capacities = new Map<string, number>();
    buyers.forEach(b => capacities.set(b.id, 1));
    const buyerIds = buyers.map(b => b.id);
    shuffle(buyerIds);
    for (let i = 0; i < extraNeeded; i++) capacities.set(buyerIds[i], capacities.get(buyerIds[i])! + 1);

    const buyerSlots: string[] = [];
    for (const b of buyers) {
      const cap = capacities.get(b.id) || 1;
      for (let k = 0; k < cap; k++) buyerSlots.push(b.id);
    }
    if (buyerSlots.length !== totalRecipients) continue;

    const slotCopy = buyerSlots.slice();
    shuffle(slotCopy);
    const recCopy = recipients.slice();
    shuffle(recCopy);

    let valid = true;
    for (let i = 0; i < slotCopy.length; i++) {
      if (slotCopy[i] === recCopy[i].id) {
        let swapped = false;
        for (let j = 0; j < slotCopy.length; j++) {
          if (i === j) continue;
          if (slotCopy[j] !== recCopy[i].id && slotCopy[i] !== recCopy[j].id) {
            [slotCopy[i], slotCopy[j]] = [slotCopy[j], slotCopy[i]];
            swapped = true;
            break;
          }
        }
        if (!swapped) {
          valid = false;
          break;
        }
      }
    }
    if (!valid) continue;

    let selfAssign = false;
    for (let i = 0; i < slotCopy.length; i++) if (slotCopy[i] === recCopy[i].id) selfAssign = true;
    if (selfAssign) continue;

    const pairings = slotCopy.map((giverId, idx) => ({ giverId, receiverId: recCopy[idx].id }));
    const receiverSet = new Set(pairings.map(p => p.receiverId));
    if (receiverSet.size !== pairings.length) continue;

    return { pairings, capacities: Object.fromEntries(capacities) };
  }
  throw new Error('Failed to generate valid pairings');
}

serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return new Response('Missing env', { status: 500 });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { global: { headers: {} } });

    // fetch users
    const { data: users, error } = await supabase.from('users').select('id, username, role');
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

    const input = (users as any[]).map(u => ({ id: u.id, name: u.username, role: u.role }));

    const result = generatePairings(input);
    const toInsert = result.pairings.map((p: any) => ({ giver_id: p.giverId, receiver_id: p.receiverId }));

    // Use RPC to atomically replace pairings
    const { data: rpcData, error: rpcErr } = await supabase.rpc('replace_pairings', { new_pairings: JSON.stringify(toInsert) });
    if (rpcErr) return new Response(JSON.stringify({ error: rpcErr.message }), { status: 500 });

    return new Response(JSON.stringify({ pairings: result.pairings, capacities: result.capacities, rpcResult: rpcData }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
  }
});
