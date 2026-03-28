<script setup lang="ts">
import { ref, computed } from 'vue'
import { solve } from './game/solver'
import type { GameState, Equation } from './game/types'

// ── puzzle inputs ──────────────────────────────────────────────────────────
const tiles = ref<string[]>(['', '', '', '', '', ''])
const target = ref<string>('')

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
    // corsproxy.io is a free CORS proxy; append the target URL as a query parameter
    const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent('https://summle.net/')}`
    const resp = await fetch(proxyUrl)
    if (!resp.ok) throw new Error(`Proxy returned ${resp.status}`)
    const text = await resp.text()
    const match = text.match(/window\.puzzString\s*=\s*"([^"]+)"/)
    if (!match) throw new Error('Could not find puzzle data in page')
    const parts = match[1].split(',').map(Number)
    // format: t1,t2,t3,t4,t5,t6,target
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
  if (!inputsValid.value) return

  const state: GameState = {
    target: Number(target.value),
    availableNumbers: tiles.value.map(Number),
    completedEquations: [],
    maxSteps: 5,
  }

  const t0 = performance.now()
  try {
    const result = solve(state, true)   // find ALL solutions
    elapsed.value = Math.round(performance.now() - t0)
    solutions.value = result
    if (result.length === 0) solveError.value = 'No solution found within 5 steps.'
  } catch (e: unknown) {
    solveError.value = e instanceof Error ? e.message : 'Unknown error'
  }
}

// ── display helpers ────────────────────────────────────────────────────────
function opSymbol(op: string) {
  return op === '×' ? '×' : op === '÷' ? '÷' : op
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">

    <!-- header -->
    <div class="mb-8 text-center">
      <h1 class="text-4xl font-bold text-indigo-600 tracking-tight">Summle Solver</h1>
      <p class="mt-1 text-gray-500 text-sm">
        Solve today's <a href="https://summle.net" target="_blank" class="underline hover:text-indigo-500">summle.net</a> puzzle
      </p>
    </div>

    <!-- input card -->
    <div class="w-full max-w-lg bg-white rounded-2xl shadow-md p-6">

      <!-- auto-fill -->
      <div class="flex items-center gap-3 mb-6">
        <button
          @click="autoFill"
          :disabled="loading"
          class="flex-1 py-2 px-4 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {{ loading ? 'Fetching…' : "⬇ Auto-fill today's puzzle" }}
        </button>
      </div>
      <p v-if="fetchError" class="text-red-500 text-xs mb-4">⚠ {{ fetchError }} — please enter the numbers manually.</p>

      <!-- target -->
      <div class="mb-5">
        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Target</label>
        <input
          v-model="target"
          type="number"
          min="1"
          placeholder="e.g. 243"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-xl font-bold text-center text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <!-- tiles -->
      <div class="mb-6">
        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tiles (6 numbers)</label>
        <div class="grid grid-cols-6 gap-2">
          <input
            v-for="(_, i) in tiles"
            :key="i"
            v-model="tiles[i]"
            type="number"
            min="1"
            class="border border-gray-300 rounded-lg px-1 py-2 text-center font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>

      <!-- solve button -->
      <button
        @click="runSolve"
        :disabled="!inputsValid"
        class="w-full py-3 rounded-xl bg-green-600 text-white font-bold text-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        Solve
      </button>
    </div>

    <!-- results -->
    <div v-if="solutions !== null || solveError" class="w-full max-w-lg mt-6">

      <p v-if="solveError" class="text-red-600 font-semibold text-center">{{ solveError }}</p>

      <template v-if="solutions && solutions.length > 0">
        <div class="flex items-center justify-between mb-3 px-1">
          <h2 class="text-lg font-bold text-gray-700">
            {{ solutions.length }} solution{{ solutions.length === 1 ? '' : 's' }} found
          </h2>
          <span v-if="elapsed !== null" class="text-xs text-gray-400">{{ elapsed }}ms</span>
        </div>

        <!-- solution cards -->
        <div
          v-for="(sol, si) in solutions"
          :key="si"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4"
        >
          <div class="text-xs font-semibold text-gray-400 mb-2">Solution {{ si + 1 }} · {{ sol.length }} step{{ sol.length === 1 ? '' : 's' }}</div>
          <div
            v-for="(eq, ei) in sol"
            :key="ei"
            class="flex items-center gap-2 py-1 border-b border-gray-50 last:border-0"
          >
            <span class="w-5 text-xs text-gray-400 text-right">{{ ei + 1 }}.</span>
            <span class="font-mono font-bold text-gray-800 text-lg">{{ eq.operand1 }}</span>
            <span class="font-mono text-indigo-500 font-bold text-lg w-5 text-center">{{ opSymbol(eq.operator) }}</span>
            <span class="font-mono font-bold text-gray-800 text-lg">{{ eq.operand2 }}</span>
            <span class="text-gray-400 font-mono">=</span>
            <span
              class="font-mono font-bold text-lg"
              :class="eq.result === Number(target) ? 'text-green-600' : 'text-amber-600'"
            >{{ eq.result }}</span>
            <span v-if="eq.result === Number(target)" class="text-green-500 text-sm ml-1">✓</span>
          </div>
        </div>
      </template>
    </div>

  </div>
</template>
