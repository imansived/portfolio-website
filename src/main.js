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
    overview: 'Three agents — the Introspector, the Behaviorist, and the Gardener — answer the same question from genuinely different worldviews, and they’re not meant to agree. Conversations persist server-side, turning every session into a queryable corpus rather than something trapped in one browser tab.',
    role: 'Solo build — backend, frontend, and agent prompt design.',
    tools: ['Next.js', 'FastAPI', 'Gemini API', 'SQLite', 'Docker'],
    challenges: 'Proving the three agents actually think differently, not just vary in tone. Built an automated classifier (`npm run report`) that scores transcripts to check whether the agents stay genuinely distinct instead of converging toward the same voice.',
    results: 'Shipped two working frontends (Next.js and Streamlit) sharing one backend and one set of agent prompts, so the UIs can’t drift out of sync. Backend deployed on Railway, frontend on Vercel, with the API key kept fully server-side.'
  },
  {
    cat: 'Category',
    name: 'Project Name Two',
    overview: 'Placeholder overview — one or two sentences on what this project is and why you built it.',
    role: 'Placeholder role — e.g. Sole designer & developer, or your part in a team project.',
    tools: ['Python', 'Pandas', 'Matplotlib'],
    challenges: 'Placeholder — the trickiest problem you ran into and how you approached it.',
    results: 'Placeholder — the outcome, what you learned, or impact it had.'
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

  const toolsWrap = document.getElementById('modalTools');
  toolsWrap.innerHTML = '';
  p.tools.forEach(t => {
    const span = document.createElement('span');
    span.className = 'pill';
    span.textContent = t;
    toolsWrap.appendChild(span);
  });

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
