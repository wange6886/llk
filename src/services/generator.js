/* ============================================
   流量卡举报助手 - Complaint Script Generator
   ============================================ */

// ---- Template Engine ----
function renderTemplate(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (data[key] === undefined || data[key] === null) return `[请填写${key}]`;
    return data[key];
  });
}

// ---- Scenario Templates ----
const TEMPLATES = {
  false_advertising: {
    short: '我在{{platform}}看到博主{{bloggerName}}推广的流量卡广告，宣称{{adClaim}}，实际到账后严重不符（{{actualIssue}}）。订单号{{orderNumber}}，要求退款并依据《消费者权益保护法》处理。',
    medium: '投诉{{platform}}博主"{{bloggerName}}"虚假宣传流量卡。其推广内容宣称{{adClaim}}，但本人办理（{{phone}}）后实际为{{actualIssue}}。该行为违反《广告法》第4条、第28条关于广告真实性规定，属于虚假广告。要求：1.全额退款{{orderAmount}}元；2.平台下架该虚假内容。订单号：{{orderNumber}}。',
    full: '投诉对象：{{platform}}平台博主"{{bloggerName}}"（视频/笔记链接：{{videoLink}}）\n\n投诉事由：该博主在{{platform}}发布的流量卡推广内容存在严重虚假宣传行为。广告中宣称"{{adClaim}}"，但本人办理（手机号：{{phone}}）后，实际{{actualIssue}}，与宣传内容严重不符。\n\n法律依据：\n1. 违反《中华人民共和国广告法》第四条：广告不得含有虚假或者引人误解的内容，不得欺骗、误导消费者。\n2. 违反《中华人民共和国广告法》第二十八条：广告以虚假或者引人误解的内容欺骗、误导消费者的，构成虚假广告。\n3. 违反《中华人民共和国消费者权益保护法》第五十五条：经营者提供商品或者服务有欺诈行为的，应当按照消费者的要求增加赔偿其受到的损失，增加赔偿的金额为消费者购买商品的价款或者接受服务的费用的三倍。\n\n投诉诉求：\n1. 要求{{carrier}}运营商全额退款已支付费用{{orderAmount}}元；\n2. 要求{{platform}}平台下架该博主虚假广告内容；\n3. 根据《消费者权益保护法》第55条，要求三倍赔偿。\n\n订购号码：{{phone}}\n订单金额：{{orderAmount}}元\n订单编号：{{orderNumber}}',
  },
  speed_throttling: {
    short: '我在{{platform}}办理的流量卡（{{phone}}）实际网速严重受限，与博主{{bloggerName}}宣称的"不限速"严重不符。要求解除合约并退款。',
    medium: '投诉{{platform}}博主"{{bloggerName}}"推广流量卡存在严重限速问题。广告宣称高网速不限速，实际使用中网速极低（不足1Mbps），无法正常使用。订单号{{orderNumber}}，要求解除合约并退款{{orderAmount}}元。',
    full: '投诉对象：{{platform}}平台博主"{{bloggerName}}"（链接：{{videoLink}}）\n\n投诉事由：该博主推广的流量卡宣称"高速不限速"，但本人（{{phone}}）实际使用中网速严重受限，经多次测速下载速度均不足1Mbps，无法正常浏览网页、使用视频通话。\n\n法律依据：\n1. 违反《广告法》第四条、第二十八条，构成虚假广告；\n2. 违反《电信条例》相关规定，运营商应按实际提供服务质量承担相应责任。\n\n投诉诉求：无条件解除合约并全额退款{{orderAmount}}元。\n\n订单编号：{{orderNumber}}',
  },
  hidden_fees: {
    short: '{{platform}}博主{{bloggerName}}推广的流量卡（{{phone}}）存在隐形扣费，办理时未告知。每月多扣费用，要求退款并整改。',
    medium: '投诉{{platform}}博主"{{bloggerName}}"推广的流量卡存在隐藏扣费问题。办理时仅告知{{adClaim}}，实际每月账单中有未提前说明的额外扣费。违反《消费者权益保护法》第八条关于消费者知情权的规定。订单号{{orderNumber}}，要求退还多扣费用。',
    full: '投诉对象：{{platform}}平台博主"{{bloggerName}}"（链接：{{videoLink}}）\n\n投诉事由：该博主推广的流量卡宣传"{{adClaim}}"，但本人（{{phone}}）实际使用中每月账单存在未提前告知的额外扣费项目，侵犯了消费者的知情权和公平交易权。\n\n法律依据：\n1. 违反《消费者权益保护法》第八条：消费者享有知悉其购买、使用的商品或者接受的服务的真实情况的权利。\n2. 违反《消费者权益保护法》第五十五条关于欺诈行为三倍赔偿的规定。\n\n投诉诉求：退还所有未告知的额外扣费，并依据消法第55条赔偿。\n\n订单编号：{{orderNumber}}',
  },
  difficult_cancellation: {
    short: '{{platform}}博主{{bloggerName}}推广的流量卡宣称"无合约随时注销"，实际{{phone}}申请注销时被拒/需付违约金。要求无条件销户。',
    medium: '投诉{{platform}}博主"{{bloggerName}}"推广的流量卡存在注销难问题。该博主宣称"无合约随时可注销"，但本人{{phone}}申请销户时被客服以各种理由拒绝，或要求支付不合理违约金。违反《电信条例》第三十二条。订单号{{orderNumber}}。',
    full: '投诉对象：{{platform}}平台博主"{{bloggerName}}"（链接：{{videoLink}}）\n\n投诉事由：该博主推广的流量卡明确宣称"无合约限制、随时可注销"，但本人（{{phone}}）在申请销户时被{{carrier}}客服拒绝，或告知需支付不合理违约金。\n\n法律依据：\n1. 违反《广告法》第四条、第二十八条，构成虚假广告；\n2. 违反《电信条例》第三十二条：电信用户有权自主选择电信业务经营者，经营者不得以任何方式限制电信用户选择其他电信业务经营者。\n\n投诉诉求：立即无条件办理销户，取消所有不合理违约金。\n\n订单编号：{{orderNumber}}',
  },
  data_misrepresentation: {
    short: '{{platform}}博主{{bloggerName}}推广的流量卡宣称{{adClaim}}，实际{{phone}}到账流量严重不足。要求按实际流量比例退款。',
    medium: '投诉{{platform}}博主"{{bloggerName}}"推广的流量卡流量虚标。宣传称{{adClaim}}，本人{{phone}}办理后实际可用流量远低于承诺额度，存在严重的流量虚标问题。订单号{{orderNumber}}，要求退款。',
    full: '投诉对象：{{platform}}平台博主"{{bloggerName}}"（链接：{{videoLink}}）\n\n投诉事由：该博主推广的流量卡宣称"{{adClaim}}"，但本人（{{phone}}）办理激活后实际到账流量严重不足，与宣传额度存在巨大差距。该行为属于典型的流量虚标、货不对板。\n\n法律依据：\n1. 违反《广告法》第四条、第二十八条，构成虚假广告；\n2. 违反《消费者权益保护法》关于商品信息真实性的要求。\n\n投诉诉求：按实际流量与宣传流量的比例退款{{orderAmount}}元，或补充至宣传承诺的流量额度。\n\n订单编号：{{orderNumber}}',
  },
};

// ---- Scenario keywords ----
function detectScenarios(description) {
  const desc = (description || '').toLowerCase();
  const scenarios = [];

  if (/虚假宣传|夸大|不符|虚假|骗|货不对板/.test(desc)) scenarios.push('false_advertising');
  if (/限速|网速|慢|卡顿|速度|加载/.test(desc)) scenarios.push('speed_throttling');
  if (/扣费|乱扣|多扣|隐形|乱收费|额外|偷偷/.test(desc)) scenarios.push('hidden_fees');
  if (/注销|销户|解约|不让|拒绝|违约金|取消/.test(desc)) scenarios.push('difficult_cancellation');
  if (/流量虚标|虚标|不够|不足|缩水|少|缺/.test(desc)) scenarios.push('data_misrepresentation');

  if (scenarios.length === 0) scenarios.push('false_advertising');
  return scenarios;
}

// ---- Scenario name mapping ----
const SCENARIO_NAMES = {
  false_advertising: '虚假宣传',
  speed_throttling: '限速问题',
  hidden_fees: '隐形扣费',
  difficult_cancellation: '注销困难',
  data_misrepresentation: '流量虚标',
};

// ---- Main generation function ----
function generateComplaintScripts(formData) {
  const scenarios = detectScenarios(formData.issueDescription || formData.adClaim);
  const platform = formData.platform || '推广平台';
  const carrier = formData.carrier || '运营商';

  const adClaim = formData.adClaim || '大额流量套餐';
  const actualIssue = formData.issueDescription || '实际套餐与宣传严重不符';

  const templateData = {
    platform,
    carrier,
    bloggerName: formData.bloggerName || '该博主',
    phone: formData.phone || '用户手机号',
    orderNumber: formData.orderNumber || '订单号',
    orderAmount: formData.orderAmount || '____',
    videoLink: formData.videoLink || '相关链接',
    adClaim,
    actualIssue,
  };

  const scripts = [];

  for (const scenario of scenarios) {
    const tpl = TEMPLATES[scenario];
    if (!tpl) continue;

    scripts.push({
      id: `${scenario}_short`,
      scenario: SCENARIO_NAMES[scenario],
      label: '简短版（适合平台内举报）',
      length: 'short',
      content: renderTemplate(tpl.short, templateData),
      platform,
      carrier,
    });

    scripts.push({
      id: `${scenario}_medium`,
      scenario: SCENARIO_NAMES[scenario],
      label: '标准版（适合客服投诉）',
      length: 'medium',
      content: renderTemplate(tpl.medium, templateData),
      platform,
      carrier,
    });

    scripts.push({
      id: `${scenario}_full`,
      scenario: SCENARIO_NAMES[scenario],
      label: '完整版（适合工信部/12315申诉）',
      length: 'full',
      content: renderTemplate(tpl.full, templateData),
      platform,
      carrier,
    });
  }

  return scripts;
}
