const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendContents: (contents) => ipcRenderer.send("submitContents", contents)
});