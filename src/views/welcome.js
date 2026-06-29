/* ============================================
   流量卡举报助手 - Welcome View
   ============================================ */

function renderWelcome() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div id="view-welcome" class="view-container active px-4 pt-6 pb-8">
      <!-- Hero -->
      <div class="text-center mb-8 slide-up">
        <div class="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">流量卡举报助手</h2>
        <p class="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
          被虚假流量卡广告骗了？别慌，3分钟生成投诉方案，一键直达举报入口
        </p>
      </div>

      <!-- How it works -->
      <div class="bg-gray-50 rounded-2xl p-5 mb-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-4 text-center">三步完成投诉</h3>
        <div class="flex flex-col gap-4">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</div>
            <div>
              <p class="font-medium text-gray-900 text-sm">填写订单信息</p>
              <p class="text-xs text-gray-500 mt-0.5">输入手机号、推广平台、博主昵称等基本信息</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</div>
            <div>
              <p class="font-medium text-gray-900 text-sm">自动生成投诉方案</p>
              <p class="text-xs text-gray-500 mt-0.5">基于情况生成多平台投诉话术和证据清单</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</div>
            <div>
              <p class="font-medium text-gray-900 text-sm">一键投诉直达</p>
              <p class="text-xs text-gray-500 mt-0.5">复制话术、打开举报入口、跟踪投诉进度</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Supported platforms -->
      <div class="mb-6">
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">支持平台</h3>
        <div class="flex justify-center gap-4">
          <div class="flex flex-col items-center gap-1.5">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background:#F0F0FF">
              <span class="text-lg font-bold text-gray-700" style="font-size:13px">抖音</span>
            </div>
            <span class="text-xs text-gray-500">抖音</span>
          </div>
          <div class="flex flex-col items-center gap-1.5">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background:#FFF0F0">
              <span class="text-lg font-bold" style="font-size:12px;color:#DC2626">RED</span>
            </div>
            <span class="text-xs text-gray-500">小红书</span>
          </div>
          <div class="flex flex-col items-center gap-1.5">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background:#F0F8FF">
              <span class="text-lg font-bold" style="font-size:11px;color:#00A1D6">B站</span>
            </div>
            <span class="text-xs text-gray-500">B站</span>
          </div>
        </div>
      </div>

      <!-- Action button -->
      <button onclick="navigate('form')" class="w-full bg-primary text-white font-semibold py-3.5 rounded-xl text-base shadow-sm hover:bg-primaryDark active:bg-primaryDark transition-all active:scale-[0.98]">
        开始投诉
      </button>

      <!-- Previous cases link -->
      <div class="text-center mt-4">
        <button onclick="navigate('history')" class="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          查看历史投诉记录
        </button>
      </div>

      <!-- Trust signals -->
      <div class="mt-6 pt-4 border-t border-gray-100">
        <div class="flex justify-center gap-6 text-xs text-gray-400">
          <span>📋 标准法律话术</span>
          <span>🔗 直达官方入口</span>
          <span>🔒 本地存储安全</span>
        </div>
      </div>
    </div>
  `;
}
