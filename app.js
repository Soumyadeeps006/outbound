/**
 * OUTBOUND - Core Application JavaScript
 * Highly interactive, visual social re-entry gamification companion.
 * Features:
 * - Native Web Audio API synth chime (zero external dependencies)
 * - Dynamic Comfort Zone Canvas target radar
 * - Multi-stage offline Interest quiz
 * - Quest progression and LocalStorage state management
 * - Responsive viewport integrations
 */

// Global State Object
let state = {
  player: {
    level: 1,
    xp: 0,
    completedCount: 0,
    totalXPEarned: 0,
    streak: 0,
    lastActiveDate: null
  },
  quests: [],
  journal: [],
  energyLogs: []
};

// Target XP scale: Level * 100
const getTargetXP = (level) => level * 100;

// Quotes Database for Inspiration Card
const quotesList = [
  { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "Sometimes the most important thing in a whole day is the rest we take between two deep breaths.", author: "Etty Hillesum" },
  { text: "To be vulnerable, to let ourselves be seen, is the only way to find connection.", author: "Brené Brown" },
  { text: "Small steps in the right direction can turn out to be the biggest steps of your life.", author: "Unknown" },
  { text: "Beautiful things happen when you distance yourself from negativity.", author: "Unknown" },
  { text: "Every social interaction is a practice ground. There is no such thing as failure, only feedback.", author: "Unknown" },
  { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." }
];

// Prepopulated Default Quests
const defaultQuests = [
  // Tier 1: Grounding
  {
    id: "q-default-1",
    title: "Green Solitude",
    desc: "Walk through a local public park or green space for 15 minutes. Enjoy the air.",
    tier: 1,
    xp: 40,
    custom: false,
    completed: false
  },
  {
    id: "q-default-2",
    title: "Quiet Pages",
    desc: "Visit your neighborhood public library. Browse three aisles and sit to read for 15 minutes.",
    tier: 1,
    xp: 40,
    custom: false,
    completed: false
  },
  {
    id: "q-default-3",
    title: "Coffee Shop Nomads",
    desc: "Order a warm beverage at a local cafe and sit at a table inside for 15 minutes. Let yourself adapt to the environment.",
    tier: 1,
    xp: 50,
    custom: false,
    completed: false
  },
  // Tier 2: Sparking
  {
    id: "q-default-4",
    title: "The Barista's Choice",
    desc: "Ask the barista or clerk: 'What is your absolute favorite thing here?' and order it if possible.",
    tier: 2,
    xp: 60,
    custom: false,
    completed: false
  },
  {
    id: "q-default-5",
    title: "Pass the Smile",
    desc: "Politely nod, wave, or smile warmly at three distinct people you pass on your next walk.",
    tier: 2,
    xp: 60,
    custom: false,
    completed: false
  },
  {
    id: "q-default-6",
    title: "Simple Time Check",
    desc: "Ask a stranger in a park or store: 'Excuse me, do you happen to have the time?' Say thank you, and move along.",
    tier: 2,
    xp: 50,
    custom: false,
    completed: false
  },
  // Tier 3: Outbound
  {
    id: "q-default-7",
    title: "Open Board Play",
    desc: "Visit a local board game shop or game cafe during an open-gaming night. Sit and watch a match or ask to join.",
    tier: 3,
    xp: 100,
    custom: false,
    completed: false
  },
  {
    id: "q-default-8",
    title: "Volunteer Spark",
    desc: "Sign up online and attend your first local volunteer shift (animal shelter, food bank, community center).",
    tier: 3,
    xp: 120,
    custom: false,
    completed: false
  },
  {
    id: "q-default-9",
    title: "Class Discovery",
    desc: "Attend a single one-off public workshop, book club discussion, or outdoor exercise class (like yoga in the park).",
    tier: 3,
    xp: 120,
    custom: false,
    completed: false
  }
];

// Offline Recommendation Blueprints (Interest Quiz)
const activityBlueprints = {
  "observational-creative": [
    { title: "Museum Sketch Session", desc: "Take a notebook to a local gallery. Sit and sketch or write descriptions of two pieces.", action: "Grounding (Tier 1)" },
    { title: "Silent Book Reading Cafe", desc: "Search for a local cafe popular for readers or a library garden. Sit and read with others in silence.", action: "Grounding (Tier 1)" }
  ],
  "observational-analytical": [
    { title: "Co-working Space Trial", desc: "Visit a quiet local tech library or co-working lounge. Observe work styles and sit in the vicinity.", action: "Grounding (Tier 1)" },
    { title: "Electronics Showcase", desc: "Visit a hobbyist electronics or maker shop. Check out parts and layouts without direct pressure.", action: "Grounding (Tier 1)" }
  ],
  "observational-nature": [
    { title: "Arboretum Exploration", desc: "Find a local botanical garden, nature trail, or lake loop. Hike for 30 minutes in peace.", action: "Grounding (Tier 1)" },
    { title: "Bird-Watching Spot", desc: "Sit quietly at a local park observation deck or lake bench. Spend 20 minutes cataloging local birds.", action: "Grounding (Tier 1)" }
  ],
  "observational-humanitarian": [
    { title: "Local Donation Dropoff", desc: "Prepare a box of clothes or canned goods and drop it off in-person to a collection shelter.", action: "Grounding (Tier 1)" },
    { title: "Stray Cat Shelter Support", desc: "Visit an adoption shelter lobby. Just look at the animals and read their bios on the walls.", action: "Grounding (Tier 1)" }
  ],
  "structured-creative": [
    { title: "Pottery or Painting Class", desc: "Attend a beginner group art class where everyone is learning to paint or mould clay.", action: "Outbound (Tier 3)" },
    { title: "Community Book Circle", desc: "Attend a library book discussion where everyone shares thoughts on a single chapter.", action: "Outbound (Tier 3)" }
  ],
  "structured-analytical": [
    { title: "Board Game Open Night", desc: "Visit a local store hosting casual board game nights. Great structured focus, easy conversation.", action: "Outbound (Tier 3)" },
    { title: "Hobbyist Trivia Night", desc: "Find a local restaurant hosting general trivia. Sit at the bar and ask to join a group needing players.", action: "Outbound (Tier 3)" }
  ],
  "structured-nature": [
    { title: "Community Garden Shift", desc: "Join a weekend morning gardening slot at your local community plot. Soil digging is highly grounding.", action: "Outbound (Tier 3)" },
    { title: "Casual Hike Meetup", desc: "Join an organized walking or hiking group on Meetup. Hiking makes it easy to walk alongside others.", action: "Outbound (Tier 3)" }
  ],
  "structured-humanitarian": [
    { title: "Animal Companion Volunteering", desc: "Sign up to walk dogs at your local animal shelter. Connect with kind staff and caring animals.", action: "Outbound (Tier 3)" },
    { title: "Food Bank Sorting Shift", desc: "Join a assembly line sorting dry food packages. Dynamic, cooperative, and low talking pressure.", action: "Outbound (Tier 3)" }
  ]
};

// -------------------------------------------------------------
// Web Audio API Synthesizer (satisfying synth reward chimes)
// -------------------------------------------------------------
const playRewardChime = (levelUp = false) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    
    // Level Up: Majestic major chord sweep
    if (levelUp) {
      const now = ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        
        gainNode.gain.setValueAtTime(0.12, now + idx * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.8);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.85);
      });
    } else {
      // Standard Quest Complete: Sweet retro double bell chime
      const now = ctx.currentTime;
      const notes = [523.25, 783.99]; // C5, G5
      
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        
        gainNode.gain.setValueAtTime(0.15, now + idx * 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.55);
      });
    }
  } catch (e) {
    console.warn("Web Audio API is blocked or unsupported on this device.", e);
  }
};

// -------------------------------------------------------------
// Data State Controllers
// -------------------------------------------------------------

const loadFromLocalStorage = () => {
  const savedData = localStorage.getItem("outbound_companion_state");
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      state = parsed;
      // Ensure all arrays and sub-nodes exist in case of version changes
      if (!state.quests) state.quests = [...defaultQuests];
      if (!state.journal) state.journal = [];
      if (!state.energyLogs) state.energyLogs = [];
      if (!state.player) state.player = { level: 1, xp: 0, completedCount: 0, totalXPEarned: 0, streak: 0, lastActiveDate: null };
    } catch (e) {
      console.error("Local storage recovery failed. Initializing empty state.", e);
      initializeNewState();
    }
  } else {
    initializeNewState();
  }
};

const initializeNewState = () => {
  state.player = {
    level: 1,
    xp: 0,
    completedCount: 0,
    totalXPEarned: 0,
    streak: 0,
    lastActiveDate: null
  };
  state.quests = [...defaultQuests];
  state.journal = [];
  state.energyLogs = [];
  saveToLocalStorage();
};

const saveToLocalStorage = () => {
  localStorage.setItem("outbound_companion_state", JSON.stringify(state));
};

const addXP = (amount) => {
  state.player.xp += amount;
  state.player.totalXPEarned += amount;
  let target = getTargetXP(state.player.level);
  let leveledUp = false;
  
  while (state.player.xp >= target) {
    state.player.xp -= target;
    state.player.level++;
    target = getTargetXP(state.player.level);
    leveledUp = true;
  }
  
  updateUniversalHeader();
  saveToLocalStorage();
  
  if (leveledUp) {
    triggerLevelUpModal();
  }
};

const updateStreak = () => {
  const today = new Date().toDateString();
  const lastActive = state.player.lastActiveDate;
  
  if (!lastActive) {
    state.player.streak = 1;
  } else {
    const lastDate = new Date(lastActive);
    const differenceInTime = new Date(today) - lastDate;
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    
    if (differenceInDays === 1) {
      state.player.streak++;
    } else if (differenceInDays > 1) {
      state.player.streak = 1; // Reset streak
    }
    // If same day, streak doesn't change
  }
  state.player.lastActiveDate = today;
  saveToLocalStorage();
};

// -------------------------------------------------------------
// UI Renderers & Dom Syncing
// -------------------------------------------------------------

const updateUniversalHeader = () => {
  const levelText = document.getElementById("playerLevelDisplay");
  const xpText = document.getElementById("playerXPDisplay");
  const xpBarInner = document.getElementById("playerXPBar");
  
  const currentLvl = state.player.level;
  const currentXP = state.player.xp;
  const maxXP = getTargetXP(currentLvl);
  const ratio = Math.min(100, Math.max(0, (currentXP / maxXP) * 100));
  
  levelText.innerText = `LV ${currentLvl}`;
  xpText.innerText = `${currentXP} / ${maxXP} XP`;
  xpBarInner.style.width = `${ratio}%`;
};

const triggerLevelUpModal = () => {
  const modal = document.getElementById("levelUpModal");
  const title = document.getElementById("levelUpModalTitle");
  
  title.innerText = `LEVEL UP! REACHED LV ${state.player.level}`;
  modal.classList.add("active");
  playRewardChime(true);
  
  // Hide after 4 seconds
  setTimeout(() => {
    modal.classList.remove("active");
  }, 4000);
};

const renderDashboardStats = () => {
  document.getElementById("statsCompletedCount").innerText = state.player.completedCount;
  document.getElementById("statsStreakCount").innerText = `${state.player.streak}d`;
  document.getElementById("statsXPAccumulated").innerText = state.player.totalXPEarned;
};

const renderMiniQuests = () => {
  const container = document.getElementById("miniQuestsList");
  container.innerHTML = "";
  
  const activePendingQuests = state.quests
    .filter(q => !q.completed)
    .slice(0, 3);
    
  if (activePendingQuests.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:10px;">
        <p style="font-size:12px;">No active quests on your list! Go to the Quest Board to add or find some.</p>
      </div>
    `;
    return;
  }
  
  activePendingQuests.forEach(quest => {
    const card = document.createElement("div");
    card.className = `glass-panel quest-card tier-${quest.tier}`;
    card.style.height = "auto";
    card.style.padding = "14px";
    
    let tierName = "Grounding";
    if (quest.tier === 2) tierName = "Sparking";
    if (quest.tier === 3) tierName = "Outbound";
    
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <span class="quest-tier-tag" style="padding: 2px 6px;">${tierName}</span>
        <span class="quest-xp-badge" style="padding: 2px 6px;">+${quest.xp} XP</span>
      </div>
      <div style="margin: 8px 0;">
        <h4 style="font-size:14px; margin-bottom:2px;">${escapeHTML(quest.title)}</h4>
        <p style="font-size:11px; color:var(--text-secondary); line-height:1.3;">${escapeHTML(quest.desc)}</p>
      </div>
      <div style="display:flex; justify-content:flex-end;">
        <button class="complete-btn" onclick="completeQuest('${quest.id}')" style="padding: 4px 10px; font-size:11px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Complete
        </button>
      </div>
    `;
    container.appendChild(card);
  });
};

const renderQuestsGrid = (filter = "all") => {
  const container = document.getElementById("questsGridContainer");
  container.innerHTML = "";
  
  let list = state.quests.filter(q => !q.completed);
  if (filter !== "all") {
    const tierNum = parseInt(filter);
    list = list.filter(q => q.tier === tierNum);
  }
  
  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1; padding: 40px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h3>No challenges in this level</h3>
        <p>Excellent work! All challenges are done, or you can add a custom challenge using the button above.</p>
      </div>
    `;
    return;
  }
  
  list.forEach(quest => {
    const card = document.createElement("div");
    card.className = `glass-panel quest-card tier-${quest.tier}`;
    card.id = `quest-card-${quest.id}`;
    
    let tierName = "Grounding (Level 1)";
    if (quest.tier === 2) tierName = "Sparking (Level 2)";
    if (quest.tier === 3) tierName = "Outbound (Level 3)";
    
    card.innerHTML = `
      <div class="quest-card-top">
        <span class="quest-tier-tag">${tierName}</span>
        <span class="quest-xp-badge">+${quest.xp} XP</span>
      </div>
      <div class="quest-card-middle">
        <h4 class="quest-title">${escapeHTML(quest.title)}</h4>
        <p class="quest-desc">${escapeHTML(quest.desc)}</p>
      </div>
      <div class="quest-card-bottom">
        <button class="complete-btn" onclick="completeQuest('${quest.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Mark Complete
        </button>
      </div>
    `;
    container.appendChild(card);
  });
};

const renderJournalTimeline = () => {
  const timelineFull = document.getElementById("fullJournalTimeline");
  const timelineMini = document.getElementById("miniJournaltimeline");
  
  timelineFull.innerHTML = "";
  timelineMini.innerHTML = "";
  
  if (state.journal.length === 0) {
    document.getElementById("journalEmptyState").style.display = "flex";
    timelineMini.innerHTML = `
      <div class="empty-state" style="padding:10px;">
        <p style="font-size:12px;">Your journal timeline is empty. Complete quests to write entries!</p>
      </div>
    `;
    return;
  } else {
    document.getElementById("journalEmptyState").style.display = "none";
  }
  
  // Sort journal - newest first
  const sorted = [...state.journal].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  sorted.forEach((item, idx) => {
    let tierLabel = "Grounding";
    let tierColor = "cyan";
    if (item.tier === 2) { tierLabel = "Sparking"; tierColor = "purple"; }
    if (item.tier === 3) { tierLabel = "Outbound"; tierColor = "orange"; }
    
    const elementHTML = `
      <div class="glass-panel timeline-card">
        <div class="timeline-emoji-box">${item.emoji || '👣'}</div>
        <div class="timeline-body">
          <div class="timeline-header">
            <h4 class="timeline-title">${escapeHTML(item.title)}</h4>
            <span class="timeline-date">${formatDate(item.date)}</span>
          </div>
          <div class="timeline-stats">
            <span class="timeline-pill ${tierColor}">${tierLabel}</span>
            ${item.energy ? `<span class="timeline-pill orange">Energy: ${item.energy}/10</span>` : ''}
          </div>
          <p class="timeline-desc">${escapeHTML(item.notes || 'Activity completed successfully!')}</p>
        </div>
      </div>
    `;
    
    // Add to full journal
    timelineFull.innerHTML += elementHTML;
    
    // Add first 3 items to mini journal dashboard
    if (idx < 3) {
      timelineMini.innerHTML += elementHTML;
    }
  });
};

// -------------------------------------------------------------
// Interactive Core Event Action Implementations
// -------------------------------------------------------------

window.completeQuest = (questId) => {
  const questIndex = state.quests.findIndex(q => q.id === questId);
  if (questIndex === -1) return;
  
  const quest = state.quests[questIndex];
  
  // Trigger DOM anim in quest board panel if it exists there
  const cardDom = document.getElementById(`quest-card-${questId}`);
  
  // Confetti explosion rendering
  if (cardDom) {
    createConfettiEffect(cardDom);
    cardDom.classList.add("completed-anim");
    
    // Delayed completion processing after animation
    setTimeout(() => {
      processQuestCompletion(questIndex);
    }, 600);
  } else {
    processQuestCompletion(questIndex);
  }
};

const processQuestCompletion = (idx) => {
  const quest = state.quests[idx];
  quest.completed = true;
  state.player.completedCount++;
  
  updateStreak();
  playRewardChime(false);
  
  // Log directly into outing journal Timeline
  const logItem = {
    title: quest.title,
    date: new Date().toISOString().split('T')[0],
    tier: quest.tier,
    emoji: quest.tier === 1 ? "😌" : (quest.tier === 2 ? "😊" : "⚡"),
    notes: `Accomplished Quest: ${quest.desc}`,
    energy: null
  };
  state.journal.push(logItem);
  
  addXP(quest.xp);
  
  // Save and redraw
  saveToLocalStorage();
  renderDashboardStats();
  renderMiniQuests();
  renderQuestsGrid(document.querySelector(".filter-pill.active")?.dataset.filter || "all");
  renderJournalTimeline();
  drawComfortRadar();
};

const createConfettiEffect = (element) => {
  const rect = element.getBoundingClientRect();
  const body = document.body;
  const colors = ["#8b5cf6", "#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e"];
  
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement("div");
    particle.className = "confetti-particle";
    
    // Center position
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    
    particle.style.left = `${startX}px`;
    particle.style.top = `${startY}px`;
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Random angle vectors
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 80;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    
    particle.style.setProperty("--tx", `${tx}px`);
    particle.style.setProperty("--ty", `${ty}px`);
    
    body.appendChild(particle);
    
    // Remove node after completion
    setTimeout(() => {
      particle.remove();
    }, 850);
  }
};

// -------------------------------------------------------------
// Interactive Comfort Zone canvas renderer
// -------------------------------------------------------------
const drawComfortRadar = () => {
  const canvas = document.getElementById("comfortCanvas");
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  const size = Math.min(380, canvas.parentElement.clientWidth - 40);
  canvas.width = size;
  canvas.height = size;
  
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = (size / 2) - 30;
  
  ctx.clearRect(0, 0, size, size);
  
  // Count quests
  const completedQ = state.quests.filter(q => q.completed);
  const totalTier1 = state.quests.filter(q => q.tier === 1).length || 1;
  const totalTier2 = state.quests.filter(q => q.tier === 2).length || 1;
  const totalTier3 = state.quests.filter(q => q.tier === 3).length || 1;
  
  const doneTier1 = completedQ.filter(q => q.tier === 1).length;
  const doneTier2 = completedQ.filter(q => q.tier === 2).length;
  const doneTier3 = completedQ.filter(q => q.tier === 3).length;
  
  const ratio1 = doneTier1 / totalTier1;
  const ratio2 = doneTier2 / totalTier2;
  const ratio3 = doneTier3 / totalTier3;
  
  // Update percentages displays
  document.getElementById("zone1Percentage").innerText = `${Math.round(ratio1 * 100)}%`;
  document.getElementById("zone2Percentage").innerText = `${Math.round(ratio2 * 100)}%`;
  document.getElementById("zone3Percentage").innerText = `${Math.round(ratio3 * 100)}%`;
  
  const overallExpansion = Math.round(((ratio1 + ratio2 + ratio3) / 3) * 100);
  document.getElementById("comfortZoneExpansionDisplay").innerText = `${overallExpansion}%`;
  
  // 1. Draw target sonar concentric circles
  const radii = [maxRadius * 0.35, maxRadius * 0.68, maxRadius];
  const ringColors = ["rgba(6, 182, 212, 0.15)", "rgba(139, 92, 246, 0.15)", "rgba(244, 63, 94, 0.15)"];
  
  // Fill rings from outside in
  for (let i = 2; i >= 0; i--) {
    ctx.beginPath();
    ctx.arc(cx, cy, radii[i], 0, Math.PI * 2);
    ctx.fillStyle = ringColors[i];
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  // Draw divider crosshairs
  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
  ctx.beginPath();
  ctx.moveTo(cx - maxRadius, cy); ctx.lineTo(cx + maxRadius, cy);
  ctx.moveTo(cx, cy - maxRadius); ctx.lineTo(cx, cy + maxRadius);
  ctx.stroke();
  
  // 2. Explored Footprint Polygon
  // Compute expanding custom path based on completed quest ratios
  // Node 1 (North - Tier 1): ratio 1
  // Node 2 (East - Tier 2): ratio 2
  // Node 3 (South - Tier 3): ratio 3
  // Node 4 (West - Tier 2): average / placeholder
  const footprintRadii = [
    radii[0] + (radii[1] - radii[0]) * ratio1, // Tier 1 (Observing)
    radii[0] + (radii[2] - radii[0]) * ratio2, // Tier 2 (Conversing)
    radii[0] + (radii[2] - radii[0]) * ratio3, // Tier 3 (Joining)
    radii[0] + (radii[1] - radii[0]) * ((ratio1 + ratio2) / 2)
  ];
  
  const angles = [
    -Math.PI / 2, // North
    0,            // East
    Math.PI / 2,  // South
    Math.PI       // West
  ];
  
  ctx.beginPath();
  angles.forEach((angle, index) => {
    const radius = Math.max(radii[0] * 0.5, footprintRadii[index]);
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    if (index === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
  
  const polygonGradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, maxRadius);
  polygonGradient.addColorStop(0, "rgba(139, 92, 246, 0.4)");
  polygonGradient.addColorStop(1, "rgba(6, 182, 212, 0.15)");
  ctx.fillStyle = polygonGradient;
  ctx.fill();
  ctx.strokeStyle = "rgba(139, 92, 246, 0.8)";
  ctx.lineWidth = 2.5;
  ctx.shadowColor = "rgba(139, 92, 246, 0.6)";
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.shadowBlur = 0; // Reset shadow
  
  // 3. Draw Completed Excursions as glowing dots
  // Cache completed dots location on screen to support interactive hover overlays
  state.completedNodesPositions = [];
  
  state.journal.forEach((log, index) => {
    // Distribute based on Tier category
    let minR, maxR, dotColor, glowColor;
    if (log.tier === 1) {
      minR = 10; maxR = radii[0];
      dotColor = "#06b6d4"; glowColor = "rgba(6, 182, 212, 0.8)";
    } else if (log.tier === 2) {
      minR = radii[0]; maxR = radii[1];
      dotColor = "#8b5cf6"; glowColor = "rgba(139, 92, 246, 0.8)";
    } else {
      minR = radii[1]; maxR = radii[2];
      dotColor = "#f43f5e"; glowColor = "rgba(244, 63, 94, 0.8)";
    }
    
    // Consistent pseudorandom coordinate based on title character hash
    const hash = log.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const angle = (hash % 360) * (Math.PI / 180);
    const radius = minR + (hash % (maxR - minR - 15)) + 8;
    
    const nodeX = cx + Math.cos(angle) * radius;
    const nodeY = cy + Math.sin(angle) * radius;
    
    // Store coordinate details
    state.completedNodesPositions.push({
      x: nodeX,
      y: nodeY,
      title: log.title,
      date: log.date,
      emoji: log.emoji || '👣',
      notes: log.notes
    });
    
    // Draw dot with outer neon aura ring
    ctx.beginPath();
    ctx.arc(nodeX, nodeY, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = dotColor;
    ctx.shadowBlur = 8;
    ctx.shadowColor = glowColor;
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow
    
    ctx.beginPath();
    ctx.arc(nodeX, nodeY, 8.5, 0, Math.PI * 2);
    ctx.strokeStyle = dotColor + "30";
    ctx.lineWidth = 1;
    ctx.stroke();
  });
};

// Canvas Hover Interactive Check Overlay
const setupCanvasInteractiveHover = () => {
  const canvas = document.getElementById("comfortCanvas");
  if (!canvas) return;
  
  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Check nodes
    let hoveredNode = null;
    if (state.completedNodesPositions) {
      for (const node of state.completedNodesPositions) {
        const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
        if (dist <= 10) {
          hoveredNode = node;
          break;
        }
      }
    }
    
    // Redraw and render custom HUD overlay if matching node is hovered
    drawComfortRadar();
    
    if (hoveredNode) {
      drawCanvasTooltip(canvas.getContext("2d"), hoveredNode);
      canvas.style.cursor = "pointer";
    } else {
      canvas.style.cursor = "default";
    }
  });
};

const drawCanvasTooltip = (ctx, node) => {
  const tx = node.x;
  const ty = node.y - 15;
  
  ctx.save();
  ctx.font = "bold 11px Outfit";
  const titleWidth = ctx.measureText(node.title).width;
  ctx.font = "9px Inter";
  const dateWidth = ctx.measureText(formatDate(node.date)).width;
  const boxWidth = Math.max(titleWidth, dateWidth) + 30;
  const boxHeight = 44;
  
  // Align bounds safely
  const bx = Math.min(ctx.canvas.width - boxWidth - 10, Math.max(10, tx - boxWidth / 2));
  const by = ty - boxHeight - 8;
  
  // Draw Tooltip Container with gradient border
  ctx.beginPath();
  ctx.roundRect(bx, by, boxWidth, boxHeight, 8);
  ctx.fillStyle = "rgba(10, 14, 27, 0.92)";
  ctx.fill();
  ctx.strokeStyle = "rgba(139, 92, 246, 0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Draw Emoji & Text details
  ctx.font = "14px Inter";
  ctx.fillText(node.emoji, bx + 8, by + 18);
  
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 10px Outfit";
  ctx.fillText(node.title, bx + 26, by + 16);
  
  ctx.fillStyle = "#9ca3af";
  ctx.font = "8px Inter";
  ctx.fillText(formatDate(node.date), bx + 26, by + 28);
  ctx.fillText(node.notes ? truncateString(node.notes, 28) : "No log details", bx + 26, by + 38);
  
  ctx.restore();
};

// -------------------------------------------------------------
// Interest Finder Quiz Step Controller
// -------------------------------------------------------------
let quizStep = 1;
const quizSelections = {
  env: "",
  hobby: "",
  size: ""
};

const setupQuizHandlers = () => {
  const optionCards = document.querySelectorAll(".option-card");
  optionCards.forEach(card => {
    card.addEventListener("click", () => {
      const step = parseInt(card.dataset.step);
      const val = card.dataset.val;
      
      // Deselect siblings
      document.querySelectorAll(`.option-card[data-step="${step}"]`).forEach(sibling => {
        sibling.classList.remove("selected");
      });
      
      card.classList.add("selected");
      
      // Store value
      if (step === 1) quizSelections.env = val;
      if (step === 2) quizSelections.hobby = val;
      if (step === 3) quizSelections.size = val;
    });
  });
  
  const nextBtn = document.getElementById("quizNextBtn");
  const prevBtn = document.getElementById("quizPrevBtn");
  
  nextBtn.addEventListener("click", () => {
    if (quizStep === 1 && !quizSelections.env) {
      alert("Please select an environment style to continue!");
      return;
    }
    if (quizStep === 2 && !quizSelections.hobby) {
      alert("Please select a core category to continue!");
      return;
    }
    if (quizStep === 3 && !quizSelections.size) {
      alert("Please select an ideal group size to continue!");
      return;
    }
    
    if (quizStep < 4) {
      navigateQuizStep(quizStep + 1);
    } else {
      // Final stage resets quiz
      resetQuizEngine();
    }
  });
  
  prevBtn.addEventListener("click", () => {
    if (quizStep > 1) {
      navigateQuizStep(quizStep - 1);
    }
  });
};

const navigateQuizStep = (target) => {
  // Hide active step
  document.getElementById(`quizStep${quizStep}`).classList.remove("active");
  document.getElementById(`quizStepIndicator${quizStep}`).classList.remove("active");
  if (quizStep < target) {
    document.getElementById(`quizStepIndicator${quizStep}`).classList.add("done");
  } else {
    document.getElementById(`quizStepIndicator${target}`).classList.remove("done");
  }
  
  // Set new step active
  quizStep = target;
  document.getElementById(`quizStep${quizStep}`).classList.add("active");
  document.getElementById(`quizStepIndicator${quizStep}`).classList.add("active");
  
  // Navigation visibility details
  const prevBtn = document.getElementById("quizPrevBtn");
  const nextBtn = document.getElementById("quizNextBtn");
  
  prevBtn.style.visibility = quizStep === 1 ? "hidden" : "visible";
  
  if (quizStep === 4) {
    generateRecommendationsBlueprint();
    nextBtn.innerText = "Restart Quiz";
  } else {
    nextBtn.innerText = "Continue";
  }
};

const generateRecommendationsBlueprint = () => {
  const container = document.getElementById("quizRecommendationsContainer");
  const empty = document.getElementById("quizRecommendationEmpty");
  
  container.innerHTML = "";
  
  // Construct blueprint mapping key: e.g. "observational-creative"
  const searchKey = `${quizSelections.env}-${quizSelections.hobby}`;
  const blueprints = activityBlueprints[searchKey] || [];
  
  if (blueprints.length === 0) {
    empty.style.display = "flex";
    return;
  }
  
  empty.style.display = "none";
  
  blueprints.forEach((bp, index) => {
    const card = document.createElement("div");
    card.className = "glass-panel rec-card";
    
    // Check if user already has a quest with this exact title
    const exists = state.quests.some(q => q.title.toLowerCase() === bp.title.toLowerCase());
    
    card.innerHTML = `
      <div class="rec-details">
        <h4 class="rec-title">${escapeHTML(bp.title)}</h4>
        <p class="rec-desc">${escapeHTML(bp.desc)}</p>
        <span class="rec-action-badge">${bp.action}</span>
      </div>
      <div>
        ${exists ? `
          <button class="glass-button btn-secondary" style="font-size:11px; padding:6px 10px;" disabled>
            Added to Board
          </button>
        ` : `
          <button class="glass-button active" style="font-size:11px; padding:6px 12px;" onclick="acceptRecommendedQuest('${escapeJsString(bp.title)}', '${escapeJsString(bp.desc)}', ${searchKey.includes('structured') ? 3 : 1})">
            Accept Challenge
          </button>
        `}
      </div>
    `;
    container.appendChild(card);
  });
};

window.acceptRecommendedQuest = (title, desc, tier) => {
  const newQuest = {
    id: `q-rec-${Date.now()}`,
    title: title,
    desc: desc,
    tier: tier,
    xp: tier === 3 ? 100 : 40,
    custom: true,
    completed: false
  };
  
  state.quests.push(newQuest);
  saveToLocalStorage();
  
  // Re-generate list & refresh UI elements
  generateRecommendationsBlueprint();
  renderMiniQuests();
  renderQuestsGrid();
  
  // Display brief alert toast
  alert(`Added "${title}" to your active Quest Board!`);
};

const resetQuizEngine = () => {
  quizSelections.env = "";
  quizSelections.hobby = "";
  quizSelections.size = "";
  
  document.querySelectorAll(".option-card").forEach(c => c.classList.remove("selected"));
  document.querySelectorAll(".indicator-step").forEach(i => {
    i.classList.remove("active", "done");
  });
  
  navigateQuizStep(1);
};

// -------------------------------------------------------------
// Custom Quest and Outing Journal Forms handling
// -------------------------------------------------------------

const setupFormSubmitHandlers = () => {
  // Modal toggle buttons
  const openModal = document.getElementById("openQuestModalBtn");
  const closeModal = document.getElementById("closeQuestModalBtn");
  const modalOverlay = document.getElementById("questModalOverlay");
  
  openModal.addEventListener("click", () => modalOverlay.classList.add("active"));
  closeModal.addEventListener("click", () => modalOverlay.classList.remove("active"));
  
  // Custom Quest Submission
  const saveQuestBtn = document.getElementById("saveCustomQuestBtn");
  saveQuestBtn.addEventListener("click", () => {
    const titleInput = document.getElementById("customQuestTitle");
    const descInput = document.getElementById("customQuestDesc");
    const tierSelect = document.getElementById("customQuestTier");
    const xpSelect = document.getElementById("customQuestXP");
    
    if (!titleInput.value || !descInput.value) {
      alert("Please fill out all challenge fields!");
      return;
    }
    
    const newQuest = {
      id: `q-custom-${Date.now()}`,
      title: titleInput.value,
      desc: descInput.value,
      tier: parseInt(tierSelect.value),
      xp: parseInt(xpSelect.value),
      custom: true,
      completed: false
    };
    
    state.quests.push(newQuest);
    saveToLocalStorage();
    
    // Clear forms and reset
    titleInput.value = "";
    descInput.value = "";
    tierSelect.value = "1";
    xpSelect.value = "40";
    modalOverlay.classList.remove("active");
    
    // Redraw lists
    renderMiniQuests();
    renderQuestsGrid(document.querySelector(".filter-pill.active")?.dataset.filter || "all");
    playRewardChime(false);
  });
  
  // Journal Emoji Selection
  const emojiBtns = document.querySelectorAll("#journalEmojiGrid .emoji-btn");
  let selectedEmoji = "";
  
  emojiBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      emojiBtns.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedEmoji = btn.dataset.emoji;
    });
  });
  
  // Set date field to today by default
  document.getElementById("outingDate").value = new Date().toISOString().split('T')[0];
  
  // Journal Entry Submission
  const saveJournalBtn = document.getElementById("saveJournalBtn");
  saveJournalBtn.addEventListener("click", () => {
    const titleInput = document.getElementById("outingTitle");
    const dateInput = document.getElementById("outingDate");
    const tierSelect = document.getElementById("outingTier");
    const energySlider = document.getElementById("energySlider");
    const notesInput = document.getElementById("outingNotes");
    
    if (!titleInput.value || !dateInput.value) {
      alert("Please fill in the Outing Title and Date!");
      return;
    }
    
    const entry = {
      title: titleInput.value,
      date: dateInput.value,
      tier: parseInt(tierSelect.value),
      emoji: selectedEmoji || "👣",
      notes: notesInput.value || "Excursion completed successfully.",
      energy: parseInt(energySlider.value)
    };
    
    state.journal.push(entry);
    updateStreak();
    addXP(25); // Award points for reflecting
    saveToLocalStorage();
    
    // Clear Form inputs
    titleInput.value = "";
    notesInput.value = "";
    selectedEmoji = "";
    emojiBtns.forEach(b => b.classList.remove("selected"));
    
    // Refresh feed and stats views
    renderDashboardStats();
    renderJournalTimeline();
    drawComfortRadar();
    
    // Focus timelines
    alert("Outing journal saved! +25 XP awarded.");
  });
  
  // Energy Slider Dashboard Logger
  const dashboardSlider = document.getElementById("energySlider");
  const valueDisplay = document.getElementById("energyValueText");
  const logEnergyBtn = document.getElementById("logEnergyBtn");
  
  dashboardSlider.addEventListener("input", (e) => {
    valueDisplay.innerText = `${e.target.value} / 10`;
  });
  
  logEnergyBtn.addEventListener("click", () => {
    const energyVal = parseInt(dashboardSlider.value);
    
    // Record energy log
    state.energyLogs.push({
      date: new Date().toISOString().split('T')[0],
      rating: energyVal
    });
    
    updateStreak();
    addXP(10); // Gamified boost for logging health parameters
    saveToLocalStorage();
    renderDashboardStats();
    
    alert(`Energy logged as ${energyVal}/10! Earned +10 XP.`);
  });
};

// -------------------------------------------------------------
// App Navigation Tab Controllers
// -------------------------------------------------------------
const setupNavigationTabs = () => {
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      
      // Toggle button states
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      // Toggle panel displays
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      document.getElementById(target).classList.add("active");
      
      // Perform specific tab actions
      if (target === "comfort") {
        // Redraw canvas radar mapping
        setTimeout(drawComfortRadar, 50);
      }
      if (target === "quests") {
        renderQuestsGrid();
      }
    });
  });
  
  // Special buttons routing
  document.getElementById("goToQuestsTabBtn").addEventListener("click", () => {
    document.querySelector('.tab-btn[data-tab="quests"]').click();
  });
  
  // Quest filter pills
  const pills = document.querySelectorAll(".filter-pill");
  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      pills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      renderQuestsGrid(pill.dataset.filter);
    });
  });
};

// -------------------------------------------------------------
// Shared Utilities
// -------------------------------------------------------------
const escapeHTML = (str) => {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
};

const escapeJsString = (str) => {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const truncateString = (str, num) => {
  if (str.length <= num) return str;
  return str.slice(0, num) + '...';
};

// -------------------------------------------------------------
// App Initialization Entrance point
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Load local state
  loadFromLocalStorage();
  
  // Set up handlers
  setupNavigationTabs();
  setupFormSubmitHandlers();
  setupQuizHandlers();
  setupCanvasInteractiveHover();
  
  // Set up random starting inspiration quote
  const randomQ = quotesList[Math.floor(Math.random() * quotesList.length)];
  document.getElementById("inspirationQuote").innerText = `"${randomQ.text}"`;
  document.getElementById("inspirationAuthor").innerText = randomQ.author;
  
  // Render views
  updateUniversalHeader();
  renderDashboardStats();
  renderMiniQuests();
  renderQuestsGrid();
  renderJournalTimeline();
  
  // Comfort radar draws if visible on start
  if (document.getElementById("comfort").classList.contains("active")) {
    setTimeout(drawComfortRadar, 50);
  }
  
  // Resize handler for canvas sizing responsiveness
  window.addEventListener("resize", () => {
    if (document.getElementById("comfort").classList.contains("active")) {
      drawComfortRadar();
    }
  });
});
