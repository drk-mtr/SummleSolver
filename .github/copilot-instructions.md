# Summle Solver – Copilot Instructions

## Project Overview

This is a Vite + Vue 3 + TypeScript application with Tailwind CSS v4 and Vitest.  
It models and solves puzzles from [https://summle.net/](https://summle.net/).

## Starting the Dev Server

```bash
cd /mnt/ext4data/coding/SummleSolver
npm run dev
```

The dev server runs at **http://localhost:5173**.

> **Note:** If the dev server is already running in watch mode (check if port 5173 is already in use), you do **not** need to start it again. You can verify it is running by navigating to http://localhost:5173 with a browser or Playwright.

## Running Tests

```bash
npm test          # run all tests once
npm run test:watch  # run tests in watch mode
```

Tests use **Vitest** with `jsdom` as the test environment.

## Tech Stack

| Tool | Purpose |
|------|---------|
| Vite 8 | Build tool & dev server |
| Vue 3 | UI framework |
| TypeScript | Language |
| Tailwind CSS v4 (`@tailwindcss/vite`) | Styling – use the Vite plugin, NOT PostCSS |
| Vitest | Unit testing |
| `@vue/test-utils` | Vue component testing helpers |

## Key Files

- `src/game/types.ts` – TypeScript types for game state
- `src/game/moves.ts` – `getPossibleMoves()` function
- `src/game/moves.test.ts` – Vitest tests for the above
- `src/style.css` – Contains only `@import "tailwindcss";`
- `vite.config.ts` – Vite config (includes Tailwind plugin and Vitest config)

## Tailwind Notes

Tailwind v4 is configured as a **Vite plugin** (`@tailwindcss/vite`).  
Do **not** use `tailwind.config.js` or PostCSS config — this version does not need them.  
The sole Tailwind entry point is `@import "tailwindcss";` in `src/style.css`.
