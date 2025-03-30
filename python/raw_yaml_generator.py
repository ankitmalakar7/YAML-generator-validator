import yaml
import sys
import json
import os

def process(source_path, target_path, append=False):
    try:
        with open(source_path, 'r') as source_file:
            source_data = yaml.safe_load(source_file)
        
        if append and os.path.exists(target_path):
            try:
                with open(target_path, 'r') as target_file:
                    target_data = yaml.safe_load(target_file) or {}
                    
                if isinstance(target_data, dict) and isinstance(source_data, dict):
                    target_data.update(source_data)
                    final_data = target_data
                else:
                    return {"status": "error", "message": "Cannot append: incompatible data structures"}
            except Exception as e:
                return {"status": "error", "message": f"Error reading target file: {str(e)}"}
        else:
            final_data = source_data
        
        with open(target_path, 'w') as output_file:
            yaml.dump(final_data, output_file, default_flow_style=False, sort_keys=False)
            
        return {"status": "success", "message": f"YAML {'appended to' if append else 'saved to'} {target_path}"}
    except yaml.YAMLError as e:
        return {"status": "error", "message": f"YAML error: {str(e)}"}
    except Exception as e:
        return {"status": "error", "message": f"Error: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"status": "error", "message": "Insufficient arguments"}))
    else:
        try:
            source_path = sys.argv[1]
            target_path = sys.argv[2]
            append = False
            if len(sys.argv) > 3:
                append = sys.argv[3].lower() == 'true'
                
            result = process(source_path, target_path, append)
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"status": "error", "message": f"Unexpected error: {str(e)}"})) 