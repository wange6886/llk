/* ============================================
   流量卡举报助手 - Detection Service
   Auto-detect carrier from phone prefix,
   platform from URL
   ============================================ */

const CARRIER_PREFIXES = {
  '移动': ['134','135','136','137','138','139','147','150','151','152','157','158','159','172','178','182','183','184','187','188','195','197','198'],
  '联通': ['130','131','132','155','156','166','171','175','176','185','186','196'],
  '电信': ['133','149','153','173','177','180','181','189','190','191','193','199'],
  '广电': ['192'],
};

const PLATFORM_PATTERNS = {
  '抖音': [/douyin\.com/i, /iesdouyin\.com/i],
  '小红书': [/xiaohongshu\.com/i, /xhslink\.com/i],
  'B站': [/bilibili\.com/i, /b23\.tv/i],
};

function detectCarrier(phone) {
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.length < 3) return null;

  // Try 3-digit prefix
  const prefix3 = cleaned.slice(0, 3);
  for (const [carrier, prefixes] of Object.entries(CARRIER_PREFIXES)) {
    if (prefixes.includes(prefix3)) return carrier;
  }

  // Try 4-digit prefix (for 17x numbers with more granularity)
  if (cleaned.length >= 4) {
    const prefix4 = cleaned.slice(0, 4);
    for (const [carrier, prefixes] of Object.entries(CARRIER_PREFIXES)) {
      if (prefixes.includes(prefix4)) return carrier;
    }
  }

  return null;
}

function detectPlatform(url) {
  if (!url || !url.trim()) return null;
  for (const [platform, patterns] of Object.entries(PLATFORM_PATTERNS)) {
    if (patterns.some(p => p.test(url))) return platform;
  }
  return null;
}

function getCarrierColor(carrier) {
  const colors = {
    '移动': 'bg-blue-50 text-blue-700 border-blue-200',
    '联通': 'bg-green-50 text-green-700 border-green-200',
    '电信': 'bg-orange-50 text-orange-700 border-orange-200',
    '广电': 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return colors[carrier] || 'bg-gray-50 text-gray-700 border-gray-200';
}

function getPlatformColor(platform) {
  const colors = {
    '抖音': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    '小红书': 'bg-red-50 text-red-700 border-red-200',
    'B站': 'bg-sky-50 text-sky-700 border-sky-200',
  };
  return colors[platform] || 'bg-gray-50 text-gray-700 border-gray-200';
}

const PLATFORM_NAMES = {
  '抖音': '抖音',
  '小红书': '小红书',
  'B站': 'B站',
  'bilibili': 'B站',
};
