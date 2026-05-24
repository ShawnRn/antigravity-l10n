# Antigravity UI 中文本地化补丁 (Chinese Localization Patch)

这是一个专为 Google DeepMind 开发的 Agentic 编程助手 **Antigravity** 客户端设计的 UI 中文本地化补丁。

## 特性

- **动态 DOM 翻译**：使用 `MutationObserver` 动态监听并翻译界面上的英文字符，不破坏或修改打包混淆后的 `main.js` 代码。
- **高抗更新性**：由于不依赖前端混淆后的变量名或内部逻辑，当 Antigravity 版本更新时，只需重新运行补丁即可快速适配，不会轻易失效。
- **安全与性能优先**：完全使用原生 JavaScript 语言特性，屏蔽了代码块和文本输入框的翻译，避免破坏代码显示；移除可能引发运行时错误的动态菜单读写，采用静态源码替换方式，确保运行稳定。
- **覆盖率高**：支持侧边栏、设置面板、定时任务、通知对话框以及系统应用菜单的全面汉化。

## 使用方法

### 一键应用补丁

在终端中进入本项目目录，运行以下命令即可自动完成备份、解包、注入与重新打包：

```bash
# 运行补丁脚本
node apply_patch.js
```

或者使用 npm 脚本：

```bash
npm run apply
```

### 刷新界面

补丁应用成功后：
- 如果您的 Antigravity 客户端已在运行，请在客户端窗口中按下 **`Cmd + R`** (或 `Cmd + Shift + R` 强制刷新) 重新加载渲染进程。
- 您也可以手动退出并重新打开 Antigravity 应用。

## 目录结构

- `apply_patch.js`：核心补丁脚本，处理 `app.asar` 的自动解密、内容替换、注入、重包与备份。
- `package.json`：定义了 npm 命令与依赖管理。
- `README.md`：本项目说明文档。

## 故障回滚

如果需要还原为原始的英文界面，可以直接执行以下命令以恢复备份的 `app.asar`：

```bash
cp /Applications/Antigravity.app/Contents/Resources/app.asar.bak /Applications/Antigravity.app/Contents/Resources/app.asar
```
