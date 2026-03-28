use wasm_bindgen::prelude::*;

/// Operator encoding: 0 = +, 1 = -, 2 = ×, 3 = ÷
#[inline(always)]
fn apply_op(a: i32, op: u8, b: i32) -> i32 {
    match op {
        0 => a + b,
        1 => a - b,
        2 => a * b,
        3 => {
            if b != 0 && a % b == 0 {
                a / b
            } else {
                0
            }
        }
        _ => 0,
    }
}

/// A single completed equation in a solution path.
/// Each step is encoded as 4 u32 values: [operand1, op_code, operand2, result].
type Step = [u32; 4];

/// Recursive DFS with bitmask-tracked tile pool.
///
/// `pool`   – fixed-size array; only slots where `active` bit is set are valid.
/// `active` – bitmask; bit k ⟺ pool[k] is a live tile.
/// `hist`   – current solution path (at most 5 entries).
/// `depth`  – number of moves already taken.
/// `target` – the number we're looking for.
/// `max`    – maximum depth allowed.
/// `out`    – flat output buffer (filled by push_solution).
fn dfs(
    pool: &mut [i32; 6],
    active: u8,
    hist: &mut Vec<Step>,
    target: i32,
    max: usize,
    out: &mut Vec<u32>,
) {
    // Check whether the target is already among the live tiles.
    let mut mask = active;
    while mask != 0 {
        let lsb = mask & mask.wrapping_neg();
        let k = lsb.trailing_zeros() as usize;
        if pool[k] == target {
            push_solution(hist, out);
            return;
        }
        mask ^= lsb;
    }
    if hist.len() == max {
        return;
    }

    // Collect active indices (max 6).
    let mut idxs = [0u8; 6];
    let mut size = 0usize;
    {
        let mut m = active;
        while m != 0 {
            let lsb = m & m.wrapping_neg();
            idxs[size] = lsb.trailing_zeros() as u8;
            size += 1;
            m ^= lsb;
        }
    }

    // Dedup seen (a, op, b) triples at this level.
    // A small fixed-size open-addressed hash set (256 slots, load ≤ 50%).
    const HTSIZE: usize = 256;
    let mut seen = [u64::MAX; HTSIZE];

    for ii in 0..size {
        for jj in 0..size {
            if ii == jj {
                continue;
            }
            let i = idxs[ii] as usize;
            let j = idxs[jj] as usize;
            let a = pool[i];
            let b = pool[j];

            for op in 0u8..4 {
                // Suppress commutative duplicate (b op a) for + and ×
                if (op == 0 || op == 2) && ii > jj {
                    continue;
                }

                let result = apply_op(a, op, b);
                if result <= 0 {
                    continue;
                }

                // Injective key for (a, op, b): safe for a, b ≤ ~1_000_000
                let key = (a as u64 * 4 + op as u64) * 1_000_001 + b as u64;
                let slot = (key ^ (key >> 7)) as usize & (HTSIZE - 1);
                // Linear probe
                let mut s = slot;
                let mut found = false;
                loop {
                    if seen[s] == u64::MAX {
                        seen[s] = key;
                        break;
                    }
                    if seen[s] == key {
                        found = true;
                        break;
                    }
                    s = (s + 1) & (HTSIZE - 1);
                }
                if found {
                    continue;
                }

                hist.push([a as u32, op as u32, b as u32, result as u32]);

                // Reuse slot i for the result; mark slot j inactive.
                let saved_a = pool[i];
                pool[i] = result;
                let next_active = active ^ (1 << j);

                dfs(pool, next_active, hist, target, max, out);

                pool[i] = saved_a;
                hist.pop();
            }
        }
    }
}

/// Encode a completed solution path into the flat output buffer.
/// Format per solution: [n_steps, step0_a, step0_op, step0_b, step0_result, ...]
fn push_solution(hist: &[Step], out: &mut Vec<u32>) {
    out.push(hist.len() as u32);
    for step in hist {
        out.extend_from_slice(step);
    }
}

/// Find all solutions to a Summle puzzle.
///
/// `tiles`     – initial tile values (1–6 elements).
/// `target`    – the number to reach.
/// `max_steps` – maximum number of equations allowed.
///
/// Returns a flat `Vec<u32>` with:
///   `[n_solutions, sol0_n_steps, sol0_step0_a, sol0_step0_op, sol0_step0_b, sol0_step0_result, ...]`
///
/// Op codes: 0 = +, 1 = -, 2 = × (multiply), 3 = ÷ (divide).
#[wasm_bindgen]
pub fn solve_all(tiles: &[u32], target: u32, max_steps: u32) -> Vec<u32> {
    let n = tiles.len().min(6);
    let mut pool = [0i32; 6];
    let mut active: u8 = 0;
    for k in 0..n {
        pool[k] = tiles[k] as i32;
        active |= 1 << k;
    }

    let mut out: Vec<u32> = Vec::new();
    out.push(0); // placeholder for solution count

    let mut hist: Vec<Step> = Vec::with_capacity(max_steps as usize);
    dfs(&mut pool, active, &mut hist, target as i32, max_steps as usize, &mut out);

    // Count solutions by scanning the output
    let total = count_solutions(&out[1..], max_steps as usize);
    out[0] = total;
    out
}

/// Find the shortest solution only (iterative deepening).
///
/// Returns the same format as `solve_all` but with at most one solution.
#[wasm_bindgen]
pub fn solve_first(tiles: &[u32], target: u32, max_steps: u32) -> Vec<u32> {
    let n = tiles.len().min(6);
    let mut pool = [0i32; 6];
    let mut active: u8 = 0;
    for k in 0..n {
        pool[k] = tiles[k] as i32;
        active |= 1 << k;
    }

    for depth in 0..=(max_steps as usize) {
        let mut out: Vec<u32> = vec![0];
        let mut hist: Vec<Step> = Vec::with_capacity(depth);
        dfs(&mut pool, active, &mut hist, target as i32, depth, &mut out);
        if out.len() > 1 {
            out[0] = 1;
            return out;
        }
    }
    vec![0]
}

fn count_solutions(data: &[u32], max_steps: usize) -> u32 {
    let mut count = 0u32;
    let mut i = 0;
    while i < data.len() {
        let n = data[i] as usize;
        if n > max_steps {
            break; // corrupt
        }
        count += 1;
        i += 1 + n * 4;
    }
    count
}
