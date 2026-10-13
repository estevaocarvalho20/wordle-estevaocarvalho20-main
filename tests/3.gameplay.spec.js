import { expect, test } from "@playwright/test";
import { openWordle } from "./helpers/mock-word-apis.js";

test.describe("Wordle gameplay", () => {
  test("rejects a word the dictionary API does not recognize", async ({
    page,
  }) => {
    await openWordle(page, { targetWord: "hello" });
    await page.keyboard.type("zzzzz");
    await page.keyboard.press("Enter");

    for (let column = 0; column < 5; column += 1) {
      await expect(page.locator(`#cell-0-${column}`)).toHaveClass(
        /animate__shakeX/,
      );
    }
    await expect(page.locator("#cell-1-0")).toHaveText("");
  });

  test("marks every tile correct and announces a win", async ({ page }) => {
    await openWordle(page, { targetWord: "hello" });
    await page.keyboard.type("hello");
    await page.keyboard.press("Enter");

    for (let column = 0; column < 5; column += 1) {
      await expect(page.locator(`#cell-0-${column}`)).toHaveClass(/correct/);
    }
    await expect(page.getByRole("status")).toHaveText("You won!");
  });

  test("accounts for repeated letters when scoring a valid guess", async ({
    page,
  }) => {
    await openWordle(page, { targetWord: "hello", validWords: ["level"] });
    await page.keyboard.type("level");
    await page.keyboard.press("Enter");

    const expectedClasses = [
      "misplaced",
      "correct",
      "incorrect",
      "incorrect",
      "misplaced",
    ];
    for (let column = 0; column < expectedClasses.length; column += 1) {
      await expect(page.locator(`#cell-0-${column}`)).toHaveClass(
        new RegExp(`\\b${expectedClasses[column]}\\b`),
      );
    }
  });

  test("announces game over after six valid incorrect guesses", async ({
    page,
  }) => {
    const guesses = ["hello", "cigar", "mango", "piano", "lemon", "tiger"];
    await openWordle(page, { targetWord: "zebra", validWords: guesses });

    for (let attempt = 0; attempt < guesses.length; attempt += 1) {
      const guess = guesses[attempt];
      await page.keyboard.type(guess);
      await page.keyboard.press("Enter");
      await expect(page.locator(`#cell-${attempt}-0`)).toHaveClass(
        /correct|misplaced|incorrect/,
      );
    }

    await expect(page.getByRole("status")).toHaveText("Game Over!");
  });
});
