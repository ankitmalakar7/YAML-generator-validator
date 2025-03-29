import yaml
import sys
import json
import os

def generate_yaml(data, file_path, append=False):
    try:
        mode = 'a' if append and os.path.exists(file_path) else 'w'
        
        if append and os.path.exists(file_path):
            with open(file_path, 'r') as file:
                existing_data = yaml.safe_load(file) or {}
                
            if isinstance(existing_data, dict) and isinstance(data, dict):
                existing_data.update(data)
                data = existing_data
            else:
                return {"status": "error", "message": "Cannot append: incompatible data structures"}
        
        with open(file_path, mode) as file:
            yaml.dump(data, file, default_flow_style=False, sort_keys=False)
            
        return {"status": "success", "message": f"YAML {'appended to' if append else 'saved to'} {file_path}"}
    except Exception as e:
        return {"status": "error", "message": f"Error: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"status": "error", "message": "Insufficient arguments"}))
    else:
        try:
            file_path = sys.argv[1]
            data = json.loads(sys.argv[2])
            append = False
            if len(sys.argv) > 3:
                append = sys.argv[3].lower() == 'true'
                
            result = generate_yaml(data, file_path, append)
            print(json.dumps(result))
        except json.JSONDecodeError:
            print(json.dumps({"status": "error", "message": "Invalid JSON data provided"}))