/**
 * Performance benchmarks: Original TS vs Optimised TS vs Rust WASM.
 *
 * Run with:  npm run bench
 *
 * The WASM module is initialised synchronously in beforeAll via initSync +
 * fs.readFileSync so there is no fetch dependency in the Node/jsdom env.
 * WASM bench entries use the raw solve_all / solve_first functions directly
 * to measure pure solver time without the async wrapper overhead.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { bench, describe, beforeAll, it, expect } from 'vitest';
import { solve } from './solver';
import { solveOptimized } from './solver-optimized';
import type { GameState, Equation } from './types';

// ── WASM setup ──────────────────────────────────────────────────────────────
import { initSync, solve_all, solve_first } from '../../solver-wasm/pkg/solver_wasm';

const WASM_PATH = resolve(process.cwd(), 'solver-wasm/pkg/solver_wasm_bg.wasm');

beforeAll(() => {
  const bytes = readFileSync(WASM_PATH);
  initSync({ module: bytes });
});

const OP_SYMBOLS: Equation['operator'][] = ['+', '-', '×', '÷'];

function wasmDecodeFirst(raw: Uint32Array): Equation[] {
  if (raw[0] === 0) return [];
  const n = raw[1];
  const sol: Equation[] = [];
  for (let k = 0; k < n; k++) {
    const base = 2 + k * 4;
    sol.push({ operand1: raw[base], operator: OP_SYMBOLS[raw[base + 1]], operand2: raw[base + 2], result: raw[base + 3] });
  }
  return sol;
}

// ---------------------------------------------------------------------------
// Puzzles
// ---------------------------------------------------------------------------

const EASY: GameState = { target: 350, availableNumbers: [7, 50, 2, 3, 4, 100], completedEquations: [], maxSteps: 5 };
const MEDIUM: GameState = { target: 243, availableNumbers: [2, 2, 4, 4, 5, 100], completedEquations: [], maxSteps: 5 };
const HARD: GameState = { target: 351, availableNumbers: [6, 6, 8, 12, 50, 100], completedEquations: [], maxSteps: 5 };

// ---------------------------------------------------------------------------
// Sanity checks
// ---------------------------------------------------------------------------
describe('solver sanity (before bench)', () => {
  for (const [name, state] of [['easy', EASY], ['medium', MEDIUM], ['hard', HARD]] as [string, GameState][]) {
    it(`all three solvers agree on shortest path for ${name}`, () => {
      const ref  = solve(state, false);
      const opt  = solveOptimized(state, false);
      const wasmRaw = solve_first(new Uint32Array(state.availableNumbers), state.target, state.maxSteps);
      const wasmSol = wasmDecodeFirst(wasmRaw);
      expect(opt.length).toBeGreaterThan(0);
      expect(opt[0].length).toBe(ref[0].length);
      expect(wasmSol.length).toBe(ref[0].length);
    });
  }
});

// ---------------------------------------------------------------------------
// Benchmarks – findFirst
// ---------------------------------------------------------------------------
describe('findFirst', () => {
  bench('easy   – original TS',  () => { solve(EASY, false); });
  bench('easy   – optimised TS', () => { solveOptimized(EASY, false); });
  bench('easy   – Rust WASM',    () => { solve_first(new Uint32Array([7, 50, 2, 3, 4, 100]), 350, 5); });

  bench('medium – original TS',  () => { solve(MEDIUM, false); });
  bench('medium – optimised TS', () => { solveOptimized(MEDIUM, false); });
  bench('medium – Rust WASM',    () => { solve_first(new Uint32Array([2, 2, 4, 4, 5, 100]), 243, 5); });

  bench('hard   – original TS',  () => { solve(HARD, false); });
  bench('hard   – optimised TS', () => { solveOptimized(HARD, false); });
  bench('hard   – Rust WASM',    () => { solve_first(new Uint32Array([6, 6, 8, 12, 50, 100]), 351, 5); });
});

// ---------------------------------------------------------------------------
// Benchmarks – findAll
// ---------------------------------------------------------------------------
describe('findAll', () => {
  bench('easy   – original TS',  () => { solve(EASY, true); });
  bench('easy   – optimised TS', () => { solveOptimized(EASY, true); });
  bench('easy   – Rust WASM',    () => { solve_all(new Uint32Array([7, 50, 2, 3, 4, 100]), 350, 5); });

  bench('medium – original TS',  () => { solve(MEDIUM, true); });
  bench('medium – optimised TS', () => { solveOptimized(MEDIUM, true); });
  bench('medium – Rust WASM',    () => { solve_all(new Uint32Array([2, 2, 4, 4, 5, 100]), 243, 5); });

  bench('hard   – original TS',  () => { solve(HARD, true); });
  bench('hard   – optimised TS', () => { solveOptimized(HARD, true); });
  bench('hard   – Rust WASM',    () => { solve_all(new Uint32Array([6, 6, 8, 12, 50, 100]), 351, 5); });
});

