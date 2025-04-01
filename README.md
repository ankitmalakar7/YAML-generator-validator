# YAML Generator & Validator

A desktop application for validating and generating YAML files.

## Prerequisites

- Node.js (v14 or higher)
- Python (v3.7 or higher)
- pip (Python package manager)

## Installation

1. Fork the GitHub repository.
2. Clone the repository using:
   ```sh
   git clone https://github.com/ankitmalakar7/YAML-generator-validator.git
   ```

## Running the Application

1. Open a terminal in the `electron` folder.
2. Install dependencies:

   ```sh
   # Install Python dependencies
   cd python
   pip install -r requirements.txt
   cd ..

   # Install Node.js dependencies
   cd electron
   npm install
   cd ..
   ```

3. Start the application:
   ```sh
   npm start
   ```

## Features

- YAML Validation
- Generate New YAML Files
- Append to Existing YAML Files
- File Loading and Saving

## Basic Usage

### Validating YAML

1. Click "Load YAML File" or paste YAML content.
2. Click "Validate YAML".
3. Check results in the output area.

### Generating New YAML

1. Enter YAML content in the editor.
2. Click "Generate New YAML".
3. Choose save location.
4. Check results.

### Appending to YAML

1. Load existing YAML file.
2. Add new content.
3. Click "Append to YAML".
4. Check results.
