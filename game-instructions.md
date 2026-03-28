# Summle – Game Instructions

Source: [https://summle.net/](https://summle.net/)

## What is Summle?

Summle is a daily maths puzzle. A new puzzle is released every day (e.g. puzzle #1492 on 2026-03-28).  
The objective is to reach a **target number** by combining six given number tiles through a series of arithmetic equations, using **5 steps or fewer**.

---

## Game Layout

```
┌─────────────────────────────────────────┐
│              Target: 243                │
│                                         │
│  [ ] + [ ] = [   ]                      │  ← Step 1
│  [ ] + [ ] = [   ]                      │  ← Step 2
│  [ ] + [ ] = [   ]                      │  ← Step 3
│  [ ] + [ ] = [   ]                      │  ← Step 4
│  [ ] + [ ] = [   ]                      │  ← Step 5
│                                         │
│  C  +  −  ×  ÷  ↩                      │  ← Operators + Undo/Clear
│                                         │
│  [2] [2] [4] [4] [5] [100]             │  ← Number tiles
└─────────────────────────────────────────┘
```

### UI Components

| Element | Description |
|---------|-------------|
| **Target** | The number displayed at the top that you must reach. |
| **Number tiles** | Six clickable tiles at the bottom of the screen. Each can be used **at most once**. |
| **Equation rows** | Up to 5 rows; each row holds: `[first number] [operator] [second number] = [subtotal]` |
| **Operators** | `+`, `−`, `×`, `÷` — clicked to select the operation for the current row. |
| **Subtotal tiles** | Yellow tiles that appear after completing a row. They can be used as operands in subsequent rows. |
| **C (Clear)** | Clears the current in-progress equation row. |
| **Undo (↩)** | Undo the last completed equation. |
| **Help (?)** | Opens the "How to play" modal. |

---

## How to Make a Move

1. **Click a number tile** (from the bottom row, or from a previous row's yellow subtotal). This becomes the **first operand** and is marked as "used".
2. **Click an operator** (`+`, `−`, `×`, `÷`). This is placed in the middle of the equation.
3. **Click a second number tile** (any remaining available tile or yellow subtotal).
4. The equation **auto-completes**: the result appears as a yellow subtotal tile for that row.
5. Move to the **next row**. Repeat.

### Interaction Steps (DOM internals)

Each equation row in the DOM has the following structure:

```
[g(n)   .digit]  – first operand slot
[g(n+1) .operand] – operator slot (becomes active after first operand selected)
[g(n+2) .digit]  – second operand slot
[.equals]         – static "=" text
[g(n+3) .subtotal] – result (shown in yellow when the equation is complete)
```

- Tiles cycle through classes: `number` → `number used` once clicked.
- Subtotal tiles have `class="subtotal valid"` when complete and can be clicked to use in a future row.
- The currently-active input slot has `class="... active"`.

---

## Rules

1. **Each of the 6 starting number tiles can be used at most once** across all steps.
2. **Subtotals from completed rows can be used as operands in later rows** (each subtotal can also only be used once).
3. **You do not have to use all tiles** — use only what you need.
4. **You have at most 5 steps** (equations) to reach the target.
5. **There is always at least one valid solution** for each puzzle.
6. **Division** must produce a positive integer (no fractions, no zero divisor).

---

## Starting a New Game

- A new puzzle is automatically presented when you navigate to https://summle.net/ on a new day.
- Puzzle data is embedded in the page as `window.puzzString = "t1,t2,t3,t4,t5,t6,target"` and `window.target = <number>`.

---

## Puzzle Data Format

```js
window.target    = 243;          // The target number
window.puzzString = "2,2,4,4,5,100,243";  // Comma-separated tiles + target
window.puzzNumber = "1492";      // Puzzle index number
window.today     = "28-03-2026"; // Date of the puzzle
```

---

## Example Puzzle

**Puzzle #1492 (2026-03-28)**  
Target: **243**  
Tiles: `2, 2, 4, 4, 5, 100`

One possible solution approach (illustrative):
```
Step 1:  5  −  2  = 3
Step 2:  3  ×  100 = 300   ← uses subtotal from step 1
Step 3: ...
```

---

## Scoring

The game tracks how many steps you needed and compares it to other players' results each day.  
Completing the puzzle in fewer steps is better.
