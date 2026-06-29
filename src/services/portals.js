/* ============================================
   流量卡举报助手 - Portal Links Service
   ============================================ */

const PORTAL_LINKS = {
  '抖音': {
    complaint: {
      url: 'https://www.douyin.com/complaint',
      label: '抖音举报中心',
      instructions: '打开后点击"举报"，选择"虚假宣传"，粘贴投诉内容',
      icon: '#douyin',
    },
    appAction: '抖音APP内 → 我 → 右上角菜单 → 举报中心',
  },
  '小红书': {
    complaint: {
      url: 'https://www.xiaohongshu.com/complaint',
      label: '小红书举报中心',
      instructions: '登录后选择"虚假广告举报"，上传截图证据',
      icon: '#xiaohongshu',
    },
    appAction: '小红书APP内 → 我的 → 帮助与客服 → 举报投诉',
  },
  'B站': {
    complaint: {
      url: 'https://www.bilibili.com/blackboard/help.html#complaint',
      label: 'B站举报中心',
      instructions: '选择"内容举报"→"虚假宣传"，填写UP主UID和视频链接',
      icon: '#bilibili',
    },
    appAction: 'B站APP内 → 我的 → 服务中心 → 举报',
  },
};

const CARRIER_HOTLINES = {
  '移动': { phone: '10086', desc: '移动客服热线（按0转人工）' },
  '联通': { phone: '10010', desc: '联通客服热线（按0转人工）' },
  '电信': { phone: '10000', desc: '电信客服热线（按0转人工）' },
  '广电': { phone: '10099', desc: '广电客服热线' },
};

const CARRIER_APPS = {
  '移动': { name: '中国移动APP', note: '我的 → 我的投诉 → 投诉申诉' },
  '联通': { name: '中国联通APP', note: '服务 → 客服 → 投诉' },
  '电信': { name: '中国电信APP', note: '我的 → 我的客服 → 投诉' },
  '广电': { name: '中国广电APP', note: '我的 → 帮助与反馈' },
};

const GOVERNMENT_PORTALS = {
  miit: {
    url: 'https://yhssglxt.miit.gov.cn/',
    label: '工信部申诉受理中心',
    instructions: '需先在运营商投诉并获取投诉记录编号，再提交申诉',
    type: 'url',
    icon: '#gov',
  },
  '12315': {
    url: 'https://www.12315.cn/',
    label: '全国12315平台',
    instructions: '微信搜索"12315"小程序，填写被投诉企业全称',
    type: 'url',
    icon: '#gov',
  },
};

function getPortalsForCase(formData) {
  const portals = [];

  // 1. Platform举报 (priority 1)
  if (formData.platform && PORTAL_LINKS[formData.platform]) {
    portals.push({
      category: '平台举报',
      items: [{
        ...PORTAL_LINKS[formData.platform].complaint,
        type: 'url',
      }],
      priority: 1,
      hint: PORTAL_LINKS[formData.platform].appAction,
    });
  }

  // 2. Carrier hotline (priority 2)
  if (formData.carrier && CARRIER_HOTLINES[formData.carrier]) {
    portals.push({
      category: '运营商投诉',
      items: [
        { ...CARRIER_HOTLINES[formData.carrier], type: 'tel', label: CARRIER_HOTLINES[formData.carrier].desc },
        { ...(CARRIER_APPS[formData.carrier] || {}), type: 'app', label: (CARRIER_APPS[formData.carrier] || {}).name || '' },
      ].filter(i => i.label),
      priority: 2,
    });
  }

  // 3. Gov申诉 (priority 3)
  portals.push({
    category: '行政申诉',
    items: Object.values(GOVERNMENT_PORTALS),
    priority: 3,
  });

  return portals.sort((a, b) => a.priority - b.priority);
}
