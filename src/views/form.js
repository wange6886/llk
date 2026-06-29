/* ============================================
   流量卡举报助手 - Multi-step Form View
   ============================================ */

let formAutoSaveTimer = null;

function renderForm(options) {
  const main = document.getElementById('main-content');
  const step = appState.form.step || 1;

  main.innerHTML = `
    <div id="view-form" class="view-container active px-4 pt-2 pb-8">
      ${renderStepIndicator(step)}
      <div id="form-content" class="slide-up">
        ${step === 1 ? renderStep1() : step === 2 ? renderStep2() : renderStep3()}
      </div>
    </div>
  `;

  // Show/hide bottom nav
  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav) bottomNav.style.display = 'none';

  // Update header
  updateHeader('form');

  bindFormEvents(step);
}

function renderStepIndicator(step) {
  const steps = [
    { num: 1, label: '基本信息' },
    { num: 2, label: '订单信息' },
    { num: 3, label: '问题描述' },
  ];
  return `
    <div class="flex items-center mb-6 pt-2">
      ${steps.map((s, i) => {
        const status = s.num < step ? 'completed' : s.num === step ? 'active' : 'pending';
        const icon = status === 'completed'
          ? '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>'
          : s.num;
        return `
          <div class="step-dot ${status}">${icon}</div>
          ${i < steps.length - 1 ? `<div class="step-line ${status === 'pending' ? 'pending' : 'completed'}"></div>` : ''}
        `;
      }).join('')}
    </div>
    <p class="text-xs text-gray-400 text-center -mt-3 mb-4">
      ${step === 1 ? '请输入手机号，自动识别运营商' : step === 2 ? '填写推广平台和订单信息' : '描述遇到的问题'}
    </p>
  `;
}

// ---- Step 1: Basic Info ----
function renderStep1() {
  const carrier = appState.form.carrier;
  const carrierDetected = appState.form.carrierDetected;
  const carrierBadge = carrier && carrierDetected
    ? `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getCarrierColor(carrier)} mt-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        识别为：${carrier}
       </span>`
    : '';

  return `
    <div class="space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">手机号 <span class="text-danger">*</span></label>
        <input type="tel" id="input-phone" value="${escapeHtml(appState.form.phone)}"
          class="input-field text-lg tracking-widest" placeholder="请输入手机号"
          inputmode="numeric" maxlength="11" autocomplete="tel">
        <div id="carrier-result" class="mt-1.5">${carrierBadge}</div>
        <p class="text-xs text-gray-400 mt-1">输入手机号后自动识别所属运营商</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">推广平台 <span class="text-danger">*</span></label>
        <div class="grid grid-cols-3 gap-3" id="platform-select">
          ${['抖音', '小红书', 'B站'].map(p => `
            <button class="platform-option py-3 px-2 rounded-xl border-2 text-sm font-medium transition-all
              ${appState.form.platform === p ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}"
              data-platform="${p}">
              ${p}
            </button>
          `).join('')}
        </div>
        <p class="text-xs text-gray-400 mt-1.5">或在下一步粘贴视频/笔记链接自动识别</p>
      </div>

      <button onclick="handleStep1Next()" class="w-full bg-primary text-white font-semibold py-3.5 rounded-xl text-base shadow-sm hover:bg-primaryDark active:bg-primaryDark transition-all active:scale-[0.98]">
        下一步
      </button>
    </div>
  `;
}

function handleStep1Next() {
  const phone = document.getElementById('input-phone').value.replace(/\s/g, '');
  const activePlatform = document.querySelector('.platform-option.border-primary');
  const platform = activePlatform ? activePlatform.dataset.platform : '';

  if (phone.length !== 11 || !/^1\d{10}$/.test(phone)) {
    showToast('请输入正确的11位手机号');
    document.getElementById('input-phone').focus();
    return;
  }
  if (!platform) {
    showToast('请选择推广平台');
    return;
  }

  appState.form.phone = phone;
  appState.form.platform = platform;
  appState.form.platformDetected = true;
  appState.form.step = 2;
  saveDraft(appState.form);
  navigate('form');
}

// ---- Step 2: Order Info ----
function renderStep2() {
  return `
    <div class="space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">视频/笔记链接</label>
        <input type="url" id="input-link" value="${escapeHtml(appState.form.videoLink)}"
          class="input-field" placeholder="粘贴推广视频或笔记链接（可选）"
          inputmode="url" autocomplete="url">
        <div id="platform-detect-result" class="mt-1.5"></div>
        <p class="text-xs text-gray-400 mt-1">粘贴链接可自动识别平台，与上一步选择不一致时可更正</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">博主/UP主昵称 <span class="text-danger">*</span></label>
        <input type="text" id="input-blogger" value="${escapeHtml(appState.form.bloggerName)}"
          class="input-field" placeholder="输入推广该流量卡的博主昵称" maxlength="50">
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">订单编号</label>
        <input type="text" id="input-order" value="${escapeHtml(appState.form.orderNumber)}"
          class="input-field" placeholder="输入订单号（可选）" maxlength="50">
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">支付金额（元）</label>
        <input type="text" id="input-amount" value="${escapeHtml(appState.form.orderAmount)}"
          class="input-field" placeholder="如 19.9" inputmode="decimal" maxlength="10">
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">宣传承诺</label>
        <input type="text" id="input-adclaim" value="${escapeHtml(appState.form.adClaim)}"
          class="input-field" placeholder="如 "19元185G全国流量"" maxlength="100">
        <p class="text-xs text-gray-400 mt-1">广告宣传中承诺的套餐内容</p>
      </div>

      <div class="flex gap-3">
        <button onclick="appState.form.step--; navigate('form');"
          class="flex-1 bg-gray-100 text-gray-600 font-medium py-3.5 rounded-xl text-base hover:bg-gray-200 transition-all active:scale-[0.98]">
          上一步
        </button>
        <button onclick="handleStep2Next()"
          class="flex-1 bg-primary text-white font-semibold py-3.5 rounded-xl text-base shadow-sm hover:bg-primaryDark active:bg-primaryDark transition-all active:scale-[0.98]">
          下一步
        </button>
      </div>
    </div>
  `;
}

function handleStep2Next() {
  const blogger = document.getElementById('input-blogger').value.trim();
  if (!blogger) {
    showToast('请输入博主昵称');
    document.getElementById('input-blogger').focus();
    return;
  }

  appState.form.bloggerName = blogger;
  appState.form.videoLink = document.getElementById('input-link').value.trim();
  appState.form.orderNumber = document.getElementById('input-order').value.trim();
  appState.form.orderAmount = document.getElementById('input-amount').value.trim();
  appState.form.adClaim = document.getElementById('input-adclaim').value.trim();
  appState.form.step = 3;
  saveDraft(appState.form);
  navigate('form');
}

// ---- Step 3: Issue Description ----
function renderStep3() {
  const screenshots = appState.form.screenshots || [];
  const previews = screenshots.map((src, i) => `
    <div class="preview-item">
      <img src="${src}" alt="截图${i+1}">
      <button class="remove-btn" onclick="removeScreenshot(${i})">×</button>
    </div>
  `).join('');

  const canUploadMore = screenshots.length < 6;

  return `
    <div class="space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">遇到的问题 <span class="text-danger">*</span></label>
        <textarea id="input-issue" class="input-field min-h-[120px] resize-none" placeholder="请描述您遇到的问题，例如：&#10;· 激活后只到账30G，宣传说185G&#10;· 用了才发现每个月要扣额外的费用&#10;· 想注销客服说必须付违约金" maxlength="500">${escapeHtml(appState.form.issueDescription)}</textarea>
        <div class="flex justify-between mt-1">
          <p class="text-xs text-gray-400">描述越详细，生成的投诉话术越精准</p>
          <span id="char-count" class="text-xs text-gray-400">${(appState.form.issueDescription || '').length}/500</span>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">上传截图证据</label>
        <div class="preview-grid mb-2">
          ${previews}
        </div>
        ${canUploadMore ? `
        <div class="file-upload-area" onclick="document.getElementById('file-input').click()">
          <svg class="w-8 h-8 text-gray-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4"/>
          </svg>
          <p class="text-sm text-gray-500">点击上传截图（最多6张）</p>
          <p class="text-xs text-gray-400 mt-0.5">支持广告截图、订单截图、聊天记录等</p>
          <input id="file-input" type="file" accept="image/*" multiple class="hidden" onchange="handleFileUpload(event)">
        </div>
        ` : '<p class="text-xs text-gray-400">已达到最大上传数量（6张）</p>'}
      </div>

      <div class="flex gap-3 pt-2">
        <button onclick="appState.form.step--; navigate('form');"
          class="flex-1 bg-gray-100 text-gray-600 font-medium py-3.5 rounded-xl text-base hover:bg-gray-200 transition-all active:scale-[0.98]">
          上一步
        </button>
        <button id="btn-generate" onclick="handleGenerate()"
          class="flex-1 bg-primary text-white font-semibold py-3.5 rounded-xl text-base shadow-sm hover:bg-primaryDark transition-all active:scale-[0.98]">
          生成投诉方案
        </button>
      </div>
    </div>
  `;
}

function handleGenerate() {
  const issue = document.getElementById('input-issue').value.trim();
  if (!issue || issue.length < 10) {
    showToast('请详细描述您遇到的问题（至少10个字）');
    document.getElementById('input-issue').focus();
    return;
  }

  appState.form.issueDescription = issue;
  saveDraft(appState.form);

  // Show generating state
  const btn = document.getElementById('btn-generate');
  btn.disabled = true;
  btn.innerHTML = '<span class="inline-flex items-center gap-2"><svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> 生成中...</span>';

  // Simulate generation delay for UX
  setTimeout(() => {
    try {
      const carrier = appState.form.carrier || detectCarrier(appState.form.phone) || '';
      appState.form.carrier = carrier;
      appState.form.carrierDetected = !!carrier;

      const scripts = generateComplaintScripts(appState.form);
      const portals = getPortalsForCase(appState.form);
      const evidence = generateEvidenceChecklist(appState.form);

      appState.results = {
        scripts,
        portals,
        evidence,
        formSnapshot: { ...appState.form },
        createdAt: new Date().toISOString(),
      };

      // Save to history
      saveToHistory({
        platform: appState.form.platform,
        carrier: appState.form.carrier,
        bloggerName: appState.form.bloggerName,
        phone: appState.form.phone,
        summary: appState.form.issueDescription.slice(0, 40),
        scripts,
        portals,
        evidence,
      });

      // Clear draft
      clearDraft();

      navigate('results');
    } catch (e) {
      showToast('生成失败，请重试');
      btn.disabled = false;
      btn.textContent = '生成投诉方案';
    }
  }, 800);
}

// ---- File Upload ----
function handleFileUpload(event) {
  const files = Array.from(event.target.files);
  const current = appState.form.screenshots || [];
  const remaining = 6 - current.length;

  if (files.length > remaining) {
    showToast(`最多上传6张截图，还可上传${remaining}张`);
  }

  const toProcess = files.slice(0, remaining);
  toProcess.forEach(file => {
    if (file.size > 10 * 1024 * 1024) {
      showToast(`${file.name} 超过10MB，已跳过`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      appState.form.screenshots.push(e.target.result);
      if (appState.form.screenshots.length === current.length + toProcess.length) {
        saveDraft(appState.form);
        navigate('form');
      }
    };
    reader.readAsDataURL(file);
  });
}

function removeScreenshot(index) {
  appState.form.screenshots.splice(index, 1);
  saveDraft(appState.form);
  navigate('form');
}

// ---- Form Events ----
function bindFormEvents(step) {
  // Phone auto-detect
  const phoneInput = document.getElementById('input-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function() {
      const phone = this.value.replace(/\D/g, '');
      this.value = phone;
      if (phone.length >= 3) {
        const carrier = detectCarrier(phone);
        const resultEl = document.getElementById('carrier-result');
        if (carrier) {
          appState.form.carrier = carrier;
          appState.form.carrierDetected = true;
          resultEl.innerHTML = `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getCarrierColor(carrier)}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            识别为：${carrier}
          </span>`;
        } else {
          appState.form.carrier = '';
          appState.form.carrierDetected = false;
          resultEl.innerHTML = '<span class="text-xs text-warm">未能识别运营商，请手动选择</span>';
        }
      }
      autoSaveForm();
    });
  }

  // Platform select
  document.querySelectorAll('.platform-option').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.platform-option').forEach(b => {
        b.className = 'platform-option py-3 px-2 rounded-xl border-2 text-sm font-medium transition-all border-gray-200 bg-white text-gray-600 hover:border-gray-300';
      });
      this.className = 'platform-option py-3 px-2 rounded-xl border-2 text-sm font-medium transition-all border-primary bg-blue-50 text-primary';
      autoSaveForm();
    });
  });

  // URL auto-detect
  const linkInput = document.getElementById('input-link');
  if (linkInput) {
    linkInput.addEventListener('blur', function() {
      const url = this.value.trim();
      if (url) {
        const platform = detectPlatform(url);
        const resultEl = document.getElementById('platform-detect-result');
        if (platform) {
          appState.form.platform = platform;
          resultEl.innerHTML = `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getPlatformColor(platform)}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            识别为：${platform}
          </span>`;
        }
      }
      autoSaveForm();
    });
  }

  // Blogger name
  const bloggerInput = document.getElementById('input-blogger');
  if (bloggerInput) {
    bloggerInput.addEventListener('input', autoSaveForm);
  }

  // Order fields
  ['input-order', 'input-amount', 'input-adclaim'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', autoSaveForm);
  });

  // Issue description char count
  const issueInput = document.getElementById('input-issue');
  if (issueInput) {
    issueInput.addEventListener('input', function() {
      const count = document.getElementById('char-count');
      if (count) count.textContent = `${this.value.length}/500`;
      autoSaveForm();
    });
  }
}

function autoSaveForm() {
  if (formAutoSaveTimer) clearTimeout(formAutoSaveTimer);
  formAutoSaveTimer = setTimeout(() => {
    // Collect current values
    const phoneEl = document.getElementById('input-phone');
    const bloggerEl = document.getElementById('input-blogger');
    const linkEl = document.getElementById('input-link');
    const orderEl = document.getElementById('input-order');
    const amountEl = document.getElementById('input-amount');
    const adClaimEl = document.getElementById('input-adclaim');
    const issueEl = document.getElementById('input-issue');

    const activePlatform = document.querySelector('.platform-option.border-primary');

    if (phoneEl) appState.form.phone = phoneEl.value.replace(/\D/g, '');
    if (activePlatform) appState.form.platform = activePlatform.dataset.platform;
    if (bloggerEl) appState.form.bloggerName = bloggerEl.value.trim();
    if (linkEl) appState.form.videoLink = linkEl.value.trim();
    if (orderEl) appState.form.orderNumber = orderEl.value.trim();
    if (amountEl) appState.form.orderAmount = amountEl.value.trim();
    if (adClaimEl) appState.form.adClaim = adClaimEl.value.trim();
    if (issueEl) appState.form.issueDescription = issueEl.value.trim();

    saveDraft(appState.form);
  }, 500);
}

// ---- Utility ----
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
