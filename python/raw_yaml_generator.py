import yaml
import sys
import json
import os

def process(source_path, target_path, append=False):
    try:
        with open(source_path, 'r') as source_file:
            new_data = yaml.safe_load(source_file)
            if new_data is None:
                new_data = {}

        if append and os.path.exists(target_path):
            try:
                with open(target_path, 'r') as target_file:
                    existing_data = yaml.safe_load(target_file)
                    if existing_data is None:
                        existing_data = {}

                if isinstance(existing_data, dict) and isinstance(new_data, dict):
                    merged_data = merge(existing_data, new_data)
                elif isinstance(existing_data, list) and isinstance(new_data, list):
                    merged_data = existing_data + new_data
                elif isinstance(existing_data, list):
                    merged_data = existing_data + [new_data]
                elif isinstance(existing_data, dict) and not isinstance(new_data, dict):
                    return {"status": "error", "message": "Cannot append non-dictionary to dictionary"}
                else:
                    merged_data = [existing_data, new_data]

            except Exception as e:
                return {"status": "error", "message": f"Error reading target file: {str(e)}"}
        else:
            merged_data = new_data

        with open(target_path, 'w') as output_file:
            yaml.dump(merged_data, output_file, default_flow_style=False, sort_keys=False, allow_unicode=True)

        return {
            "status": "success",
            "message": f"YAML {'appended to' if append else 'saved to'} {target_path}"
        }

    except yaml.YAMLError as e:
        return {"status": "error", "message": f"YAML error: {str(e)}"}
    except Exception as e:
        return {"status": "error", "message": f"Error: {str(e)}"}

def merge(dict1, dict2):
    result = dict1.copy()
    for key, value in dict2.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = merge(result[key], value)
        elif key in result and isinstance(result[key], list) and isinstance(value, list):
            result[key] = result[key] + value
        else:
            result[key] = value
    return result

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