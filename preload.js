const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  processFiles: (files, apiKey) => ipcRenderer.invoke('process-files', files, apiKey),
  saveApiKey: (apiKey) => ipcRenderer.invoke('save-api-key', apiKey),
  loadApiKey: () => ipcRenderer.invoke('load-api-key'),
  selectFiles: () => ipcRenderer.invoke('select-files')
});
