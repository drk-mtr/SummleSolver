<script setup lang="ts">
defineProps<{ isDark: boolean }>()
defineEmits<{ toggle: [] }>()
</script>

<template>
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
      <button
        @click="$emit('toggle')"
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
</template>
