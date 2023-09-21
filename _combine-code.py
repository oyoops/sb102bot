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
file_names = ['main.py', 'api/building_height.py', 'location.py', 'building.py', 
              'constants.py', 'utilities.py', 'density.py', 'public/index.html', 'public/script.js']

# Output zip file name
zip_file_name = 'combined_code.zip'

# Full path to the output zip file on the Desktop
desktop_path = get_desktop_path()  # Get Desktop path
full_zip_path = os.path.join(desktop_path, zip_file_name)

# Initialize the zip file
try:
    with zipfile.ZipFile(full_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file_name in file_names:
            try:
                # Add the file to the zip archive
                zipf.write(file_name, os.path.basename(file_name))
            except FileNotFoundError:
                print(f"{file_name} not found, skipping.")
    print(f"Zipped files into {full_zip_path}")
except Exception as e:
    print(f"Could not create the zip file. Error: {e}")
