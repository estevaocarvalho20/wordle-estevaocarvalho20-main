import { expect, test } from "@playwright/test";
import { openWordle } from "./helpers/mock-word-apis.js";

test.describe("Wordle structure", () => {
  test.beforeEach(async ({ page }) => {
    await openWordle(page);
  });

  test("provides the required accessible game controls and local assets", async ({
    page,
  }) => {
    await expect(page).toHaveTitle(/Wordle/i);
    await expect(
      page.getByRole("heading", { level: 1, name: "Wordle" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /toggle color theme/i }),
    ).toHaveAttribute("id", "mode-toggle");
    await expect(page.locator("#game")).toBeVisible();
    await expect(page.locator("#wordle-grid")).toBeVisible();
    await expect(page.getByRole("status")).toHaveAttribute("id", "game-result");

    const styles = await page
      .locator("link[rel='stylesheet']")
      .evaluateAll((elements) =>
        elements.map((element) => new URL(element.href).pathname),
      );
    expect(styles).toContain("/assets/styles/style.css");

    const scripts = await page
      .locator("script[src]")
      .evaluateAll((elements) =>
        elements.map((element) => new URL(element.src).pathname),
      );
    expect(scripts).toEqual(
      expect.arrayContaining([
        "/assets/scripts/dark-mode-toggle.js",
        "/assets/scripts/main.js",
      ]),
    );
  });

  test("creates a six-by-five grid with stable cell identifiers", async ({
    page,
  }) => {
    const cells = page.locator("#wordle-grid .letter");
    await expect(cells).toHaveCount(30);
    await expect(page.locator("#cell-0-0")).toBeVisible();
    await expect(page.locator("#cell-5-4")).toBeVisible();
  });

  test("toggles light mode without replacing other body classes", async ({
    page,
  }) => {
    const body = page.locator("body");
    await page.getByRole("button", { name: /toggle color theme/i }).click();
    await expect(body).toHaveClass(/light-mode/);
    await page.getByRole("button", { name: /toggle color theme/i }).click();
    await expect(body).not.toHaveClass(/light-mode/);
  });
});
