<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { solve } from './game/solver'
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
    const result = solve(state, true)
    elapsed.value = Math.round(performance.now() - t0)
    solutions.value = result
    if (result.length === 0) solveError.value = 'No solution found within 5 steps.'
  } catch (e: unknown) {
    solveError.value = e instanceof Error ? e.message : 'Unknown error'
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
