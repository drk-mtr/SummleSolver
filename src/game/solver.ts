import type { Equation, GameState } from './types';
import { getPossibleMoves } from './moves';

/**
 * Returns the pool of available numbers after applying an equation:
 * removes the two operands (by index) and adds the result.
 */
function applyEquation(available: number[], eq: Equation): number[] {
  const next = [...available];
  const i1 = next.indexOf(eq.operand1);
  next.splice(i1, 1);
  const i2 = next.indexOf(eq.operand2);
  next.splice(i2, 1);
  next.push(eq.result);
  return next;
}

function dfs(
  available: number[],
  history: Equation[],
  target: number,
  stepsLeft: number,
  solutions: Equation[][],
): void {
  if (available.includes(target)) {
    solutions.push([...history]);
    return; // target reached — no point taking further steps
  }
  if (stepsLeft === 0) return;

  const state: GameState = {
    target,
    availableNumbers: available,
    completedEquations: history,
    maxSteps: stepsLeft,
  };

  for (const move of getPossibleMoves(state)) {
    const nextAvailable = applyEquation(available, move);
    history.push(move);
    dfs(nextAvailable, history, target, stepsLeft - 1, solutions);
    history.pop();
  }
}

/**
 * Finds solution(s) to the given Summle puzzle.
 *
 * @param state    The initial game state.
 * @param findAll  If true, find every solution up to `maxSteps` deep.
 *                 If false (default), use iterative deepening to return only
 *                 the shortest solution (much faster).
 * @returns  An array of solutions, each an ordered list of equations.
 *           Empty if no solution exists within maxSteps.
 */
export function solve(state: GameState, findAll = false): Equation[][] {
  const solutions: Equation[][] = [];

  if (findAll) {
    // Single full DFS — each branch stops as soon as the target is reached,
    // so no duplicates and no spurious post-target steps.
    dfs([...state.availableNumbers], [], state.target, state.maxSteps, solutions);
  } else {
    // Iterative deepening: try depth 1, 2, … so we always get the shortest solution.
    for (let depth = 1; depth <= state.maxSteps; depth++) {
      dfs([...state.availableNumbers], [], state.target, depth, solutions);
      if (solutions.length > 0) break;
    }
  }

  return solutions;
}
