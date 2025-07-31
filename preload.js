const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  runExe: (exePath) => ipcRenderer.invoke("run-exe", exePath),

  selectFolder: () => ipcRenderer.invoke("select-folder"),
  runDownloader: (folderPath) => ipcRenderer.invoke("run-downloader", folderPath),
  onDownloadProgress: (callback) => ipcRenderer.on("download-progress", callback),
  removeDownloadProgressListener: (callback) => ipcRenderer.removeListener("download-progress", callback),

  minimizeWindow: () => ipcRenderer.send("window:minimize"),
  closeWindow: () => ipcRenderer.send("window:close"),
  getFolder: () => ipcRenderer.invoke("get-folder"),
  saveFolder: (path) => ipcRenderer.invoke("set-folder", path),
  getVersion: () => ipcRenderer.invoke("get-app-version"),
  checkStatus: (folder) => ipcRenderer.invoke("check-status", folder),
  sendLog: (status, localVersion, remoteVersion, error) => {
    ipcRenderer.send("sendLog", status, localVersion, remoteVersion, error);
  },

  // REFRESH SIGNAL METHODS (keep only one set)
  broadcastRefreshSignal: () => ipcRenderer.invoke('broadcast-refresh-signal'),
  onRefreshSignal: (callback) => ipcRenderer.on('refresh-signal', callback),
  removeRefreshListener: () => ipcRenderer.removeAllListeners('refresh-signal'),

  setCloseBehavior: (shouldMinimize) => ipcRenderer.invoke("set-close-behavior", shouldMinimize),
  getCloseBehavior: () => ipcRenderer.invoke("get-close-behavior"),
  setAutoLaunch: (enable) => ipcRenderer.invoke("set-auto-launch", enable),
  getAutoLaunch: () => ipcRenderer.invoke("get-auto-launch"),

  // AUTO UPDATE METHODS
  setAutoUpdateEnabled: (enabled) => ipcRenderer.invoke("set-auto-update-enabled", enabled),
  getAutoUpdateEnabled: () => ipcRenderer.invoke("get-auto-update-enabled"),
  onAutoUpdateChange: (callback) => ipcRenderer.on('auto-update-changed', callback),
  removeAutoUpdateChangeListener: (callback) => ipcRenderer.removeListener('auto-update-changed', callback),
  broadcastAutoUpdateChange: (enabled) => ipcRenderer.invoke('broadcast-auto-update-change', enabled),

  // APP UPDATE METHODS
  onUpdateAvailable: (callback) => ipcRenderer.on("update-available", callback),
  onUpdateProgress: (callback) => ipcRenderer.on("update-download-progress", callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on("update-downloaded", callback),
  restartApp: () => ipcRenderer.send("restart-app"),
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
  removeUpdateListeners: () => {
    ipcRenderer.removeAllListeners("update-available");
    ipcRenderer.removeAllListeners("update-download-progress");
    ipcRenderer.removeAllListeners("update-downloaded");
  },

  // ADD INSTALL PATH CHANGE METHODS
  onInstallPathChanged: (callback) => ipcRenderer.on('install-path-changed', callback),
  removeInstallPathChangeListener: (callback) => ipcRenderer.removeListener('install-path-changed', callback),
  broadcastInstallPathChange: (newPath) => ipcRenderer.invoke('broadcast-install-path-change', newPath)
});

// const { contextBridge, ipcRenderer } = require('electron');

// // Expose safe APIs to the renderer process
// contextBridge.exposeInMainWorld('electronAPI', {
//   // Example: add more methods here if needed
//   openExternalLink: (url) => ipcRenderer.send('open-external-link', url),
  
//   // Just a test placeholder
//   ping: () => 'pong'
// });
