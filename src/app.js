/* ============================================
   流量卡举报助手 - Main Application
   ============================================ */

// ---- Global State ----
const appState = {
  form: {
    step: 1,
    phone: '',
    carrier: '',
    carrierDetected: false,
    platform: '',
    platformDetected: false,
    bloggerName: '',
    videoLink: '',
    orderNumber: '',
    orderAmount: '',
    adClaim: '',
    screenshots: [],
    issueDescription: '',
  },
  results: null,
  ui: {
    activeView: 'welcome',
    isGenerating: false,
  },
};

// ---- Router ----
const ROUTES = ['welcome', 'form', 'results', 'history'];

function navigate(view, options) {
  if (!ROUTES.includes(view)) view = 'welcome';

  // Guard: results requires form data
  if (view === 'results' && !appState.results) {
    view = 'form';
  }

  appState.ui.activeView = view;

  // Hide all views
  document.querySelectorAll('.view-container').forEach(el => {
    el.classList.remove('active');
  });

  // Show target view
  const targetEl = document.getElementById(`view-${view}`);
  if (targetEl) {
    targetEl.classList.add('active');
  }

  // Update header
  updateHeader(view);

  // Update bottom nav
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === view);
  });

  // Hide bottom nav on form steps (except initial)
  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav) {
    bottomNav.style.display = (view === 'form' && appState.form.step > 1) ? 'none' : 'flex';
  }

  // Render view
  switch (view) {
    case 'welcome': renderWelcome(); break;
    case 'form': renderForm(options); break;
    case 'results': renderResults(); break;
    case 'history': renderHistory(); break;
  }

  window.location.hash = view;
  window.scrollTo(0, 0);
}

function updateHeader(view) {
  const title = document.getElementById('header-title');
  const backBtn = document.getElementById('btn-back');

  const titles = {
    welcome: '流量卡举报助手',
    form: '填写投诉信息',
    results: '投诉方案',
    history: '投诉记录',
  };
  title.textContent = titles[view] || '流量卡举报助手';

  if (view === 'form' && appState.form.step > 1) {
    backBtn.classList.remove('hidden');
    backBtn.onclick = () => {
      if (appState.form.step > 1) {
        appState.form.step--;
        navigate('form');
      } else {
        navigate('welcome');
      }
    };
  } else if (view === 'results') {
    backBtn.classList.remove('hidden');
    backBtn.onclick = () => navigate('form');
  } else {
    backBtn.classList.add('hidden');
  }
}

// ---- Toast System ----
function showToast(message, duration) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast bg-gray-800 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, duration || 2500);
}

// ---- Initialize ----
document.addEventListener('DOMContentLoaded', () => {
  // Load saved draft
  const draft = loadDraft();
  if (draft) {
    Object.assign(appState.form, draft);
  }

  // Render initial view
  const hash = window.location.hash.replace('#', '') || 'welcome';
  navigate(hash);

  // Hash change listener
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'welcome';
    if (hash !== appState.ui.activeView) {
      navigate(hash);
    }
  });

  // Nav tab click listeners
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      navigate(tab.dataset.view);
    });
  });
});
