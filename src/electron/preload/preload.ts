import fs from 'fs';
import os from 'os';
import path from 'path';
// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
import { contextBridge, ipcRenderer } from 'electron'
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector: any, text: any) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  onSettingScan: (callback: any) => ipcRenderer.on('setting-scan', callback),
  onSettingOdu: (callback: any) => ipcRenderer.on('setting-odu', callback),
  onSettingTelnet: (callback: any) => ipcRenderer.on('setting-telnet', callback),
})

contextBridge.exposeInMainWorld('fileAPI', {
  getUserDir: () => os.homedir(),
  appendToFile: (userDir: string, fileName: string, content: string) => {
    // 如果 userDir 为空或 null，使用用户主目录
    if (!userDir || userDir.length === 0) {
      userDir = os.homedir();
    }

    // 检查目录是否存在，不存在则创建
    if (!fs.existsSync(userDir)) {
      try {
        fs.mkdirSync(userDir, { recursive: true }); // 确保创建多级目录
      } catch (err) {
        console.error('Error creating directory:', err);
        return;
      }
    }

    const filePath = path.join(userDir, fileName);

    // 追加写入文件
    fs.appendFile(filePath, content + '\n', (err) => {
      if (err) {
        console.error('Error writing to file:', err);
      } else {
        console.log(`Content appended to ${filePath}`);
      }
    });
  }
});
