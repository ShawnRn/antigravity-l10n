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
    "agent settings and permissions for conversations outside of projects.": "针对项目外对话的智能体设置与权限。"
  };

  // 仅对长而唯一的短语使用正则替换，避免污染普通单词（如 App, Open, File）
  const regexReplacements = [
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
    { pattern: /Agent settings and permissions for conversations outside of projects\\./gi, replace: "针对项目外对话的智能体设置与权限。" }
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

  // 7. 修改 menu.js 中的硬编码菜单项 (静态替换)
  console.log('正在修改 menu.js 硬编码菜单项...');
  const menuPath = path.join(tempDir, 'dist/menu.js');
  if (fs.existsSync(menuPath)) {
    let content = fs.readFileSync(menuPath, 'utf8');
    content = content.replace("label: 'New Window'", "label: '新建窗口'");
    content = content.replace("label: 'Docs'", "label: '文档'");
    fs.writeFileSync(menuPath, content, 'utf8');
    console.log('menu.js 修改完成。');
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
