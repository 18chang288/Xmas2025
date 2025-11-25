// Secret Santa pairing utility
// Rules implemented:
// - Users have roles: "adult" or "child"
// - Adults are buyers; children are only recipients
// - Each recipient (all users) receives exactly 1 gift
// - Each adult buys 1 or 2 gifts
// - Pairings are random with no self-assignments
// - If impossible, function throws an error

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function generatePairings(users, maxAttempts = 1000) {
  // users: [{ id: string, name: string, role: 'adult'|'child' }]
  const recipients = users.slice(); // everyone receives
  const buyers = users.filter(u => u.role === 'adult');

  if (buyers.length === 0) {
    throw new Error('No buyers (adults) available to buy gifts.');
  }

  const totalRecipients = recipients.length;
  const minCapacity = buyers.length; // each buyer at least 1
  const extraNeeded = totalRecipients - minCapacity; // how many extra +1 slots we need

  if (extraNeeded < 0) {
    throw new Error('More buyers than recipients - impossible');
  }

  if (extraNeeded > buyers.length) {
    // each buyer can at most buy 2 gifts, so max extra is buyers.length
    throw new Error('Not enough buyer capacity to cover recipients');
  }

  // We'll attempt generating random allocations and resolving self-assignments
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Step 1: assign capacities: everyone gets 1, then randomly pick extraNeeded distinct buyers to get +1
    const capacities = new Map();
    buyers.forEach(b => capacities.set(b.id, 1));

    // choose random buyers for the extra slot
    const buyerIds = buyers.map(b => b.id);
    shuffle(buyerIds);
    for (let i = 0; i < extraNeeded; i++) {
      capacities.set(buyerIds[i], capacities.get(buyerIds[i]) + 1);
    }

    // Step 2: create buyerSlots array with duplicates per capacity
    const buyerSlots = [];
    for (const b of buyers) {
      const cap = capacities.get(b.id);
      for (let k = 0; k < cap; k++) buyerSlots.push(b.id);
    }

    if (buyerSlots.length !== totalRecipients) {
      // sanity check
      continue;
    }

    // Step 3: attempt to assign buyers to recipients randomly and resolve self-assignments
    // We'll shuffle buyers and recipients to make random
    const slotCopy = buyerSlots.slice();
    shuffle(slotCopy);

    const recCopy = recipients.slice();
    shuffle(recCopy);

    // If any slotCopy[i] === recCopy[i].id try to swap with some j
    let valid = true;
    for (let i = 0; i < slotCopy.length; i++) {
      if (slotCopy[i] === recCopy[i].id) {
        // find j to swap with
        let swapped = false;
        for (let j = 0; j < slotCopy.length; j++) {
          if (i === j) continue;
          if (slotCopy[j] !== recCopy[i].id && slotCopy[i] !== recCopy[j].id) {
            // swapping resolves both positions
            [slotCopy[i], slotCopy[j]] = [slotCopy[j], slotCopy[i]];
            swapped = true;
            break;
          }
        }
        if (!swapped) {
          // try a more relaxed swap: find j where slotCopy[j] !== recCopy[i].id
          for (let j = 0; j < slotCopy.length; j++) {
            if (slotCopy[j] !== recCopy[i].id && slotCopy[j] !== recCopy[j].id) {
              [slotCopy[i], slotCopy[j]] = [slotCopy[j], slotCopy[i]];
              swapped = true;
              break;
            }
          }
        }
        if (!swapped) {
          valid = false;
          break;
        }
      }
    }

    if (!valid) {
      // try next attempt
      continue;
    }

    // final check: ensure no self-assignments
    let selfAssign = false;
    for (let i = 0; i < slotCopy.length; i++) {
      if (slotCopy[i] === recCopy[i].id) {
        selfAssign = true;
        break;
      }
    }
    if (selfAssign) continue;

    // Build pairings: map slotCopy[i] (giverId) -> recCopy[i].id (receiverId)
    const pairings = slotCopy.map((giverId, idx) => ({ giverId, receiverId: recCopy[idx].id }));

    // Additional sanity checks: each recipient appears exactly once
    const receiverSet = new Set(pairings.map(p => p.receiverId));
    if (receiverSet.size !== pairings.length) continue;

    // And each giver appears number of times equal to capacity
    // (we can skip explicit check since slots were created from capacities)

    return { pairings, capacities: Object.fromEntries(capacities) };
  }

  throw new Error('Failed to generate valid pairings after many attempts');
}
export { generatePairings };
