/* ============================================
   流量卡举报助手 - Storage Service
   LocalStorage persistence with fallback
   ============================================ */

function safeStorage() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return localStorage;
  } catch (e) {
    return null;
  }
}

const storage = safeStorage();
const memoryStore = {};

function getItem(key) {
  if (storage) {
    try { return storage.getItem(key); } catch { return memoryStore[key] || null; }
  }
  return memoryStore[key] || null;
}

function setItem(key, value) {
  if (storage) {
    try { storage.setItem(key, value); } catch { memoryStore[key] = value; }
  } else {
    memoryStore[key] = value;
  }
}

function removeItem(key) {
  if (storage) {
    try { storage.removeItem(key); } catch { delete memoryStore[key]; }
  } else {
    delete memoryStore[key];
  }
}

// ---- Draft ----

function saveDraft(formData) {
  try {
    const data = JSON.stringify({
      step: formData.step,
      phone: formData.phone,
      carrier: formData.carrier,
      carrierDetected: formData.carrierDetected,
      platform: formData.platform,
      platformDetected: formData.platformDetected,
      bloggerName: formData.bloggerName,
      videoLink: formData.videoLink,
      orderNumber: formData.orderNumber,
      orderAmount: formData.orderAmount,
      adClaim: formData.adClaim,
      issueDescription: formData.issueDescription,
      screenshots: formData.screenshots.slice(0, 6),
    });
    setItem('complaint_draft', data);
  } catch (e) {
    // silently fail
  }
}

function loadDraft() {
  try {
    const data = getItem('complaint_draft');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function clearDraft() {
  removeItem('complaint_draft');
}

// ---- History ----

function loadHistory() {
  try {
    const data = getItem('complaint_history');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToHistory(result) {
  const history = loadHistory();
  history.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    ...result,
    createdAt: new Date().toISOString(),
  });
  // Keep max 50 records
  if (history.length > 50) history.length = 50;
  setItem('complaint_history', JSON.stringify(history));
}

function deleteFromHistory(id) {
  const history = loadHistory().filter(item => item.id !== id);
  setItem('complaint_history', JSON.stringify(history));
}
