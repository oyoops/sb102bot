import os
import ctypes
import ctypes.wintypes
import zipfile

# Function to get the Desktop path dynamically
def get_desktop_path():
    CSIDL_DESKTOP = 0x0000
    array = ctypes.create_unicode_buffer(ctypes.wintypes.MAX_PATH)
    ctypes.windll.shell32.SHGetFolderPathW(None, CSIDL_DESKTOP, None, 0, array)
    return array.value

# --- Main code starts here --- #

# List of file names to combine
file_names = [ 
              'public/script2.js', 'public/index.html', 'public/styles.css',
              'api/analyze_address.py', 'main.py',
              'location.py', 'building.py',
              'density.py', 'utilities.py', 'constants.py'] # ,
              # 'api/building_height.py', 'api/site_lookup.py']

# Output file names
zip_file_name = '_combined_code.zip' # Output zip file name
txt_file_name = '_combined_code.txt' # Output text file name

# Full path to the output files on the Desktop
desktop_path = get_desktop_path()  # Get Desktop path
full_zip_path = os.path.join(desktop_path, zip_file_name)
full_txt_path = os.path.join(desktop_path, txt_file_name)

# SAVE BOTH TO DESKTOP
try:
    with zipfile.ZipFile(full_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Initialize the text file to store combined contents
        with open(full_txt_path, 'w', encoding='utf-8') as txtf:
            for file_name in file_names:
                try:
                    # Add the file to the zip archive
                    zipf.write(file_name, os.path.basename(file_name))
                    
                    # Add the content of the file to the text file
                    with open(file_name, 'r', encoding='utf-8', errors='replace') as input_file:
                        content = input_file.read()
                        txtf.write(f"### File: {file_name}\\n")
                        txtf.write(content)
                        txtf.write("\\n--------------------------------------------------\\n")
                        
                except FileNotFoundError:
                    print(f"{file_name} not found, skipping.")
                    txtf.write(f"// {file_name} not found.\\n")
    print(f"Zipped files into {full_zip_path}")
    print(f"Combined files into {full_txt_path}")
except Exception as e:
    print(f"Could not create the files. Error: {e}")


# SAVE BOTH TO THIS FOLDER
try:
    with zipfile.ZipFile(zip_file_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Initialize the text file to store combined contents
        with open(txt_file_name, 'w', encoding='utf-8') as txtf:
            for file_name in file_names:
                try:
                    # Add the file to the zip archive
                    zipf.write(file_name, os.path.basename(file_name))
                    
                    # Add the content of the file to the text file
                    with open(file_name, 'r', encoding='utf-8', errors='replace') as input_file:
                        content = input_file.read()
                        txtf.write(f"### File: {file_name}\\n")
                        txtf.write(content)
                        txtf.write("\\n--------------------------------------------------\\n")
                        
                except FileNotFoundError:
                    print(f"{file_name} not found, skipping.")
                    txtf.write(f"// {file_name} not found.\\n")
    print(f"Zipped files into {zip_file_name}")
    print(f"Combined files into {txt_file_name}")
except Exception as e:
    print(f"Could not create the files. Error: {e}")