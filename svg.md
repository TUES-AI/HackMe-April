<div class="media-card mnist-hero-card">
  <div class="mnist-hero">
    <div class="mnist-hero-top">
      <span class="mnist-badge">AutoGrad · digits</span>
      <span class="mnist-meta">1797 samples · 10 classes · 8×8</span>
    </div>

    <div class="mnist-stage">
      <div class="mnist-stage-main">
        <div class="mnist-stage-glow"></div>

        <div class="mnist-big-shell">
          <div class="mnist-big-grid" id="mnist-main-grid" aria-label="Interactive digits preview"></div>
        </div>

        <div class="mnist-stage-caption">
          <strong id="mnist-main-label">Digit 3</strong>
          <span>inline HTML · hover + click</span>
        </div>
      </div>

      <div class="mnist-rail" id="mnist-rail"></div>
    </div>
  </div>

  <p class="media-caption">Interactive preview for the hardest route: handwritten digit classification without SVG.</p>
</div>

<style>
  .mnist-hero-card {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background:
      radial-gradient(circle at top left, rgba(25, 231, 110, 0.16), transparent 30%),
      radial-gradient(circle at bottom right, rgba(0, 184, 107, 0.14), transparent 34%),
      linear-gradient(180deg, rgba(8, 13, 10, 0.96), rgba(8, 10, 9, 0.98));
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.05),
      0 24px 60px rgba(0,0,0,0.34);
  }

  .mnist-hero {
    position: relative;
    padding: 1rem;
  }

  .mnist-hero::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(180deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 22px 22px;
    mask-image: linear-gradient(180deg, rgba(0,0,0,0.7), transparent 90%);
    pointer-events: none;
  }

  .mnist-hero-top {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    margin-bottom: 1rem;
  }

  .mnist-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.45rem 0.75rem;
    border-radius: 999px;
    border: 1px solid rgba(25, 231, 110, 0.22);
    background: rgba(25, 231, 110, 0.09);
    color: #cffff0;
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .mnist-badge::before {
    content: "";
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 999px;
    background: #19e76e;
    box-shadow: 0 0 14px rgba(25, 231, 110, 0.9);
  }

  .mnist-meta {
    color: rgba(230, 255, 241, 0.7);
    font-size: 0.78rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .mnist-stage {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(230px, 0.9fr);
    gap: 1rem;
    align-items: stretch;
  }

  .mnist-stage-main {
    position: relative;
    min-height: 330px;
    display: grid;
    place-items: center;
    border-radius: 1.35rem;
    border: 1px solid rgba(255,255,255,0.06);
    background:
      linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015)),
      rgba(10, 15, 12, 0.78);
    overflow: hidden;
    isolation: isolate;
  }

  .mnist-stage-glow {
    position: absolute;
    width: 72%;
    aspect-ratio: 1;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(25, 231, 110, 0.22), rgba(25, 231, 110, 0.04) 45%, transparent 72%);
    filter: blur(10px);
    pointer-events: none;
  }

  .mnist-big-shell {
    position: relative;
    padding: 1rem;
    border-radius: 1.15rem;
    border: 1px solid rgba(25, 231, 110, 0.14);
    background:
      linear-gradient(180deg, rgba(13, 20, 16, 0.96), rgba(7, 11, 9, 0.96));
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.05),
      0 18px 40px rgba(0,0,0,0.32),
      0 0 0 1px rgba(25, 231, 110, 0.05);
  }

  .mnist-big-grid,
  .mnist-mini-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 0.42rem;
  }

  .mnist-big-grid {
    width: min(22vw, 240px);
    min-width: 180px;
    aspect-ratio: 1;
  }

  .mnist-mini-grid {
    width: 74px;
    aspect-ratio: 1;
    gap: 0.2rem;
  }

  .mnist-pixel {
    border-radius: 0.38rem;
    border: 1px solid rgba(255,255,255,0.03);
    background: rgba(255,255,255,0.03);
    transition:
      transform 180ms ease,
      box-shadow 180ms ease,
      background 180ms ease,
      border-color 180ms ease,
      opacity 180ms ease;
  }

  .mnist-big-grid .mnist-pixel {
    border-radius: 0.55rem;
  }

  .mnist-pixel.level-0 {
    background: rgba(255,255,255,0.028);
    border-color: rgba(255,255,255,0.025);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.01);
  }

  .mnist-pixel.level-1 {
    background: rgba(25, 231, 110, 0.20);
    border-color: rgba(25, 231, 110, 0.13);
    box-shadow: 0 0 9px rgba(25, 231, 110, 0.08);
  }

  .mnist-pixel.level-2 {
    background: rgba(25, 231, 110, 0.44);
    border-color: rgba(25, 231, 110, 0.22);
    box-shadow:
      0 0 12px rgba(25, 231, 110, 0.18),
      inset 0 0 10px rgba(255,255,255,0.04);
  }

  .mnist-pixel.level-3 {
    background: rgba(25, 231, 110, 0.92);
    border-color: rgba(215, 255, 230, 0.25);
    box-shadow:
      0 0 20px rgba(25, 231, 110, 0.4),
      0 0 36px rgba(25, 231, 110, 0.18),
      inset 0 0 12px rgba(255,255,255,0.08);
  }

  .mnist-stage-main:hover .mnist-big-grid .mnist-pixel.level-2,
  .mnist-stage-main:hover .mnist-big-grid .mnist-pixel.level-3 {
    transform: translateY(-1px) scale(1.03);
  }

  .mnist-stage-caption {
    position: absolute;
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    color: rgba(231, 255, 240, 0.82);
    font-size: 0.82rem;
  }

  .mnist-stage-caption strong {
    font-size: 0.92rem;
    color: #effff4;
  }

  .mnist-stage-caption span:last-child {
    color: rgba(231, 255, 240, 0.56);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.72rem;
  }

  .mnist-rail {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.7rem;
  }

  .mnist-thumb {
    position: relative;
    display: grid;
    gap: 0.55rem;
    justify-items: center;
    padding: 0.85rem 0.65rem;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 1rem;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)),
      rgba(10, 14, 12, 0.82);
    cursor: pointer;
    transition:
      transform 180ms ease,
      border-color 180ms ease,
      box-shadow 180ms ease,
      background 180ms ease;
  }

  .mnist-thumb:hover {
    transform: translateY(-2px);
    border-color: rgba(25, 231, 110, 0.24);
    box-shadow: 0 10px 28px rgba(0,0,0,0.24);
  }

  .mnist-thumb.is-active {
    border-color: rgba(25, 231, 110, 0.36);
    background:
      linear-gradient(180deg, rgba(25, 231, 110, 0.08), rgba(255,255,255,0.02)),
      rgba(10, 16, 12, 0.9);
    box-shadow:
      0 0 0 1px rgba(25, 231, 110, 0.08),
      0 12px 34px rgba(0,0,0,0.28);
  }

  .mnist-thumb-label {
    color: rgba(240, 255, 247, 0.9);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .mnist-thumb::after {
    content: "";
    position: absolute;
    inset: auto 14px 10px 14px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(25, 231, 110, 0.5), transparent);
    opacity: 0;
    transition: opacity 180ms ease;
  }

  .mnist-thumb.is-active::after {
    opacity: 1;
  }

  @media (max-width: 860px) {
    .mnist-stage {
      grid-template-columns: 1fr;
    }

    .mnist-stage-main {
      min-height: 290px;
    }

    .mnist-big-grid {
      width: min(56vw, 220px);
    }

    .mnist-rail {
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }
  }

  @media (max-width: 560px) {
    .mnist-hero {
      padding: 0.85rem;
    }

    .mnist-stage-caption {
      position: static;
      padding: 0 0.15rem 0.15rem;
      margin-top: 0.75rem;
      flex-direction: column;
      align-items: flex-start;
    }

    .mnist-rail {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>

<script>
  (() => {
    const DIGITS = [
      { label: "0", rows: ["00122100","01333310","12300321","23000032","23000032","12300321","01333310","00122100"] },
      { label: "1", rows: ["00021000","00131000","01331000","00031000","00031000","00031000","00133200","00000000"] },
      { label: "2", rows: ["00122200","01333310","12000320","00001310","00013100","00131000","01333332","00000000"] },
      { label: "3", rows: ["00122200","01333310","10000320","00013210","00000320","12000320","01333310","00122200"] },
      { label: "4", rows: ["00003200","00013200","00123200","01213200","12333221","00003200","00003200","00000000"] },
      { label: "5", rows: ["01333320","01300000","01333210","12000320","00000320","12000320","01333310","00122200"] },
      { label: "6", rows: ["00122200","01333310","12300000","23333210","23000320","12300320","01333310","00122200"] },
      { label: "7", rows: ["12333332","10000320","00001320","00013200","00132000","00132000","00132000","00000000"] },
      { label: "8", rows: ["00122200","01333310","12300320","01333310","12300320","12300320","01333310","00122200"] },
      { label: "9", rows: ["00122200","01333310","12300320","01333320","00000320","12000320","01333310","00122200"] }
    ];

    const mainGrid = document.getElementById("mnist-main-grid");
    const mainLabel = document.getElementById("mnist-main-label");
    const rail = document.getElementById("mnist-rail");

    if (!mainGrid || !mainLabel || !rail) return;

    let activeIndex = 3;
    let timer = null;

    function pixel(level) {
      const node = document.createElement("span");
      node.className = `mnist-pixel level-${level}`;
      return node;
    }

    function renderGrid(target, rows) {
      target.innerHTML = "";
      rows.join("").split("").forEach((value) => {
        target.appendChild(pixel(Number(value)));
      });
    }

    function setActive(index) {
      activeIndex = index;
      renderGrid(mainGrid, DIGITS[index].rows);
      mainLabel.textContent = `Digit ${DIGITS[index].label}`;

      [...rail.children].forEach((button, i) => {
        button.classList.toggle("is-active", i === index);
      });
    }

    DIGITS.forEach((digit, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "mnist-thumb";
      button.setAttribute("aria-label", `Show digit ${digit.label}`);

      const mini = document.createElement("div");
      mini.className = "mnist-mini-grid";
      renderGrid(mini, digit.rows);

      const label = document.createElement("span");
      label.className = "mnist-thumb-label";
      label.textContent = `#${digit.label}`;

      button.append(mini, label);
      button.addEventListener("click", () => {
        setActive(index);
        resetTimer();
      });

      rail.appendChild(button);
    });

    function startTimer() {
      timer = window.setInterval(() => {
        setActive((activeIndex + 1) % DIGITS.length);
      }, 1800);
    }

    function resetTimer() {
      window.clearInterval(timer);
      startTimer();
    }

    rail.addEventListener("mouseenter", () => window.clearInterval(timer));
    rail.addEventListener("mouseleave", startTimer);
    mainGrid.addEventListener("mouseenter", () => window.clearInterval(timer));
    mainGrid.addEventListener("mouseleave", startTimer);

    setActive(activeIndex);
    startTimer();
  })();
</script>
