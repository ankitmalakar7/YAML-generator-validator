document.addEventListener("DOMContentLoaded", () => {
  const validateBtn = document.getElementById("validate-btn");
  const generateBtn = document.getElementById("generate-btn");
  const appendBtn = document.getElementById("append-btn");
  const loadFileBtn = document.getElementById("load-file-btn");
  const yamlInput = document.getElementById("yaml-input");
  const resultArea = document.getElementById("result-area");
  const filePathDisplay = document.getElementById("file-path");

  let currentFilePath = null;

  validateBtn.addEventListener("click", async () => {
    try {
      const yamlContent = yamlInput.value;
      if (!yamlContent.trim()) {
        display({
          status: "error",
          message: "Please enter YAML content to validate",
        });
        return;
      }

      const result = await window.yamlAPI.validateYAMLContent(yamlContent);
      display(result);
    } catch (error) {
      display({ status: "error", message: error.message });
    }
  });

  generateBtn.addEventListener("click", async () => {
    try {
      const yamlContent = yamlInput.value;
      if (!yamlContent.trim()) {
        display({
          status: "error",
          message: "Please enter YAML content to generate",
        });
        return;
      }

      const result = await window.yamlAPI.generateYAMLFromContent(
        yamlContent,
        null,
        false
      );
      display(result);
      if (result.status === "success") {
        currentFilePath = result.filePath || currentFilePath;
        updateFilePathDisplay();
      }
    } catch (error) {
      display({ status: "error", message: error.message });
    }
  });

  appendBtn.addEventListener("click", async () => {
    try {
      const yamlContent = yamlInput.value;
      if (!yamlContent.trim()) {
        display({
          status: "error",
          message: "Please enter YAML content to append",
        });
        return;
      }

      if (!currentFilePath) {
        const fileResult = await window.yamlAPI.openFileDialog();
        if (fileResult.status === "success") {
          currentFilePath = fileResult.filePath;
          updateFilePathDisplay();
        } else if (fileResult.status === "canceled") {
          display({ status: "info", message: "Operation canceled" });
          return;
        } else {
          display(fileResult);
          return;
        }
      }
      const result = await window.yamlAPI.generateYAMLFromContent(
        yamlContent,
        currentFilePath,
        true
      );
      display(result);
    } catch (error) {
      display({ status: "error", message: error.message });
    }
  });

  loadFileBtn.addEventListener("click", async () => {
    const result = await window.yamlAPI.openFileDialog();
    if (result.status === "success") {
      yamlInput.value = result.content;
      currentFilePath = result.filePath;
      updateFilePathDisplay();
      display({ status: "success", message: "File loaded successfully" });
    } else if (result.status === "error") {
      display(result);
    }
  });

  function display(result) {
    resultArea.innerHTML = "";

    const statusDiv = document.createElement("div");
    statusDiv.className = result.status === "success" ? "success" : "error";
    statusDiv.textContent = result.message;

    resultArea.appendChild(statusDiv);
  }

  function updateFilePathDisplay() {
    filePathDisplay.textContent = currentFilePath || "No file selected";
  }
});
