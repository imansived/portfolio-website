import './style.css';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover)').matches;

const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); });
}, { threshold: 0.15 });
reveals.forEach(el => io.observe(el));

// ---- Hero name: scramble/decode into place — the one hero interaction ----
function scrambleText(el, finalText, opts = {}) {
  const chars = opts.chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const stagger = opts.stagger ?? 70;
  const tick = opts.tick ?? 40;
  const settleAfter = opts.settleAfter ?? 260;
  const letters = finalText.split('');
  const lockTimes = letters.map((_, i) => settleAfter + i * stagger);
  const start = performance.now();
  (function step(){
    const elapsed = performance.now() - start;
    let out = '';
    let allLocked = true;
    letters.forEach((ch, i) => {
      if (ch === ' ') { out += ' '; return; }
      if (elapsed >= lockTimes[i]) { out += ch; }
      else { allLocked = false; out += chars[Math.floor(Math.random() * chars.length)]; }
    });
    el.textContent = out;
    if (!allLocked) setTimeout(step, tick);
  })();
}
const wmBold = document.getElementById('wmBold');
if (wmBold && !reduceMotion) {
  const finalName = wmBold.textContent;
  setTimeout(() => scrambleText(wmBold, finalName, { stagger:70, tick:40, settleAfter:260 }), 340);
}

// ---- Scroll progress — a quiet single line, no attached button ----
const progressBar = document.getElementById('progressBar');
function updateProgress(){
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;
  progressBar.style.width = (pct * 100) + '%';
}
window.addEventListener('scroll', updateProgress, { passive:true });
window.addEventListener('resize', updateProgress);
updateProgress();

// ---- Project data (placeholder — swap in real case studies) ----
const PROJECTS = [
  {
    cat: 'AI / Full-Stack',
    name: 'Other Minds',
    overview: '“You ask an AI. It agrees with you. That’s the failure mode this project exists to avoid.” Three agents — the Introspector, the Behaviorist, and the Gardener — examine the same question through deliberately different, sometimes conflicting worldviews instead of converging on consensus.',
    role: 'Solo build — backend, frontend, and agent prompt design.',
    tools: ['Python', 'FastAPI', 'Next.js', 'Streamlit', 'Gemini API', 'SQLite', 'Docker'],
    challenges: 'Proving the three agents actually think differently, not just vary in tone — `npm run report` trains a classifier to guess which agent wrote a line from text alone; scores near 33% mean they’re converging, scores above mean they’re genuinely distinct. A separate detector (`backend/app/epistemics.py`) enforces a “hypothesis is not fact” rule across six claim levels: 100/100 core test cases pass, with 9 documented gaps found through adversarial testing.',
    results: 'Two frontends (Next.js and Streamlit) share one backend and a single orchestrator (`backend/app/orchestrator.py`), so they can’t drift out of sync. The API key never reaches the browser — requests are proxied server-side — with the backend on Railway and the frontend on Vercel.'
  },
  {
    cat: 'Game / AI',
    name: 'Branch Wars',
    overview: '“A 2048-style tile-merging game themed around the Indian engineering ‘branch wars’ — merge your way from Civil up through Mech, Instru, E&TC, Robotics, AI&DS, IT, and finally CS.” Merge two CS tiles and “placement season” triggers, revealing your final outcome.',
    role: 'Solo build — game design, mechanics, and the AI solver.',
    tools: ['React', 'Vite', 'Web Audio API', 'Vitest'],
    challenges: 'Building an AI solver using expectimax search — the same algorithm family as classic 2048 AIs. Max nodes evaluate all four directional moves while chance nodes average outcomes across possible tile spawns, with search depth adapting to board density. The evaluator balances four heuristics: empty-cell count, monotonicity, smoothness, and corner-anchoring.',
    results: 'Kept game and AI logic framework-agnostic — `game/` and `ai/` have zero React dependencies, with all state centralized in one `useGameState.js` hook. Sound effects are fully synthesized through the Web Audio API rather than loaded audio files.'
  },
  {
    cat: 'Category',
    name: 'Project Name Three',
    overview: 'Placeholder overview — one or two sentences on what this project is and why you built it.',
    role: 'Placeholder role — e.g. Sole designer & developer, or your part in a team project.',
    tools: ['Illustrator', 'After Effects'],
    challenges: 'Placeholder — the trickiest problem you ran into and how you approached it.',
    results: 'Placeholder — the outcome, what you learned, or impact it had.'
  },
  {
    cat: 'Category',
    name: 'Project Name Four',
    overview: 'Placeholder overview — one or two sentences on what this project is and why you built it.',
    role: 'Placeholder role — e.g. Sole designer & developer, or your part in a team project.',
    tools: ['Node.js', 'MongoDB', 'Express'],
    challenges: 'Placeholder — the trickiest problem you ran into and how you approached it.',
    results: 'Placeholder — the outcome, what you learned, or impact it had.'
  }
];

// ---- Project detail modal ----
const backdrop = document.getElementById('modalBackdrop');
const closeBtn = document.getElementById('modalClose');
const projects = document.querySelectorAll('.project');
let lastFocused = null;

function openModal(idx){
  const p = PROJECTS[idx];
  if(!p) return;
  document.getElementById('modalCat').textContent = p.cat;
  document.getElementById('modalTitle').textContent = p.name;
  document.getElementById('modalOverview').textContent = p.overview;
  document.getElementById('modalRole').textContent = p.role;
  document.getElementById('modalChallenges').textContent = p.challenges;
  document.getElementById('modalResults').textContent = p.results;

  document.getElementById('modalTools').textContent = p.tools.join(' · ');

  lastFocused = document.activeElement;
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
  closeBtn.focus();
}

function closeModal(){
  backdrop.classList.remove('open');
  document.body.style.overflow = '';
  if (lastFocused) lastFocused.focus();
}

projects.forEach(project => {
  const idx = Number(project.dataset.project);
  project.addEventListener('click', () => openModal(idx));
  project.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(idx); }
  });
});

closeBtn.addEventListener('click', closeModal);
backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && backdrop.classList.contains('open')) closeModal();
});

// ---- Project demo videos: muted autoplay, click-to-unmute, pause when off-screen ----
document.querySelectorAll('.video-mute-btn').forEach(btn => {
  const video = btn.closest('.project-art')?.querySelector('video');
  if (!video) return;
  const setState = () => {
    btn.classList.toggle('is-unmuted', !video.muted);
    btn.setAttribute('aria-pressed', String(!video.muted));
    btn.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
  };
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    video.muted = !video.muted;
    setState();
  });
  btn.addEventListener('keydown', (e) => e.stopPropagation());
  setState();
});

const projectVideos = document.querySelectorAll('.project-video');
if (projectVideos.length) {
  const videoIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.play().catch(() => {});
      else entry.target.pause();
    });
  }, { threshold: 0.2 });
  projectVideos.forEach(v => videoIo.observe(v));
}

// ---- Magnetic primary CTA (kept — everything else quieted down) ----
if (!reduceMotion && canHover) {
  document.querySelectorAll('.btn-solid').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      btn.style.transform = `translate(${(x * 12).toFixed(2)}px, ${(y * 12).toFixed(2)}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}
