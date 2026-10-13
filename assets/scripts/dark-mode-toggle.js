// Add the color-theme toggle behavior here.
const themeButton = document.querySelector("#mode-toggle");

if (themeButton) {
  themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
  });
}
