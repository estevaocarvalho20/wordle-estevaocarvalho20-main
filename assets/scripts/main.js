// Build the grid, capture keyboard input, and connect the DOM to game.js here.
import "animate.css";
import {
  checkGuess,
  gameConfig,
  gameState,
  getRandomWord,
  isValidWord,
} from "./game.js";

const grid = document.querySelector("#wordle-grid");
const gameResultsParagraph = document.querySelector("#game-result");

function addTileToGrid(row, column) {
  const tile = document.createElement("div");
  tile.className = "letter";
  tile.id = `cell-${row}-${column}`;
  tile.dataset.row = String(row);
  tile.dataset.column = String(column);
  grid.appendChild(tile);
}

function setupGrid() {
  if (!grid) {
    return;
  }

  grid.replaceChildren();
  grid.style.gridTemplateColumns = `repeat(${gameConfig.wordLength}, 60px)`;

  for (let row = 0; row < gameConfig.attempts; row += 1) {
    for (let column = 0; column < gameConfig.wordLength; column += 1) {
      addTileToGrid(row, column);
    }
  }
}

function isLetter(letter) {
  return /^[a-z]$/i.test(letter);
}

function animateElement(element, animation) {
  if (!element) {
    return;
  }

  const animationClass = `animate__${animation}`;
  element.classList.remove("animate__animated", animationClass);
  void element.offsetWidth;
  element.classList.add("animate__animated", animationClass);
  element.addEventListener(
    "animationend",
    () => {
      element.classList.remove("animate__animated", animationClass);
    },
    { once: true },
  );
}

function addLetter(letter) {
  if (gameState.currentPosition >= gameConfig.wordLength) {
    return;
  }

  const row = gameState.currentAttempt;
  const column = gameState.currentPosition;
  const tile = document.querySelector(`#cell-${row}-${column}`);

  gameState.guesses[row][column] = letter.toLowerCase();
  if (tile) {
    tile.textContent = letter.toLowerCase();
    animateElement(tile, "bounceIn");
  }
  gameState.currentPosition += 1;
}

function removeLetter() {
  if (gameState.currentPosition === 0) {
    return;
  }

  gameState.currentPosition -= 1;
  gameState.guesses[gameState.currentAttempt][gameState.currentPosition] = "";

  const tile = document.querySelector(
    `#cell-${gameState.currentAttempt}-${gameState.currentPosition}`,
  );
  if (tile) {
    tile.textContent = "";
  }
}

function shakeRow(columns = Array.from(
  { length: gameConfig.wordLength },
  (_, column) => column,
)) {
  for (const column of columns) {
    const tile = document.querySelector(
      `#cell-${gameState.currentAttempt}-${column}`,
    );
    animateElement(tile, "shakeX");
  }
}

function showMessage(message) {
  if (gameResultsParagraph) {
    gameResultsParagraph.textContent = message;
  }
}

function lockInput() {
  gameState.finished = true;
}

function revealResults(results) {
  const delayBetweenTileReveal = 300;

  results.forEach((result, column) => {
    const tile = document.querySelector(
      `#cell-${gameState.currentAttempt}-${column}`,
    );

    if (!tile) {
      return;
    }

    tile.classList.add(result);
    window.setTimeout(
      () => animateElement(tile, "flipInX"),
      column * delayBetweenTileReveal,
    );
  });
}

async function submitGuess() {
  if (gameState.currentPosition !== gameConfig.wordLength) {
    const missingColumns = gameState.guesses[gameState.currentAttempt]
      .map((letter, column) => (letter === "" ? column : -1))
      .filter((column) => column !== -1);
    shakeRow(missingColumns);
    return;
  }

  const guess = gameState.guesses[gameState.currentAttempt].join("");
  gameState.submitting = true;

  try {
    const isValid = await isValidWord(guess);

    if (!isValid) {
      shakeRow();
      return;
    }

    const results = checkGuess(gameState.targetWord, guess);
    revealResults(results);

    const isWon = results.every((result) => result === "correct");
    if (isWon) {
      lockInput();
      showMessage("You won!");
      return;
    }

    if (gameState.currentAttempt === gameConfig.attempts - 1) {
      lockInput();
      showMessage("Game Over!");
      return;
    }

    gameState.currentAttempt += 1;
    gameState.currentPosition = 0;
  } catch (error) {
    console.error(`Failed to validate guess "${guess}":`, error);
    showMessage("Could not validate guess. Please try again.");
  } finally {
    gameState.submitting = false;
  }
}

function handleKeydown(event) {
  if (gameState.finished || gameState.submitting) {
    return;
  }

  if (isLetter(event.key)) {
    addLetter(event.key);
    return;
  }

  if (event.key === "Backspace") {
    event.preventDefault();
    removeLetter();
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    void submitGuess();
  }
}

async function initializeGame() {
  gameState.submitting = true;

  try {
    gameState.targetWord = await getRandomWord();
  } catch (error) {
    console.error("Error loading target word:", error);
    lockInput();
    showMessage("Could not load the target word. Please refresh.");
  } finally {
    gameState.submitting = false;
  }
}

setupGrid();
document.addEventListener("keydown", handleKeydown);
void initializeGame();
