/**
 * Thin wrapper around the Rust WASM solver.
 *
 * The WASM module is initialised lazily on first call; subsequent calls reuse
 * the already-loaded instance so there is no per-call overhead.
 *
 * Op-code mapping (matches the Rust implementation):
 *   0 = +   1 = -   2 = ×   3 = ÷
 */

import type { Equation, GameState } from './types';

// Dynamic import so Vite can code-split the WASM binary.
// The `?url` suffix gives us the raw `.wasm` URL for manual init.
type WasmModule = typeof import('../../solver-wasm/pkg/solver_wasm');

let wasmModule: WasmModule | null = null;
let initPromise: Promise<WasmModule> | null = null;

async function getWasm(): Promise<WasmModule> {
  if (wasmModule) return wasmModule;
  if (!initPromise) {
    initPromise = (async () => {
      // Webpack / Vite will resolve this to the WASM package entry point.
      const mod = await import('../../solver-wasm/pkg/solver_wasm');
      // `init` is the default export from wasm-pack --target web.
      await (mod as unknown as { default: () => Promise<void> }).default();
      wasmModule = mod;
      return mod;
    })();
  }
  return initPromise;
}

const OP_SYMBOLS: Equation['operator'][] = ['+', '-', '×', '÷'];

/**
 * Decode the flat WASM output buffer into an array of solution paths.
 *
 * Wire format:
 *   [n_solutions, sol0_n_steps, sol0_step0_a, sol0_step0_op, sol0_step0_b, sol0_step0_result, ...]
 */
function decodeSolutions(raw: Uint32Array): Equation[][] {
  const nSols = raw[0];
  const solutions: Equation[][] = [];
  let i = 1;
  for (let s = 0; s < nSols; s++) {
    const nSteps = raw[i++];
    const sol: Equation[] = [];
    for (let k = 0; k < nSteps; k++) {
      const a   = raw[i++];
      const op  = raw[i++];
      const b   = raw[i++];
      const res = raw[i++];
      sol.push({ operand1: a, operator: OP_SYMBOLS[op], operand2: b, result: res });
    }
    solutions.push(sol);
  }
  return solutions;
}

/**
 * WASM-powered drop-in replacement for `solve()`.
 *
 * Returns a Promise because the WASM module must be loaded first.
 * After the first call the module is cached and subsequent calls are
 * essentially synchronous (the async overhead is a single `then` microtask).
 */
export async function solveWasm(state: GameState, findAll = false): Promise<Equation[][]> {
  const wasm = await getWasm();
  const tiles = new Uint32Array(state.availableNumbers);
  const raw = findAll
    ? wasm.solve_all(tiles, state.target, state.maxSteps)
    : wasm.solve_first(tiles, state.target, state.maxSteps);
  return decodeSolutions(raw);
}
