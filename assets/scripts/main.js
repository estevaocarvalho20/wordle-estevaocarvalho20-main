// Build the grid, capture keyboard input, and connect the DOM to game.js here.
import {
  gameConfig,
  isValidGuess,
  loadTargetWord,
  scoreGuess,
} from "./game.js";

document.addEventListener("wordle:guess-submit", async (event) => {
  const { guess, attempt } = event.detail;
  if (gameState.finished || gameState.submitting) {
    return;
  }

  gameState.submitting = true;

  try {
    const valid = await isValidGuess(guess);

    if (!valid) {
      for (let column = 0; column < gameConfig.wordLength; column += 1) {
        const cell = document.querySelector(`#cell-${attempt}-${column}`);
        if (cell) {
          shakeCell(cell);
        }
      }
      return;
    }

    const results = scoreGuess(gameState.targetWord, guess);

    results.forEach((result, column) => {
      const cell = document.querySelector(`#cell-${attempt}-${column}`);
      if (cell) {
        cell.classList.add(result);
      }
    });

    const gameResult = document.querySelector("#game-result");

    if (guess === gameState.targetWord) {
      gameState.finished = true;
      if (gameResult) {
        gameResult.textContent = "You won!";
      }
      return;
    }

    if (attempt + 1 === gameConfig.attempts) {
      gameState.finished = true;
      if (gameResult) {
        gameResult.textContent = "Game Over!";
      }
      return;
    }

    if (attempt + 1 < gameConfig.attempts) {
      gameState.currentAttempt = attempt + 1;
      gameState.currentPosition = 0;
    }
  } catch (error) {
    console.error("Error validating guess:", error);
    const result = document.querySelector("#game-result");
    if (result) {
      result.textContent = "Could not validate guess. Please try again.";
    }
  } finally {
    gameState.submitting = false;
  }
});

const gameState = {
  targetWord: "",
  currentAttempt: 0,
  currentPosition: 0,
  guesses: Array.from({ length: gameConfig.attempts }, () =>
    Array(gameConfig.wordLength).fill(""),
  ),
  finished: false,
  submitting: false,
};

const grid = document.querySelector("#wordle-grid");

if (grid) {
  for (let row = 0; row < gameConfig.attempts; row += 1) {
    for (let column = 0; column < gameConfig.wordLength; column += 1) {
      const cell = document.createElement("div");
      cell.id = `cell-${row}-${column}`;
      cell.className = "letter";
      grid.appendChild(cell);
    }
  }
}

async function initializeGame() {
  gameState.submitting = true;

  try {
    gameState.targetWord = await loadTargetWord();
  } catch (error) {
    console.error("Error loading target word:", error);
    gameState.finished = true;
    const result = document.querySelector("#game-result");
    if (result) {
      result.textContent = "Could not load the target word. Please refresh.";
    }
  } finally {
    gameState.submitting = false;
  }
}

initializeGame();

function shakeCell(cell) {
  cell.classList.remove("animate__animated", "animate__shakeX");
  void cell.offsetWidth;
  cell.classList.add("animate__animated", "animate__shakeX");
}

function handleEnter() {
  const guess = gameState.guesses[gameState.currentAttempt];
  const missingColumns = guess
    .map((letter, column) => (letter === "" ? column : -1))
    .filter((column) => column !== -1);

  if (missingColumns.length > 0) {
    for (const column of missingColumns) {
      const cell = document.querySelector(
        `#cell-${gameState.currentAttempt}-${column}`,
      );
      if (cell) {
        shakeCell(cell);
      }
    }
    return;
  }

  document.dispatchEvent(
    new CustomEvent("wordle:guess-submit", {
      detail: {
        guess: guess.join(""),
        attempt: gameState.currentAttempt,
      },
    }),
  );
}

document.addEventListener("keydown", (event) => {
  if (gameState.finished || gameState.submitting) {
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    handleEnter();
    return;
  }

  if (event.key === "Backspace") {
    event.preventDefault();
    if (gameState.currentPosition === 0) {
      return;
    }

    gameState.currentPosition -= 1;
    gameState.guesses[gameState.currentAttempt][gameState.currentPosition] = "";
    const cell = document.querySelector(
      `#cell-${gameState.currentAttempt}-${gameState.currentPosition}`,
    );
    if (cell) {
      cell.textContent = "";
    }
    return;
  }

  if (!/^[a-z]$/i.test(event.key)) {
    return;
  }

  if (gameState.currentPosition >= gameConfig.wordLength) {
    return;
  }

  const letter = event.key.toLowerCase();
  const row = gameState.currentAttempt;
  const column = gameState.currentPosition;
  gameState.guesses[row][column] = letter;

  const cell = document.querySelector(`#cell-${row}-${column}`);
  if (cell) {
    cell.textContent = letter;
  }
  gameState.currentPosition += 1;
});
