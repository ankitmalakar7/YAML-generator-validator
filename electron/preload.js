const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("yamlAPI", {
  validateYAML: (filePath) => ipcRenderer.invoke("validate-yaml", filePath),
  generateYAML: (data, filePath, append) =>
    ipcRenderer.invoke("generate-yaml", data, filePath, append),
  openFileDialog: () => ipcRenderer.invoke("open-file-dialog"),
});
