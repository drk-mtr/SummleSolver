# Summle Solver – Possible Approaches

## Problem Characterisation

Summle is a **combinatorial search problem** with the following structure:

- **State**: the set of currently available numbers (initially 6 tiles) and the sequence of equations played so far.
- **Actions**: pick any ordered pair of available numbers, combine them with one of four operators (+, −, ×, ÷), and add the result to the pool (removing the two operands).
- **Goal**: some available number equals the target.
- **Constraints**:
  - Maximum 5 steps.
  - Division must produce a positive integer.
  - Each number instance can be used exactly once.
  - The search space is finite and relatively small.

### Search Space Size

At each step, the branching factor is at most:

$$B = P(n, 2) \times 4 = n(n-1) \times 4$$

Where $n$ is the number of available numbers at that step.

Starting with 6 tiles, across 5 steps:

| Step | Max numbers available | Max branches |
|------|-----------------------|--------------|
| 1    | 6                     | 6×5×4 = 120  |
| 2    | 5 (6 − 2 + 1)        | 5×4×4 = 80   |
| 3    | 4                     | 4×3×4 = 48   |
| 4    | 3                     | 3×2×4 = 24   |
| 5    | 2                     | 2×1×4 = 8    |

Worst-case total nodes:

$$120 \times 80 \times 48 \times 24 \times 8 = 110{,}592{,}000$$

This is a few hundred million, but with heavy pruning (invalid divisions, zero/negative results) the real search space is vastly smaller. In practice, exhaustive search is feasible.

---

## Approach 1 – Brute-Force Depth-First Search (DFS)

### Description

Enumerate every possible sequence of moves (up to 5 steps). At each step, try every ordered pair of available numbers with every operator. If any step produces the target, record the path as a solution.

### Algorithm (pseudocode)

```
function dfs(availableNumbers, equationsPlayed, target, maxSteps):
  if target in availableNumbers:
    return equationsPlayed   // found a solution!
  if |equationsPlayed| == maxSteps:
    return null              // out of steps

  for each ordered pair (a, b) in availableNumbers × availableNumbers where a ≠ b (by index):
    for each operator op in [+, −, ×, ÷]:
      result = apply(a, op, b)
      if result is a valid positive integer:
        nextNumbers = availableNumbers − {a, b} ∪ {result}
        solution = dfs(nextNumbers, equationsPlayed + [(a, op, b, result)], target, maxSteps)
        if solution != null:
          return solution

  return null
```

### Pros
- Simple to implement and understand.
- Guaranteed to find a solution if one exists.
- Fast enough for Summle's small search space (pruning reduces effective branching factor significantly).

### Cons
- Explores many redundant orderings (e.g., trying `2+3` and then `3+2` for commutative operators).
- No awareness of which moves bring you closer to the target.

### Optimisations
- **Deduplicate commutative operations**: for `+` and `×`, only try pairs where `a ≤ b` to avoid counting `2+3` and `3+2` as separate branches.
- **Early termination**: stop as soon as a single solution is found (not optimal-finding).
- **Prune negatives and fractions early**: skip any branch where the result is ≤ 0 or not an integer.

---

## Approach 2 – Breadth-First Search (BFS)

### Description

BFS explores all game states at depth 1 (all 1-step sequences), then depth 2, etc. This finds the **shortest** solution (fewest steps).

### Pros
- Finds the minimum number of steps required (optimal solution length).
- Natural separation of "level 1" and "level 2" solutions.

### Cons
- Higher memory usage than DFS, since all nodes at each depth must be stored simultaneously.
- For Summle this is not a major concern given the small search space, but it makes BFS less practical for extensions to larger puzzle sizes.

---

## Approach 3 – Iterative Deepening DFS (IDDFS)

### Description

A hybrid of DFS and BFS: run DFS limited to depth 1; if no solution found, run DFS limited to depth 2; and so on up to depth 5. This achieves BFS's optimality (shortest solution) with DFS's low memory footprint.

### Pros
- Finds the optimal (shortest-step) solution.
- Memory usage comparable to DFS.

### Cons
- Re-explores earlier depths on each iteration (overhead that is negligible for Summle's small branching factor).

---

## Approach 4 – Heuristic / Best-First Search (Greedy or A\*)

### Description

Prioritise partial search paths that have intermediate results **closest to the target** (or to promising intermediate values). Use a priority queue ordered by a heuristic distance function, e.g.:

$$h(\text{state}) = \min_{n \in \text{availableNumbers}} |n - \text{target}|$$

A* combines this heuristic with the number of steps used:

$$f(\text{state}) = g(\text{state}) + h(\text{state})$$

Where $g$ is the number of steps taken so far.

### Pros
- Likely finds a solution quickly by steering towards it.
- Can discover solutions with fewer explored nodes than exhaustive search.

### Cons
- The heuristic is crude — a number close to the target in absolute value is not necessarily close to a solution (e.g., one multiplication may double the gap).
- No guarantee that the solution found is optimal in step count.
- More complex to implement correctly.

---

## Approach 5 – Bidirectional Search

### Description

Search simultaneously from the initial state (forward) and from a state containing only the target number (backward, decomposing it into pairs). When the two frontiers meet, a solution is assembled.

### Pros
- Can dramatically reduce the effective search depth.

### Cons
- Reverse search for arithmetic is non-trivial (factoring the target into valid pairs requires its own enumeration).
- Implementation complexity is high relative to Summle's already small search space, making the benefit marginal.

---

## Recommended Approach for This Project

For a Summle solver, **brute-force DFS with pruning** (Approach 1) is the most practical starting point:

1. **Correctness is guaranteed** — it will find all solutions, not just heuristic approximations.
2. **Fast enough** — the actual search space after pruning (invalid divisions, non-positive results, commutative deduplication) is well under 10 million nodes and completes in milliseconds in JavaScript.
3. **Simple to implement and test** — the recursive structure maps directly onto the `GameState` and `Move` types already defined.

If finding the **shortest solution** is required (fewest steps), wrap DFS in iterative deepening (Approach 3) or simply sort the collected solutions by step count after the DFS completes.

### Implementation Sketch

```typescript
function solve(state: GameState): Equation[][] {
  const solutions: Equation[][] = [];
  dfs(state.availableNumbers, [], state.target, state.maxSteps, solutions);
  return solutions;
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
    return;
  }
  if (stepsLeft === 0) return;

  const moves = getPossibleMoves({ target, availableNumbers: available, completedEquations: history, maxSteps: stepsLeft });

  for (const move of moves) {
    const nextAvailable = applyMove(available, move);
    dfs(nextAvailable, [...history, move], target, stepsLeft - 1, solutions);
  }
}
```

This keeps the solver cleanly decoupled from `getPossibleMoves`, making both independently testable.
