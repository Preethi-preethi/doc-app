import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
    openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
    scanDirectory: (dirPath: string) => ipcRenderer.invoke('scan:directory', dirPath)
})
