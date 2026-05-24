const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. 配置路径
const appPath = '/Applications/Antigravity.app';
const resourcesPath = path.join(appPath, 'Contents/Resources');
const asarPath = path.join(resourcesPath, 'app.asar');
const backupAsarPath = path.join(resourcesPath, 'app.asar.bak');
const tempDir = path.join(__dirname, 'temp_extracted_asar');

console.log('=== Antigravity UI 中文化补丁 (登录汉化增强版) ===');

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
  const translationDict = {
    // 登录与欢迎界面 (Login & Welcome)
    "Sign In": "登录",
    "Sign in": "登录",
    "Log in to use the agent": "登录以使用智能体",
    "To use the agent, please login": "要使用智能体，请登录",
    "Sign in again": "重新登录",
    "Login failed": "登录失败",
    "Continue with Google": "使用 Google 账号继续",
    "Google Antigravity - Experience liftoff": "Google Antigravity - 体验升空",
    "To start using the agent, please sign in with your Google account.": "要开始使用智能体，请使用您的 Google 账号登录。",
    "There was an error with your authentication. To log in, click": "您的身份验证出错。要登录，请点击",
    "Please verify your account, then sign in again to continue. Learn more by visiting our": "请验证您的账号，然后重新登录以继续。访问我们的网站了解更多：",
    "Login to give your agent access to Google Drive": "登录以授予智能体访问 Google 云端硬盘的权限",
    "To start using the agent, please sign in with your Google account.": "要开始使用智能体，请使用您的 Google 账号登录。",
    "Welcome to": "欢迎来到",

    // 基础导航
    "Antigravity": "Antigravity",
    "Task": "任务",
    "Settings": "设置",
    "Implementation Plan": "实施计划",
    "Walkthrough": "演示与回顾",
    "Verify": "验证",
    
    // 侧边栏
    "New Conversation": "新建会话",
    "Conversation History": "会话历史",
    "Scheduled Tasks": "定时任务",
    "Projects": "项目",
    "No conversations yet": "暂无会话",
    "Not in Project": "未关联项目",
    "Shortcuts": "快捷键",
    "Provide Feedback": "提供反馈",
    
    // 设置侧边栏标签
    "Account": "账户",
    "Appearance": "外观",
    "Models": "模型",
    "Customizations": "个性化",
    "App": "应用",
    "Antigravity Settings": "Antigravity 设置",
    "CanMirror": "CanMirror",
    "Show all": "显示全部",
    "Conversations": "会话",
    
    // 账户设置 (Account Settings)
    "Manage your plan, credentials, and general preferences.": "管理您的计划、凭证和通用偏好。",
    "Enable Telemetry": "启用数据遥测",
    "When toggled on, Antigravity collects usage data to help Google enhance performance and features.": "开启后，Antigravity 将收集使用数据，以帮助 Google 提升性能和功能。",
    "Marketing Emails": "接收营销邮件",
    "Receive product updates, tips, and promotions from Google Antigravity via email.": "通过电子邮件接收来自 Google Antigravity 的产品更新、提示和促销信息。",
    "Your Plan:": "您的计划：",
    "Your Plan: Google AI Pro": "您的计划：Google AI Pro",
    "You can upgrade to a Google AI Ultra plan to receive the highest rate limits.": "您可以升级到 Google AI Ultra 计划，以获得最高的速率限制。",
    "Upgrade": "升级",
    "Email": "电子邮箱",
    "Sign Out": "退出登录",
    "Sign out": "退出登录",
    "By using this app, you agree to its ": "使用此应用即表示您同意其 ",
    "By using this app, you agree to its": "使用此应用即表示您同意其",
    "Terms of Service": "服务条款",
    "Terms of Service.": "服务条款。",

    // 权限设置 (Permissions Settings)
    "Configure global allowed and denied resource permissions.": "配置全局允许和拒绝的资源权限。",
    "Project-Specific Settings": "项目特定设置",
    "Modify scoped permissions, folders, and agent settings like Sandbox and Terminal Command Execution.": "修改特定项目范围内的权限、文件夹，以及像沙箱和终端命令执行这样的智能体设置。",
    "Go To Projects": "转到项目",
    "File Permissions": "文件权限",
    "Network Permissions": "网络权限",
    "Terminal & Tooling Permissions": "终端与工具权限",
    "Terminal Commands": "终端命令",
    "Configure allowed terminal commands.": "配置允许执行的终端命令。",
    "Commands Outside Sandbox": "沙箱外的命令",
    "Configure allowed commands outside the sandbox.": "配置允许在沙箱外运行的命令。",
    "MCP Tools": "MCP 工具",
    "Configure external tools via Model Context Protocol.": "通过模型上下文协议配置外部工具。",
    "Configure allowed and denied paths for file reads and writes.": "配置允许和拒绝文件读写的路径。",
    "Configure allowed and denied URLs for reading.": "配置允许和拒绝读取的 URL。",
    "No folders added yet.": "尚未添加任何文件夹。",
    "Folders": "文件夹",
    "+ Add Folder": "+ 添加文件夹",
    "Agent Settings": "智能体设置",
    "Security Preset": "安全预设",
    "Unrestricted": "无限制",
    "Choose a predefined security preset for the agent. This controls terminal auto-execution policy, and file access policy.": "为智能体选择预设的安全级别。这控制了终端自动执行策略和文件访问策略。",
    "Agent Behavior": "智能体行为",
    "Artifact Review Policy": "Artifact 审查策略",
    "Always Ask": "每次询问",
    "Specifies Agent's behavior when asking for review on artifacts, which are documents it creates to enable a richer conversation experience.": "指定智能体在请求审查 Artifact 时（即它为提供更丰富的对话体验而创建的文档）的行为。",
    "Local Permissions": "本地权限",
    "File Access Rules": "文件访问规则",
    "Network Access Rules": "网络访问规则",
    "Open": "打开",
    "打开": "打开", // 确保中文匹配
    
    // 权限设置中的句段/短语碎片
    "Inherits from": "继承自",
    "Inherits from ": "继承自 ",
    "global settings": "全局设置",
    "global settings.": "全局设置。",
    ". Local permissions have higher priority. ": "。本地权限具有更高的优先级。",
    "Local permissions have higher priority.": "本地权限具有更高的优先级。",
    "Learn more.": "了解更多。",
    "Learn more": "了解更多",
    "Learn more about": "了解更多关于",
    "Learn more about ": "了解更多关于 ",

    // 外观设置 (Appearance Settings)
    "Configure the agent's visual theme and display preferences.": "配置智能体的视觉主题与显示偏好。",
    "Chat Settings": "聊天设置",
    "Verbose agent chat": "详细智能体聊天",
    "Display and preserve intermediate thinking steps": "显示并保留中间思考步骤",
    "Select light, dark, or inherit system settings.": "选择浅色、深色，或继承系统设置。",
    "Light Theme": "浅色主题",
    "Dark Theme": "深色主题",
    "Preset": "预设",
    "Background": "背景色",
    "Foreground": "前景色",
    "Accent": "强调色",
    "System": "系统默认",
    "Default Light": "默认浅色",
    "Default Dark": "默认深色",

    // 更多模型与通用 UI
    "Model Selection": "模型选择",
    "No models available": "无可用模型",
    "Select Model": "选择模型",
    "Check for Updates": "检查更新",
    "Checking for updates": "正在检查更新",
    "New Window": "新建窗口",
    "Close Window": "关闭窗口",
    "Welcome to the new Antigravity!": "欢迎使用全新的 Antigravity！",
    "Download the Antigravity IDE": "下载 Antigravity IDE",
    "Explore the new Antigravity": "探索全新的 Antigravity",
    "Loading Antigravity": "正在加载 Antigravity",
    "Setting up…": "正在设置…",
    "Confirm Quit": "确认退出",
    "Are you sure you want to quit?": "确定要退出吗？",
    "There may be agents or background tasks running.": "可能有智能体或后台任务正在运行。",
    "Submit": "提交",
    "Skip": "跳过",
    "Cancel": "取消",
    "Save": "保存",
    "Close": "关闭",
    "Apply": "应用"
  };

  // 仅对长而唯一的短语使用正则替换，避免污染普通单词（如 App, Open, File）
  const regexReplacements = [
    { pattern: /New Conversation/g, replace: "新建会话" },
    { pattern: /Conversation History/g, replace: "会话历史" },
    { pattern: /Scheduled Tasks/g, replace: "定时任务" },
    { pattern: /No conversations yet/g, replace: "暂无会话" },
    { pattern: /Antigravity Settings/g, replace: "Antigravity 设置" },
    { pattern: /Manage your plan, credentials, and general preferences\\./g, replace: "管理您的计划、凭证和通用偏好。" },
    { pattern: /Manage project folders, agent settings, and permissions\\./g, replace: "管理项目文件夹、智能体设置与权限。" },
    { pattern: /No folders added yet\\./g, replace: "尚未添加任何文件夹。" },
    { pattern: /Choose a predefined security preset for the agent\\. This controls terminal auto-execution policy, and file access policy\\./g, replace: "为智能体选择预设的安全级别。这控制了终端自动执行策略和文件访问策略。" },
    { pattern: /Specifies Agent's behavior when asking for review on artifacts, which are documents it creates to enable a richer conversation experience\\./g, replace: "指定智能体在请求审查 Artifact 时（即它为提供更丰富的对话体验而创建的文档）的行为。" },
    { pattern: /Configure allowed and denied paths for file reads and writes\\./g, replace: "配置允许和拒绝文件读写的路径。" },
    { pattern: /Configure allowed and denied URLs for reading\\./g, replace: "配置允许和拒绝读取的 URL。" },
    { pattern: /Local permissions have higher priority\\./g, replace: "本地权限具有更高的优先级。" },
    { pattern: /Configure the agent's visual theme and display preferences\\./g, replace: "配置智能体的视觉主题与显示偏好。" },
    { pattern: /Display and preserve intermediate thinking steps/g, replace: "显示并保留中间思考步骤" },
    { pattern: /Configure global allowed and denied resource permissions\\./g, replace: "配置全局允许和拒绝的资源权限。" }
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
    if (translationDict[trimmed]) {
      const leadingSpace = text.match(/^\\s*/)[0];
      const trailingSpace = text.match(/\\s*$/)[0];
      node.nodeValue = leadingSpace + translationDict[trimmed] + trailingSpace;
      return;
    }

    // 尝试正则替换长短语
    let modified = false;
    for (const item of regexReplacements) {
      if (item.pattern.test(text)) {
        text = text.replace(item.pattern, item.replace);
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
        if (val && translationDict[val.trim()]) {
          node.setAttribute(attr, translationDict[val.trim()]);
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
      if (document.title && translationDict[document.title.trim()]) {
        document.title = translationDict[document.title.trim()];
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
