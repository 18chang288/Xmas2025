import { generatePairings } from './pairing.js';
import assert from 'assert';

function validateResult(users, result) {
  const { pairings, capacities } = result;

  // 1) every recipient appears once
  const recipients = users.map(u => u.id);
  const receivers = pairings.map(p => p.receiverId);
  const receiverSet = new Set(receivers);
  if (receiverSet.size !== receivers.length) throw new Error('Duplicate or missing receivers');
  for (const r of recipients) if (!receiverSet.has(r)) throw new Error('Some recipient missing: ' + r);

  // 2) buyers only adults
  for (const [giverId, count] of Object.entries(capacities)) {
    const u = users.find(x => x.id === giverId);
    if (!u) throw new Error('Giver not found: ' + giverId);
    if (u.role !== 'adult') throw new Error('Non-adult assigned as buyer: ' + giverId);
  }

  // 3) no self-assign
  for (const p of pairings) {
    if (p.giverId === p.receiverId) throw new Error('Self-assignment found: ' + p.giverId);
  }

  console.log('Validation passed');
}

// sample run
const sampleUsers = [
  { id: 'u1', name: 'Alice', role: 'adult' },
  { id: 'u2', name: 'Bob', role: 'adult' },
  { id: 'u3', name: 'Carol', role: 'adult' },
  { id: 'u4', name: 'Danny', role: 'child' },
  { id: 'u5', name: 'Eve', role: 'child' }
];

try {
  const result = generatePairings(sampleUsers, 5000);
  console.log('Capacities:', result.capacities);
  console.log('Pairings:');
  for (const p of result.pairings) {
    const giver = sampleUsers.find(u => u.id === p.giverId).name;
    const receiver = sampleUsers.find(u => u.id === p.receiverId).name;
    console.log(`  ${giver} -> ${receiver}`);
  }
  validateResult(sampleUsers, result);
} catch (err) {
  console.error('Run failed:', err.message);
  process.exit(1);
}
