const fs = require('fs');
const path = require('path');
const os = require('os');

function detectAppPath() {
  if (process.platform === 'darwin') {
    return '/Applications/Antigravity.app';
  } else if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA;
    const programFiles = process.env.ProgramFiles;
    const programFilesX86 = process.env['ProgramFiles(x86)'];
    
    const possiblePaths = [];
    if (localAppData) {
      possiblePaths.push(path.join(localAppData, 'Programs/antigravity'));
      possiblePaths.push(path.join(localAppData, 'Programs/Antigravity'));
    }
    if (programFiles) {
      possiblePaths.push(path.join(programFiles, 'Antigravity'));
      possiblePaths.push(path.join(programFiles, 'antigravity'));
    }
    if (programFilesX86) {
      possiblePaths.push(path.join(programFilesX86, 'Antigravity'));
      possiblePaths.push(path.join(programFilesX86, 'antigravity'));
    }
    
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
    return possiblePaths[0] || '';
  }
  return '';
}

const appPath = detectAppPath();
const resourcesPath = process.platform === 'darwin'
  ? path.join(appPath, 'Contents/Resources')
  : path.join(appPath, 'resources');

const binaryName = process.platform === 'win32' ? 'language_server.exe' : 'language_server';
const binaryPath = path.join(resourcesPath, 'bin', binaryName);
const outputPath = path.join(os.homedir(), '.gemini/antigravity/scratch/scanned_strings.json');

console.log('=== 开始扫描 language_server 二进制字符串 ===');

if (!fs.existsSync(binaryPath)) {
  console.error(`错误：找不到二进制文件: ${binaryPath}`);
  process.exit(1);
}

try {
  console.log('读取二进制文件 (大小约为 126MB)...');
  const buffer = fs.readFileSync(binaryPath);
  console.log('读取成功，开始搜索 ASCII 字符串...');

  const text = buffer.toString('ascii');
  // 正则寻找长度在 12 到 200 之间、以字母开头、含有空格的英文字符串候选体
  // 这有利于规避大量的无空格 Go 符号 (如 runtime.mallocgc)
  const regex = /[a-zA-Z][a-zA-Z0-9\s\.,!\?'"\(\)\-\_:\*\/]{12,200}/g;
  const matches = text.match(regex) || [];
  console.log(`初步搜寻到 ${matches.length} 个候选字符串，开始清洗过滤...`);

  const uniqueStrings = new Set();

  for (let str of matches) {
    str = str.trim();
    
    // 过滤条件 1: 必须包含至少一个空格 (保证是英文句子或短语，而非变量名/路径)
    if (!str.includes(' ')) continue;
    
    // 过滤条件 2: 过滤掉明显是 Go 运行时的符号、路径或包名
    if (str.startsWith('github.com') || 
        str.startsWith('google.golang.org') || 
        str.startsWith('golang.org') ||
        str.startsWith('gopkg.in') ||
        str.includes('/go/src/') ||
        str.includes('/go-build/') ||
        str.startsWith('runtime.') ||
        str.startsWith('reflect.') ||
        str.startsWith('syscall.') ||
        str.startsWith('net/http') ||
        str.startsWith('internal/') ||
        str.startsWith('google.golang.org/') ||
        str.includes('protobuf')
    ) {
      continue;
    }

    // 过滤条件 3: 排除明显的日志格式、版本信息、系统路径
    if (/^[a-zA-Z0-9_\-\.\/]+$/.test(str)) continue; // 无空格的组合，但前面已过滤，这里双重保险
    if (/^[A-Z0-9_\s]+$/.test(str) && str.length > 20) continue; // 疑似大写常量/汇编指令
    if (str.startsWith('/') || str.startsWith('C:\\')) continue; // 绝对路径
    if (str.includes('//') || str.includes('/*')) continue; // 代码注释标记
    if (str.includes('http://') || str.includes('https://')) continue; // 排除链接

    // 过滤条件 4: 文本必须含有一定比例的英文字母
    const letters = str.replace(/[^a-zA-Z]/g, '').length;
    if (letters / str.length < 0.6) continue;

    // 过滤条件 5: 词数必须在 2 到 35 之间 (避开过长的混淆或日志文本)
    const wordCount = str.split(/\s+/).length;
    if (wordCount < 2 || wordCount > 35) continue;

    // 清洗完成后加入 Set
    uniqueStrings.add(str);
  }

  const resultList = Array.from(uniqueStrings).sort();
  console.log(`过滤清洗完成！共提取出 ${resultList.length} 条具有 UI 文案特征的独立字符串。`);

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(resultList, null, 2), 'utf8');
  console.log(`结果已保存至: ${outputPath}`);

} catch (err) {
  console.error('扫描过程中发生错误:', err);
}
