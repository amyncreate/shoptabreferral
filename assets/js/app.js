/**
 * ═══════════════════════════════════════════════════════════
 * REFERRAL HUB — Resource Scanner & Card Engine
 * Dynamically reads manifest.json and builds the UI
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

/* ── File type detection map ── */
const FILE_TYPE_MAP = {
  // Images
  jpg: 'image', jpeg: 'image', png: 'image', webp: 'image',
  gif: 'image', svg: 'image', bmp: 'image', avif: 'image',
  // Videos
  mp4: 'video', webm: 'video', mov: 'video', avi: 'video',
  mkv: 'video', m4v: 'video', ogv: 'video',
  // APKs
  apk: 'apk', xapk: 'apk', aab: 'apk',
  // Documents
  pdf: 'document', docx: 'document', doc: 'document',
  txt: 'document', xlsx: 'document', xls: 'document',
  pptx: 'document', ppt: 'document', csv: 'document',
  zip: 'document', rar: 'document',
};

/* ── Type metadata ── */
const TYPE_META = {
  image:    { label: 'Image',    icon: '🖼️',  badge: 'badge-image',    color: '#4cc9f0', emoji: '📸' },
  video:    { label: 'Video',    icon: '🎬',  badge: 'badge-video',    color: '#f72585', emoji: '🎥' },
  apk:      { label: 'APK',      icon: '📱',  badge: 'badge-apk',      color: '#43e97b', emoji: '⚡' },
  document: { label: 'Document', icon: '📄',  badge: 'badge-document', color: '#f9a825', emoji: '📋' },
  pdf:      { label: 'PDF',      icon: '📕',  badge: 'badge-pdf',      color: '#ff6b9d', emoji: '📕' },
};

/* ── Global state ── */
const state = {
  resources: [],    // All loaded resources
  filtered: [],     // Currently visible
  activeFilter: 'all',
  searchQuery: '',
  cancelDownload: false,
};

/* ── Detect type from file extension ── */
function detectType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  if (ext === 'pdf') return 'pdf';
  return FILE_TYPE_MAP[ext] || 'document';
}

/* ── Detect sub-type for documents ── */
function getDocIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const icons = {
    pdf: '📕', docx: '📘', doc: '📘', txt: '📝',
    xlsx: '📗', xls: '📗', pptx: '📙', ppt: '📙',
    csv: '📊', zip: '🗜️', rar: '🗜️',
  };
  return icons[ext] || '📄';
}

/* ── Build resource objects from manifest ── */
function buildResources(manifest) {
  const folders = ['images', 'videos', 'apks', 'documents'];
  const all = [];

  folders.forEach(folder => {
    const files = manifest[folder] || [];
    files.forEach((item, idx) => {
      const type = detectType(item.file);
      all.push({
        id: `${folder}-${idx}`,
        name: item.name || item.file,
        file: item.file,
        folder: folder,
        path: `resources/${folder}/${item.file}`,
        type: type,
        size: item.size || null,
        date: item.date || null,
      });
    });
  });

  return all;
}

/* ── Load manifest from server ── */
async function loadManifest() {
  try {
    const res = await fetch('resources/manifest.json?v=' + Date.now());
    if (!res.ok) throw new Error('Manifest not found');
    return await res.json();
  } catch (err) {
    console.warn('[ReferralHub] Could not load manifest.json:', err.message);
    return null;
  }
}

/* ═══════════════════════════════════════════════════════════
   CARD GENERATION
═══════════════════════════════════════════════════════════ */
function buildCard(resource, delay = 0) {
  const { id, name, file, path, type, size, folder } = resource;
  const meta = TYPE_META[type] || TYPE_META.document;

  const card = document.createElement('div');
  card.className = 'resource-card';
  card.dataset.id = id;
  card.dataset.type = type;
  card.dataset.folder = folder;
  card.dataset.name = name.toLowerCase();
  card.dataset.file = file.toLowerCase();
  card.style.animationDelay = `${delay}ms`;

  let previewHtml = '';

  if (type === 'image') {
    previewHtml = `
      <div class="card-preview">
        <img
          src="${path}"
          alt="${name}"
          loading="lazy"
          onerror="this.parentNode.innerHTML=getIconPreview('image','${name}')"
        />
        <span class="type-badge ${meta.badge}">${meta.label}</span>
      </div>`;

  } else if (type === 'video') {
    previewHtml = `
      <div class="card-preview">
        <video
          src="${path}"
          muted
          loop
          preload="none"
          class="vid-preview"
          onerror="this.parentNode.innerHTML=getIconPreview('video','${name}')"
        ></video>
        <div class="play-overlay">
          <button class="play-btn" onclick="toggleVideoPlay(this)" title="Play preview">▶</button>
        </div>
        <span class="type-badge ${meta.badge}">${meta.label}</span>
      </div>`;

  } else if (type === 'apk') {
    previewHtml = `
      <div class="card-preview">
        <div class="preview-icon-wrap">
          <div class="preview-icon">📱</div>
          <div class="preview-label">Android App</div>
        </div>
        <span class="type-badge ${meta.badge}">${meta.label}</span>
      </div>`;

  } else {
    // Document / PDF
    const docIcon = getDocIcon(file);
    const docLabel = type === 'pdf' ? 'PDF Document' : 'Document';
    previewHtml = `
      <div class="card-preview">
        <div class="preview-icon-wrap">
          <div class="preview-icon">${docIcon}</div>
          <div class="preview-label">${docLabel}</div>
        </div>
        <span class="type-badge ${meta.badge}">${type === 'pdf' ? 'PDF' : 'Doc'}</span>
      </div>`;
  }

  const sizeHtml = size ? `<span class="card-size">${size}</span>` : '';

  card.innerHTML = `
    ${previewHtml}
    <div class="card-body">
      <div class="card-meta">
        <span class="card-name" title="${name}">${name}</span>
        ${sizeHtml}
      </div>
      <div class="card-filename">${file}</div>
      <div class="card-footer">
        <a
          href="${path}"
          download="${file}"
          class="btn-download"
          onclick="onCardDownload(event, '${name}')"
          title="Download ${name}"
        >
          <i class="fa-solid fa-download"></i> Download
        </a>
      </div>
    </div>
  `;

  return card;
}

/* Helper used by onerror fallback */
window.getIconPreview = function(type, name) {
  const icons = { image: '🖼️', video: '🎬' };
  return `<div class="preview-icon-wrap">
    <div class="preview-icon">${icons[type] || '📄'}</div>
    <div class="preview-label">${name}</div>
  </div>`;
};

/* ── Render all cards into grid ── */
function renderCards(resources) {
  const grid = document.getElementById('resource-grid');
  const emptyState = document.getElementById('empty-state');

  // Clear non-empty-state children
  Array.from(grid.children).forEach(c => {
    if (!c.id) grid.removeChild(c);
  });

  if (resources.length === 0) {
    emptyState.classList.add('visible');
    return;
  }

  emptyState.classList.remove('visible');

  resources.forEach((res, idx) => {
    const card = buildCard(res, idx * 60);
    grid.insertBefore(card, emptyState);
  });

  // Setup video hover previews
  setupVideoHovers();
}

/* ── Video hover play ── */
function setupVideoHovers() {
  document.querySelectorAll('.vid-preview').forEach(vid => {
    const card = vid.closest('.resource-card');
    card.addEventListener('mouseenter', () => {
      vid.play().catch(() => {});
    });
    card.addEventListener('mouseleave', () => {
      vid.pause();
      vid.currentTime = 0;
    });
  });
}

/* Toggle play on click */
window.toggleVideoPlay = function(btn) {
  const vid = btn.closest('.card-preview').querySelector('video');
  if (!vid) return;
  if (vid.paused) {
    vid.play();
    btn.textContent = '⏸';
  } else {
    vid.pause();
    btn.textContent = '▶';
  }
};

/* ═══════════════════════════════════════════════════════════
   FILTERING & SEARCH
═══════════════════════════════════════════════════════════ */
function applyFilters() {
  const { activeFilter, searchQuery, resources } = state;

  let filtered = resources;

  // Type filter
  if (activeFilter !== 'all') {
    filtered = filtered.filter(r => {
      if (activeFilter === 'documents') return r.type === 'document' || r.type === 'pdf';
      return r.type === activeFilter;
    });
  }

  // Search
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.file.toLowerCase().includes(q) ||
      r.type.includes(q) ||
      r.folder.includes(q)
    );
  }

  state.filtered = filtered;
  renderCards(filtered);
  updateResultsBar(filtered.length, resources.length);
}

function updateResultsBar(shown, total) {
  const el = document.getElementById('results-text');
  if (!el) return;
  if (shown === total) {
    el.innerHTML = `Showing <strong>${total}</strong> resource${total !== 1 ? 's' : ''}`;
  } else {
    el.innerHTML = `Showing <strong>${shown}</strong> of <strong>${total}</strong> resources`;
  }
}

/* ── Setup filter pills ── */
function setupFilters() {
  document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeFilter = pill.dataset.filter;
      applyFilters();
    });
  });
}

/* ── Setup search ── */
function setupSearch() {
  const input = document.getElementById('search-input');
  const clear = document.getElementById('search-clear');

  if (!input) return;

  let debounceTimer;

  input.addEventListener('input', () => {
    state.searchQuery = input.value;
    clear.classList.toggle('visible', input.value.length > 0);

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      applyFilters();
    }, 220);
  });

  clear?.addEventListener('click', () => {
    input.value = '';
    state.searchQuery = '';
    clear.classList.remove('visible');
    applyFilters();
    input.focus();
  });
}

/* ── Update pill counts ── */
function updatePillCounts(resources) {
  const counts = { all: resources.length, image: 0, video: 0, apk: 0, documents: 0 };
  resources.forEach(r => {
    if (r.type === 'image') counts.image++;
    else if (r.type === 'video') counts.video++;
    else if (r.type === 'apk') counts.apk++;
    else if (r.type === 'document' || r.type === 'pdf') counts.documents++;
  });

  document.querySelectorAll('.pill').forEach(pill => {
    const count = pill.querySelector('.pill-count');
    if (!count) return;
    const filter = pill.dataset.filter;
    if (filter === 'images') count.textContent = counts.image;
    else if (filter === 'videos') count.textContent = counts.video;
    else if (filter === 'apks') count.textContent = counts.apk;
    else if (filter === 'documents') count.textContent = counts.documents;
    else count.textContent = counts.all;
  });
}

/* ═══════════════════════════════════════════════════════════
   DOWNLOAD SYSTEM
═══════════════════════════════════════════════════════════ */
function onCardDownload(event, name) {
  showToast(` Downloading "${name}"...`, 'info');
  // native <a download> handles the actual download
}

window.onCardDownload = onCardDownload;

async function downloadAllResources() {
  const resources = state.filtered.length > 0 ? state.filtered : state.resources;
  if (resources.length === 0) {
    showToast('⚠ No resources to download', 'error');
    return;
  }

  const overlay = document.getElementById('download-overlay');
  const fill = document.getElementById('dl-bar-fill');
  const progressText = document.getElementById('dl-progress-text');
  const fileList = document.getElementById('dl-file-list');

  overlay.classList.add('visible');
  state.cancelDownload = false;

  // Build file list UI
  fileList.innerHTML = resources.map((r, i) =>
    `<div class="dl-file-item" id="dl-item-${i}">
      <span>${TYPE_META[r.type]?.icon || '📄'}</span>
      <span>${r.name}</span>
    </div>`
  ).join('');

  for (let i = 0; i < resources.length; i++) {
    if (state.cancelDownload) break;

    const res = resources[i];
    const pct = Math.round(((i) / resources.length) * 100);

    // Update UI
    fill.style.width = pct + '%';
    progressText.textContent = `Downloading ${i + 1} of ${resources.length}...`;

    // Highlight current item
    document.querySelectorAll('.dl-file-item').forEach(el => el.classList.remove('current'));
    const currentItem = document.getElementById(`dl-item-${i}`);
    currentItem?.classList.add('current');

    // Trigger download
    const link = document.createElement('a');
    link.href = res.path;
    link.download = res.file;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Mark done
    currentItem?.classList.remove('current');
    currentItem?.classList.add('done');
    if (currentItem) currentItem.querySelector('span:first-child').textContent = '✅';

    // Stagger downloads
    await sleep(700);
  }

  // Complete
  fill.style.width = '100%';
  progressText.textContent = state.cancelDownload
    ? 'Download cancelled.'
    : `All ${resources.length} resources queued!`;

  await sleep(1200);
  overlay.classList.remove('visible');

  if (!state.cancelDownload) {
    showToast(`✅ All ${resources.length} resources downloaded!`, 'success');
  }
}

function cancelDownloadAll() {
  state.cancelDownload = true;
  document.getElementById('download-overlay').classList.remove('visible');
  showToast('❌ Download cancelled', 'error');
}

/* ═══════════════════════════════════════════════════════════
   TOAST NOTIFICATIONS
═══════════════════════════════════════════════════════════ */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <span class="toast-msg">${message}</span>
    <div class="toast-progress"></div>
  `;

  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}

window.showToast = showToast;

/* ═══════════════════════════════════════════════════════════
   ANIMATED COUNTERS
═══════════════════════════════════════════════════════════ */
function animateCounter(el, target, duration = 1200) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = Math.round(start);
    if (start >= target) clearInterval(timer);
  }, 16);
}

function updateStats(resources) {
  const counts = { total: resources.length, image: 0, video: 0, apk: 0, doc: 0 };
  resources.forEach(r => {
    if (r.type === 'image') counts.image++;
    else if (r.type === 'video') counts.video++;
    else if (r.type === 'apk') counts.apk++;
    else counts.doc++;
  });

  const statTotal = document.getElementById('stat-total');
  const statImages = document.getElementById('stat-images');
  const statVideos = document.getElementById('stat-videos');
  const statApks = document.getElementById('stat-apks');

  if (statTotal) animateCounter(statTotal, counts.total);
  if (statImages) animateCounter(statImages, counts.image);
  if (statVideos) animateCounter(statVideos, counts.video);
  if (statApks) animateCounter(statApks, counts.apk + counts.doc);
}

/* ═══════════════════════════════════════════════════════════
   TYPING ANIMATION
═══════════════════════════════════════════════════════════ */
function setupTypingAnimation() {
  const el = document.getElementById('typing-text');
  if (!el) return;

  const phrases = [
    'Flyers, Videos, Documents & More',
    'Everything You Need to Promote',
    'Share & Earn with ShopTab',
    'Premium Marketing Assets',
    'Download. Share. Earn.',
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;

  function tick() {
    const phrase = phrases[phraseIdx];

    if (deleting) {
      charIdx--;
    } else {
      charIdx++;
    }

    el.textContent = phrase.substring(0, charIdx);

    let delay = deleting ? 45 : 80;

    if (!deleting && charIdx === phrase.length) {
      delay = 2200;
      deleting = true;
    } else if (deleting && charIdx === 0) {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      delay = 400;
    }

    setTimeout(tick, delay);
  }

  tick();
}

/* ═══════════════════════════════════════════════════════════
   THEME TOGGLE
═══════════════════════════════════════════════════════════ */
function setupThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('rh-theme') || 'dark';
  document.documentElement.dataset.theme = saved;
  if (btn) btn.textContent = saved === 'dark' ? '☀️' : '🌙';

  btn?.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme;
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('rh-theme', next);
    btn.textContent = next === 'dark' ? '☀️' : '🌙';
  });
}

/* ═══════════════════════════════════════════════════════════
   OFFLINE DETECTION
═══════════════════════════════════════════════════════════ */
function setupOfflineDetection() {
  const banner = document.getElementById('offline-banner');

  function update() {
    if (!navigator.onLine) {
      banner?.classList.add('visible');
    } else {
      banner?.classList.remove('visible');
    }
  }

  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}

/* ═══════════════════════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════════════════════ */
function setupScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════════════════════════
   SKELETONS
═══════════════════════════════════════════════════════════ */
function showSkeletons(count = 6) {
  const grid = document.getElementById('resource-grid');
  for (let i = 0; i < count; i++) {
    const skel = document.createElement('div');
    skel.className = 'skeleton-card';
    skel.innerHTML = `
      <div class="skeleton-preview"></div>
      <div class="skeleton-body">
        <div class="skeleton-line medium"></div>
        <div class="skeleton-line short"></div>
        <div class="skeleton-line"></div>
      </div>
    `;
    skel.style.animationDelay = `${i * 80}ms`;
    grid.appendChild(skel);
  }
}

function clearSkeletons() {
  document.querySelectorAll('.skeleton-card').forEach(s => s.remove());
}

/* ── Utility ── */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ═══════════════════════════════════════════════════════════
   MAIN INIT
═══════════════════════════════════════════════════════════ */
async function init() {
  setupThemeToggle();
  setupOfflineDetection();
  setupTypingAnimation();

  // Show loading screen
  const loadingScreen = document.getElementById('loading-screen');

  // Show skeletons while loading
  showSkeletons(6);

  // Load manifest
  const manifest = await loadManifest();

  // Simulate minimum load time for UX
  await sleep(1800);

  // Hide loading screen
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
  }

  clearSkeletons();

  if (!manifest) {
    showToast('⚠ Could not load resources. Check manifest.json', 'error');
    document.getElementById('empty-state').classList.add('visible');
    return;
  }

  // Build resources
  state.resources = buildResources(manifest);
  state.filtered = [...state.resources];

  // Update UI
  updateStats(state.resources);
  updatePillCounts(state.resources);
  renderCards(state.resources);
  updateResultsBar(state.resources.length, state.resources.length);

  // Setup interactivity
  setupFilters();
  setupSearch();
  setupScrollReveal();

  // Bind download all button
  const dlBtn = document.getElementById('btn-download-all');
  dlBtn?.addEventListener('click', downloadAllResources);

  const dlBtnHero = document.getElementById('btn-download-all-hero');
  dlBtnHero?.addEventListener('click', downloadAllResources);

  const cancelBtn = document.getElementById('btn-cancel-dl');
  cancelBtn?.addEventListener('click', cancelDownloadAll);
}

// Boot
document.addEventListener('DOMContentLoaded', init);
