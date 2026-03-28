import type { GameState, Move, Operator } from './types';

const OPERATORS: Operator[] = ['+', '-', '×', '÷'];

function applyOperator(a: number, op: Operator, b: number): number | null {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷':
      if (b === 0 || a % b !== 0) return null;
      return a / b;
  }
}

/**
 * Given the current game state, returns a list of all valid moves that can be
 * played next.
 *
 * A move is valid when:
 *  - Both operands are distinct items from `state.availableNumbers` (by index;
 *    the same value may appear more than once in the pool).
 *  - The result is a positive integer (> 0).
 *  - For division: the result must be a whole number and the divisor non-zero.
 *  - Commutative duplicates are suppressed: for + and ×, only pairs where
 *    i < j with a ≤ b are emitted, halving the search space.
 */
export function getPossibleMoves(state: GameState): Move[] {
  const { availableNumbers } = state;
  const moves: Move[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < availableNumbers.length; i++) {
    for (let j = 0; j < availableNumbers.length; j++) {
      if (i === j) continue;
      const a = availableNumbers[i];
      const b = availableNumbers[j];

      for (const op of OPERATORS) {
        // Suppress commutative duplicates for + and ×
        if ((op === '+' || op === '×') && i > j) continue;

        const result = applyOperator(a, op, b);
        if (result === null || result <= 0 || !Number.isInteger(result)) continue;

        // Deduplicate moves that are identical in value (e.g. two 2s)
        const key = `${a}${op}${b}=${result}`;
        if (seen.has(key)) continue;
        seen.add(key);

        moves.push({ operand1: a, operator: op, operand2: b, result });
      }
    }
  }

  return moves;
}
