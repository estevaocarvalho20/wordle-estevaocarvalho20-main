export async function installMockWordApis(
  page,
  { targetWord = "hello", validWords = [] } = {},
) {
  const acceptedWords = new Set(
    [targetWord, ...validWords].map((word) => word.toLowerCase()),
  );

  await page.route(
    "https://random-word-api.herokuapp.com/word*",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json; charset=utf-8",
        body: JSON.stringify([targetWord]),
      });
    },
  );

  await page.route(
    "https://api.dictionaryapi.dev/api/v2/entries/en/*",
    async (route) => {
      const word = decodeURIComponent(
        new URL(route.request().url()).pathname.split("/").at(-1),
      ).toLowerCase();

      if (acceptedWords.has(word)) {
        await route.fulfill({
          status: 200,
          contentType: "application/json; charset=utf-8",
          body: JSON.stringify([
            {
              word,
              phonetics: [],
              meanings: [],
              license: {
                name: "CC BY-SA 3.0",
                url: "https://creativecommons.org/licenses/by-sa/3.0",
              },
              sourceUrls: [],
            },
          ]),
        });
        return;
      }

      await route.fulfill({
        status: 404,
        contentType: "application/json; charset=utf-8",
        body: JSON.stringify({
          title: "No Definitions Found",
          message: `No definitions found for ${word}`,
          resolution: "Try another word.",
        }),
      });
    },
  );
}

export async function openWordle(page, options) {
  await installMockWordApis(page, options);
  await page.goto("/");
  await page
    .locator("#wordle-grid .letter")
    .first()
    .waitFor({ timeout: 3_000 });
}
