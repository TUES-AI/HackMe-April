const NAV_GROUPS = [
  {
    title: "Guide",
    links: [
      { id: "home", label: "Overview", href: "index.html" },
      { id: "rules", label: "Правила", href: "rules.html" },
      { id: "workflow", label: "Workflow", href: "workflow.html" },
      { id: "grading", label: "Награди", href: "grading.html" }
    ]
  },
  {
    title: "Tracks",
    links: [
      { id: "crypto", label: "Cipher Hunters", href: "tracks/crypto.html" },
      { id: "autograd", label: "AutoGrad Scientist", href: "tracks/autograd.html" },
      { id: "game", label: "Learning Enemy", href: "tracks/game.html" },
      { id: "toolsmith", label: "AI Toolsmith", href: "tracks/toolsmith.html" }
    ]
  }
];

const IMPORTANT_DATES = {
  start: new Date("2026-04-02T09:00:00+03:00"),
  support: new Date("2026-04-04T11:00:00+03:00"),
  deadline: new Date("2026-04-18T10:00:00+03:00")
};

function getRoot() {
  return document.body.dataset.root || "./";
}

function getCurrentPage() {
  return document.body.dataset.page || "home";
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  try {
    window.localStorage.setItem("hackme-theme", theme);
  } catch (_) {
    // ignore storage failures
  }

  const button = document.querySelector(".theme-toggle");
  if (button) {
    const next = theme === "dark" ? "Light mode" : "Dark mode";
    button.textContent = next;
    button.setAttribute("aria-label", next);
  }
}

function initTheme() {
  let theme = "light";

  try {
    theme = window.localStorage.getItem("hackme-theme") || "light";
  } catch (_) {
    theme = "light";
  }

  applyTheme(theme);
}

function buildHeader() {
  const root = getRoot();
  const target = document.getElementById("site-header");
  if (!target) return;

  target.innerHTML = `
    <header class="site-header">
      <div class="header-row">
        <button class="menu-button" type="button" aria-expanded="false" aria-label="Open navigation">Menu</button>
        <a class="brand" href="${root}index.html" aria-label="HackMe April home">
          <span class="brand-mark">HM</span>
          <span>
            <strong>HackMe April</strong>
            <small>TUES AI Club</small>
          </span>
        </a>
        <div class="header-actions">
          <a class="header-link" href="https://github.com/TUES-AI/HackMe-April" target="_blank" rel="noreferrer">GitHub</a>
          <button class="theme-toggle" type="button" aria-label="Dark mode">Dark mode</button>
        </div>
      </div>
    </header>
  `;
}

function buildLayout() {
  const main = document.querySelector("main.page-shell");
  if (!main) return;

  if (main.parentElement?.classList.contains("docs-shell")) return;

  const shell = document.createElement("div");
  shell.className = "docs-shell";

  const sidebar = document.createElement("aside");
  sidebar.id = "site-sidebar";
  sidebar.className = "site-sidebar";

  const rail = document.createElement("aside");
  rail.id = "page-rail";
  rail.className = "page-rail";

  main.parentNode.insertBefore(shell, main);
  shell.appendChild(sidebar);
  shell.appendChild(main);
  shell.appendChild(rail);

  const backdrop = document.createElement("button");
  backdrop.type = "button";
  backdrop.id = "sidebar-backdrop";
  backdrop.className = "sidebar-backdrop";
  backdrop.setAttribute("aria-label", "Close navigation");
  document.body.appendChild(backdrop);
}

function buildSidebar() {
  const root = getRoot();
  const current = getCurrentPage();
  const target = document.getElementById("site-sidebar");
  if (!target) return;

  const groups = NAV_GROUPS.map((group) => {
    const links = group.links.map((link) => {
      const active = link.id === current ? "is-active" : "";
      return `<a class="sidebar-link ${active}" href="${root}${link.href}">${link.label}</a>`;
    }).join("");

    return `
      <section class="sidebar-group">
        <p class="sidebar-heading">${group.title}</p>
        <div class="sidebar-links">${links}</div>
      </section>
    `;
  }).join("");

  target.innerHTML = `
    <div class="sidebar-inner">
      <p class="sidebar-kicker">Challenge docs</p>
      <p class="sidebar-copy">Minimal guide за rules, workflow, rewards и четирите challenge paths.</p>
      ${groups}
      <div class="sidebar-note">
        <p class="sidebar-note-title">Final demo day</p>
        <p>18 April 2026</p>
        <a href="https://github.com/TUES-AI/HackMe-April" target="_blank" rel="noreferrer">Open repo hub</a>
      </div>
    </div>
  `;
}

function ensureHeadingIds() {
  const headings = document.querySelectorAll(".hero h1, .page-banner h1, .section-title");
  const used = new Set();

  headings.forEach((heading, index) => {
    if (heading.id) {
      used.add(heading.id);
      return;
    }

    let base = slugify(heading.textContent || `section-${index + 1}`) || `section-${index + 1}`;
    let id = base;
    let counter = 2;
    while (used.has(id)) {
      id = `${base}-${counter}`;
      counter += 1;
    }
    heading.id = id;
    used.add(id);
  });
}

function buildRail() {
  ensureHeadingIds();

  const target = document.getElementById("page-rail");
  if (!target) return;

  const sections = Array.from(document.querySelectorAll(".section-title"));
  const links = sections.map((heading) => {
    return `<a class="rail-link" href="#${heading.id}">${heading.textContent}</a>`;
  }).join("");

  target.innerHTML = `
    <div class="rail-inner">
      <div class="rail-card">
        <p class="rail-label">Important</p>
        <div class="rail-value" data-countdown="deadline" data-label="До финалните представяния"></div>
        <p class="rail-copy">Google Meet help: 4 April</p>
      </div>
      <div class="rail-card rail-toc ${links ? "" : "is-empty"}">
        <p class="rail-label">On this page</p>
        <nav class="rail-nav" aria-label="Page sections">${links || "<span class=\"rail-copy\">Overview page</span>"}</nav>
      </div>
    </div>
  `;
}

function buildFooter() {
  const target = document.getElementById("site-footer");
  if (!target) return;

  target.innerHTML = `
    <footer class="site-footer">
      <div class="footer-grid">
        <div>
          <p class="footer-title">HackMe April</p>
          <p>Optional holiday challenge за research, debugging и clear engineering process.</p>
        </div>
        <div>
          <p class="footer-title">Hub</p>
          <a href="https://github.com/TUES-AI/HackMe-April" target="_blank" rel="noreferrer">HackMe April repo</a>
          <a href="https://github.com/TUES-AI/AutoGrad" target="_blank" rel="noreferrer">AutoGrad</a>
        </div>
        <div>
          <p class="footer-title">Timeline</p>
          <p>Start: 2 April 2026</p>
          <p>Support meet: 4 April 2026</p>
          <p>Demos: 18 April 2026</p>
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

function setCurrentYear() {
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
}

function setActiveRailLink(id) {
  document.querySelectorAll(".rail-link").forEach((link) => {
    const active = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", active);
  });
}

function activateRailObserver() {
  const headings = Array.from(document.querySelectorAll(".section-title"));
  if (!headings.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

    if (visible?.target?.id) {
      setActiveRailLink(visible.target.id);
    }
  }, {
    rootMargin: "-20% 0px -70% 0px",
    threshold: [0, 1]
  });

  headings.forEach((heading) => observer.observe(heading));
  setActiveRailLink(headings[0].id);
}

function closeSidebar() {
  document.body.classList.remove("sidebar-open");
  const button = document.querySelector(".menu-button");
  if (button) button.setAttribute("aria-expanded", "false");
}

function bindUI() {
  const menuButton = document.querySelector(".menu-button");
  const themeButton = document.querySelector(".theme-toggle");
  const backdrop = document.getElementById("sidebar-backdrop");

  menuButton?.addEventListener("click", () => {
    const open = document.body.classList.toggle("sidebar-open");
    menuButton.setAttribute("aria-expanded", String(open));
  });

  backdrop?.addEventListener("click", closeSidebar);

  document.querySelectorAll(".sidebar-link").forEach((link) => {
    link.addEventListener("click", closeSidebar);
  });

  themeButton?.addEventListener("click", () => {
    const next = document.body.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 980) closeSidebar();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  buildHeader();
  applyTheme(document.body.dataset.theme || "light");
  buildLayout();
  buildSidebar();
  buildRail();
  buildFooter();
  bindUI();
  hydrateCountdowns();
  activateRailObserver();
  setCurrentYear();
});
