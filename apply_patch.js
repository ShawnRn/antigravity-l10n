const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. 配置路径
const appPath = '/Applications/Antigravity.app';
const resourcesPath = path.join(appPath, 'Contents/Resources');
const asarPath = path.join(resourcesPath, 'app.asar');
const backupAsarPath = path.join(resourcesPath, 'app.asar.bak');
const tempDir = path.join(__dirname, 'temp_extracted_asar');

console.log('=== Antigravity UI 中文化补丁 (个性化细分增强版) ===');

// 2. 检查 Antigravity 是否存在
if (!fs.existsSync(appPath)) {
  console.error(`错误：找不到 Antigravity 应用，路径应为: ${appPath}`);
  process.exit(1);
}

if (!fs.existsSync(asarPath)) {
  console.error(`错误：找不到 app.asar 文件，路径应为: ${asarPath}`);
  process.exit(1);
}

// 3. 备份原 app.asar (如果不存在备份则备份，存在则使用备份恢复，确保每次都是干净的包打补丁)
if (!fs.existsSync(backupAsarPath)) {
  console.log('正在备份原始 app.asar...');
  fs.copyFileSync(asarPath, backupAsarPath);
  console.log(`备份已保存至: ${backupAsarPath}`);
} else {
  console.log('检测到已备份的原始 app.asar，正在恢复以确保应用干净的补丁...');
  fs.copyFileSync(backupAsarPath, asarPath);
  console.log('原始 app.asar 恢复成功。');
}

// 4. 清理并创建临时解包目录
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir);

try {
  // 5. 使用 npx 解包 asar
  console.log('正在解包 app.asar...');
  execSync(`npx -y @electron/asar extract "${asarPath}" "${tempDir}"`, { stdio: 'inherit' });
  console.log('解包成功！');

  // 6. 注入翻译脚本至 preload.js
  console.log('正在注入翻译脚本至 preload.js...');
  const preloadPath = path.join(tempDir, 'dist/preload.js');
  if (!fs.existsSync(preloadPath)) {
    throw new Error(`找不到 preload.js: ${preloadPath}`);
  }

  const l10nCode = `
// ==================== ANTIGRAVITY L10N PATCH ====================
(function() {

  // 使用全小写作为键，实现大小写不敏感的高鲁棒性匹配
  const translationDict = {
    // 登录与身份验证界面 (Login & Authentication)
    "sign in": "登录",
    "log in to use the agent": "登录以使用智能体",
    "to use the agent, please login": "要使用智能体，请登录",
    "sign in again": "重新登录",
    "login failed": "登录失败",
    "continue with google": "使用 Google 账号继续",
    "google antigravity - experience liftoff": "Google Antigravity - 体验升空",
    "to start using the agent, please sign in with your google account.": "要开始使用智能体，请使用您的 Google 账号登录。",
    "there was an error with your authentication. to log in, click": "您的身份验证出错。要登录，请点击",
    "please verify your account, then sign in again to continue. learn more by visiting our": "请验证您的账号，然后重新登录以继续。访问我们的网站了解更多：",
    "login to give your agent access to google drive": "登录以授予智能体访问 Google 云端硬盘的权限",
    "welcome to": "欢迎来到",
    "authentication required": "需要身份验证",
    "open settings": "打开设置",

    // 基础导航
    "antigravity": "Antigravity",
    "task": "任务",
    "settings": "设置",
    "implementation plan": "实施计划",
    "walkthrough": "演示与回顾",
    "verify": "验证",
    
    // 侧边栏
    "general": "通用",
    "new conversation": "新建会话",
    "conversation history": "会话历史",
    "scheduled tasks": "定时任务",
    "projects": "项目",
    "no conversations yet": "暂无会话",
    "not in project": "未关联项目",
    "shortcuts": "快捷键",
    "provide feedback": "提供反馈",
    
    // 设置侧边栏标签
    "account": "账户",
    "permissions": "权限",
    "appearance": "外观",
    "models": "模型",
    "customizations": "个性化",
    "app": "应用",
    "antigravity settings": "Antigravity 设置",
    "canmirror": "CanMirror",
    "show all": "显示全部",
    "conversations": "会话",
    "browser": "浏览器",
    
    // 账户设置 (Account Settings)
    "manage your plan, credentials, and general preferences.": "管理您的计划、凭证和通用偏好。",
    "enable telemetry": "启用数据遥测",
    "when toggled on, antigravity collects usage data to help google enhance performance and features.": "开启后，Antigravity 将收集使用数据，以帮助 Google 提升性能和功能。",
    "marketing emails": "接收营销邮件",
    "receive product updates, tips, and promotions from google antigravity via email.": "通过电子邮件接收来自 Google Antigravity 的产品更新、提示和促销信息。",
    "your plan:": "您的计划：",
    "your plan: google ai pro": "您的计划：Google AI Pro",
    "you can upgrade to a google ai ultra plan to receive the highest rate limits.": "您可以升级到 Google AI Ultra 计划，以获得最高的速率限制。",
    "upgrade": "升级",
    "email": "电子邮箱",
    "sign out": "退出登录",
    "by using this app, you agree to its ": "使用此应用即表示您同意其 ",
    "by using this app, you agree to its": "使用此应用即表示您同意其",
    "terms of service": "服务条款",
    "terms of service.": "服务条款。",

    // 权限与智能体设置 (Permissions & Agent Settings)
    "configure global allowed and denied resource permissions.": "配置全局允许和拒绝的资源权限。",
    "project-specific settings": "项目特定设置",
    "modify scoped permissions, folders, and agent settings like sandbox and terminal command execution.": "修改特定项目范围内的权限、文件夹，以及像沙箱和终端命令执行这样的智能体设置。",
    "go to projects": "转到项目",
    "file permissions": "文件权限",
    "network permissions": "网络权限",
    "terminal & tooling permissions": "终端与工具权限",
    "terminal commands": "终端命令",
    "configure allowed terminal commands.": "配置允许执行的终端命令。",
    "commands outside sandbox": "沙箱外的命令",
    "configure allowed commands outside the sandbox.": "配置允许在沙箱外运行的命令。",
    "mcp tools": "MCP 工具",
    "configure external tools via model context protocol.": "通过模型上下文协议配置外部工具。",
    "configure allowed and denied paths for file reads and writes.": "配置允许和拒绝文件读写的路径。",
    "configure allowed and denied urls for reading.": "配置允许 and 拒绝读取的 URL。",
    "no folders added yet.": "尚未添加任何文件夹。",
    "folders": "文件夹",
    "+ add folder": "+ 添加文件夹",
    "agent settings": "智能体设置",
    "security preset": "安全预设",
    "unrestricted": "无限制",
    "custom": "自定义",
    "require review": "需要审查",
    "outside of folders file access policy": "工作文件夹外的文件访问策略",
    "configures how the agent tries to access files outside of its working folders.": "配置智能体如何尝试访问其工作文件夹之外的文件。",
    "terminal command auto execution": "终端命令自动执行",
    "controls whether terminal commands require your approval before running.": "控制终端命令在运行前是否需要您的批准。",
    "enable sandbox mode (preview)": "启用沙箱模式（预览）",
    "restricts agent tools to a secure, isolated local sandbox.": "限制智能体工具在安全、隔离的本地沙箱中运行。",
    "choose a predefined security preset for the agent. this controls terminal auto-execution policy, and file access policy.": "为智能体选择预设的安全级别。这控制了终端自动执行策略和文件访问策略。",
    "agent behavior": "智能体行为",
    "artifact review policy": "Artifact 审查策略",
    "always ask": "每次询问",
    "always proceed": "总是继续",
    "specifies agent's behavior when asking for review on artifacts, which are documents it creates to enable a richer conversation experience.": "指定智能体在请求审查 Artifact 时（即它为提供更丰富的对话体验而创建的文档）的行为。",
    "local permissions": "本地权限",
    "file access rules": "文件访问规则",
    "network access rules": "网络访问规则",
    "open": "打开",
    "打开": "打开",
    
    // 权限设置中的句段/短语碎片
    "inherits from": "继承自",
    "inherits from ": "继承自 ",
    "global settings": "全局设置",
    "global settings.": "全局设置。",
    ". local permissions have higher priority. ": "。本地权限具有更高的优先级。",
    "local permissions have higher priority.": "本地权限具有更高的优先级。",
    "learn more.": "了解更多。",
    "learn more": "了解更多",
    "learn more about": "了解更多关于",
    "learn more about ": "了解更多关于 ",

    // 个性化设置 (Customizations Settings)
    "the breakdown below shows token usage from customizations like skills, rules, and mcp. if the budget is exceeded, large customizations will be truncated automatically.": "以下细分显示了来自技能、规则和 MCP 等自定义项的 Token 使用情况。如果超出了预算，大型自定义项将被自动截断。",
    "customization token budget exceeded. large customizations will be truncated.": "已超出自定义 Token 预算。大型自定义项将被自动截断。",
    "% of the customization budget is available.": "% 的个性化预算可用。",
    "rules": "规则",
    "skills": "技能",
    "mcp": "MCP",
    "hide breakdown": "隐藏细分",

    // 外观设置 (Appearance Settings)
    "configure the agent's visual theme and display preferences.": "配置智能体的视觉主题与显示偏好。",
    "chat settings": "聊天设置",
    "verbose agent chat": "详细智能体聊天",
    "display and preserve intermediate thinking steps": "显示并保留中间思考步骤",
    "select light, dark, or inherit system settings.": "选择浅色、深色，或继承系统设置。",
    "light theme": "浅色主题",
    "dark theme": "深色主题",
    "preset": "预设",
    "background": "背景色",
    "foreground": "前景色",
    "accent": "强调色",
    "system": "系统默认",
    "default light": "默认浅色",
    "default dark": "默认深色",

    // 更多模型与通用 UI
    "model selection": "模型选择",
    "no models available": "无可用模型",
    "select model": "选择模型",
    "checking for updates": "正在检查更新",
    "new window": "新建窗口",
    "close window": "关闭窗口",
    "welcome to the new antigravity!": "欢迎使用全新的 Antigravity！",
    "download the antigravity ide": "下载 Antigravity IDE",
    "explore the new antigravity": "探索全新的 Antigravity",
    "loading antigravity": "正在加载 Antigravity",
    "setting up…": "正在设置…",
    "confirm quit": "确认退出",
    "are you sure you want to quit?": "确定要退出吗？",
    "there may be agents or background tasks running.": "可能有智能体或后台任务正在运行。",
    "submit": "提交",
    "skip": "跳过",
    "cancel": "取消",
    "save": "保存",
    "close": "关闭",
    "apply": "应用",

    // App Settings
    "app settings": "应用设置",
    "manage application settings.": "管理应用设置。",
    "prevent sleep": "防止休眠",
    "prevent the computer from sleeping while the app is running.": "在应用运行时防止计算机进入休眠状态。",
    "keep in menu bar": "保留在菜单栏",
    "the app will be accessible from the menu bar and will keep running in the background when all windows are closed.": "该应用可从菜单栏访问，并在所有窗口关闭时在后台继续运行。",
    "notifications": "通知",
    "notification settings": "通知设置",
    "to modify notification settings, open your operating system's system preferences.": "要修改通知设置，请打开您操作系统的系统偏好设置。",
    "open system preferences": "打开系统偏好设置",

    // Browser Settings
    "browser settings": "浏览器设置",
    "configure the browser subagent. it requires google chrome to be installed. the browser subagent can be invoked by typing /browser in the conversation input box.": "配置浏览器子智能体。它需要安装 Google Chrome。可以在会话输入框中输入 /browser 启动浏览器子智能体。",
    "browser javascript execution policy": "浏览器 JavaScript 执行策略",
    "controls whether the agent can run custom javascript to automate complex browser actions.": "控制智能体是否可以运行自定义 JavaScript 以自动化复杂的浏览器操作。",
    "actuation permissions": "操作权限",
    "browser actuation rules": "浏览器操作规则",
    "configure allowed and denied urls for browser actuation.": "配置允许和拒绝进行浏览器操作的 URL 规则。",
    "edit": "编辑",
    "request review": "需要审查",

    // Conversations
    "agent settings and permissions for conversations outside of projects.": "针对项目外对话的智能体设置与权限。",

    // 增补系统常用 UI 控件
    "typeahead menu": "输入预测菜单",
    "sidebar": "侧边栏",
    "toggle sidebar": "切换侧边栏",
    "go back": "返回",
    "go forward": "前进",
    "display options": "显示选项",
    "select project": "选择项目",
    "ask anything, @ to mention, / for actions": "提问任何问题，使用 @ 提及，/ 执行操作",
    "add context": "添加上下文",
    "select model, current: no model selected": "选择模型，当前：未选择模型",
    "no model selected": "未选择模型",
    "record voice memo": "录制语音备忘录",
    "send message": "发送消息",
    "select environment": "选择环境",
    "local": "本地",
    "edit project-specific settings": "编辑项目特定设置",
    "edit project name": "编辑项目名称",
    "add folder": "添加文件夹",
    "no token data available.": "无可用 Token 数据。",
    "loading workspace customizations...": "正在加载工作区自定义项...",
    "create new project": "创建新项目",
    "new project": "新建项目",
    "quick start": "快速启动",
    "group by": "分组方式",
    "project": "项目",
    "status": "状态",
    "none": "无",
    "sort conversations": "会话排序",
    "last updated": "最近更新",
    "alphabetical (a-z)": "按字母顺序 (A-Z)",
    "date added": "添加日期",
    "subtitles": "副标题",
    "worktree": "工作区 (Worktree)",
    "no subtitle": "不显示副标题",
    "now": "刚刚",
    "new worktree": "新建工作树 (Worktree)",
    "worktrees are available for git repositories": "工作树仅适用于 Git 仓库",
    "limited time": "限时",
    "for turn": "针对轮次",
    "search": "搜索",
    "view split diff": "分栏差异对比",
    "view unified diff": "统一差异对比",
    "unified diff": "统一对比",
    "split diff": "分栏对比",
    "collapse file": "折叠文件",
    "expand file": "展开文件",
    "collapse all": "折叠全部",
    "expand all": "展开全部",
    "comment": "评论",
    "file reads": "文件读取",
    "allow/deny agent read access to specific files or directories.": "允许/拒绝智能体对特定文件或目录的读取访问权限。",
    "file writes": "文件写入",
    "allow/deny agent write access to specific files or directories.": "允许/拒绝智能体对特定文件或目录的写入访问权限。",
    "allow": "允许",
    "add": "添加",
    "read urls": "读取 URL",
    "allow/deny agent read access to specific urls or domains.": "允许/拒绝智能体对特定 URL 或域名的读取访问权限。",
    "allow/deny specific terminal commands.": "允许/拒绝特定的终端命令。",
    "allow/deny agent command execution outside the sandbox.": "允许/拒绝智能体在沙箱外执行命令。",
    "external tools the agent can call via model context protocol.": "智能体可以通过模型上下文协议 (Model Context Protocol) 调用的外部工具。",
    "refresh": "刷新",
    "delete": "删除",
    "this will permanently delete the project and all conversations within it. this action cannot be undone.": "这将永久删除该项目及其中的所有会话。此操作无法撤销。",
    "are you sure you want to delete the project": "您确定要删除项目 ",
    "are you sure you want to delete the project ": "您确定要删除项目 ",
    "this will permanently delete the project and": "这将永久删除该项目及",
    "this will permanently delete the project and ": "这将永久删除该项目及",
    "within it. this action cannot be undone.": "。此操作无法撤销。",
    "within it. this action cannot be undone": "。此操作无法撤销。",
    "all conversations": "所有会话",
    "danger zone": "危险区域",
    "delete project": "删除项目",
    "permanently delete this project and all of its conversations.": "永久删除此项目及其所有会话。",
    "google drive integration not available": "Google 云端硬盘集成不可用",
    "editor settings": "编辑器设置",
    "configure editor-specific behaviors and shortcuts.": "配置编辑器特定的行为和快捷键。",
    "marketplace": "插件市场",
    "marketplace item url": "插件项 URL",
    "changes the base url on each extension page. you must restart antigravity to use the new marketplace after changing this value.": "更改每个插件页面的基准 URL。更改此值后，您必须重启 Antigravity 才能使用新的插件市场。",
    "marketplace gallery url": "插件市场展示 URL",
    "changes the base url for marketplace search results. you must restart antigravity to use the new marketplace after changing this value.": "更改插件市场搜索结果的基准 URL。更改此值后，您必须重启 Antigravity 才能使用新的插件市场。",
    "selection actions": "选区操作",
    "show selection actions": "显示选区操作",
    'show "edit" and "chat" buttons when selecting text in the editor.': "在编辑器中选择文本时，显示“编辑”和“聊天”按钮。",
    "to modify editor settings, open settings within the editor window.": "要修改编辑器设置，请在编辑器窗口中打开“设置”。",
    "open editor settings": "打开编辑器设置",
    "open ide": "打开 IDE",
    "configure the browser subagent. it requires": "配置浏览器子智能体。它需要",
    "to be installed. the browser subagent can be invoked by typing /browser in the conversation input box.": "已安装。可以在会话输入框中输入 /browser 启动浏览器子智能体。",
    "manage your notification preferences.": "管理您的通知偏好。",
    "configure default behaviors, skills, and mcp servers.": "配置默认行为、技能和 MCP 服务端。",
    "token usage": "Token 使用情况",
    "installed mcp servers": "已安装的 MCP 服务端",
    "add mcp": "添加 MCP",
    "loading mcp servers...": "正在加载 MCP 服务端...",
    "build with google plugins": "使用 Google 插件构建",
    "customize": "自定义",
    "feedback type": "反馈类型",
    "bug report": "缺陷报告",
    "feature request": "功能建议",
    "auth and billing": "认证与计费",
    "general feedback": "通用反馈",
    "description": "描述",
    "please describe the issue in detail. the more actionable your feedback, the quicker our team can address your request. some helpful information includes:": "请详细描述问题。您的反馈越具体，我们的团队就能越快处理您的请求。一些有帮助的信息包括：",
    "steps to reproduce the issue": "重现该问题的步骤",
    "expected behavior": "预期行为",
    "actual behavior": "实际行为",
    "any error messages": "任何错误信息",
    "any relevant information": "任何相关信息",
    "steps to reproduce": "重现步骤",
    "describe the bug you encountered...": "请详细描述您遇到的问题...",
    "please list the steps to reproduce the issue": "请列出重现该问题的步骤",
    "submit feedback": "提交反馈",
    "send feedback": "发送反馈",
    "attach a screenshot (optional)": "附加截图（可选）",
    "attach antigravity server logs": "附加 Antigravity 服务端日志",
    "send feedback as shawnrain.me@gmail.com": "以 shawnrain.me@gmail.com 身份发送反馈",
    "we recommend attaching logs. attaching logs will help the antigravity team act on and prioritize your feedback.": "我们建议附加日志。附加日志将有助于 Antigravity 团队处理并优先考虑您的反馈。",
    "keyboard shortcuts for quick navigation and control.": "用于快速导航和控制的键盘快捷键。",
    "recommended": "推荐",
    "open conversation picker": "打开会话选择器",
    "open file search": "打开文件搜索",
    "focus input": "聚焦输入框",
    "navigation": "导航",
    "file picker": "文件选择器",
    "select previous conversation": "选择上一个会话",
    "select next conversation": "选择下一个会话",
    "conversation": "会话",
    "toggle model selector": "切换模型选择器",
    "toggle voice recording": "切换语音录制",
    "find in pane": "在面板中查找",
    "layout controls": "布局控制",
    "toggle auxiliary pane": "切换辅助面板",
    "zoom in": "放大",
    "zoom out": "缩小",
    "reset zoom": "重置缩放",
    "configure ai models and view your quota.": "配置 AI 模型并查看您的配额。",
    "refresh quota and credits data": "刷新配额与额度数据",
    "model credits": "模型额度",
    "enable ai credit overages": "启用 AI 超额额度",
    "when toggled on, antigravity will use your ai credits to fulfill model requests once you're out of model quota. antigravity will always use your model quota first before using ai credits.": "开启后，一旦您的模型配额用尽，Antigravity 将使用您的 AI 信用额度来满足模型请求。Antigravity 会在尝试使用 AI 信用额度之前，始终优先使用您的模型配额。",
    "model quota": "模型配额",
    "view your available model quota and ai credits. model quota refreshes periodically based on your plan. enable ai credit overages to continue using models when your quota is exhausted.": "查看您可用的模型配额和 AI 信用额度。模型配额会根据您的计划定期刷新。启用 AI 超额额度可以在配额用尽时继续使用模型。",
    "loading token usage...": "正在加载 Token 使用量...",
    "global": "全局",
    "plugin:": "插件:",
    "no mcp servers": "无 MCP 服务端",
    "you currently don't have any mcp servers installed.": "您目前未安装任何 MCP 服务端。",
    "add an mcp server above": "在上方添加一个 MCP 服务端",
    "select branch": "选择分支",
    "attaching logs requires an email address": "附加日志需要提供电子邮箱地址",
    "untitled conversation": "无标题会话",

    // 技能说明的翻译 (只翻译其作用描述)
    "orchestrates android development tasks including project creation, deployment, sdk management, and environment diagnostics using the \`android\` command-line tool.": "使用 'android' 命令行工具协调 Android 开发任务，包括项目创建、部署、SDK 管理和环境诊断。",
    "orchestrates android development tasks including project creation, deployment, sdk management, and environment diagnostics using the android command-line tool.": "使用 android 命令行工具协调 Android 开发任务，包括项目创建、部署、SDK 管理和环境诊断。",
    "design, implement, and debug autonomous ai agents and multi-agent systems using the google antigravity (agy) sdk. activate this skill when the user wants to create, configure, or orchestrate google antigravity agents.": "使用 Google Antigravity (AGY) SDK 设计、实现和调试自主 AI 智能体及多智能体系统。当用户想要创建、配置或编排 Google Antigravity 智能体时，激活此技能。",
    "build professional native macos apps in swift with swiftui and appkit. full lifecycle - build, debug, test, optimize, ship. cli-only, no xcode.": "使用 Swift 结合 SwiftUI 和 AppKit 构建专业的原生 macOS 应用程序。全生命周期 - 构建、调试、测试、优化、出货。仅限命令行，无需 Xcode。",

    // 增补最新发现的界面死角 (Overview, Review, 历史时间, 提示气泡)
    "overview": "总览",
    "review": "审查",
    "review changes": "审查改动",
    "subagents": "子智能体",
    "files changed": "修改的文件",
    "artifacts": "交付成果 (Artifacts)",
    "background tasks": "后台任务",
    "today": "今天",
    "yesterday": "昨天",
    "am": "上午",
    "pm": "下午",
    "a high-risk mode that disables all safety barriers. the agent operates with full system access, auto-executes all terminal commands, and reads or writes to all local files without review prompts.": "一种禁用所有安全屏障的高风险模式。智能体运行于完整的系统访问权限下，自动执行所有终端命令，读写所有本地文件时均无需审查提示。",
    "working.": "正在执行。",
    "explored": "探索了",
    "edited": "编辑了",
    "ran": "执行了",
    "thought": "思考了",
    "worked": "工作了",
    "working": "正在执行",
    "working..": "正在执行..",
    "working...": "正在执行...",
    "thinking": "正在思考",
    "thinking...": "正在思考...",
    "exploring": "正在探索",
    "exploring...": "正在探索...",
    "editing": "正在编辑",
    "editing...": "正在编辑...",
    "running": "正在运行",
    "running...": "正在运行...",
    "analyzing": "正在分析",
    "analyzing...": "正在分析...",
    "analyzed": "分析了",
    "searched": "搜索了",
    "searching": "正在搜索",
    "searching...": "正在搜索...",
    "refreshing": "正在刷新",
    "refreshing...": "正在刷新...",
    "finished": "已完成",
    "timer cancelled": "定时器已取消",
    "cancelled": "已取消",
    "timer has expired": "定时器已过期",
    "timer": "定时器",
    "expired": "已过期",
    "compacting": "正在压缩",
    "compacting...": "正在压缩...",
    "compacted": "已压缩"
  };

  // 仅对长而唯一的短语使用正则替换，避免污染普通单词（如 App, Open, File）
  const regexReplacements = [
    { pattern: /Open IDE/gi, replace: "打开 IDE" },
    { pattern: /Compacting\\.\\.\\./gi, replace: "正在压缩..." },
    { pattern: /Compacting/gi, replace: "正在压缩" },
    { pattern: /Compacted/gi, replace: "已压缩" },
    { pattern: /New Conversation/gi, replace: "新建会话" },
    { pattern: /Conversation History/gi, replace: "会话历史" },
    { pattern: /Scheduled Tasks/gi, replace: "定时任务" },
    { pattern: /No conversations yet/gi, replace: "暂无会话" },
    { pattern: /Antigravity Settings/gi, replace: "Antigravity 设置" },
    { pattern: /Manage your plan, credentials, and general preferences\\./gi, replace: "管理您的计划、凭证和通用偏好。" },
    { pattern: /Manage project folders, agent settings, and permissions\\./gi, replace: "管理项目文件夹、智能体设置与权限。" },
    { pattern: /No folders added yet\\./gi, replace: "尚未添加任何文件夹。" },
    { pattern: /Choose a predefined security preset for the agent\\. This controls terminal auto-execution policy, and file access policy\\./gi, replace: "为智能体选择预设的安全级别。这控制了终端自动执行策略和文件访问策略。" },
    { pattern: /Specifies Agent's behavior when asking for review on artifacts, which are documents it creates to enable a richer conversation experience\\./gi, replace: "指定智能体在请求审查 Artifact 时（即它为提供更丰富的对话体验而创建的文档）的行为。" },
    { pattern: /Configure allowed and denied paths for file reads and writes\\./gi, replace: "配置允许和拒绝文件读写的路径。" },
    { pattern: /Configure allowed and denied URLs for reading\\./gi, replace: "配置允许和拒绝读取的 URL。" },
    { pattern: /Local permissions have higher priority\\./gi, replace: "本地权限具有更高的优先级。" },
    { pattern: /Configure the agent's visual theme and display preferences\\./gi, replace: "配置智能体的视觉主题与显示偏好。" },
    { pattern: /Display and preserve intermediate thinking steps/gi, replace: "显示并保留中间思考步骤" },
    { pattern: /Configure global allowed and denied resource permissions\\./gi, replace: "配置全局允许和拒绝的资源权限。" },
    { pattern: /Configures how the agent tries to access files outside of its working folders\\./gi, replace: "配置智能体如何尝试访问其工作文件夹之外的文件。" },
    { pattern: /Controls whether terminal commands require your approval before running\\./gi, replace: "控制终端命令在运行前是否需要您的批准。" },
    { pattern: /Restricts agent tools to a secure, isolated local sandbox\\./gi, replace: "限制智能体工具在安全、隔离的本地沙箱中运行。" },
    { pattern: /Manage application settings\\./gi, replace: "管理应用设置。" },
    { pattern: /Prevent the computer from sleeping while the app is running\\./gi, replace: "在应用运行时防止计算机进入休眠状态。" },
    { pattern: /The app will be accessible from the menu bar and will keep running in the background when all windows are closed\\./gi, replace: "该应用可从菜单栏访问，并在所有窗口关闭时在后台继续运行。" },
    { pattern: /To modify notification settings, open your operating system's system preferences\\./gi, replace: "要修改通知设置，请打开您操作系统的系统偏好设置。" },
    { pattern: /Configure the browser subagent\\. It requires Google Chrome to be installed\\. The browser subagent can be invoked by typing \\/browser in the conversation input box\\./gi, replace: "配置浏览器子智能体。它需要安装 Google Chrome。可以在会话输入框中输入 /browser 启动浏览器子智能体。" },
    { pattern: /Controls whether the agent can run custom JavaScript to automate complex browser actions\\./gi, replace: "控制智能体是否可以运行自定义 JavaScript 以自动化复杂的浏览器操作。" },
    { pattern: /Configure allowed and denied URLs for browser actuation\\./gi, replace: "配置允许和拒绝进行浏览器操作的 URL 规则。" },
    { pattern: /Agent settings and permissions for conversations outside of projects\\./gi, replace: "针对项目外对话的智能体设置与权限。" },
    { pattern: /Rules: (\\d+) tokens/gi, replace: "规则: $1 字节 (tokens)" },
    { pattern: /Skills: (\\d+) tokens/gi, replace: "技能: $1 字节 (tokens)" },
    { pattern: /Workflows: (\\d+) tokens/gi, replace: "工作流: $1 字节 (tokens)" },
    { pattern: /Show (\\d+) breakdowns?/gi, replace: "显示 $1 个细分" },
    { pattern: /(\\d+)% remaining/gi, replace: "剩余 $1%" },
    { pattern: /Refreshes in (\\d+) hours?, (\\d+) minutes?/gi, replace: "在 $1 小时 $2 分钟后刷新" },
    { pattern: /See all \\((\\d+)\\)/gi, replace: "查看全部 ($1)" },
    { pattern: /^\\s*(\\d+)s\\s*$/g, replace: "$1秒前" },
    { pattern: /^\\s*(\\d+)m\\s*$/g, replace: "$1分钟前" },
    { pattern: /^\\s*(\\d+)h\\s*$/g, replace: "$1小时前" },
    { pattern: /^\\s*(\\d+)d\\s*$/g, replace: "$1天前" },
    { pattern: /^\\s*(\\d+)w\\s*$/g, replace: "$1周前" },
    { pattern: /^\\s*(\\d+)mo\\s*$/g, replace: "$1个月前" },
    { pattern: /^\\s*(\\d+)y\\s*$/g, replace: "$1年前" },
    { pattern: /A high-risk mode that disables all safety barriers\\. The agent operates with full system access, auto-executes all terminal commands, and reads or writes to all local files without review prompts\\./gi, replace: "一种禁用所有安全屏障的高风险模式。智能体运行于完整的系统访问权限下，自动执行所有终端命令，读写所有本地文件时均无需审查提示。" },
    { pattern: /Today (\\d+:\\d+)\\s*AM/gi, replace: "今天上午 $1" },
    { pattern: /Today (\\d+:\\d+)\\s*PM/gi, replace: "今天下午 $1" },
    { pattern: /Yesterday (\\d+:\\d+)\\s*AM/gi, replace: "昨天上午 $1" },
    { pattern: /Yesterday (\\d+:\\d+)\\s*PM/gi, replace: "昨天下午 $1" },
    { pattern: /Thought for (\\d+)s?/gi, replace: "思考了 $1 秒" },
    { pattern: /Explored (\\d+) files?/gi, replace: "探索了 $1 个文件" },
    { pattern: /Edited\\s+([a-zA-Z]{1,4})\\s+(.+)/gi, replace: "编辑了 $1 文件 $2" },
    { pattern: /Edited\\s+(.+)/gi, replace: "编辑了 $1" },
    { pattern: /Ran\\s+(.+)/gi, replace: "执行了命令 $1" },
    { pattern: /Are you sure you want to delete the project (.+)\\?/gi, replace: "您确定要删除项目 $1 吗？" },
    { pattern: /Are you sure you want to delete the project/gi, replace: "您确定要删除项目 " },
    { pattern: /This will permanently delete the project and/gi, replace: "这将永久删除该项目及" },
    { pattern: /within it\\.\\s*This action cannot be undone\\.?/gi, replace: "。此操作无法撤销。" },
    { pattern: /within it\\.\\s*this action cannot be undone\\.?/gi, replace: "。此操作无法撤销。" },
    { pattern: /Worked for (\\d+)s/gi, replace: "工作了 $1 秒" },
    { pattern: /Worked for (\\d+)m/gi, replace: "工作了 $1 分钟" },
    { pattern: /Explored (\\d+) artifacts?/gi, replace: "探索了 $1 个交付物" },
    { pattern: /Explored (\\d+) files?, (\\d+) folders?/gi, replace: "探索了 $1 个文件，$2 个文件夹" },
    { pattern: /Explored (\\d+) files?, (\\d+) searches?/gi, replace: "探索了 $1 个文件，执行了 $2 次搜索" },
    { pattern: /Available AI Credits:\\s*(\\d+)/gi, replace: "可用 AI 额度: $1" },
    // === 以下为新增的 -ing 及动态文本匹配 ===
    { pattern: /Exploring (\\d+) artifacts?/gi, replace: "正在探索 $1 个交付物" },
    { pattern: /Exploring (\\d+) files?, (\\d+) folders?/gi, replace: "正在探索 $1 个文件，$2 个文件夹" },
    { pattern: /Exploring (\\d+) files?, (\\d+) searches?/gi, replace: "正在探索 $1 个文件，进行了 $2 次搜索" },
    { pattern: /Exploring (\\d+) files?/gi, replace: "正在探索 $1 个文件" },
    { pattern: /Exploring (\\d+) folders?/gi, replace: "正在探索 $1 个文件夹" },
    { pattern: /Exploring (\\d+) searches?/gi, replace: "正在进行 $1 次搜索" },
    { pattern: /Exploring (\\d+) search/gi, replace: "正在进行 $1 次搜索" },
    { pattern: /Exploring\\.\\.\\./gi, replace: "正在探索..." },
    { pattern: /Searching\\s+(.+)/gi, replace: "正在搜索 $1" },
    { pattern: /Searching\\.\\.\\./gi, replace: "正在搜索..." },
    { pattern: /Analyzed\\s+([a-zA-Z]{1,4})\\s+(.+)/gi, replace: "分析了 $1 文件 $2" },
    { pattern: /Analyzed\\s+(.+)/gi, replace: "分析了 $1" },
    { pattern: /Searched\\s+(.+)/gi, replace: "搜索了 $1" },
    { pattern: /Working\\.\\.\\./gi, replace: "正在执行..." },
    { pattern: /Working\\.\\./gi, replace: "正在执行.." },
    { pattern: /Working\\./gi, replace: "正在执行." },
    // === 针对 finished, Timer Cancelled ===
    { pattern: /(.+)\\s+finished/gi, replace: "$1 已完成" },
    { pattern: /Timer Cancelled/gi, replace: "定时器已取消" },
    // === 针对 Timer 和 Timed ===
    { pattern: /Timer has expired/gi, replace: "定时器已过期" },
    { pattern: /Timed (\\d+) seconds?/gi, replace: "定时了 $1 秒" },
    { pattern: /Timed (\\d+) minutes?/gi, replace: "定时了 $1 分钟" },
    { pattern: /Timed (\\d+) hours?/gi, replace: "定时了 $1 小时" }
  ];

  function shouldSkipNode(node) {
    let current = node;
    while (current) {
      if (current.nodeType === 1) { // ELEMENT_NODE
        const tagName = current.tagName.toLowerCase();
        if (tagName === 'pre' || tagName === 'code' || tagName === 'textarea' || tagName === 'script' || tagName === 'style') {
          return true;
        }
        if (current.classList && (
          current.classList.contains('monaco-editor') ||
          current.classList.contains('cm-editor') ||
          current.classList.contains('code-block') ||
          current.classList.contains('code') ||
          current.classList.contains('no-translate')
        )) {
          return true;
        }
        if (current.getAttribute('contenteditable') === 'true') {
          return true;
        }
      }
      current = current.parentNode;
    }
    return false;
  }

  function translateTextNode(node) {
    if (node.nodeType !== 3) return; // Not a TEXT_NODE
    if (shouldSkipNode(node)) return;
    
    let text = node.nodeValue;
    if (!text) return;
    
    const trimmed = text.trim();
    
    // 智能处理 Show N breakdown(s) 这样的英语拼接格式
    if (/^Show \\d+ breakdown$/i.test(trimmed)) {
      let next = node.nextSibling;
      if (next && next.nodeType === 3 && next.nodeValue.trim() === 's') {
        next.nodeValue = ''; // 擦除末尾的复数 s 字符
      }
      const num = trimmed.match(/\\d+/)[0];
      node.nodeValue = "显示 " + num + " 个细分";
      return;
    }

    const key = trimmed.toLowerCase();
    if (translationDict[key]) {
      const leadingSpace = text.match(/^\\s*/)[0];
      const trailingSpace = text.match(/\\s*$/)[0];
      node.nodeValue = leadingSpace + translationDict[key] + trailingSpace;
      return;
    }

    // 尝试正则替换长短语 (直接 replace 以避免 RegExp state lastIndex 陷阱)
    let modified = false;
    for (const item of regexReplacements) {
      const newText = text.replace(item.pattern, item.replace);
      if (newText !== text) {
        text = newText;
        modified = true;
      }
    }
    if (modified) {
      node.nodeValue = text;
    }
  }

  function traverseAndTranslate(node) {
    if (shouldSkipNode(node)) return;
    
    if (node.nodeType === 3) {
      translateTextNode(node);
    } else if (node.nodeType === 1) {
      const attrs = ['placeholder', 'title', 'alt', 'aria-label'];
      for (const attr of attrs) {
        const val = node.getAttribute(attr);
        if (val) {
          const key = val.trim().toLowerCase();
          if (translationDict[key]) {
            node.setAttribute(attr, translationDict[key]);
          }
        }
      }
      
      let child = node.firstChild;
      while (child) {
        traverseAndTranslate(child);
        child = child.nextSibling;
      }
    }
  }

  // 监听并动态翻译 DOM
  const observer = new MutationObserver((mutations) => {
    observer.disconnect();
    try {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          translateTextNode(mutation.target);
        } else if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            traverseAndTranslate(node);
          }
        }
      }
      if (document.title) {
        const key = document.title.trim().toLowerCase();
        if (translationDict[key]) {
          document.title = translationDict[key];
        }
      }
    } catch (e) {
      console.error('[L10N] Translation error:', e);
    } finally {
      observer.observe(document, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
  });

  // 页面加载完成后启动
  document.addEventListener('DOMContentLoaded', () => {
    traverseAndTranslate(document.body);
  });

  // 立即开始监听整个 document
  observer.observe(document, {
    childList: true,
    subtree: true,
    characterData: true
  });
})();
// ==================== END OF L10N PATCH ====================
`;

  fs.appendFileSync(preloadPath, l10nCode);
  console.log('preload.js 注入完成。');

  // 7. 修改 menu.js 中的硬编码菜单项
  console.log('正在修改 menu.js 中的自定义硬编码项...');
  const menuPath = path.join(tempDir, 'dist/menu.js');
  if (fs.existsSync(menuPath)) {
    let content = fs.readFileSync(menuPath, 'utf8');
    
    content = content
      .replace("label: 'New Window',", "label: '新建窗口',")
      .replace("label: 'Docs',", "label: '文档',")
      .replace(
        "const submenuItem = appMenu.items.find((item) => item.label === submenuLabel);",
        "const submenuItem = appMenu.items.find((item) => item.label === submenuLabel || (submenuLabel === 'File' && item.label === '文件') || (submenuLabel === 'Help' && item.label === '帮助'));"
      )
      .replace(
        "electron_1.Menu.setApplicationMenu(menu);",
        `// 递归汉化所有顶级和子级菜单项
    const menuDict = {
        "File": "文件", "Edit": "编辑", "View": "视图", "Window": "窗口", "Help": "帮助",
        "New Window": "新建窗口", "Close Window": "关闭窗口", "Close": "关闭",
        "Undo": "撤销", "Redo": "重做", "Cut": "剪切", "Copy": "复制", "Paste": "粘贴",
        "Paste and Match Style": "粘贴并匹配样式", "Delete": "删除", "Select All": "全选",
        "Speech": "语音", "Start Speaking": "开始朗读", "Stop Speaking": "停止朗读",
        "Reload": "重新加载", "Force Reload": "强制重新加载", "Toggle Developer Tools": "开发者工具",
        "Actual Size": "实际大小", "Zoom In": "放大", "Zoom Out": "缩小", "Toggle Full Screen": "全屏",
        "Minimize": "最小化", "Zoom": "缩放", "Bring All to Front": "前置全部窗口",
        "Docs": "文档", "About Antigravity": "关于 Antigravity", "Services": "服务",
        "Hide Antigravity": "隐藏 Antigravity", "Hide Others": "隐藏其他", "Show All": "显示全部",
        "Quit Antigravity": "退出 Antigravity", "Check for Updates": "检查更新",
        "Checking for Updates...": "正在检查更新...", "Downloading Update...": "正在下载更新...",
        "Restart to Update": "重启并应用更新"
    };
    function translateMenu(m) {
        if (!m || !m.items) return;
        m.items.forEach(item => {
            if (item.label && menuDict[item.label]) item.label = menuDict[item.label];
            if (item.submenu) translateMenu(item.submenu);
        });
    }
    translateMenu(menu);
    electron_1.Menu.setApplicationMenu(menu);`
      );
    
    fs.writeFileSync(menuPath, content, 'utf8');
    console.log('menu.js 字符替换与递归汉化注入完成。');
  }

  // 7b. 修改 updater.js 中的更新菜单文本
  console.log('正在修改 updater.js 菜单枚举...');
  const updaterPath = path.join(tempDir, 'dist/updater.js');
  if (fs.existsSync(updaterPath)) {
    let content = fs.readFileSync(updaterPath, 'utf8');
    content = content
      .replace('MenuUpdateStep["CheckForUpdates"] = "Check for Updates";', 'MenuUpdateStep["CheckForUpdates"] = "检查更新";')
      .replace('MenuUpdateStep["CheckingForUpdates"] = "Checking for Updates...";', 'MenuUpdateStep["CheckingForUpdates"] = "正在检查更新...";')
      .replace('MenuUpdateStep["DownloadingUpdate"] = "Downloading Update...";', 'MenuUpdateStep["DownloadingUpdate"] = "正在下载更新...";')
      .replace('MenuUpdateStep["RestartToUpdate"] = "Restart to Update";', 'MenuUpdateStep["RestartToUpdate"] = "重启并应用更新";');
    fs.writeFileSync(updaterPath, content, 'utf8');
    console.log('updater.js 修改完成。');
  }

  // 8. 修改 loadingOverlay.js 中的 Loading 文字
  console.log('正在修改 loadingOverlay.js 默认文字...');
  const loadingOverlayPath = path.join(tempDir, 'dist/loadingOverlay.js');
  if (fs.existsSync(loadingOverlayPath)) {
    let content = fs.readFileSync(loadingOverlayPath, 'utf8');
    content = content.replace('Loading Antigravity', '正在加载 Antigravity...');
    fs.writeFileSync(loadingOverlayPath, content, 'utf8');
    console.log('loadingOverlay.js 修改完成。');
  }

  // 9. 修改 ideInstall/wizardHtml.js 中的设置文字
  console.log('正在修改 ideInstall/wizardHtml.js 设置向导文字...');
  const wizardHtmlPath = path.join(tempDir, 'dist/ideInstall/wizardHtml.js');
  if (fs.existsSync(wizardHtmlPath)) {
    let content = fs.readFileSync(wizardHtmlPath, 'utf8');
    content = content
      .replace('Setting up…', '正在设置…')
      .replace('Welcome to the new Antigravity!', '欢迎使用全新的 Antigravity！')
      .replace(
        "Antigravity has been redesigned to put agents first with new capabilities. If you'd still like a code editor, you can download it as a separate app named <b>Antigravity IDE</b>.",
        "Antigravity 经过了全新设计，以智能体为核心并提供了全新的能力。如果您仍然需要代码编辑器，您可以将其作为名为 <b>Antigravity IDE</b> 的独立应用程序进行下载。"
      )
      .replace('Download the Antigravity IDE', '下载 Antigravity IDE')
      .replace('Explore the new Antigravity', '探索全新的 Antigravity');
    fs.writeFileSync(wizardHtmlPath, content, 'utf8');
    console.log('ideInstall/wizardHtml.js 修改完成。');
  }

  // 9b. 修改 main.js 中的退出对话框与托盘/Dock菜单
  console.log('正在修改 main.js 中的弹窗与托盘菜单...');
  const mainJsPath = path.join(tempDir, 'dist/main.js');
  if (fs.existsSync(mainJsPath)) {
    let content = fs.readFileSync(mainJsPath, 'utf8');
    content = content
      .replace("title: 'Confirm Quit',", "title: '确认退出',")
      .replace("message: 'Are you sure you want to quit?',", "message: '确定要退出吗？',")
      .replace("detail: 'There may be agents or background tasks running.',", "detail: '可能有智能体或后台任务正在运行。',")
      .replace("buttons: ['Cancel', 'Quit'],", "buttons: ['取消', '退出'],")
      .replace("label: 'New Window',", "label: '新建窗口',")
      .replace("label: 'No agents running',", "label: '无运行中的智能体',")
      .replace("label: `Open ${electron_1.app.getName()}`,", "label: `打开 ${electron_1.app.getName()}`,")
      .replace("label: 'Quit',", "label: '退出',");
    fs.writeFileSync(mainJsPath, content, 'utf8');
    console.log('main.js 修改完成。');
  }

  // 10. 使用 npx 打包为 app.asar
  console.log('正在打包修改后的文件为 app.asar...');
  execSync(`npx -y @electron/asar pack "${tempDir}" "${asarPath}"`, { stdio: 'inherit' });
  console.log('打包成功！补丁应用完成。');

} catch (err) {
  console.error('发生错误，正在回滚原始 app.asar...');
  if (fs.existsSync(backupAsarPath)) {
    fs.copyFileSync(backupAsarPath, asarPath);
    console.log('已成功回滚到原始 app.asar。');
  }
  console.error(err);
  process.exit(1);
} finally {
  // 11. 清理临时解包目录
  console.log('正在清理临时解包目录...');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  console.log('清理完毕。');
}

console.log('\n补丁成功应用！请手动在 Antigravity 窗口中按下 Cmd+R 重新加载，或手动重启应用。');
