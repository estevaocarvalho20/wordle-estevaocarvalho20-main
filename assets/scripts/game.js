// Implement the Wordle data, network, validation, and scoring functions described
// in README.md. Keep DOM manipulation out of this file.
export function scoreGuess(targetWord, guess) {
  const target = targetWord.toLowerCase();
  const letters = guess.toLowerCase();
  const results = Array(letters.length).fill("");
  const remainingLetters = new Map();

  for (let index = 0; index < target.length; index += 1) {
    if (letters[index] === target[index]) {
      results[index] = "correct";
    } else {
      const count = remainingLetters.get(target[index]) || 0;
      remainingLetters.set(target[index], count + 1);
    }
  }

  for (let index = 0; index < letters.length; index += 1) {
    if (results[index] === "correct") {
      continue;
    }

    const count = remainingLetters.get(letters[index]) || 0;
    if (count > 0) {
      results[index] = "misplaced";
      remainingLetters.set(letters[index], count - 1);
    } else {
      results[index] = "incorrect";
    }
  }
  return results;
}
