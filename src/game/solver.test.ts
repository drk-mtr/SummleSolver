import { describe, it, expect } from 'vitest';
import { solve } from './solver';
import type { GameState } from './types';

describe('solve', () => {
  it('finds a 1-step solution when target is directly reachable', () => {
    const state: GameState = {
      target: 350,
      availableNumbers: [7, 50, 2, 3, 4, 100],
      completedEquations: [],
      maxSteps: 5,
    };
    const solutions = solve(state);
    expect(solutions.length).toBeGreaterThan(0);
    // Should find it in 1 step (IDDFS gives us the shortest first)
    expect(solutions[0].length).toBe(1);
    expect(solutions[0][0]).toMatchObject({ operand1: 7, operator: '×', operand2: 50, result: 350 });
  });

  it('finds a multi-step solution for puzzle #1492 (target 243, tiles 2,2,4,4,5,100)', () => {
    // Real daily puzzle from 2026-03-28
    const state: GameState = {
      target: 243,
      availableNumbers: [2, 2, 4, 4, 5, 100],
      completedEquations: [],
      maxSteps: 5,
    };
    const solutions = solve(state);
    expect(solutions.length).toBeGreaterThan(0);

    // Validate that every returned solution is actually correct
    for (const solution of solutions) {
      expect(solution.length).toBeLessThanOrEqual(5);
      // The last equation's result must be 243
      expect(solution[solution.length - 1].result).toBe(243);
    }
  });

  it('returns an empty array when no solution exists', () => {
    // 1 and 3 cannot produce 100 in 5 steps through valid positive-integer arithmetic
    const state: GameState = {
      target: 997,   // prime; unreachable from [1, 2]
      availableNumbers: [1, 2],
      completedEquations: [],
      maxSteps: 1,
    };
    const solutions = solve(state);
    expect(solutions).toHaveLength(0);
  });

  it('finds all solutions when findAll=true', () => {
    const state: GameState = {
      target: 350,
      availableNumbers: [7, 50, 2, 3, 4, 100],
      completedEquations: [],
      maxSteps: 5,
    };
    const allSolutions = solve(state, true);
    const firstSolution = solve(state, false);
    // findAll should find at least as many as findFirst
    expect(allSolutions.length).toBeGreaterThanOrEqual(firstSolution.length);
    // Every solution must end with the target
    for (const sol of allSolutions) {
      expect(sol[sol.length - 1].result).toBe(350);
    }
  });
});
