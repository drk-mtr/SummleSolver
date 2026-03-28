<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
</script>

<template>
  <div class="rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
    <button
      @click="open = !open"
      class="w-full flex items-center justify-between px-5 py-4 text-left bg-gray-100/60 dark:bg-slate-900/60 hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-colors"
      :aria-expanded="open"
    >
      <span class="text-sm font-medium text-gray-400 dark:text-slate-500">
        The prompts that were used to create this app
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="size-4 text-gray-300 dark:text-slate-600 transition-transform duration-300 shrink-0"
        :class="open ? 'rotate-180' : ''"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>

    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-[2000px]"
      leave-from-class="opacity-100 max-h-[2000px]"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="open" class="overflow-hidden">
        <div class="px-5 py-5 bg-gray-50/80 dark:bg-slate-900/40 border-t border-gray-200 dark:border-slate-800">
          <ol class="list-decimal list-outside ml-4 space-y-3 text-sm text-gray-400 dark:text-slate-500 leading-relaxed">
            <li>Create a simple web app using Vite, Vitest and Vue. Use TypeScript.</li>
            <li>Add Tailwind CSS to the project, following the official Vite installation instructions. Do not use an old version.</li>
            <li>Once the web app is created, run it yourself and make sure it works using Playwright MCP. The app doesn't need any specific UI for now, it can be empty.</li>
            <li>Also verify that Tailwind styles (including padding) are ACTUALLY being applied.</li>
            <li>Create and write to a <code class="font-mono text-xs bg-gray-200 dark:bg-slate-800 rounded px-1">copilot-instructions.md</code> file in the default location so you know how to start the web app and run the tests. Be sure to include a note to say that if the app is already running in watch mode, you don't need to start it — you can do this by documenting the port and either hitting the URL in the browser or checking the port to see if it's running.</li>
            <li>Access <a href="https://summle.net" target="_blank" rel="noopener" class="underline underline-offset-2 hover:text-indigo-400 transition-colors">summle.net</a> with Playwright MCP. Understand the game layout and how to interact with it. Read the instruction accessible via the <code class="font-mono text-xs bg-gray-200 dark:bg-slate-800 rounded px-1">?</code> help button. Document your understanding of the game in a markdown file called <code class="font-mono text-xs bg-gray-200 dark:bg-slate-800 rounded px-1">game-instructions.md</code>. This should include how to start a new game, how to make moves, and any other relevant information about the game mechanics.</li>
            <li>Create a data structure in TypeScript that represents the game state of Summle. This should include the target number, current sums they've applied, the operators and numbers they have available for future sums, and any other relevant information needed to make decisions in the game.</li>
            <li>Create a function that takes the current game state and returns a list of possible moves (i.e., combinations of operators and numbers that can be applied to the current sums to get closer to the target number). This function should consider the rules of the game and only return valid moves. For now, this function can effectively do nothing or return a dummy response, as we're not going to implement the solver just yet.</li>
            <li>Write a Vitest that calls that function with a sample game state and checks that it returns a correct response. You will need to search online to find some examples of valid starting states and solutions. Ideally we'd like a few test cases to be implemented. Again, since the function is not fully implemented, this test (or tests) should fail. Run the test(s) to ensure they fail as expected.</li>
            <li>Finally, once all other tasks are complete, analyse possibilities for solvers and write this to <code class="font-mono text-xs bg-gray-200 dark:bg-slate-800 rounded px-1">solver-approaches.md</code>. This should include a discussion of different algorithms that could be used to solve the game.</li>
            <li>Implement the solver and test it.</li>
            <li>Implement a web interface that allows the user to input the game state for a new game, then click "Solve" to see the solution.</li>
            <li>If possible, implement a call to summle.net to fetch the current day's puzzle data directly into the app, so the user doesn't have to input it manually. This will be deployed as a static web app, so it cannot have a backend, but it can fetch data from the summle.net frontend if CORS allows it.</li>
            <li>We want to deploy this as a static web app but we want it to be free. Advise on the best option or options then assist in getting this deployed.</li>
            <li>The app looks a bit boring. Allow a light and dark theme and add some nice styling to make it look more polished. Follow best practices as per the Tailwind CSS theme documentation.</li>
            <li>The number increment/decrement buttons that appear in the number input fields are ugly.</li>
            <li>I want people to be able to understand how this app was made. Add an expandable panel at the bottom of the page that's collapsed by default showing the prompts used to create it.</li>
            <li>App.vue is getting big. Componentise where possible.</li>
            <li>The app shows <code class="font-mono text-xs bg-gray-200 dark:bg-slate-800 rounded px-1">243</code> in the target before we've even populated any values.</li>
          </ol>
        </div>
      </div>
    </Transition>
  </div>
</template>
