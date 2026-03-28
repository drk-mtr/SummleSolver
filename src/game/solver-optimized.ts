/**
 * Optimised TypeScript solver.
 *
 * Same DFS algorithm as solver.ts but with targeted allocations removed from
 * the hot path:
 *
 *  1. No GameState object created per DFS node.
 *  2. Pool is a fixed-size array; active slots tracked by a bitmask.
 *     No new array allocated per move — we just mark bits.
 *  3. Move dedup uses a Set<number> (not Set<string>), avoiding string allocs.
 *  4. getPossibleMoves() is inlined — no intermediate Move[] per DFS node.
 *
 * Pool layout: with ≤6 initial tiles and each DFS step net-removing one tile,
 * the pool shrinks monotonically.  Six slots are always sufficient.
 * Active slots are tracked by a 6-bit bitmask.  The result of each explored
 * move is written into the operand-a slot (slot i), so backtracking only needs
 * to restore pool[i] — one integer write per explored move.
 */

import type { Equation, GameState } from './types';

const OP_SYMBOLS = ['+', '-', '×', '÷'] as const;

function applyOp(a: number, op: number, b: number): number {
  switch (op) {
    case 0: return a + b;
    case 1: return a - b;
    case 2: return a * b;
    case 3: return (b !== 0 && a % b === 0) ? (a / b) : 0;
    default: return 0;
  }
}

function dfs(
  pool: number[],       // fixed-size; only slots where active bit is set are valid
  active: number,       // bitmask — bit k set ⟺ pool[k] is a live tile
  history: Equation[],
  target: number,
  stepsLeft: number,
  solutions: Equation[][],
): void {
  // Check whether target already exists among the active tiles
  let mask = active;
  while (mask) {
    const lsb = mask & -mask;                 // isolate lowest set bit
    const k   = 31 - Math.clz32(lsb);        // its index
    if (pool[k] === target) {
      solutions.push(history.slice());
      return;
    }
    mask ^= lsb;
  }
  if (stepsLeft === 0) return;

  // Collect active indices (ascending, max 6 elements)
  const idxs: number[] = [];
  mask = active;
  while (mask) {
    const lsb = mask & -mask;
    idxs.push(31 - Math.clz32(lsb));
    mask ^= lsb;
  }
  const size = idxs.length;

  // Dedup (a, op, b) tuples to skip states we've already branched from
  // Key is injective for a,b ≤ 1e6 (safe for any realistic intermediate value)
  const seen = new Set<number>();

  for (let ii = 0; ii < size; ii++) {
    for (let jj = 0; jj < size; jj++) {
      if (ii === jj) continue;
      const i = idxs[ii];   // slot of operand a
      const j = idxs[jj];   // slot of operand b
      const a = pool[i];
      const b = pool[j];

      for (let op = 0; op < 4; op++) {
        // Suppress the redundant (b op a) direction for commutative operators
        if ((op === 0 || op === 2) && ii > jj) continue;

        const result = applyOp(a, op, b);
        if (result <= 0) continue;

        // Injective key for (a, op, b) — deduplicates duplicate tile values
        const key = (a * 4 + op) * 1_000_001 + b;
        if (seen.has(key)) continue;
        seen.add(key);

        const eq: Equation = { operand1: a, operator: OP_SYMBOLS[op], operand2: b, result };
        history.push(eq);

        // Reuse slot i for the result; slot j is retired (bit cleared).
        // Only pool[i] is mutated — O(1) and trivially reversed on backtrack.
        pool[i] = result;
        const nextActive = active ^ (1 << j);  // bit i stays (now holds result); bit j cleared

        dfs(pool, nextActive, history, target, stepsLeft - 1, solutions);

        pool[i] = a;   // restore
        history.pop();
      }
    }
  }
}

/**
 * Optimised drop-in replacement for `solve()`.
 *
 * Identical external contract: same GameState input, same Equation[][] output.
 */
export function solveOptimized(state: GameState, findAll = false): Equation[][] {
  const solutions: Equation[][] = [];
  const tiles = state.availableNumbers;

  // Build initial pool (fixed size 6) and bitmask
  const pool = [0, 0, 0, 0, 0, 0];
  let active = 0;
  for (let k = 0; k < tiles.length; k++) {
    pool[k] = tiles[k];
    active |= (1 << k);
  }

  if (findAll) {
    dfs(pool, active, [], state.target, state.maxSteps, solutions);
  } else {
    for (let depth = 1; depth <= state.maxSteps; depth++) {
      dfs(pool, active, [], state.target, depth, solutions);
      if (solutions.length > 0) break;
    }
  }

  return solutions;
}
