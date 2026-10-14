// Implement the Wordle data, network, validation, and scoring functions described
// in README.md. Keep DOM manipulation out of this file.

export const gameConfig = { attempts: 6, wordLength: 5 };

export const gameState = {
  targetWord: "",
  currentAttempt: 0,
  currentPosition: 0,
  guesses: Array.from({ length: gameConfig.attempts }, () =>
    Array(gameConfig.wordLength).fill(""),
  ),
  finished: false,
  submitting: false,
};

export async function isValidWord(word) {
  const response = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
  );
  return response.ok;
}

export async function getRandomWord() {
  const response = await fetch(
    `https://random-word-api.herokuapp.com/word?length=${gameConfig.wordLength}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch target word: ${response.status}`);
  }

  const words = await response.json();
  const word = Array.isArray(words) ? words[0] : undefined;

  if (typeof word !== "string" || !/^[a-zA-Z]{5}$/.test(word)) {
    throw new Error("Invalid target word");
  }

  return word.toLowerCase();
}

export function checkGuess(targetWord, guess) {
  const targetLetters = targetWord.toLowerCase().split("");
  const guessLetters = guess.toLowerCase().split("");
  const results = Array(guessLetters.length).fill("");
  const remainingLetters = new Map();

  for (let index = 0; index < targetLetters.length; index += 1) {
    if (guessLetters[index] === targetLetters[index]) {
      results[index] = "correct";
    } else {
      const count = remainingLetters.get(targetLetters[index]) || 0;
      remainingLetters.set(targetLetters[index], count + 1);
    }
  }

  for (let index = 0; index < guessLetters.length; index += 1) {
    if (results[index] === "correct") {
      continue;
    }

    const count = remainingLetters.get(guessLetters[index]) || 0;
    if (count > 0) {
      results[index] = "misplaced";
      remainingLetters.set(guessLetters[index], count - 1);
    } else {
      results[index] = "incorrect";
    }
  }

  return results;
}
