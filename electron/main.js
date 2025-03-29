const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("validate-yaml", async (event, filePath) => {
  if (!filePath) {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openFile"],
      filters: [{ name: "YAML Files", extensions: ["yaml", "yml"] }],
    });

    if (result.canceled) return { status: "canceled" };
    filePath = result.filePaths[0];
  }

  return runPythonScript("yaml_validator.py", [filePath]);
});

ipcMain.handle("generate-yaml", async (event, data, filePath, append) => {
  if (!filePath) {
    const result = await dialog.showSaveDialog(mainWindow, {
      filters: [{ name: "YAML Files", extensions: ["yaml", "yml"] }],
    });

    if (result.canceled) return { status: "canceled" };
    filePath = result.filePath;
  }

  return runPythonScript("yaml_generator.py", [
    filePath,
    JSON.stringify(data),
    append,
  ]);
});

ipcMain.handle("open-file-dialog", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [{ name: "YAML Files", extensions: ["yaml", "yml"] }],
  });

  if (result.canceled) return { status: "canceled" };

  try {
    const content = fs.readFileSync(result.filePaths[0], "utf8");
    return {
      status: "success",
      filePath: result.filePaths[0],
      content: content,
    };
  } catch (error) {
    return { status: "error", message: error.message };
  }
});

function runPythonScript(scriptName, args) {
  return new Promise((resolve, reject) => {
    const pythonPath = process.platform === "win32" ? "python" : "python3";
    const scriptPath = path.join(__dirname, "..", "python", scriptName);

    const pythonProcess = spawn(pythonPath, [scriptPath, ...args]);

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        resolve({
          status: "error",
          message: errorOutput || `Process exited with code ${code}`,
        });
      } else {
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (e) {
          resolve({
            status: "error",
            message: "Failed to parse Python output",
          });
        }
      }
    });
  });
}
