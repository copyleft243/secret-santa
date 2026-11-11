import { randomInt } from "node:crypto";

export interface Assignable {
  id: number;
  /** Ids this person is not allowed to give to (their own id is handled implicitly). */
  excluded: Set<number>;
}

/** Fisher–Yates shuffle using a CSPRNG for non-predictable results. */
function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/**
 * Produces a random derangement (a bijection where nobody is mapped to
 * themselves) that also respects each person's exclusion set.
 *
 * Uses backtracking with a "most-constrained first" heuristic, which is
 * instant for the typical group size and stays correct even when exclusions
 * make the problem tight.
 *
 * Returns a Map<giverId, receiverId>, or null when no valid assignment exists.
 */
export function assignSecretSanta(people: Assignable[]): Map<number, number> | null {
  if (people.length < 2) return null;

  const ids = people.map((p) => p.id);
  const byId = new Map(people.map((p) => [p.id, p]));

  const candidates = (giverId: number): number[] => {
    const giver = byId.get(giverId)!;
    const out: number[] = [];
    for (const id of ids) {
      if (id === giverId) continue;
      if (giver.excluded.has(id)) continue;
      out.push(id);
    }
    return out;
  };

  const result = new Map<number, number>();
  const usedReceivers = new Set<number>();

  function backtrack(givers: number[]): boolean {
    if (givers.length === 0) return true;

    // Pick the giver with the fewest remaining options (MRV).
    let pickIndex = 0;
    let pickCount = Infinity;
    for (let i = 0; i < givers.length; i++) {
      const g = givers[i];
      let count = 0;
      for (const r of candidates(g)) {
        if (!usedReceivers.has(r)) count++;
      }
      if (count < pickCount) {
        pickCount = count;
        pickIndex = i;
        if (count === 0) break; // can't do better than zero
      }
    }

    const giver = givers.splice(pickIndex, 1)[0];
    const options = candidates(giver).filter((r) => !usedReceivers.has(r));
    shuffle(options);

    for (const receiver of options) {
      result.set(giver, receiver);
      usedReceivers.add(receiver);
      if (backtrack(givers)) return true;
      usedReceivers.delete(receiver);
      result.delete(giver);
    }

    givers.splice(pickIndex, 0, giver);
    return false;
  }

  return backtrack(shuffle([...ids])) ? result : null;
}
