const NAV_GROUPS = [
	{
		title: "Основни",
		links: [
			{ id: "home", label: "Начало", href: "index.html" },
			{ id: "rules", label: "Правила", href: "rules.html" },
			{ id: "workflow", label: "Как се работи", href: "workflow.html" },
			{ id: "rewards", label: "Награди", href: "rewards.html" }
		]
	},
	{
		title: "Tracks",
		links: [
			{ id: "crypto", label: "Cipher Hunters", href: "tracks/crypto.html" },
			{ id: "autograd", label: "AutoGrad Scientist", href: "tracks/autograd.html" },
			{ id: "game", label: "Learning Enemy", href: "tracks/game.html" },
			{ id: "toolsmith", label: "Scratch for ML", href: "tracks/toolsmith.html" }
		]
	}
];

const IMPORTANT_DATES = {
	start: new Date("2026-04-02T09:00:00+03:00"),
	support: new Date("2026-04-04T11:00:00+03:00"),
	deadline: new Date("2026-04-25T14:00:00+03:00")
};

const AUTH_TOKEN_KEY = "hackme-auth-token";
const TRACK_OPTIONS = [
	{ key: "crypto", label: "Cipher Hunters" },
	{ key: "autograd", label: "AutoGrad Scientist" },
	{ key: "game", label: "Learning Enemy" },
	{ key: "toolsmith", label: "Scratch for ML" }
];

let backendBaseUrlPromise = null;
let currentUserPromise = null;

function getRoot() {
	return document.body.dataset.root || "./";
}

function getCurrentPage() {
	return document.body.dataset.page || "home";
}

function getStoredToken() {
	try {
		return window.localStorage.getItem(AUTH_TOKEN_KEY) || "";
	} catch (_) {
		return "";
	}
}

function storeToken(token) {
	try {
		window.localStorage.setItem(AUTH_TOKEN_KEY, token);
	} catch (_) {
		// ignore storage failures
	}
	currentUserPromise = null;
}

function clearStoredToken() {
	try {
		window.localStorage.removeItem(AUTH_TOKEN_KEY);
	} catch (_) {
		// ignore storage failures
	}
	currentUserPromise = null;
}

async function getBackendBaseUrl(force = false) {
	if (!force && backendBaseUrlPromise) {
		return backendBaseUrlPromise;
	}

	backendBaseUrlPromise = (async () => {
		const response = await fetch(`${getRoot()}.link?ts=${Date.now()}`, { cache: "no-store" });
		if (!response.ok) {
			throw new Error("Backend link is not published yet");
		}
		const raw = (await response.text()).trim();
		if (!/^https?:\/\//.test(raw)) {
			throw new Error("Backend link is not configured");
		}
		return raw.replace(/\/+$/, "");
	})();

	try {
		return await backendBaseUrlPromise;
	} catch (error) {
		backendBaseUrlPromise = null;
		throw error;
	}
}

async function apiFetch(path, options = {}) {
	const headers = new Headers(options.headers || {});
	const token = options.token === null ? "" : options.token || getStoredToken();
	const init = {
		method: options.method || "GET",
		headers,
		mode: "cors"
	};

	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	if (options.body !== undefined) {
		headers.set("Content-Type", "application/json");
		init.body = JSON.stringify(options.body);
	}

	const response = await fetch(`${await getBackendBaseUrl()}${path}`, init);
	const raw = await response.text();
	let data = {};
	if (raw) {
		try {
			data = JSON.parse(raw);
		} catch (_) {
			data = { raw };
		}
	}

	if (!response.ok) {
		const error = new Error(data.error || `Request failed with ${response.status}`);
		error.status = response.status;
		error.payload = data;
		throw error;
	}

	return data;
}

async function fetchCurrentUser(force = false) {
	if (!getStoredToken()) {
		currentUserPromise = null;
		return null;
	}
	if (!force && currentUserPromise) {
		return currentUserPromise;
	}

	currentUserPromise = (async () => {
		try {
			const data = await apiFetch("/api/auth/me");
			return data.user ? data : null;
		} catch (_) {
			clearStoredToken();
			return null;
		}
	})();

	return currentUserPromise;
}

async function hydrateAuthAction() {
	const action = document.querySelector(".auth-action");
	if (!action) return;

	action.textContent = "Log In";
	action.href = `${getRoot()}auth.html`;

	try {
		const me = await fetchCurrentUser();
		if (!me?.user) return;
		action.textContent = me.team ? "My Team" : "Register a Team";
		action.href = `${getRoot()}team.html`;
	} catch (_) {
		// keep the login fallback
	}
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
		const next = theme === "dark" ? "Светла тема" : "Тъмна тема";
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
	const current = getCurrentPage();
	const target = document.getElementById("site-header");
	if (!target) return;

	const allLinks = NAV_GROUPS.flatMap((group) => group.links);
	const quickLinks = allLinks.map((link) => {
		const active = link.id === current ? "is-active" : "";
		return `<a class="mobile-tab ${active}" href="${root}${link.href}">${link.label}</a>`;
	}).join("");

	const desktopLinks = allLinks.map((link) => {
		const active = link.id === current ? "is-active" : "";
		return `<a class="desktop-link ${active}" href="${root}${link.href}">${link.label}</a>`;
	}).join("");

	target.innerHTML = `
    <header class="site-header">
      <div class="header-row">
        <button class="menu-button" type="button" aria-expanded="false" aria-label="Open navigation">Меню</button>
        <a class="brand" href="${root}index.html" aria-label="HackMe April home">
          <span class="brand-mark">HM</span>
          <span>
            <strong>HackMe April</strong>
            <small>TUES AI Club</small>
          </span>
        </a>
        <nav class="desktop-nav" aria-label="Main navigation">
          ${desktopLinks}
        </nav>
        <div class="header-actions">
          <a class="header-link auth-action" href="${root}auth.html">Log In</a>
          <button class="theme-toggle" type="button" aria-label="Тъмна тема">Тъмна тема</button>
        </div>
      </div>
      <div class="mobile-nav-shell">
        <p class="mobile-nav-label">Страници</p>
        <nav class="mobile-tabs" aria-label="Quick navigation">
          ${quickLinks}
        </nav>
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

	main.parentNode.insertBefore(shell, main);
	shell.appendChild(sidebar);
	shell.appendChild(main);

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
      <p class="sidebar-kicker">HackMe April</p>
      <p class="sidebar-copy">Кратък гид за правилата, работата по проекта и четирите посоки.</p>
      ${groups}
      <div class="sidebar-note">
        <p class="sidebar-note-title">Финал</p>
        <p>25 April 2026 · 14:00</p>
        <a href="https://github.com/TUES-AI/HackMe-April" target="_blank" rel="noreferrer">Repo hub</a>
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
          <p>Optional holiday challenge за проучване, експерименти и добра проектна следа.</p>
        </div>
        <div>
          <p class="footer-title">Hub</p>
          <a href="https://github.com/TUES-AI/AutoGrad" target="_blank" rel="noreferrer">AutoGrad</a>
        </div>
        <div>
          <p class="footer-title">Timeline</p>
          <p>Старт: 2 April 2026</p>
          <p>Среща: 4 April 2026</p>
          <p>Финал: 25 April 2026 · 14:00</p>
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

function initCryptoAnimation() {
	const stage = document.getElementById("crypto-anim-stage");
	const output = document.getElementById("crypto-anim-output");
	if (!stage || !output) return;

	const frames = [
		{
			stage: "VIGENERE -> КЛЮЧ + ИНТЕРВАЛИ",
			output: "НПГЪЛНФ ТНДЕБ, ЮНЮЕЗ ШПОРФХ..."
		},
		{
			stage: "AFFINE + COLUMNAR -> БЕЗ ИНТЕРВАЛИ",
			output: "КЛХЖП ЕБНЖН ЦЕЛКБ КДКЛИ РУМНВ..."
		},
		{
			stage: "BYTE/TOKEN LAYER -> ПАКЕТИРАНИ ГРУПИ",
			output: "H DR HS MM SQ 11 E6 G2 M7 XP..."
		}
	];

	let index = 0;
	const tick = () => {
		const frame = frames[index % frames.length];
		stage.textContent = frame.stage;
		output.textContent = frame.output;
		index += 1;
	};

	tick();
	window.setInterval(tick, 1800);
}

function initMiniPlayground() {
	const lr = document.getElementById("ml-lr");
	const noise = document.getElementById("ml-noise");
	const layers = document.getElementById("ml-layers");
	const lrValue = document.getElementById("ml-lr-value");
	const noiseValue = document.getElementById("ml-noise-value");
	const layersValue = document.getElementById("ml-layers-value");
	const output = document.getElementById("ml-playground-output");
	if (!lr || !noise || !layers || !lrValue || !noiseValue || !layersValue || !output) return;

	const render = () => {
		const lrNum = Number(lr.value) / 1000;
		const noiseNum = Number(noise.value);
		const layersNum = Number(layers.value);
		lrValue.textContent = lrNum.toFixed(3);
		noiseValue.textContent = `${noiseNum}%`;
		layersValue.textContent = String(layersNum);

		let title = "Stable boundary";
		let text = "Това е пример как може да изглежда live feedback в проекта ви.";
		if (noiseNum > 24) {
			title = "Noisy boundary";
			text = "Повече noise прави разделянето по-трудно и границата става по-неясна.";
		} else if (layersNum >= 3) {
			title = "Higher capacity";
			text = "Повече слоеве позволяват по-сложна граница, но искат по-добър контрол.";
		} else if (lrNum > 0.06) {
			title = "Aggressive learning";
			text = "Learning rate-ът е висок и моделът може да стане нестабилен, ако прекалите.";
		}

		output.innerHTML = `<strong>${title}</strong><span>${text}</span>`;
	};

	[lr, noise, layers].forEach((input) => input.addEventListener("input", render));
	render();
}

document.addEventListener("DOMContentLoaded", () => {
	initTheme();
	buildHeader();
	applyTheme(document.body.dataset.theme || "light");
	buildLayout();
	buildSidebar();
	buildFooter();
	bindUI();
	hydrateAuthAction();
	hydrateCountdowns();
	initCryptoAnimation();
	initMiniPlayground();
	setCurrentYear();
});

window.HackmePortal = {
	TRACK_OPTIONS,
	getRoot,
	getStoredToken,
	storeToken,
	clearStoredToken,
	fetchCurrentUser,
	getBackendBaseUrl,
	apiFetch,
	hydrateAuthAction
};
