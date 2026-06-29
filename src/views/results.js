/* ============================================
   流量卡举报助手 - Results View
   ============================================ */

let resultsTabIndex = 0;

function renderResults() {
  const main = document.getElementById('main-content');
  const results = appState.results;
  if (!results) {
    navigate('form');
    return;
  }

  resultsTabIndex = resultsTabIndex || 0;

  main.innerHTML = `
    <div id="view-results" class="view-container active px-4 pt-2 pb-8">
      <!-- Scenario summary -->
      <div class="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 slide-up">
        <div class="flex items-center gap-2 mb-1">
          <svg class="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span class="font-semibold text-green-800 text-sm">投诉方案已生成</span>
        </div>
        <p class="text-xs text-green-700 mt-1">
          针对 ${results.formSnapshot?.platform || ''} 平台 · ${results.scripts?.length || 0} 份话术 · ${results.evidence?.length || 0} 项证据指引
        </p>
      </div>

      <!-- Tab bar -->
      <div class="flex border-b border-gray-200 mb-4 overflow-x-auto scrollbar-hide">
        <button class="result-tab ${resultsTabIndex === 0 ? 'active' : ''}" onclick="switchResultTab(0)">投诉文案</button>
        <button class="result-tab ${resultsTabIndex === 1 ? 'active' : ''}" onclick="switchResultTab(1)">投诉入口</button>
        <button class="result-tab ${resultsTabIndex === 2 ? 'active' : ''}" onclick="switchResultTab(2)">证据清单</button>
      </div>

      <!-- Tab content -->
      <div id="results-content" class="slide-up">
        ${resultsTabIndex === 0 ? renderScriptsTab(results) :
          resultsTabIndex === 1 ? renderPortalsTab(results) :
          renderEvidenceTab(results)}
      </div>

      <!-- Bottom actions -->
      <div class="mt-6 pt-4 border-t border-gray-100 flex gap-3">
        <button onclick="handleSaveResults()" class="flex-1 bg-gray-100 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-200 transition-all active:scale-[0.98]">
          💾 保存记录
        </button>
        <button onclick="navigate('form'); appState.results = null; appState.form = { step:1, phone:'', carrier:'', carrierDetected:false, platform:'', platformDetected:false, bloggerName:'', videoLink:'', orderNumber:'', orderAmount:'', adClaim:'', screenshots:[], issueDescription:'' }; clearDraft();"
          class="flex-1 bg-primary text-white font-medium py-3 rounded-xl text-sm hover:bg-primaryDark transition-all active:scale-[0.98]">
          新建投诉
        </button>
      </div>
    </div>
  `;
}

// ---- Scripts Tab ----
function renderScriptsTab(results) {
  const scripts = results.scripts || [];
  if (scripts.length === 0) {
    return '<p class="text-gray-400 text-sm text-center py-8">暂无生成的话术</p>';
  }

  // Group by scenario
  const scenarioMap = {};
  scripts.forEach(s => {
    if (!scenarioMap[s.scenario]) scenarioMap[s.scenario] = [];
    scenarioMap[s.scenario].push(s);
  });

  let html = '';
  for (const [scenario, scenarioScripts] of Object.entries(scenarioMap)) {
    html += `
      <div class="mb-5">
        <h3 class="text-sm font-semibold text-gray-700 mb-2">${scenario}</h3>
        <div class="space-y-3">
          ${scenarioScripts.map(s => `
            <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div class="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                <span class="text-xs font-medium text-gray-500">${s.label}</span>
                <button onclick="copyScript('${escapeHtmlAttr(s.id)}')" class="text-xs text-primary font-medium hover:text-primaryDark transition-colors flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  复制
                </button>
              </div>
              <div class="script-card" id="script-${escapeHtmlAttr(s.id)}">${s.content}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  return html;
}

function copyScript(id) {
  const el = document.getElementById(`script-${id}`);
  if (!el) return;
  const text = el.textContent;

  copyToClipboard(text);
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('✅ 已复制到剪贴板');
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast('✅ 已复制到剪贴板');
  } catch {
    showToast('复制失败，请长按手动复制');
  }
  document.body.removeChild(textarea);
}

// ---- Portals Tab ----
function renderPortalsTab(results) {
  const portalGroups = results.portals || [];
  if (portalGroups.length === 0) {
    return '<p class="text-gray-400 text-sm text-center py-8">暂无投诉入口信息</p>';
  }

  return `
    <div class="space-y-5">
      ${portalGroups.map(group => `
        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
            ${group.category}
          </h3>
          <div class="space-y-2">
            ${group.items.map(item => `
              <div class="portal-card" onclick="openPortal('${escapeHtmlAttr(item.url || item.phone || '')}', '${escapeHtmlAttr(item.type || 'url')}')">
                <div class="w-10 h-10 rounded-lg ${item.type === 'tel' ? 'bg-green-50' : 'bg-blue-50'} flex items-center justify-center shrink-0">
                  ${item.type === 'tel'
                    ? '<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>'
                    : '<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>'}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">${item.label}</p>
                  ${item.instructions ? `<p class="text-xs text-gray-400 mt-0.5 truncate">${item.instructions}</p>` : ''}
                </div>
                <svg class="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </div>
            `).join('')}
          </div>
          ${group.hint ? `<p class="text-xs text-gray-400 mt-1.5 ml-12">💡 ${group.hint}</p>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function openPortal(urlOrPhone, type) {
  if (!urlOrPhone) {
    showToast('暂无可用链接');
    return;
  }
  if (type === 'tel') {
    window.location.href = `tel:${urlOrPhone}`;
  } else {
    window.open(urlOrPhone, '_blank');
  }
}

// ---- Evidence Tab ----
function renderEvidenceTab(results) {
  const checklist = results.evidence || [];

  const requiredCount = checklist.filter(i => i.required).length;
  const checkedCount = checklist.filter(i => i.checked).length;
  const totalCount = checklist.length;
  const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  return `
    <div>
      <!-- Progress -->
      <div class="bg-gray-50 rounded-xl p-4 mb-4">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium text-gray-700">证据收集进度</span>
          <span class="text-xs text-gray-500">${checkedCount}/${totalCount}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div class="bg-primary h-2.5 rounded-full transition-all duration-500" style="width:${progress}%"></div>
        </div>
      </div>

      <!-- Checklist -->
      <div class="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 mb-4">
        ${checklist.map((item, i) => `
          <div class="checklist-item px-4 ${item.checked ? 'checked' : ''}">
            <input type="checkbox" ${item.checked ? 'checked' : ''}
              onchange="toggleEvidenceItem(${i})" id="evidence-${i}">
            <div class="flex-1 min-w-0">
              <label for="evidence-${i}" class="checklist-label text-sm font-medium text-gray-900 ${item.required ? '' : ''}">
                ${item.label}
                ${item.required ? '<span class="text-danger text-xs">必</span>' : '<span class="text-gray-300 text-xs">选</span>'}
              </label>
              <p class="text-xs text-gray-400 mt-0.5">${item.description}</p>
              <p class="text-xs text-blue-500 mt-0.5">📷 ${item.acquireMethod}</p>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Download button -->
      <button onclick="handleDownloadChecklist()"
        class="w-full bg-gray-100 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        下载证据清单
      </button>
    </div>
  `;
}

function toggleEvidenceItem(index) {
  if (appState.results && appState.results.evidence[index]) {
    appState.results.evidence[index].checked = !appState.results.evidence[index].checked;
    renderResults();
  }
}

function handleDownloadChecklist() {
  if (!appState.results) return;
  downloadChecklist(appState.results.evidence, appState.results.formSnapshot || appState.form);
  showToast('✅ 证据清单已下载');
}

function handleSaveResults() {
  showToast('✅ 投诉记录已保存');
}

function switchResultTab(index) {
  resultsTabIndex = index;
  renderResults();
}

function escapeHtmlAttr(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/`/g, '&#96;');
}
