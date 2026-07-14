# Antigravity UI 中文本地化补丁 (Chinese Localization Patch)

> **Antigravity UI 中文本地化补丁**：极简安全、防止白屏且抗更新的顶级菜单、设置与反馈页面汉化方案。
> **Antigravity UI Chinese Localization Patch**: A highly secure, anti-white-screen, and update-resilient Simplified Chinese localization solution for the top menus, settings, and feedback pages.

---

这是一个专为 Google DeepMind 开发的 Agentic 编程助手 **Antigravity** 客户端设计的 UI 中文本地化补丁。

## 特性 (Features)

- **顶级菜单无损汉化**：通过递归遍历和修改默认菜单对象的 label，在不改变任何 Electron 原生 MenuItem 实例、Role 角色以及快捷键/点击绑定事件的前提下实现完美汉化，**100% 杜绝了由于自定义菜单模板冲突导致的白屏崩溃问题**。
- **动态 DOM 翻译**：注入精简的 `MutationObserver` 动态监听并翻译界面上的英文字符，不破坏或修改打包混淆后的客户端代码。
- **高抗更新性**：由于不依赖前端混淆后的变量名或内部逻辑，当 Antigravity 版本更新时，只需重新运行补丁即可快速适配，不会轻易失效。
- **安全与性能优先**：完全使用原生 JavaScript 语言特性，屏蔽了代码块和文本输入框的翻译，避免破坏代码显示；移除可能引发运行时错误的动态菜单读写，采用静态源码替换方式，确保运行稳定。
- **覆盖率高**：支持顶部菜单栏、Dock 菜单、系统托盘、退出确认弹窗、侧边栏、设置面板、定时任务、通知对话框以及反馈页面的全面汉化。

---

## AI 智能体一键部署命令 (For AI Agent Deployment)

如果您正在使用 AI 编码助手（如 Antigravity 智能体或其他 Agent），您可以直接复制以下文本并发送给它，它将自动为您完成克隆、注入部署与重启应用：

> **给 Agent 的提示词 / Prompt for Agent (macOS):**
> 
> ```
> 请帮我把 Antigravity 客户端汉化。直接在终端执行以下一键命令：
> git clone https://github.com/ShawnRn/antigravity-l10n.git /tmp/antigravity-l10n && cd /tmp/antigravity-l10n && node apply_patch.js && rm -rf /tmp/antigravity-l10n && killall Antigravity 2>/dev/null || true && open -a Antigravity
> 
> Please localize my Antigravity client to Chinese. Execute the following commands in the terminal directly:
> git clone https://github.com/ShawnRn/antigravity-l10n.git /tmp/antigravity-l10n && node apply_patch.js && rm -rf /tmp/antigravity-l10n && killall Antigravity 2>/dev/null || true && open -a Antigravity
> ```

> **给 Agent 的提示词 / Prompt for Agent (Windows - PowerShell):**
> 
> ```
> 请帮我把 Windows 版 Antigravity 客户端汉化。直接在 PowerShell 中执行以下一键命令：
> git clone https://github.com/ShawnRn/antigravity-l10n.git "$env:TEMP\antigravity-l10n"; cd "$env:TEMP\antigravity-l10n"; node apply_patch.js; cd ..; Remove-Item -Recurse -Force "$env:TEMP\antigravity-l10n"; Stop-Process -Name Antigravity -Force -ErrorAction SilentlyContinue; Start-Process "$env:LOCALAPPDATA\Programs\antigravity\Antigravity.exe"
> 
> Please localize my Windows Antigravity client to Chinese. Execute the following commands in PowerShell directly:
> git clone https://github.com/ShawnRn/antigravity-l10n.git "$env:TEMP\antigravity-l10n"; cd "$env:TEMP\antigravity-l10n"; node apply_patch.js; cd ..; Remove-Item -Recurse -Force "$env:TEMP\antigravity-l10n"; Stop-Process -Name Antigravity -Force -ErrorAction SilentlyContinue; Start-Process "$env:LOCALAPPDATA\Programs\antigravity\Antigravity.exe"
> ```

---

## 手动使用方法 (Manual Usage)

### 1. 一键应用补丁

在终端中进入本项目目录，运行以下命令即可自动完成备份、解包、注入与重新打包：

```bash
# 运行补丁脚本
node apply_patch.js
```

或者使用 npm 脚本：

```bash
npm run apply
```

### 2. 刷新或重启界面

补丁应用成功后：
- 如果您的 Antigravity 客户端已在运行，请在客户端窗口中按下 **`Cmd + R`** (macOS) 或 **`Ctrl + R`** (Windows) (可附加 Shift 强制刷新) 重新加载渲染进程。
- 您也可以手动退出并重新打开 Antigravity 应用。

---

## 目录结构 (Directory Structure)

- `apply_patch.js`：核心补丁脚本，处理 `app.asar` 的自动解密、内容替换、注入、重包与备份（支持 macOS/Windows 双端）。
- `scan_binary.js`：对 `language_server` 进行静态文本提取与清洗初筛的辅助脚本（支持 macOS/Windows 双端）。
- `package.json`：定义了 npm 命令与依赖管理。
- `README.md`：本项目说明文档。

---

## 故障回滚 (Rollback)

如果需要还原为原始的英文界面，可以直接执行以下命令以恢复备份的 `app.asar`：

**macOS:**
```bash
cp /Applications/Antigravity.app/Contents/Resources/app.asar.bak /Applications/Antigravity.app/Contents/Resources/app.asar
```

**Windows (PowerShell):**
```powershell
Copy-Item "$env:LOCALAPPDATA\Programs\antigravity\resources\app.asar.bak" "$env:LOCALAPPDATA\Programs\antigravity\resources\app.asar" -Force
```
