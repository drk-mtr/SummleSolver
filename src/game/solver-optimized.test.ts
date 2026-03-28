import { describe, it, expect } from 'vitest';
import { solve } from './solver';
import { solveOptimized } from './solver-optimized';
import type { Equation, GameState } from './types';

// Helper: check every step in a solution is valid given the evolving pool
function validateSolution(state: GameState, solution: ReturnType<typeof solve>[number]): void {
  const pool = [...state.availableNumbers];
  for (const eq of solution) {
    const i1 = pool.indexOf(eq.operand1);
    expect(i1, `operand1 ${eq.operand1} not in pool [${pool}]`).toBeGreaterThanOrEqual(0);
    pool.splice(i1, 1);
    const i2 = pool.indexOf(eq.operand2);
    expect(i2, `operand2 ${eq.operand2} not in pool [${pool}]`).toBeGreaterThanOrEqual(0);
    pool.splice(i2, 1);
    pool.push(eq.result);
  }
  expect(pool, 'target not in pool after solution').toContain(state.target);
}

/**
 * Normalise an equation so that commutative operations (+, ×) always list the
 * smaller operand first.  This lets us compare solution sets produced by two
 * different traversal orders without false "duplicate" discrepancies.
 */
function normaliseEq(e: Equation): string {
  if (e.operator === '+' || e.operator === '×') {
    const [a, b] = e.operand1 <= e.operand2 ? [e.operand1, e.operand2] : [e.operand2, e.operand1];
    return `${a}${e.operator}${b}=${e.result}`;
  }
  return `${e.operand1}${e.operator}${e.operand2}=${e.result}`;
}

const normaliseSol = (sol: Equation[]) => sol.map(normaliseEq).join(',');

const STATES = {
  immediate: {
    // 7 × 50 = 350 in one step
    state: { target: 350, availableNumbers: [7, 50, 2, 3, 4, 100], completedEquations: [], maxSteps: 5 } as GameState,
    minSteps: 1,
  },
  puzzle1492: {
    // Real daily puzzle – requires multiple steps
    state: { target: 243, availableNumbers: [2, 2, 4, 4, 5, 100], completedEquations: [], maxSteps: 5 } as GameState,
    minSteps: 2,
  },
  targetInTiles: {
    // Target is already present in initial tiles
    state: { target: 100, availableNumbers: [2, 3, 100, 4, 5, 6], completedEquations: [], maxSteps: 5 } as GameState,
    minSteps: 0,
  },
  noSolution: {
    state: { target: 997, availableNumbers: [1, 2], completedEquations: [], maxSteps: 1 } as GameState,
  },
  hardPuzzle: {
    // Exercises deeper search and large intermediate values
    state: { target: 351, availableNumbers: [6, 6, 8, 12, 50, 100], completedEquations: [], maxSteps: 5 } as GameState,
    minSteps: 2,
  },
};

describe('solveOptimized', () => {
  it('finds a 1-step solution when the target is reachable in one move', () => {
    const { state } = STATES.immediate;
    const solutions = solveOptimized(state);
    expect(solutions.length).toBeGreaterThan(0);
    expect(solutions[0].length).toBe(1);
    expect(solutions[0][0]).toMatchObject({ operand1: 7, operator: '×', operand2: 50, result: 350 });
  });

  it('returns a 0-step solution when the target is already in the initial tiles', () => {
    const { state } = STATES.targetInTiles;
    const solutions = solveOptimized(state);
    expect(solutions.length).toBeGreaterThan(0);
    expect(solutions[0]).toHaveLength(0);
  });

  it('returns an empty array when no solution exists', () => {
    const { state } = STATES.noSolution;
    expect(solveOptimized(state)).toHaveLength(0);
  });

  it('finds a valid multi-step solution for puzzle #1492', () => {
    const { state } = STATES.puzzle1492;
    const solutions = solveOptimized(state);
    expect(solutions.length).toBeGreaterThan(0);
    for (const sol of solutions) {
      validateSolution(state, sol);
    }
  });

  it('every step in every solution uses numbers available at that point', () => {
    const { state } = STATES.hardPuzzle;
    const solutions = solveOptimized(state, true);
    expect(solutions.length).toBeGreaterThan(0);
    for (const sol of solutions) {
      validateSolution(state, sol);
    }
  });

  it('(findAll=false) returns only the shortest solution(s)', () => {
    const { state } = STATES.puzzle1492;
    const allSolutions = solveOptimized(state, true);
    const minLen = Math.min(...allSolutions.map((s) => s.length));
    const firstSolution = solveOptimized(state, false);
    expect(firstSolution[0].length).toBe(minLen);
  });
});

describe('solveOptimized parity with solve', () => {
  for (const [name, fixture] of Object.entries(STATES)) {
    if (!('minSteps' in fixture) && name !== 'noSolution') continue;

    it(`finds same normalised unique solutions as solve() for "${name}" (findAll=true)`, () => {
      const { state } = fixture;
      const refNorm = new Set(solve(state, true).map(normaliseSol));
      const optNorm = new Set(solveOptimized(state, true).map(normaliseSol));
      // Every solution the reference finds should also be found (normalised)
      for (const s of refNorm) expect(optNorm, `missing: ${s}`).toContain(s);
      // And vice versa
      for (const s of optNorm) expect(refNorm, `extra: ${s}`).toContain(s);
    });

    it(`(findAll=false) matches shortest solution length from solve() for "${name}"`, () => {
      const { state } = fixture;
      const ref = solve(state, false);
      const opt = solveOptimized(state, false);
      const refLen = ref.length > 0 ? ref[0].length : -1;
      const optLen = opt.length > 0 ? opt[0].length : -1;
      expect(optLen).toBe(refLen);
    });
  }
});
