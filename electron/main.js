const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const { v4: uuidv4 } = require("uuid");

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
  // mainWindow.webContents.openDevTools();
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

ipcMain.handle("validate-yaml-content", async (event, content) => {
  const tempFilePath = path.join(os.tmpdir(), `yaml-validate-${uuidv4()}.yaml`);

  try {
    fs.writeFileSync(tempFilePath, content, "utf8");
    const result = await runPythonScript("yaml_validator.py", [tempFilePath]);
    fs.unlinkSync(tempFilePath);

    return result;
  } catch (error) {
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch (e) {
      console.error("Error cleaning up temp file:", e);
    }

    return { status: "error", message: `Error: ${error.message}` };
  }
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

ipcMain.handle(
  "generate-yaml-from-content",
  async (event, content, filePath, append) => {
    if (!filePath) {
      const result = await dialog.showSaveDialog(mainWindow, {
        filters: [{ name: "YAML Files", extensions: ["yaml", "yml"] }],
      });

      if (result.canceled) return { status: "canceled" };
      filePath = result.filePath;
    }

    const tempFilePath = path.join(
      os.tmpdir(),
      `yaml-content-${uuidv4()}.yaml`
    );

    try {
      fs.writeFileSync(tempFilePath, content, "utf8");

      const result = await runPythonScript("raw_yaml_generator.py", [
        tempFilePath,
        filePath,
        append,
      ]);

      fs.unlinkSync(tempFilePath);

      if (result.status === "success") {
        result.filePath = filePath;
      }

      return result;
    } catch (error) {
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch (e) {
        console.error("Error cleaning up temp file:", e);
      }

      return { status: "error", message: `Error: ${error.message}` };
    }
  }
);

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
            message: "Failed to parse Python output: " + output,
          });
        }
      }
    });
  });
}
