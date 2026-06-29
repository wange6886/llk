/* ============================================
   流量卡举报助手 - Evidence Checklist Service
   ============================================ */

const EVIDENCE_TEMPLATES = {
  base: [
    { id: 'ad_screenshot', label: '广告截图/录屏', description: '包含广告页面内容、宣传文案和流量套餐详情截图', required: true, acquireMethod: '在推广视频/笔记页面截图' },
    { id: 'order_receipt', label: '订单截图', description: '包含订单号、下单时间、付款金额的完整截图', required: true, acquireMethod: '在订单记录中截图' },
    { id: 'reality_screenshot', label: '实际套餐截图', description: 'APP内流量使用记录、套餐详情、账单截图', required: true, acquireMethod: '运营商APP → 我的套餐 → 截图' },
    { id: 'chat_records', label: '与博主/客服沟通记录', description: '私信、评论、电话录音等沟通证据', required: false, acquireMethod: '在聊天记录中截图或录屏' },
  ],
  platform_specific: {
    '抖音': [
      { id: 'douyin_video_link', label: '抖音视频链接', description: '分享该推广视频并复制链接', required: true, acquireMethod: '视频页 → 分享 → 复制链接' },
      { id: 'douyin_blogger_page', label: '博主主页截图', description: '包含博主昵称、粉丝数的主页截图', required: false, acquireMethod: '进入博主主页截图' },
    ],
    '小红书': [
      { id: 'xhs_note_link', label: '小红书笔记链接', description: '复制该笔记的分享链接', required: true, acquireMethod: '笔记页 → 分享 → 复制链接' },
      { id: 'xhs_author_page', label: '作者主页截图', description: '作者主页截图，包含ID信息', required: false, acquireMethod: '点击作者头像进入主页截图' },
    ],
    'B站': [
      { id: 'bili_video_bv', label: 'B站视频BV号', description: '在视频页获取BV号（如BV1xxXXXX）', required: true, acquireMethod: '视频URL中获取或点击分享复制' },
      { id: 'bili_up_uid', label: 'UP主UID截图', description: 'UP主个人空间截图或UID', required: false, acquireMethod: '进入UP主空间截图' },
    ],
  },
  scenario_specific: {
    speed_throttling: [
      { id: 'speed_test', label: '网速测试结果', description: '使用测速APP（Speedtest等）的测试结果截图', required: true, acquireMethod: '下载Speedtest APP → 测速 → 截图' },
    ],
    hidden_fees: [
      { id: 'bill_detail', label: '账单明细截图', description: '包含每一笔扣费项目的完整账单截图', required: true, acquireMethod: '运营商APP → 账单查询 → 截图' },
    ],
    difficult_cancellation: [
      { id: 'cancellation_refusal', label: '拒绝销户证据', description: '客服拒绝销户的聊天记录或通话录音', required: true, acquireMethod: '对沟通界面截图或通话时录音' },
    ],
    data_misrepresentation: [
      { id: 'data_usage', label: '流量使用记录', description: 'APP中流量使用明细与套餐对比截图', required: true, acquireMethod: '运营商APP → 流量使用 → 截图' },
    ],
    false_advertising: [
      { id: 'ad_comparison', label: '宣传与实际对比', description: '将宣传截图与实际套餐截图并列对比', required: true, acquireMethod: '用拼图APP或截图工具拼接' },
    ],
  },
};

function selectScenarios(description) {
  const desc = (description || '').toLowerCase();
  const scenarios = [];

  if (/虚假宣传|夸大|不符|虚假|骗/.test(desc)) scenarios.push('false_advertising');
  if (/限速|网速|慢|卡顿|速度/.test(desc)) scenarios.push('speed_throttling');
  if (/扣费|乱扣|多扣|隐形|乱收费|额外/.test(desc)) scenarios.push('hidden_fees');
  if (/注销|销户|解约|不让|拒绝|违约金/.test(desc)) scenarios.push('difficult_cancellation');
  if (/流量虚标|虚标|不够|不足|缩水/.test(desc)) scenarios.push('data_misrepresentation');

  if (scenarios.length === 0) scenarios.push('false_advertising');
  return scenarios;
}

function generateEvidenceChecklist(formData) {
  const items = EVIDENCE_TEMPLATES.base.map(item => ({ ...item, checked: false }));

  // Platform-specific
  const platformItems = EVIDENCE_TEMPLATES.platform_specific[formData.platform] || [];
  platformItems.forEach(item => items.push({ ...item, checked: false }));

  // Scenario-specific
  const scenarios = selectScenarios(formData.issueDescription || '');
  for (const scenario of scenarios) {
    const scenarioItems = EVIDENCE_TEMPLATES.scenario_specific[scenario] || [];
    scenarioItems.forEach(item => items.push({ ...item, checked: false }));
  }

  // Deduplicate by id
  const seen = new Set();
  return items.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function downloadChecklist(checklist, formData) {
  const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  const required_items = checklist.filter(i => i.required);
  const optional_items = checklist.filter(i => !i.required);
  const hotline = formData.carrier === '移动' ? '10086' :
                  formData.carrier === '联通' ? '10010' :
                  formData.carrier === '电信' ? '10000' :
                  formData.carrier === '广电' ? '10099' : '对应运营商';

  const lines = [
    `= 流量卡投诉证据清单 =`,
    `生成时间：${now}`,
    ``,
    `投诉手机号：${formData.phone || '____'}`,
    `推广平台：${formData.platform || '____'}`,
    `博主/UP主：${formData.bloggerName || '____'}`,
    `订单编号：${formData.orderNumber || '____'}`,
    ``,
    `【必备证据（${required_items.length}项）】`,
    ...required_items.map((item, i) => `${i+1}. ${item.label}`),
    ``,
    `【补充证据（${optional_items.length}项）】`,
    ...optional_items.map((item, i) => `${i+1}. ${item.label}`),
    ``,
    `【证据收集指引】`,
    ...checklist.map((item, i) => `${i+1}. ${item.label}：${item.acquireMethod}`),
    ``,
    `= 温馨提示 =`,
    `1. 请确保所有截图清晰可辨`,
    `2. 涉及金额的截图需包含完整数字`,
    `3. 建议先拨打${hotline}联系运营商客服，获取投诉记录编号`,
    `4. 如运营商处理不满意，凭投诉记录编号到工信部申诉`,
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `投诉证据清单_${formData.platform || '流量卡'}_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
