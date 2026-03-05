import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'

// The built directory structure
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null

function createWindow() {
    win = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC || '', 'electron-vite.svg'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        width: 1200,
        height: 800,
    })

    // Set the menu bar to null
    win.setMenu(null);

    win.webContents.on('console-message', (_event, _level, message, line, sourceId) => {
        console.log(`[RENDERER CONSOLE]: ${message} (at ${sourceId}:${line})`)
    })

    if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
        win.loadURL(process.env.VITE_DEV_SERVER_URL)
        // Open dev tool if in dev mode
        win.webContents.openDevTools()
    } else {
        win.loadFile(path.join(process.env.DIST || '', 'index.html'))
        win.webContents.openDevTools()
    }
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

import { registerFileScanningHandlers } from './scanner'

app.whenReady().then(() => {
    createWindow()
    registerFileScanningHandlers()
})

// Registration of IPC events
ipcMain.handle('dialog:openDirectory', async () => {
    if (!win) return null;
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        properties: ['openDirectory']
    })
    if (canceled) {
        return null
    } else {
        return filePaths[0]
    }
})
