(function () {
	const portal = window.HackmePortal;
	if (!portal) return;

	function byId(id) {
		return document.getElementById(id);
	}

	function setStatus(node, tone, text) {
		if (!node) return;
		node.hidden = !text;
		node.className = `status-banner ${tone}`;
		node.textContent = text;
	}

	function escapeHtml(value) {
		return String(value || "")
			.replaceAll("&", "&amp;")
			.replaceAll("<", "&lt;")
			.replaceAll(">", "&gt;")
			.replaceAll('"', "&quot;")
			.replaceAll("'", "&#39;");
	}

	function renderTrackPicker(target, selected) {
		if (!target) return;
		const selectedSet = new Set(selected || []);
		target.innerHTML = `
      <details class="multi-select-shell" ${selectedSet.size ? "open" : ""}>
        <summary class="multi-select-summary">Select tracks</summary>
        <div class="multi-select-options">
          ${portal.TRACK_OPTIONS.map((track) => `
            <label class="multi-select-option">
              <input type="checkbox" value="${track.key}" ${selectedSet.has(track.key) ? "checked" : ""}>
              <span>${track.label}</span>
            </label>
          `).join("")}
        </div>
      </details>
    `;
		const details = target.querySelector("details");
		const updateSummary = () => {
			const values = [...target.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value);
			const labels = portal.TRACK_OPTIONS.filter((track) => values.includes(track.key)).map((track) => track.label);
			const summary = target.querySelector(".multi-select-summary");
			summary.textContent = labels.length ? labels.join(", ") : "Select tracks";
			if (labels.length && details && !details.open) details.open = true;
		};
		target.querySelectorAll('input[type="checkbox"]').forEach((input) => {
			input.addEventListener("change", updateSummary);
		});
		updateSummary();
	}

	function selectedTracks(target) {
		return [...target.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value);
	}

	function renderPlayerInputs(target, ownerEmail, playerCount, values, locked) {
		if (!target) return;
		const existing = Array.isArray(values) ? values.slice() : [];
		target.innerHTML = "";
		for (let index = 0; index < playerCount; index += 1) {
			const wrapper = document.createElement("label");
			wrapper.className = "field-row";
			const helper = index === 0 ? "Logged-in student" : `Player ${index + 1}`;
			const value = index === 0 ? ownerEmail : existing[index] || "";
			wrapper.innerHTML = `
        <span>Ученически имейл <small>${helper}</small></span>
        <input type="email" class="player-email-input" value="${escapeHtml(value)}" ${index === 0 || locked ? "readonly" : ""} required>
      `;
			target.appendChild(wrapper);
		}
	}

	function collectPlayerEmails(target) {
		return [...target.querySelectorAll(".player-email-input")].map((input) => input.value.trim().toLowerCase());
	}

	function updateBoard(team) {
		const board = byId("team-board");
		if (!board) return;
		const tracks = team?.selected_tracks?.length
			? team.selected_tracks.map((key) => portal.TRACK_OPTIONS.find((track) => track.key === key)?.label || key).join(", ")
			: "Not selected yet";
		const players = team?.players?.length ? team.players.map((email) => `<li>${escapeHtml(email)}</li>`).join("") : "<li>No players yet</li>";
		board.innerHTML = `
      <article class="board-card">
        <p class="mini-label">Team</p>
        <h3>${escapeHtml(team?.team_name || "Draft team")}</h3>
        <p>${escapeHtml(team?.github_url || "GitHub link will appear here")}</p>
      </article>
      <article class="board-card">
        <p class="mini-label">Tracks</p>
        <p>${escapeHtml(tracks)}</p>
      </article>
      <article class="board-card board-card-players">
        <p class="mini-label">Players</p>
        <ul>${players}</ul>
      </article>
    `;
	}

	function goToTeamPage() {
		window.location.href = `${portal.getRoot()}team.html`;
	}

	async function initAuthPage() {
		const authStatus = byId("auth-status");
		const sendCodeForm = byId("send-code-form");
		const verifyForm = byId("verify-form");
		const loginForm = byId("login-form");

		const refreshSession = async () => {
			const me = await portal.fetchCurrentUser(true);
			await portal.hydrateAuthAction();
			if (me?.user) {
				setStatus(authStatus, "success", me.team ? "You are logged in. Redirecting to your team page..." : "You are logged in. Redirecting to team registration...");
				window.setTimeout(goToTeamPage, 250);
				return;
			}
			setStatus(authStatus, "muted", "");
		};

			sendCodeForm?.addEventListener("submit", async (event) => {
				event.preventDefault();
				const email = byId("register-email").value.trim().toLowerCase();
				setStatus(authStatus, "muted", "Sending confirmation code...");
				try {
					const data = await portal.apiFetch("/api/auth/send-code", { method: "POST", token: null, body: { email } });
					byId("verify-email").value = email;
					setStatus(authStatus, "success", data.code ? `A confirmation code was sent to ${email}. Dev code: ${data.code}` : `A confirmation code was sent to ${email}.`);
				} catch (error) {
					setStatus(authStatus, "error", error.message || "Could not send the confirmation code.");
				}
			});

		verifyForm?.addEventListener("submit", async (event) => {
			event.preventDefault();
			const email = byId("verify-email").value.trim().toLowerCase();
			const code = byId("verify-code").value.trim();
			const password = byId("verify-password").value;
			setStatus(authStatus, "muted", "Verifying code and creating account...");
			try {
				const data = await portal.apiFetch("/api/auth/verify-code", {
					method: "POST",
					token: null,
					body: { email, code, password }
				});
				portal.storeToken(data.token);
				await refreshSession();
			} catch (error) {
				setStatus(authStatus, "error", error.message || "Verification failed.");
			}
		});

		loginForm?.addEventListener("submit", async (event) => {
			event.preventDefault();
			const email = byId("login-email").value.trim().toLowerCase();
			const password = byId("login-password").value;
			setStatus(authStatus, "muted", "Logging in...");
			try {
				const data = await portal.apiFetch("/api/auth/login", {
					method: "POST",
					token: null,
					body: { email, password }
				});
				portal.storeToken(data.token);
				await refreshSession();
			} catch (error) {
				setStatus(authStatus, "error", error.message || "Login failed.");
			}
		});

		await refreshSession();
	}

	async function initTeamPage() {
		const pageStatus = byId("team-page-status");
		const gate = byId("team-login-gate");
		const workspace = byId("team-workspace");
		const form = byId("team-form");
		const trackPicker = byId("team-track-picker");
		const playerCount = byId("player-count");
		const playerFields = byId("player-fields");
		const submitButton = byId("team-submit");
		const teamName = byId("team-name");
		const githubLink = byId("team-github-link");
		const formHint = byId("team-form-hint");
		const teamTitle = byId("team-form-title");

		const render = async () => {
			const me = await portal.fetchCurrentUser(true);
			await portal.hydrateAuthAction();
			if (!me?.user) {
				gate.hidden = false;
				workspace.hidden = true;
				setStatus(pageStatus, "warning", "Log in with a verified TUES student email before registering a team.");
				updateBoard(null);
				return;
			}

			gate.hidden = true;
			workspace.hidden = false;
			renderTrackPicker(trackPicker, me.team?.selected_tracks || []);

			if (!me.team) {
				teamTitle.textContent = "Register a Team";
				teamName.readOnly = false;
				githubLink.readOnly = false;
				playerCount.disabled = false;
				teamName.value = "";
				githubLink.value = "";
				playerCount.value = "1";
				renderPlayerInputs(playerFields, me.user.email, Number(playerCount.value), [me.user.email], false);
				submitButton.textContent = "Create team";
				formHint.textContent = "Team GitHub link and chosen tracks can be edited later.";
				setStatus(pageStatus, "muted", "Fill out the signup board and create your team.");
				updateBoard({ team_name: "Draft team", github_url: "", selected_tracks: [], players: [me.user.email] });
				return;
			}

			teamTitle.textContent = "Team registered";
			teamName.value = me.team.team_name;
			teamName.readOnly = true;
			githubLink.value = me.team.github_url;
			githubLink.readOnly = false;
			playerCount.value = String(me.team.player_count);
			playerCount.disabled = true;
			renderPlayerInputs(playerFields, me.user.email, me.team.player_count, me.team.players, true);
			submitButton.textContent = "Save updates";
			formHint.textContent = "Only the Team GitHub link and chosen tracks stay editable after registration.";
			setStatus(pageStatus, "success", "Your team is registered. You can still edit the GitHub link and chosen tracks.");
			updateBoard(me.team);
		};

		playerCount?.addEventListener("change", async () => {
			const me = await portal.fetchCurrentUser();
			if (!me?.user || me.team) return;
			renderPlayerInputs(playerFields, me.user.email, Number(playerCount.value), collectPlayerEmails(playerFields), false);
			updateBoard({
				team_name: teamName.value,
				github_url: githubLink.value,
				selected_tracks: selectedTracks(trackPicker),
				players: collectPlayerEmails(playerFields)
			});
		});

		[teamName, githubLink].forEach((input) => {
			input?.addEventListener("input", () => {
				updateBoard({
					team_name: teamName.value,
					github_url: githubLink.value,
					selected_tracks: selectedTracks(trackPicker),
					players: collectPlayerEmails(playerFields)
				});
			});
		});

		trackPicker?.addEventListener("change", () => {
			updateBoard({
				team_name: teamName.value,
				github_url: githubLink.value,
				selected_tracks: selectedTracks(trackPicker),
				players: collectPlayerEmails(playerFields)
			});
		});

		playerFields?.addEventListener("input", () => {
			updateBoard({
				team_name: teamName.value,
				github_url: githubLink.value,
				selected_tracks: selectedTracks(trackPicker),
				players: collectPlayerEmails(playerFields)
			});
		});

		form?.addEventListener("submit", async (event) => {
			event.preventDefault();
			const me = await portal.fetchCurrentUser();
			if (!me?.user) {
				setStatus(pageStatus, "error", "You need to log in first.");
				return;
			}

			const payload = me.team ? {
				github_url: githubLink.value.trim(),
				selected_tracks: selectedTracks(trackPicker)
			} : {
				team_name: teamName.value.trim(),
				github_url: githubLink.value.trim(),
				selected_tracks: selectedTracks(trackPicker),
				player_count: Number(playerCount.value),
				players: collectPlayerEmails(playerFields)
			};

			setStatus(pageStatus, "muted", me.team ? "Saving updates..." : "Creating team...");
			try {
				await portal.apiFetch("/api/team", {
					method: me.team ? "PATCH" : "POST",
					body: payload
				});
				await render();
			} catch (error) {
				setStatus(pageStatus, "error", error.message || "Could not save the team.");
			}
		});

		await render();
	}

	document.addEventListener("DOMContentLoaded", () => {
		const app = document.body.dataset.app;
		if (app === "auth") {
			initAuthPage();
		}
		if (app === "team") {
			initTeamPage();
		}
	});
})();
