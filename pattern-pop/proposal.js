"use strict";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const imageInput = document.querySelector("[data-image-input]");
const imagePreview = document.querySelector("[data-image-preview]");
imageInput?.addEventListener("change", () => {
  const file = imageInput.files?.[0];
  if (!file || !file.type.startsWith("image/")) return;
  const imageUrl = URL.createObjectURL(file);
  imagePreview.innerHTML = `<img src="${imageUrl}" alt="Preview of personal Little Alchemy 2 research screenshot" />`;
});

if ("IntersectionObserver" in window) {
  const navLinks = [...document.querySelectorAll(".toc a")];
  const sections = [...document.querySelectorAll(".proposal-section[id]")];
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`));
  }, { rootMargin: "-25% 0px -60%", threshold: [0, .2, .5] });
  sections.forEach((section) => observer.observe(section));
}

let audioContext = null;
function tone(frequency, duration, delay = 0, type = "sine") {
  audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume();
  const start = audioContext.currentTime + delay;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(.045, start);
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(start);
  oscillator.stop(start + duration);
}

document.querySelectorAll("[data-tone]").forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.tone;
    if (type === "pop") tone(420, .1, 0, "sine");
    if (type === "correct") { tone(523, .25); tone(784, .3, .12); }
    if (type === "wrong") tone(180, .25, 0, "triangle");
    if (type === "celebrate") [523, 659, 784, 1047].forEach((frequency, index) => tone(frequency, .32, index * .09));
    if (!reduceMotion) {
      button.animate([{ transform: "scale(1)" }, { transform: "scale(.97)" }, { transform: "scale(1)" }], { duration: 260 });
    }
  });
});
