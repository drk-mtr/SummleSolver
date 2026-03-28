<script setup lang="ts">
import { ref } from 'vue'
import type { Equation } from '../game/types'

const props = defineProps<{
  solutions: Equation[][] | null
  solveError: string | null
  target: string
  elapsed: number | null
}>()

const showAll = ref(false)
const PREVIEW_COUNT = 10

function opSymbol(op: string) {
  return op === '×' ? '×' : op === '÷' ? '÷' : op
}
</script>

<template>
  <div v-if="solutions !== null || solveError">

    <p v-if="solveError" class="text-center text-red-500 dark:text-red-400 font-semibold py-4">
      {{ solveError }}
    </p>

    <template v-if="solutions && solutions.length > 0">

      <!-- header -->
      <div class="flex items-center justify-between px-1 mb-3">
        <h2 class="font-bold text-gray-800 dark:text-slate-200">
          <span class="text-indigo-600 dark:text-indigo-400">{{ solutions.length }}</span>
          solution{{ solutions.length === 1 ? '' : 's' }} found
        </h2>
        <span v-if="elapsed !== null" class="text-xs text-gray-400 dark:text-slate-500 tabular-nums">{{ elapsed }} ms</span>
      </div>

      <!-- solution cards -->
      <div
        v-for="(sol, si) in (showAll ? solutions : solutions.slice(0, PREVIEW_COUNT))"
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
</template>
