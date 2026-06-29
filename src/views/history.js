/* ============================================
   流量卡举报助手 - History View
   ============================================ */

function renderHistory() {
  const main = document.getElementById('main-content');
  const history = loadHistory();

  main.innerHTML = `
    <div id="view-history" class="view-container active px-4 pt-2 pb-8">
      ${history.length === 0 ? renderEmptyHistory() : renderHistoryList(history)}
    </div>
  `;

  // Bind events
  document.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', function() {
      const id = this.dataset.id;
      showHistoryDetail(id);
    });
  });

  document.querySelectorAll('.btn-delete-history').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const id = this.dataset.id;
      if (confirm('确定删除这条投诉记录吗？')) {
        deleteFromHistory(id);
        renderHistory();
        showToast('已删除');
      }
    });
  });
}

function renderEmptyHistory() {
  return `
    <div class="flex flex-col items-center justify-center pt-16 pb-8">
      <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-1">暂无投诉记录</h3>
      <p class="text-sm text-gray-400 mb-6">完成投诉方案后自动保存到这里</p>
      <button onclick="navigate('form')" class="bg-primary text-white font-semibold py-3 px-8 rounded-xl text-sm shadow-sm hover:bg-primaryDark transition-all active:scale-[0.98]">
        开始投诉
      </button>
    </div>
  `;
}

function renderHistoryList(history) {
  return `
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-base font-semibold text-gray-900">投诉记录</h2>
      <span class="text-xs text-gray-400">共 ${history.length} 条</span>
    </div>
    <div class="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
      ${history.map(item => {
        const date = item.createdAt ? new Date(item.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
        return `
          <div class="history-item" data-id="${item.id}">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-medium text-primary bg-blue-50 px-2 py-0.5 rounded">${item.platform || '流量卡'}</span>
                ${item.carrier ? `<span class="text-xs text-gray-400">${item.carrier}</span>` : ''}
              </div>
              <button class="btn-delete-history text-gray-300 hover:text-danger transition-colors p-1" data-id="${item.id}" aria-label="删除">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
            <p class="text-sm text-gray-700 truncate">${escapeHtml(item.summary || item.bloggerName || '流量卡投诉')}</p>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs text-gray-400">${date || ''}</span>
              <span class="text-xs text-gray-300">·</span>
              <span class="text-xs text-gray-400">${item.bloggerName || '未知博主'}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function showHistoryDetail(id) {
  const history = loadHistory();
  const item = history.find(h => h.id === id);
  if (!item) { showToast('记录未找到'); return; }

  // Restore to results view
  appState.results = {
    scripts: item.scripts || [],
    portals: item.portals || [],
    evidence: item.evidence || [],
    formSnapshot: {
      platform: item.platform,
      carrier: item.carrier,
      bloggerName: item.bloggerName,
      phone: item.phone,
    },
    createdAt: item.createdAt,
  };

  navigate('results');
}
