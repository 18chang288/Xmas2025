import { test } from 'node:test';
import assert from 'assert';
import { generatePairings } from '../pairing.js';

// small helper to count occurrences
function countReceivers(pairings) {
  const m = new Map();
  for (const p of pairings) m.set(p.receiverId, (m.get(p.receiverId) || 0) + 1);
  return m;
}

test('basic pairing validity', () => {
  const users = [
    { id: 'u1', name: 'A', role: 'adult' },
    { id: 'u2', name: 'B', role: 'adult' },
    { id: 'u3', name: 'C', role: 'adult' },
    { id: 'u4', name: 'D', role: 'child' }
  ];

  const result = generatePairings(users, 2000);
  const { pairings, capacities } = result;

  // every recipient appears exactly once
  const receiverCounts = countReceivers(pairings);
  assert.strictEqual(receiverCounts.size, users.length);
  for (const u of users) assert.strictEqual(receiverCounts.get(u.id), 1);

  // buyers are adults
  for (const giverId of Object.keys(capacities)) {
    const u = users.find(x => x.id === giverId);
    assert.ok(u && u.role === 'adult');
  }

  // no self-assignments
  for (const p of pairings) assert.notStrictEqual(p.giverId, p.receiverId);
});

test('many children, capacity distribution (insufficient capacity) throws', () => {
  const users = [
    { id: 'a1', name: 'A1', role: 'adult' },
    { id: 'a2', name: 'A2', role: 'adult' },
    { id: 'c1', name: 'C1', role: 'child' },
    { id: 'c2', name: 'C2', role: 'child' },
    { id: 'c3', name: 'C3', role: 'child' }
  ];

  // With 2 adults max capacity is 4 (2*2) but recipients are 5 => should throw
  assert.throws(() => generatePairings(users, 10), /Not enough buyer capacity|Not enough buyer capacity to cover recipients/);
});
