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
  appendToFile: (fileName: string, content: string) => {
    const userDir = os.homedir(); // 获取用户目录
    const filePath = path.join(userDir, fileName);

    fs.appendFile(filePath, content + '\n', (err) => {
      if (err) {
        console.error('Error writing to file:', err);
      } else {
        console.log(`Content appended to ${filePath}`);
      }
    });
  }
});
