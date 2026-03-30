const SITE_LINKS = [
  { id: "home", label: "Overview", href: "index.html" },
  { id: "rules", label: "Правила", href: "rules.html" },
  { id: "workflow", label: "Workflow", href: "workflow.html" },
  { id: "grading", label: "Награди", href: "grading.html" },
  { id: "crypto", label: "Cipher", href: "tracks/crypto.html" },
  { id: "autograd", label: "AutoGrad", href: "tracks/autograd.html" },
  { id: "game", label: "Game AI", href: "tracks/game.html" },
  { id: "toolsmith", label: "Toolsmith", href: "tracks/toolsmith.html" }
];

const IMPORTANT_DATES = {
  start: new Date("2026-04-02T09:00:00+03:00"),
  support: new Date("2026-04-04T11:00:00+03:00"),
  deadline: new Date("2026-04-18T10:00:00+03:00")
};

function getRoot() {
  return document.body.dataset.root || "./";
}

function buildHeader() {
  const root = getRoot();
  const current = document.body.dataset.page || "home";
  const target = document.getElementById("site-header");
  if (!target) return;

  const nav = SITE_LINKS.map((link) => {
    const active = current === link.id ? "is-active" : "";
    return `<a class="nav-link ${active}" href="${root}${link.href}">${link.label}</a>`;
  }).join("");

  target.innerHTML = `
    <header class="site-header">
      <div class="shell header-row">
        <a class="brand" href="${root}index.html" aria-label="HackMe April home">
          <span class="brand-mark">H</span>
          <span>
            <strong>HackMe April</strong>
            <small>TUES AI Club 2026</small>
          </span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-label="Toggle navigation">
          <span></span><span></span><span></span>
        </button>
        <nav class="site-nav" aria-label="Main navigation">
          ${nav}
        </nav>
      </div>
    </header>
  `;

  const toggle = target.querySelector(".nav-toggle");
  const header = target.querySelector(".site-header");
  toggle?.addEventListener("click", () => {
    const open = header.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

function buildFooter() {
  const root = getRoot();
  const target = document.getElementById("site-footer");
  if (!target) return;

  target.innerHTML = `
    <footer class="site-footer">
      <div class="shell footer-grid">
        <div>
          <p class="footer-title">HackMe April</p>
          <p>Optional holiday challenge за research, engineering, debugging и smart teamwork.</p>
        </div>
        <div>
          <p class="footer-title">Hub</p>
          <a href="https://github.com/TUES-AI" target="_blank" rel="noreferrer">TUES-AI GitHub Org</a>
          <a href="https://github.com/TUES-AI/HackMe-April" target="_blank" rel="noreferrer">HackMe April Repo</a>
          <a href="https://github.com/TUES-AI/AutoGrad" target="_blank" rel="noreferrer">AutoGrad</a>
        </div>
        <div>
          <p class="footer-title">Important Dates</p>
          <p>Start: 2 April 2026</p>
          <p>Google Meet Q&amp;A: 4 April 2026</p>
          <p>Final demos: 18 April 2026</p>
        </div>
      </div>
    </footer>
  `;
}

function pad(number) {
  return String(number).padStart(2, "0");
}

function formatCountdown(diffMs) {
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${days}d ${pad(hours)}h ${pad(minutes)}m`;
}

function hydrateCountdowns() {
  const nodes = document.querySelectorAll("[data-countdown]");
  if (!nodes.length) return;

  const tick = () => {
    const now = Date.now();
    nodes.forEach((node) => {
      const key = node.dataset.countdown;
      const targetDate = IMPORTANT_DATES[key];
      if (!targetDate) return;

      const diff = targetDate.getTime() - now;
      const label = node.dataset.label || "Countdown";
      const state = diff > 0 ? formatCountdown(diff) : "LIVE";
      node.innerHTML = `<span>${label}</span><strong>${state}</strong>`;
    });
  };

  tick();
  window.setInterval(tick, 60000);
}

function setupReveal() {
  const nodes = document.querySelectorAll(".reveal");
  if (!nodes.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  nodes.forEach((node) => observer.observe(node));
}

function makePixelFields() {
  document.querySelectorAll(".pixel-field").forEach((field) => {
    for (let i = 0; i < 22; i += 1) {
      const pixel = document.createElement("span");
      pixel.className = "pixel";
      pixel.style.left = `${Math.random() * 100}%`;
      pixel.style.top = `${Math.random() * 100}%`;
      pixel.style.animationDelay = `${Math.random() * 4}s`;
      pixel.style.animationDuration = `${3 + Math.random() * 3}s`;
      field.appendChild(pixel);
    }
  });
}

function setCurrentYear() {
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
}

document.addEventListener("DOMContentLoaded", () => {
  buildHeader();
  buildFooter();
  hydrateCountdowns();
  setupReveal();
  makePixelFields();
  setCurrentYear();
});
