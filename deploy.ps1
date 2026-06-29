# 流量卡举报助手 - 一键部署脚本
# 用法：右键 -> 使用 PowerShell 运行，或在终端中执行

$REPO_URL = "https://github.com/wange6886/llk.git"
$REPO_DIR = "$env:TEMP\llk-deploy"
$SOURCE_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  流量卡举报助手 - 部署到 GitHub Pages" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 git
$git = Get-Command git -ErrorAction SilentlyContinue
if (-not $git) {
    Write-Host "❌ 未找到 Git，请先安装 https://git-scm.com/" -ForegroundColor Red
    exit 1
}

# 清理临时目录
if (Test-Path $REPO_DIR) {
    Remove-Item -Recurse -Force $REPO_DIR
}

Write-Host "📦 克隆仓库..." -ForegroundColor Yellow
git clone $REPO_URL $REPO_DIR 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 克隆失败，请检查仓库地址和网络连接" -ForegroundColor Red
    Read-Host "按回车退出"
    exit 1
}

Write-Host "📂 复制项目文件..." -ForegroundColor Yellow
# 复制所有项目文件到仓库根目录
Get-ChildItem -Path $SOURCE_DIR -Exclude ".git", "deploy.ps1" | ForEach-Object {
    $dest = Join-Path $REPO_DIR $_.Name
    if ($_.PSIsContainer) {
        Copy-Item -Recurse -Force $_.FullName $dest
    } else {
        Copy-Item -Force $_.FullName $dest
    }
}

# 创建 .gitignore
$gitignore = @"
node_modules/
.DS_Store
Thumbs.db
*.log
"@
Set-Content -Path (Join-Path $REPO_DIR ".gitignore") -Value $gitignore -Encoding UTF8

Set-Location $REPO_DIR

Write-Host "📝 提交代码..." -ForegroundColor Yellow
git add -A
git commit -m "feat: 流量卡举报助手 - 移动端投诉辅助工具

基于用户调研需求开发的SPA应用，功能包括：
- 3步表单填写（手机号自动识别运营商）
- 5大投诉场景自动匹配（虚假宣传/限速/扣费/注销/虚标）
- 每场景3种话术模板（短/中/完整版）
- 直达投诉入口（平台/运营商/工信部/12315）
- 证据清单生成与下载
- 投诉历史记录"
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  提交可能没有新变更，继续推送..." -ForegroundColor Yellow
}

Write-Host "🚀 推送到 GitHub..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  推送 main 分支失败，尝试 master..." -ForegroundColor Yellow
    git push origin master
}

# 清理临时目录
Set-Location $env:TEMP
Remove-Item -Recurse -Force $REPO_DIR -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ 部署完成！" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 GitHub Pages 地址（需在仓库 Settings -> Pages 中开启）：" -ForegroundColor Cyan
Write-Host "   https://wange6886.github.io/llk/" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 开启 Pages 步骤：" -ForegroundColor White
Write-Host "   1. 打开 https://github.com/wange6886/llk/settings/pages" -ForegroundColor White
Write-Host "   2. Source 选择 Deploy from a branch" -ForegroundColor White
Write-Host "   3. Branch 选 main，目录选 / (root)" -ForegroundColor White
Write-Host "   4. 点击 Save，等1-2分钟即可访问" -ForegroundColor White
Write-Host ""
Read-Host "按回车退出"
