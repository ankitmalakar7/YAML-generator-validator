const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("yamlAPI", {
  validateYAML: (filePath) => ipcRenderer.invoke("validate-yaml", filePath),
  validateYAMLContent: (content) =>
    ipcRenderer.invoke("validate-yaml-content", content),
  generateYAML: (data, filePath, append) =>
    ipcRenderer.invoke("generate-yaml", data, filePath, append),
  generateYAMLFromContent: (content, filePath, append) =>
    ipcRenderer.invoke("generate-yaml-from-content", content, filePath, append),
  openFileDialog: () => ipcRenderer.invoke("open-file-dialog"),
});
