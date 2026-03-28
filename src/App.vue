<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { solve } from './game/solver'
import type { GameState, Equation } from './game/types'

// ── theme ──────────────────────────────────────────────────────────────────
const isDark = ref(false)

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})

// ── puzzle inputs ──────────────────────────────────────────────────────────
const tiles = ref<string[]>(['', '', '', '', '', ''])
const target = ref<string>('')

// ── state ──────────────────────────────────────────────────────────────────
const loading = ref(false)
const fetchError = ref<string | null>(null)
const solutions = ref<Equation[][] | null>(null)
const solveError = ref<string | null>(null)
const elapsed = ref<number | null>(null)
const showAll = ref(false)

const PREVIEW_COUNT = 10

// ── derived ────────────────────────────────────────────────────────────────
const inputsValid = computed(() => {
  const t = Number(target.value)
  if (!Number.isInteger(t) || t <= 0) return false
  return tiles.value.every(v => {
    const n = Number(v)
    return v !== '' && Number.isInteger(n) && n > 0
  })
})

const displayedSolutions = computed(() =>
  solutions.value
    ? (showAll.value ? solutions.value : solutions.value.slice(0, PREVIEW_COUNT))
    : []
)

// ── auto-fill ──────────────────────────────────────────────────────────────
async function autoFill() {
  loading.value = true
  fetchError.value = null
  solutions.value = null
  solveError.value = null
  elapsed.value = null
  showAll.value = false
  try {
    const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent('https://summle.net/')}`
    const resp = await fetch(proxyUrl)
    if (!resp.ok) throw new Error(`Proxy returned ${resp.status}`)
    const text = await resp.text()
    const match = text.match(/window\.puzzString\s*=\s*"([^"]+)"/)
    if (!match) throw new Error('Could not find puzzle data in page')
    const parts = match[1].split(',').map(Number)
    if (parts.length !== 7) throw new Error('Unexpected puzzle format')
    tiles.value = parts.slice(0, 6).map(String)
    target.value = String(parts[6])
  } catch (e: unknown) {
    fetchError.value = e instanceof Error ? e.message : 'Unknown error fetching puzzle'
  } finally {
    loading.value = false
  }
}

// ── solve ──────────────────────────────────────────────────────────────────
function runSolve() {
  solutions.value = null
  solveError.value = null
  elapsed.value = null
  showAll.value = false
  if (!inputsValid.value) return

  const state: GameState = {
    target: Number(target.value),
    availableNumbers: tiles.value.map(Number),
    completedEquations: [],
    maxSteps: 5,
  }

  const t0 = performance.now()
  try {
    const result = solve(state, true)
    elapsed.value = Math.round(performance.now() - t0)
    solutions.value = result
    if (result.length === 0) solveError.value = 'No solution found within 5 steps.'
  } catch (e: unknown) {
    solveError.value = e instanceof Error ? e.message : 'Unknown error'
  }
}

function opSymbol(op: string) {
  return op === '×' ? '×' : op === '÷' ? '÷' : op
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300 font-sans">

    <!-- ── header ── -->
    <header class="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-gray-200 dark:border-slate-800 shadow-sm">
      <div class="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400 leading-none">
            Summle Solver
          </h1>
          <p class="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
            Solve
            <a href="https://summle.net" target="_blank" rel="noopener"
               class="underline underline-offset-2 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
              summle.net
            </a>
            puzzles instantly
          </p>
        </div>
        <!-- theme toggle -->
        <button
          @click="toggleTheme"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          class="p-2 rounded-lg text-gray-400 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
          aria-label="Toggle theme"
        >
          <!-- sun -->
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          <!-- moon -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- ── main ── -->
    <main class="max-w-xl mx-auto px-4 py-8 space-y-6">

      <!-- input card -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">

        <!-- auto-fill -->
        <button
          @click="autoFill"
          :disabled="loading"
          class="w-full mb-5 py-2.5 px-4 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <svg v-if="loading" class="size-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          {{ loading ? 'Fetching puzzle…' : "Fill today's puzzle" }}
        </button>

        <p v-if="fetchError" class="text-red-500 dark:text-red-400 text-xs mb-4 flex items-start gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-3.5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
          </svg>
          {{ fetchError }} — enter numbers manually below.
        </p>

        <!-- divider -->
        <div class="relative mb-5">
          <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-100 dark:border-slate-800"></div></div>
          <div class="relative flex justify-center">
            <span class="bg-white dark:bg-slate-900 px-3 text-xs text-gray-400 dark:text-slate-600 font-medium uppercase tracking-widest">or enter manually</span>
          </div>
        </div>

        <!-- target -->
        <div class="mb-5">
          <label class="block text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Target</label>
          <input
            v-model="target"
            type="number"
            min="1"
            placeholder="243"
            class="w-full rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-transparent dark:bg-slate-800/50 px-4 py-3 text-3xl font-black text-center text-indigo-600 dark:text-indigo-400 placeholder:text-gray-200 dark:placeholder:text-slate-700 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
          />
        </div>

        <!-- tiles -->
        <div class="mb-6">
          <label class="block text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Tiles</label>
          <div class="grid grid-cols-6 gap-2">
            <input
              v-for="(_, i) in tiles"
              :key="i"
              v-model="tiles[i]"
              type="number"
              min="1"
              class="w-full h-12 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-center text-lg font-bold text-gray-800 dark:text-slate-200 placeholder:text-gray-200 dark:placeholder:text-slate-700 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 transition-colors"
            />
          </div>
        </div>

        <!-- solve button -->
        <button
          @click="runSolve"
          :disabled="!inputsValid"
          class="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold text-lg shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          Solve
        </button>
      </div>

      <!-- ── results ── -->
      <div v-if="solutions !== null || solveError">

        <!-- error -->
        <p v-if="solveError" class="text-center text-red-500 dark:text-red-400 font-semibold py-4">
          {{ solveError }}
        </p>

        <template v-if="solutions && solutions.length > 0">

          <!-- results header -->
          <div class="flex items-center justify-between px-1 mb-3">
            <h2 class="font-bold text-gray-800 dark:text-slate-200">
              <span class="text-indigo-600 dark:text-indigo-400">{{ solutions.length }}</span>
              solution{{ solutions.length === 1 ? '' : 's' }} found
            </h2>
            <span v-if="elapsed !== null" class="text-xs text-gray-400 dark:text-slate-500 tabular-nums">{{ elapsed }} ms</span>
          </div>

          <!-- solution cards -->
          <div
            v-for="(sol, si) in displayedSolutions"
            :key="si"
            class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-4 mb-3"
          >
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide">
                Solution {{ si + 1 }}
              </span>
              <span class="text-xs text-gray-400 dark:text-slate-600 bg-gray-50 dark:bg-slate-800 rounded-full px-2 py-0.5">
                {{ sol.length }} step{{ sol.length === 1 ? '' : 's' }}
              </span>
            </div>

            <div class="space-y-1.5">
              <div
                v-for="(eq, ei) in sol"
                :key="ei"
                class="flex items-center gap-2 rounded-lg px-3 py-2"
                :class="eq.result === Number(target)
                  ? 'bg-emerald-50 dark:bg-emerald-950/40'
                  : 'bg-gray-50 dark:bg-slate-800/50'"
              >
                <span class="text-xs text-gray-300 dark:text-slate-600 w-4 text-right tabular-nums shrink-0">{{ ei + 1 }}.</span>
                <span class="font-mono font-bold text-gray-800 dark:text-slate-200 text-base min-w-[2ch] text-right">{{ eq.operand1 }}</span>
                <span class="font-mono font-bold text-indigo-500 dark:text-indigo-400 text-base w-4 text-center shrink-0">{{ opSymbol(eq.operator) }}</span>
                <span class="font-mono font-bold text-gray-800 dark:text-slate-200 text-base min-w-[2ch]">{{ eq.operand2 }}</span>
                <span class="text-gray-300 dark:text-slate-600 font-mono shrink-0">=</span>
                <span
                  class="font-mono font-bold text-base"
                  :class="eq.result === Number(target)
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'"
                >{{ eq.result }}</span>
                <span v-if="eq.result === Number(target)" class="text-emerald-500 text-sm ml-auto">✓</span>
              </div>
            </div>
          </div>

          <!-- show more -->
          <button
            v-if="solutions.length > PREVIEW_COUNT && !showAll"
            @click="showAll = true"
            class="w-full py-2.5 rounded-xl border-2 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            Show {{ solutions.length - PREVIEW_COUNT }} more solution{{ solutions.length - PREVIEW_COUNT === 1 ? '' : 's' }}
          </button>

        </template>
      </div>

    </main>
  </div>
</template>
