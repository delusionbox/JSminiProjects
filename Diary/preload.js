const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendContents: (contents) => ipcRenderer.send("submitContents", contents),
    getContents: () => ipcRenderer.invoke("show-contents"),
    selectImage: () => ipcRenderer.invoke("select-image"),
    selectVideo: () => ipcRenderer.invoke("select-video"),
    editContents: (index, newData) => ipcRenderer.invoke('edit-contents', index, newData),
    deleteContent: (date) => ipcRenderer.invoke('delete-content', date),
});
