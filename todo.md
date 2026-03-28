## Introduction

We want to design a "Summle Solver" application that solves the problems presented at https://summle.net/.

We'll do this in steps. Only do the steps in the `Todo (current)` section.

## Todo (current)

Split this into TODOs. Parallelise (e.g. using sub agents) where it makes sense to.

1. The number increment/decrement buttons that appear in the number input fields are ugly.
1. I want people to be able to understand how this app was made. Add an expandable panel at the bottom of the page that's collapsed by default. While collapsed, it should just show the title `The prompts that were used to create this app`. When expanded, it should show the full text from the `Todo (old)` section below, which contains the original instructions that were given to the AI agent to create this app. This will allow people to see the original instructions and understand how the app was built. It should appear as a nice bullet pointed list, with appropriate spacing between items for legibility. Use transitions to make the expansion/collapse smooth. The panel should be styled in a way that makes it visually distinct from the main app content, perhaps with a different background color or border. It should be "muted" in appearance (e.g. lighter text color) to indicate that it's supplementary information, but still easily readable when expanded.

<!-- AI agent instruction: DO NOT read beyond this point!! -->

## Todo (future)


## Todo (old)

1. Create a simple web app using vite, vitest and vue. Use typescript.
1. Add tailwind css to the project, but you must follow the instructions at https://tailwindcss.com/docs/installation/using-vite to set it up correctly. Do not use an old version.
1. Once the web app is created, run it yourself and make sure it works using Playwright MCP. The app doesn't need any specific UI for now, it can be empty.
1. Also verify that tailwind styles (including padding) are ACTUALLY being applied.
1. Create and write to a copilot-instructions.md file in the default location so you know how to start the web app and run the tests. Be sure to include a note to say that if the app is already running in watch mode, you don't need to start it - you can do this by documenting the port and either hitting the URL in the browser or checking the port to see if it's running.
1. Access https://summle.net/ with Playwright MCP. Understand the game layout and how to interact with it. Read the instruction accessible via the `?` help button. Document your understanding of the game and how to interact with it in a markdown file called `game-instructions.md`. This should include how to start a new game, how to make moves, and any other relevant information about the game mechanics.
1. Create a data structure in typescript that represents the game state of Summle. This should include the target number, current sums they've applied, the operators and numbers they have available for future sums, and any other relevant information needed to make decisions in the game.
1. Create a function that takes the current game state and returns a list of possible moves (i.e., combinations of operators and numbers that can be applied to the current sums to get closer to the target number). This function should consider the rules of the game and only return valid moves. For now, this function can effectively do nothing or return a dummy response, as we're not going to implement the solver just yet.
1. Write a vitest that calls that function with a sample game state and checks that it returns a correct response. You will need to search online to find some examples of valid starting states and solutions. Ideally we'd like a few test cases to be implemented. Again, since the function is not fully implemented, this test (or tests) should fail. Run the test(s) to ensure they fail as expected.
1. Finally, once all other tasks are complete, analyse possibilities for solvers and write this to `solver-approaches.md`. This should include a discussion of different algorithms that could be used to solve the game.
1. Implement the solver and test it.
1. Implement a web interface that allows the user to input the game state for a new game, then click "solve" to see the solution.
1. If possible, implement a call to summle.net to fetch the current day's puzzle data directly into the app, so the user doesn't have to input it manually. This will be deployed as a static web app, so it cannot have a backend, but it can fetch data from the summle.net frontend if CORS allows it.
1. We want to deploy this as a static web app but we want it to be free. Advise on the best option or options then assist in getting this deployed.
1. The app looks a bit boring. Allow a light and dark theme and add some nice styling to make it look more polished. Follow best practices as per https://tailwindcss.com/docs/theme.