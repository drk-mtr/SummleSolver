<script setup lang="ts">
const props = defineProps<{
  tiles: string[]
  target: string
  loading: boolean
  fetchError: string | null
  inputsValid: boolean
}>()

const emit = defineEmits<{
  'update:tiles': [value: string[]]
  'update:target': [value: string]
  'auto-fill': []
  'solve': []
}>()

function updateTile(i: number, value: string) {
  const updated = [...props.tiles]
  updated[i] = value
  emit('update:tiles', updated)
}
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">

    <!-- auto-fill -->
    <button
      @click="$emit('auto-fill')"
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
        :value="target"
        @input="$emit('update:target', ($event.target as HTMLInputElement).value)"
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
          v-for="(tile, i) in tiles"
          :key="i"
          :value="tile"
          @input="updateTile(i, ($event.target as HTMLInputElement).value)"
          type="number"
          min="1"
          class="w-full h-12 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-center text-lg font-bold text-gray-800 dark:text-slate-200 placeholder:text-gray-200 dark:placeholder:text-slate-700 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 transition-colors"
        />
      </div>
    </div>

    <!-- solve button -->
    <button
      @click="$emit('solve')"
      :disabled="!inputsValid"
      class="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold text-lg shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
    >
      Solve
    </button>
  </div>
</template>
