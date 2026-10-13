import { expect, test } from "@playwright/test";
import { openWordle } from "./helpers/mock-word-apis.js";

test.describe("Keyboard input", () => {
  test.beforeEach(async ({ page }) => {
    await openWordle(page);
  });

  test("adds letters, ignores nonletters, and removes the last letter", async ({
    page,
  }) => {
    await page.keyboard.type("a1b");
    await expect(page.locator("#cell-0-0")).toHaveText("a");
    await expect(page.locator("#cell-0-1")).toHaveText("b");
    await expect(page.locator("#cell-0-2")).toHaveText("");

    await page.keyboard.press("Backspace");
    await expect(page.locator("#cell-0-1")).toHaveText("");
  });

  test("marks the missing cells when an incomplete guess is submitted", async ({
    page,
  }) => {
    await page.keyboard.type("he");
    await page.keyboard.press("Enter");

    for (let column = 2; column < 5; column += 1) {
      await expect(page.locator(`#cell-0-${column}`)).toHaveClass(
        /animate__shakeX/,
      );
    }
    await expect(page.locator("#cell-1-0")).toHaveText("");
  });
});
