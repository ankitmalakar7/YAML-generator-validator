import yaml
import sys
import json

def validate_yaml(file_path):
    try:
        with open(file_path, 'r') as file:
            yaml.safe_load(file)
        return {"status": "success", "message": "YAML file is valid."}
    except yaml.YAMLError as e:
        return {"status": "error", "message": f"YAML validation error: {str(e)}"}
    except Exception as e:
        return {"status": "error", "message": f"Error: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "message": "No file path provided"}))
    else:
        result = validate_yaml(sys.argv[1])
        print(json.dumps(result))