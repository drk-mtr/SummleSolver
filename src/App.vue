<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { solve } from './game/solver'
import { solveOptimized } from './game/solver-optimized'
import { solveWasm } from './game/solver-wasm'
import type { GameState, Equation } from './game/types'
import AppHeader from './components/AppHeader.vue'
import PuzzleInput, { type PuzzleMode } from './components/PuzzleInput.vue'
import SolutionList from './components/SolutionList.vue'
import PromptsPanel from './components/PromptsPanel.vue'

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
const mode = ref<PuzzleMode>('normal')

// ── solver implementation selector ────────────────────────────────────────
type SolverImpl = 'original' | 'optimised' | 'wasm'
const solverImpl = ref<SolverImpl>('wasm')

const SOLVER_LABELS: Record<SolverImpl, string> = {
  original:  'Original TS',
  optimised: 'Optimised TS',
  wasm:      'Rust WASM',
}

// ── state ──────────────────────────────────────────────────────────────────
const loading = ref(false)
const fetchError = ref<string | null>(null)
const solutions = ref<Equation[][] | null>(null)
const solveError = ref<string | null>(null)
const elapsed = ref<number | null>(null)

// ── derived ────────────────────────────────────────────────────────────────
const inputsValid = computed(() => {
  const t = Number(target.value)
  if (!Number.isInteger(t) || t <= 0) return false
  return tiles.value.every(v => {
    const n = Number(v)
    return v !== '' && Number.isInteger(n) && n > 0
  })
})

// ── auto-fill ──────────────────────────────────────────────────────────────
async function autoFill() {
  loading.value = true
  fetchError.value = null
  solutions.value = null
  solveError.value = null
  elapsed.value = null
  try {
    const modeSegment = mode.value === 'normal' ? '' : `${mode.value}/`
    const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(`https://summle.net/${modeSegment}`)}`
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
async function runSolve() {
  solutions.value = null
  solveError.value = null
  elapsed.value = null
  if (!inputsValid.value) return

  const state: GameState = {
    target: Number(target.value),
    availableNumbers: tiles.value.map(Number),
    completedEquations: [],
    maxSteps: 5,
  }

  loading.value = true
  const t0 = performance.now()
  try {
    let result: Equation[][]
    if (solverImpl.value === 'wasm') {
      result = await solveWasm(state, true)
    } else if (solverImpl.value === 'optimised') {
      result = solveOptimized(state, true)
    } else {
      result = solve(state, true)
    }
    elapsed.value = Math.round(performance.now() - t0)
    solutions.value = result
    if (result.length === 0) solveError.value = 'No solution found within 5 steps.'
  } catch (e: unknown) {
    solveError.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
    <AppHeader :is-dark="isDark" @toggle="toggleTheme" />
    <main class="max-w-xl mx-auto px-4 py-8 space-y-6">
      <PuzzleInput
        :tiles="tiles"
        :target="target"
        :loading="loading"
        :fetch-error="fetchError"
        :inputs-valid="inputsValid"
        :mode="mode"
        @update:tiles="tiles = $event"
        @update:target="target = $event"
        @update:mode="mode = $event"
        @auto-fill="autoFill"
        @solve="runSolve"
      />

      <!-- ── solver selector ──────────────────────────────────────────── -->
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide shrink-0">Engine</span>
        <div class="flex rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 text-sm">
          <button
            v-for="impl in (['original', 'optimised', 'wasm'] as const)"
            :key="impl"
            class="px-3 py-1.5 font-medium transition-colors"
            :class="solverImpl === impl
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'"
            @click="solverImpl = impl"
          >{{ SOLVER_LABELS[impl] }}</button>
        </div>
      </div>

      <SolutionList
        :solutions="solutions"
        :solve-error="solveError"
        :target="target"
        :elapsed="elapsed"
      />
      <PromptsPanel />
    </main>
  </div>
</template>
