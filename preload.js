const { contextBridge, ipcRenderer } = require('electron')

console.log('preload loaded')

contextBridge.exposeInMainWorld(
    'windowControl', {
        minimize: () => ipcRenderer.send('window:minimize'),
        retry: () => ipcRenderer.send('window:reload')
    }
)

contextBridge.exposeInMainWorld(
    'game', {
        launch: (ip, port) => ipcRenderer.send('game:btnPlay', {ip: ip, port: port}),
        isLaunched: () => ipcRenderer.send('game:isLaunched')
    }
)