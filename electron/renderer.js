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
        displayResult({
          status: "error",
          message: "Please enter YAML content to validate",
        });
        return;
      }

      const result = await window.yamlAPI.validateYAMLContent(yamlContent);
      displayResult(result);
    } catch (error) {
      displayResult({ status: "error", message: error.message });
    }
  });

  generateBtn.addEventListener("click", async () => {
    try {
      const yamlContent = yamlInput.value;
      if (!yamlContent.trim()) {
        displayResult({
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
      displayResult(result);
      if (result.status === "success") {
        currentFilePath = result.filePath || currentFilePath;
        updateFilePathDisplay();
      }
    } catch (error) {
      displayResult({ status: "error", message: error.message });
    }
  });

  appendBtn.addEventListener("click", async () => {
    try {
      const yamlContent = yamlInput.value;
      if (!yamlContent.trim()) {
        displayResult({
          status: "error",
          message: "Please enter YAML content to append",
        });
        return;
      }

      const result = await window.yamlAPI.generateYAMLFromContent(
        yamlContent,
        null,
        true
      );
      displayResult(result);
      if (result.status === "success") {
        currentFilePath = result.filePath || currentFilePath;
        updateFilePathDisplay();
      }
    } catch (error) {
      displayResult({ status: "error", message: error.message });
    }
  });

  loadFileBtn.addEventListener("click", async () => {
    const result = await window.yamlAPI.openFileDialog();
    if (result.status === "success") {
      yamlInput.value = result.content;
      currentFilePath = result.filePath;
      updateFilePathDisplay();
      displayResult({ status: "success", message: "File loaded successfully" });
    } else if (result.status === "error") {
      displayResult(result);
    }
  });

  function displayResult(result) {
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
