# Wordle

Build a browser-based Wordle game with HTML, CSS, and JavaScript. The finished
game loads a five-letter target word, accepts keyboard guesses, validates each
guess, scores letters accurately, and announces a win or loss. This assignment
practices DOM construction, events, state management, asynchronous `fetch`, and
local end-to-end testing.

Canvas and this README are the official assignment instructions. You do not need
to deploy this project or use GitHub Pages.

## Repository and submission contract

- Work in the private repository named `wordle-<github-username>` that was
  created for you in the `IT3049C-26FS` organization.
- Keep the repository private. Your instructor and TA already have access; do
  not remove them or change repository visibility.
- Submit the repository URL in Canvas by the deadline.
- Do not submit a hosted-site URL, a file upload, or pasted source code.

## Local setup

Use Node.js 20.19 or newer. From the repository directory, run:

```sh
npm ci
npx playwright install chromium
npm test
```

`npm test` starts the project on `http://127.0.0.1:4174`, runs the Playwright
checks, and shuts the test server down. The tests intercept both word APIs and
use deterministic local responses. They do not make requests to the live
services.

For manual development, run:

```sh
npm start
```

Then open `http://127.0.0.1:4174`. Stop the server with `Ctrl+C`. Before
submission, also confirm the production build succeeds:

```sh
npm run build
```

## File responsibilities

- `index.html`: accessible page structure and local asset references.
- `assets/styles/style.css`: layout, theme variables, tile states, and
  validation animation.
- `assets/scripts/game.js`: configuration, API requests, word validation, and
  guess-scoring logic. Keep DOM manipulation out of this file.
- `assets/scripts/main.js`: grid construction, game state, keyboard events, and
  DOM updates.
- `assets/scripts/dark-mode-toggle.js`: light/dark theme behavior.

## Technical requirements

### 1. Accessible layout and theme

In `index.html`:

- Keep the page title `Wordle`.
- Add a `header` containing an `h1` with the text **Wordle**.
- Add a button with `id="mode-toggle"` and an accessible name containing
  “Toggle color theme.” The visible content may be `🌞/🌙`.
- Add a `main` element with `id="game"`.
- Inside `#game`, add an empty `div` with `id="wordle-grid"`.
- Add an element with `id="game-result"`, `role="status"`, and
  `aria-live="polite"` so game results are announced.
- Keep the supplied local stylesheet and script references.

Define dark-mode colors as CSS custom properties. Add a `.light-mode` rule that
overrides those properties. Clicking the theme button must toggle the
`light-mode` class on `body` without replacing other body classes.

### 2. Dynamic grid and keyboard input

Use this configuration:

```js
const gameConfig = { attempts: 6, wordLength: 5 };
```

Create all 30 cells with JavaScript. Every cell must:

- be inside `#wordle-grid`;
- have class `letter`; and
- have an ID in the form `cell-<row>-<column>`, from `cell-0-0` through
  `cell-5-4`.

Listen for `keydown` events on the document:

- A single letter adds its lowercase value to the current cell and game state.
- Nonletter keys are ignored.
- `Backspace` removes the most recently entered letter from the current row.
- No more than five letters may be entered in one attempt.
- `Enter` submits the current guess.

If a guess is incomplete, keep the game on the same attempt and add the classes
`animate__animated` and `animate__shakeX` to each missing cell. Animate.css is
installed, but you may instead provide an equivalent local animation for those
classes.

### 3. Game state and guess scoring

Track at least:

- the target word;
- the current attempt and position;
- a six-by-five array containing entered letters; and
- whether the game is finished or currently submitting a guess.

For a valid five-letter guess, assign exactly one of these classes to every tile:

- `correct`: the letter matches the target at the same position;
- `misplaced`: the letter occurs in a different available target position; or
- `incorrect`: no unused occurrence of that letter remains in the target.

Repeated letters must be scored by occurrence count. First mark exact matches,
then use only the unmatched target letters when assigning `misplaced`. For
example, with target `hello`, guess `level` produces:

```text
misplaced, correct, incorrect, incorrect, misplaced
```

### 4. Network requests

Load a five-letter target word from:

```text
https://random-word-api.herokuapp.com/word?length=5
```

Before scoring a submitted guess, validate it with:

```text
https://api.dictionaryapi.dev/api/v2/entries/en/<guess>
```

A successful dictionary response means the word is valid. A non-success
response means it is invalid. For an invalid word:

- do not advance the attempt;
- retain the entered guess so the player can edit it; and
- add `animate__animated` and `animate__shakeX` to all five current-row cells.

The live services are for brief manual testing. Never send personal or sensitive
information. Automated tests are fully local and safe to run repeatedly.

### 5. Win and loss states

- When the guess equals the target, mark all five tiles `correct`, stop accepting
  input, and set `#game-result` to exactly `You won!`.
- After six valid incorrect guesses, stop accepting input and set
  `#game-result` to exactly `Game Over!`.
- A rejected or incomplete guess does not consume an attempt.

## Testing and code quality

Run `npm test` frequently. All nine checks and `npm run build` must pass before
submission. The tests cover structure, grid generation, keyboard controls,
validation, repeated-letter scoring, API-driven behavior, win/loss states, and
theme toggling.

Keep functions focused and names descriptive. Separate game rules from DOM
updates, avoid duplicated scoring logic, and do not change the tests merely to
make an incorrect solution pass.

## Git history

Make at least five meaningful commits that show how your solution developed.
For example:

1. build the accessible page and theme;
2. create the dynamic grid and keyboard controls;
3. implement word validation and scoring;
4. connect the live APIs and game-result states; and
5. finish local tests, cleanup, and reflection.

Commit messages should describe the change. A single end-of-project commit or a
series of messages such as “update” does not demonstrate the required workflow.

## Reflection

Replace the prompts below with your answers before submitting.

1. Approximately how long did this assignment take, and where did you spend the most time?
   I took an entire night and almost a full day dedicated for it, Most time that I spended is 100% step 2 was the most confusing and made me look even in outside sources to learn how could I make it.
2. How does your scoring algorithm prevent duplicate letters from being marked
   `misplaced` too many times?
   my algorithm marks the position as correct and counts as only target, then check the unscored guess marking as misplaced, reducing its count and and making it not be used more than once.
3. How did you separate game rules from DOM manipulation?
   I put score and api in game.js while my DOM is on main.js
4. What did the deterministic API tests help you diagnose?
   They let me predict target and accepted and rejected guesses without live service. Helping validation and incrementing its own behavior.

## Final checklist

- [ ] `npm test` reports all nine checks passing.
- [ ] `npm run build` succeeds.
- [ ] A brief manual check can start and play the game with the live APIs.
- [ ] The repository is private and has the required name.
- [ ] The Git history contains at least five meaningful commits.
- [ ] All four reflection questions are answered in this README.
- [ ] The private GitHub repository URL is submitted in Canvas.
