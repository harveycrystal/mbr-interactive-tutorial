const lessonItems = document.querySelectorAll("#lessonList li");
const lessonTitle = document.querySelector("#lessonTitle");
const lessonText = document.querySelector("#lessonText");
const partTitle = document.querySelector("#partTitle");
const partText = document.querySelector("#partText");
const systemStatus = document.querySelector("#systemStatus");
const codValue = document.querySelector("#codValue");
const riskValue = document.querySelector("#riskValue");
const airControl = document.querySelector("#airControl");
const loadControl = document.querySelector("#loadControl");
const fluxControl = document.querySelector("#fluxControl");
const airValue = document.querySelector("#airValue");
const loadValue = document.querySelector("#loadValue");
const fluxValue = document.querySelector("#fluxValue");
const toggleRun = document.querySelector("#toggleRun");
const plantTab = document.querySelector("#plantTab");
const tankTab = document.querySelector("#tankTab");
const plantDiagram = document.querySelector("#plantDiagram");
const tankDiagram = document.querySelector("#tankDiagram");
const bubbles = document.querySelector("#bubbles");
const plantBubbles = document.querySelector("#plantBubbles");
const biofilm = document.querySelector("#biofilm");
const permeateFlow = document.querySelector("#permeateFlow");
const quizFeedback = document.querySelector("#quizFeedback");
const quizButtons = document.querySelectorAll(".quiz-options button");

const lessons = [
  {
    title: "廢水進入調節池",
    text: "調節池用來均化水量與污染濃度，讓後續生物處理不會因瞬間負荷過高而失穩。",
    part: "equalization",
  },
  {
    title: "格柵去除大型固體",
    text: "格柵會攔截塑膠片、纖維、砂粒等大顆粒物，降低泵浦堵塞與膜面刮傷的風險。",
    part: "screen",
  },
  {
    title: "初沉降低懸浮物",
    text: "初沉池利用重力沉降移除部分懸浮固體，讓進入 MBR 的有機與固體負荷更穩定。",
    part: "primary",
  },
  {
    title: "MBR 生物降解與膜分離",
    text: "MBR 將活性污泥反應與膜過濾結合。微生物分解有機物，膜分離管截留污泥與細菌，使出流水更清澈。",
    part: "mbr",
  },
  {
    title: "抽吸泵產出淨水",
    text: "抽吸泵提供跨膜壓力，使水通過膜孔成為產水。通量太高會加速膜污染，需搭配曝氣與反洗管理。",
    part: "pump",
  },
  {
    title: "剩餘污泥進入儲池",
    text: "系統會定期排出剩餘污泥，控制污泥齡與混合液懸浮固體濃度，維持生物處理效率。",
    part: "sludge",
  },
];

const partInfo = {
  equalization: {
    title: "調節池",
    text: "調節池緩衝水量與水質波動，是讓整套 MBR 系統穩定的前端單元。",
  },
  screen: {
    title: "格柵",
    text: "格柵移除大型雜質，避免後續泵浦、管線與膜組件被堵塞或磨損。",
  },
  primary: {
    title: "初沉池",
    text: "初沉池沉降可沉固體，降低懸浮物進入 MBR 後造成的膜面負荷。",
  },
  mbr: {
    title: "MBR 池",
    text: "MBR 池同時進行生物降解、曝氣混合與膜固液分離，是本教學的核心單元。",
  },
  membrane: {
    title: "膜分離管",
    text: "膜分離管通常為中空纖維膜或平板膜，可截留污泥、膠體與微生物，使水分子通過。",
  },
  blower: {
    title: "鼓風機與曝氣",
    text: "曝氣供應微生物所需溶氧，也會在膜面形成剪力，減少污泥附著造成的膜污染。",
  },
  pump: {
    title: "抽吸泵",
    text: "抽吸泵建立跨膜壓差。操作時需控制通量，避免因抽吸過強造成快速堵膜。",
  },
  sludge: {
    title: "污泥儲池",
    text: "污泥儲池收集排出的剩餘污泥，便於後續濃縮、脫水或處置。",
  },
  pipe: {
    title: "管線與流向",
    text: "管線箭頭顯示廢水、產水與污泥的移動方向。不同顏色代表不同水流或污泥流。",
  },
  influent: {
    title: "廢水入口",
    text: "廢水由入口進入 MBR 池，污染物會被微生物分解，固體則被膜截留。",
  },
};

const loadNames = ["低", "偏低", "中", "偏高", "高"];
let running = true;
let tick = 0;

function selectLesson(index) {
  const lesson = lessons[index];
  lessonItems.forEach((item) => item.classList.toggle("active", Number(item.dataset.step) === index));
  lessonTitle.textContent = lesson.title;
  lessonText.textContent = lesson.text;
  selectPart(lesson.part);
}

function selectPart(part) {
  const info = partInfo[part] || partInfo.mbr;
  partTitle.textContent = info.title;
  partText.textContent = info.text;

  document.querySelectorAll(".clickable, .unit").forEach((node) => {
    node.classList.toggle("active", node.dataset.part === part);
  });
}

function computePerformance() {
  const air = Number(airControl.value);
  const load = Number(loadControl.value);
  const flux = Number(fluxControl.value);
  const airScore = Math.max(0, 1 - Math.abs(air - 70) / 80);
  const fluxPenalty = Math.max(0, flux - 60) * 0.55;
  const loadPenalty = (load - 1) * 3.8;
  const cod = Math.round(70 + airScore * 20 - fluxPenalty - loadPenalty);
  const riskScore = load * 12 + flux * 0.7 - air * 0.45;

  return {
    cod: Math.max(48, Math.min(95, cod)),
    risk: riskScore > 70 ? "高" : riskScore > 48 ? "中" : "低",
  };
}

function updateStatus() {
  const air = Number(airControl.value);
  const load = Number(loadControl.value);
  const flux = Number(fluxControl.value);
  const performance = computePerformance();

  airValue.textContent = `${air}%`;
  loadValue.textContent = loadNames[load - 1];
  fluxValue.textContent = `${flux} LMH`;
  codValue.textContent = `${performance.cod}%`;
  riskValue.textContent = performance.risk;

  if (air < 40) {
    systemStatus.textContent = "曝氣不足";
  } else if (flux > 78 && load >= 4) {
    systemStatus.textContent = "堵膜風險高";
  } else if (performance.cod >= 84 && performance.risk !== "高") {
    systemStatus.textContent = "穩定高效";
  } else {
    systemStatus.textContent = "穩定運轉";
  }
}

function renderBubbles(target, baseX, baseY, count, spread, height) {
  const air = Number(airControl.value);
  const visible = Math.round((count * air) / 100);
  const markup = Array.from({ length: visible }, (_, index) => {
    const x = baseX + (index % 8) * spread + Math.sin(tick * 0.03 + index) * 7;
    const y = baseY - ((tick * (0.5 + air / 130) + index * 24) % height);
    const r = 4 + (index % 4);
    return `<circle class="bubble" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" />`;
  }).join("");
  target.innerHTML = markup;
}

function renderBiofilm() {
  const load = Number(loadControl.value);
  const count = 16 + load * 7;
  biofilm.innerHTML = Array.from({ length: count }, (_, index) => {
    const col = index % 4;
    const row = Math.floor(index / 4);
    const x = 344 + col * 52 + Math.sin(tick * 0.025 + index) * 5;
    const y = 238 + (row * 19) % 160;
    return `<circle class="bio-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${3 + (index % 3)}" />`;
  }).join("");
}

function renderPermeate() {
  const flux = Number(fluxControl.value);
  const count = Math.round(flux / 9);
  permeateFlow.innerHTML = Array.from({ length: count }, (_, index) => {
    const x = 840 + ((tick * (0.25 + flux / 180) + index * 24) % 160);
    const y = 330 + Math.sin(tick * 0.05 + index) * 4;
    return `<circle class="clean-drop" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" />`;
  }).join("");
}

function animate() {
  if (running) {
    tick += 1;
    renderBubbles(bubbles, 348, 424, 38, 31, 190);
    renderBubbles(plantBubbles, 725, 374, 24, 24, 82);
    renderBiofilm();
    renderPermeate();
  }
  requestAnimationFrame(animate);
}

function showDiagram(mode) {
  const showTank = mode === "tank";
  plantDiagram.classList.toggle("hidden", showTank);
  tankDiagram.classList.toggle("hidden", !showTank);
  plantTab.classList.toggle("active", !showTank);
  tankTab.classList.toggle("active", showTank);
  plantTab.setAttribute("aria-selected", String(!showTank));
  tankTab.setAttribute("aria-selected", String(showTank));
}

lessonItems.forEach((item) => {
  item.querySelector("button").addEventListener("click", () => selectLesson(Number(item.dataset.step)));
});

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-part]");
  if (trigger) {
    selectPart(trigger.dataset.part);
  }
});

document.querySelectorAll("[data-part]").forEach((node) => {
  node.addEventListener("focus", () => selectPart(node.dataset.part));
  node.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectPart(node.dataset.part);
    }
  });
});

[airControl, loadControl, fluxControl].forEach((control) => {
  control.addEventListener("input", updateStatus);
});

toggleRun.addEventListener("click", () => {
  running = !running;
  document.body.classList.toggle("paused", !running);
  toggleRun.textContent = running ? "暫停動畫" : "繼續動畫";
  toggleRun.setAttribute("aria-pressed", String(running));
});

plantTab.addEventListener("click", () => showDiagram("plant"));
tankTab.addEventListener("click", () => showDiagram("tank"));

quizButtons.forEach((button) => {
  button.addEventListener("click", () => {
    quizButtons.forEach((item) => item.classList.remove("correct", "wrong"));
    const correct = button.dataset.correct === "true";
    button.classList.add(correct ? "correct" : "wrong");
    quizFeedback.textContent = correct
      ? "答對了。MBR 的關鍵是將生物反應與膜固液分離整合。"
      : "再想一下：MBR 仍需要微生物處理，差異在固液分離方式。";
  });
});

selectLesson(0);
updateStatus();
animate();
