const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const stage = document.querySelector("[data-monster-stage]");
if (stage && !reduceMotion) {
  const monsters = [...stage.querySelectorAll(".monster")];
  stage.addEventListener("pointermove", (event) => {
    const rect = stage.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    monsters.forEach((monster, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      monster.style.setProperty("--monster-x", `${(x * direction * 15).toFixed(2)}px`);
      monster.style.setProperty("--monster-y", `${(y * direction * 12).toFixed(2)}px`);
      monster.style.setProperty("--pupil-x", `${(x * 9).toFixed(2)}px`);
      monster.style.setProperty("--pupil-y", `${(y * 7).toFixed(2)}px`);
    });
  });
  stage.addEventListener("pointerleave", () => {
    monsters.forEach((monster) => {
      monster.style.setProperty("--monster-x", "0px");
      monster.style.setProperty("--monster-y", "0px");
      monster.style.setProperty("--pupil-x", "0px");
      monster.style.setProperty("--pupil-y", "0px");
    });
  });
}

document.querySelectorAll(".monster").forEach((monster) => {
  monster.addEventListener("click", () => {
    document.querySelectorAll(".monster").forEach((item) => item.classList.remove("is-awake"));
    monster.classList.add("is-awake");
    const message = document.querySelector(".monster-message");
    if (message) message.textContent = monster.dataset.message;
  });
});

const reveals = document.querySelectorAll(".reveal");
if (reduceMotion || !("IntersectionObserver" in window)) {
  reveals.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  reveals.forEach((item) => observer.observe(item));
}
