  const { app, BrowserWindow, ipcMain, dialog, Tray, Menu } = require("electron");
  const path = require("path");
  const { execFile } = require("child_process");
  const downloader = require("./build/Release/downloader.node"); // <-- compiled C++ addon
  //console.log(downloader.hello());
  const { autoUpdater } = require("electron-updater");
  const log = require("electron-log");
  let updateWindow = null;

  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = "info";
  log.info("Electron logging initialized.");
  let tray = null;
  let mainWindow = null;

  const Store = require("electron-store");
  const store = new Store();
  let minimizeToTray = store.get("minimizeToTray", true); // default true

  const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    resizable: false,
    fullscreenable: false,
    maximizable: false,
    frame: false,
    show: false, // 👈 Do not show window immediately
    icon: path.join(__dirname, "public", "assets", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Development tools
  win.webContents.openDevTools({ mode: "detach" });

  // Window configuration
  win.setAspectRatio(16 / 9);
  win.setMenu(null);

  // External link handling
  win.webContents.setWindowOpenHandler(({ url }) => {
    const { shell } = require("electron");
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Window close behavior (minimize to tray)
  win.on("close", (event) => {
    if (!app.isQuitting && minimizeToTray) {
      event.preventDefault();
      win.hide();
      return false;
    }
  });

  // Load the app content
  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "dist/index.html"));
  }

  // ✅ Show window only after content is fully loaded
  win.webContents.on("did-finish-load", () => {
    win.show();
  });

  return win;
}

  app.whenReady().then(() => {
    mainWindow = createWindow(); // Assign the window to mainWindow
// if (isDev && mainWindow) {
//   console.log("🔧 Running fake update simulation (DEV mode)");

//   setTimeout(() => {
//     mainWindow.webContents.send("update-available");

//     let downloaded = 0;
//     const total = 100 * 1024 * 1024; // 100 MB
//     const speed = 5 * 1024 * 1024; // 5 MB/s

//     const interval = setInterval(() => {
//       downloaded += speed;
//       const percent = (downloaded / total) * 100;

//       mainWindow.webContents.send("update-download-progress", {
//         percent,
//         transferred: downloaded,
//         total,
//         bytesPerSecond: speed,
//       });

//       if (downloaded >= total) {
//         clearInterval(interval);
//         mainWindow.webContents.send("update-downloaded");
//         console.log("✅ Fake update finished");
//       }
//     }, 500);
//   }, 5000);
// }
  // Load saved minimizeToTray
    minimizeToTray = store.get("minimizeToTray", true);
    
  const openAtLogin = store.get("openOnStartup", true);
    app.setLoginItemSettings({
      openAtLogin,
      path: process.execPath,
    });
    // Tray initialization
    tray = new Tray(path.join(__dirname, "public", "assets", "icon.ico"));
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Show App",
        click: () => mainWindow.show()
      },
      {
        label: "Quit",
        click: () => {
    app.isQuitting = true;  // Change from isQuiting to isQuitting
          app.quit();
        }
      }
    ]);
    tray.setToolTip("SweetStakes Launcher");
    tray.setContextMenu(contextMenu);

    // Handle tray double click (optional)
    tray.on('double-click', () => mainWindow.show());

    if (!isDev) {
  autoUpdater.checkForUpdates();
    }
  });
  if (!isDev) {
    autoUpdater.on("checking-for-update", () => {
      log.info("Checking for updates...");
  });

autoUpdater.on("update-available", () => {
  log.info("Update available");
  mainWindow?.webContents.send("update-available"); // ✅ This triggers your React popup
});

autoUpdater.on("download-progress", (progress) => {
  log.info("Progress: " + JSON.stringify(progress));
  mainWindow?.webContents.send("update-download-progress", progress);
});

autoUpdater.on("update-downloaded", () => {
  log.info("Update downloaded.");
  mainWindow?.webContents.send("update-downloaded");
});

    autoUpdater.on("update-not-available", () => {
      log.info("No update available");
      updateWindow = null;
    });

    autoUpdater.on("error", (err) => {
      log.error("Update error: " + err.message);
      updateWindow?.close();
      updateWindow = null;
    });
  }

  app.on('before-quit', () => {
    app.isQuitting = true;
  });
    
  ipcMain.handle("select-folder", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });

    if (result.canceled || !result.filePaths[0]) return null;

    const folderPath = result.filePaths[0];

    // ✅ Save the selected folder path persistently
    store.set("installFolder", folderPath);
    console.log("Saved selected folder:", folderPath);

    // ✅ Return the selected path to the renderer
    return folderPath;
  });


  ipcMain.on("download-progress", (event, progressData) => {
    console.log("Progress:", progressData);
    // update UI here
  });
  ipcMain.handle("run-exe", async (event, exePath) => {
    try {
      execFile(exePath, (err) => {
        if (err) {
          console.error("Failed to run exe:", err);
        }
      });
    } catch (e) {
      console.error("Error running exe:", e);
    }
  });
  ipcMain.on("window:minimize", (event) => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.minimize();
  });

  ipcMain.on("window:close", (event) => {
    app.isQuitting = true;
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.close();
  });


  ipcMain.on('window:restore', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
    }
  });
  ipcMain.handle("run-downloader", async (event, folderPath) => {
    return downloader.startUpdate((data) => {
      event.sender.send("download-progress", data);
    }, folderPath);
  });

  ipcMain.handle("get-folder", () => {
    const folder = store.get("installFolder", null);
    console.log("Retrieved installFolder:", folder);
    return folder;
  });

  // Save the selected folder
  ipcMain.handle("set-folder", (_evt, folderPath) => {
      console.log("set folder path:", folderPath);
    store.set("installFolder", folderPath);
    return true;
  });
  ipcMain.handle("get-app-version", () => {
    return app.getVersion();
  });



  ipcMain.handle("check-status", async (_evt, folderPath) => {
    try {
      // This calls your new C++ CheckStatus
      console.log("IPC received check-status with folderPath:", folderPath); // Log the incoming folderPath
      log.info("PC received check-status with folderPath: " + folderPath);
    console.log("Saving folder path:", folderPath);
      const result = await downloader.checkStatus(folderPath);
      return result; // { status, localVersion, remoteVersion [, error] }
    } catch (e) {
      console.error("checkStatus error", e);
      return { status: "error", error: e.message };
    }
  });


  ipcMain.on("sendLog", (event, status, localVersion, remoteVersion, error) => {
    log.info(`Status: ${status}`);
    log.info(`Local Version: ${localVersion}`);
    log.info(`Remote Version: ${remoteVersion}`);

    if (error) {
      log.error(`Error: ${error}`);
    }
  });

  ipcMain.on('request-refresh', (event) => {
    // Forward the refresh signal to the renderer process
    event.sender.send('trigger-refresh');
  });

  ipcMain.handle("set-close-behavior", (_event, shouldMinimize) => {
      log.info(`Tray behavior changed: minimizeToTray = ${shouldMinimize}`);

    minimizeToTray = shouldMinimize;
    store.set("minimizeToTray", shouldMinimize); // ✅ persist
    return true;
  });
  ipcMain.handle("get-close-behavior", () => {
    const value = store.get("minimizeToTray", true);
   
    return value;
  });

  ipcMain.handle("set-auto-launch", async (_event, enable) => {

    app.setLoginItemSettings({
      openAtLogin: enable,
      path: process.execPath,
    });
    store.set("openOnStartup", enable); // ✅ persist
    return true;
  });

  ipcMain.handle("get-auto-launch", () => {
    const value = store.get("openOnStartup", true);
    return value;
  });
  // Save the auto-update checkbox state
  ipcMain.handle("set-auto-update-enabled", (_event, enabled) => {

    store.set("autoUpdateEnabled", enabled); // ✅ Store it persistently
    return true;
  });

  ipcMain.handle("get-auto-update-enabled", () => {
    const value = store.get("autoUpdateEnabled", true);
    return value;
  });

  // Also add this event handler to broadcast changes to all windows when needed:
  ipcMain.handle("broadcast-auto-update-change", (_event, enabled) => {
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send("auto-update-changed", enabled);
    });
    return true;
  });
  app.on('renderer-process-crashed', (event, webContents, killed) => {
    console.error('Renderer process crashed:', killed);
  });
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });




  ipcMain.on("restart-app", () => {  // Changed from "restart_app"
    autoUpdater.quitAndInstall();
  });
  ipcMain.handle("check-for-updates", () => {
    if (!isDev) {
      autoUpdater.checkForUpdates();
    }
    return true;
  });


ipcMain.handle('broadcast-refresh-signal', async () => {
  // Send to all windows/renderers
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('refresh-signal');
  });
});
// ✅ ADD this one (missing)
ipcMain.handle('broadcast-install-path-change', async (event, newPath) => {
  console.log("Broadcasting install path change:", newPath);
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('install-path-changed', newPath);
  });
  return true;
});



// const { app, BrowserWindow, Tray, Menu } = require("electron");
// const path = require("path");

// const isDev = !app.isPackaged;
// const now = new Date().toLocaleString();
// console.log(`[${now}] 🚀 Electron app is starting...`);

// let mainWindow = null;

// function createWindow() {
//   const win = new BrowserWindow({
//     width: 1280,
//     height: 720,
//     resizable: false,
//     fullscreenable: false,
//     maximizable: false,
//     frame: false,
//     icon: path.join(__dirname, "public", "assets", "icon.ico"),
//     webPreferences: {
//       preload: path.join(__dirname, "preload.js"),
//       contextIsolation: true,
//       nodeIntegration: false,
//     },
//   });

//   win.setAspectRatio(16 / 9);
//   win.setMenu(null);

//   win.webContents.setWindowOpenHandler(({ url }) => {
//     const { shell } = require("electron");
//     shell.openExternal(url);
//     return { action: "deny" };
//   });

//   if (isDev) {
//     win.webContents.openDevTools({ mode: "detach" });
//     win.loadURL("http://localhost:5173");
//   } else {
//     win.loadFile(path.join(__dirname, "dist/index.html"));
//   }

//   return win;
// }

// app.whenReady().then(() => {
//   mainWindow = createWindow();

//   const tray = new Tray(path.join(__dirname, "public", "assets", "icon.ico"));
//   const contextMenu = Menu.buildFromTemplate([
//     {
//       label: "Show App",
//       click: () => mainWindow.show()
//     },
//     {
//       label: "Quit",
//       click: () => {
//         app.quit();
//       }
//     }
//   ]);
//   tray.setToolTip("SweetStakes Launcher");
//   tray.setContextMenu(contextMenu);

//   tray.on("double-click", () => mainWindow.show());
// });

// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") {
//     app.quit();
//   }
// });
