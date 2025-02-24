// JavaScript to control the cheese glob animations
document.addEventListener("DOMContentLoaded", () => {
  const cheeseGlob = document.querySelector(".cheese-glob");

  // Toggle animation on click
  cheeseGlob.addEventListener("click", () => {
    cheeseGlob.classList.toggle("paused");
  });
});
