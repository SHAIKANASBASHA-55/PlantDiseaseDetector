import os
import shutil
import subprocess

def download_and_extract():
    print("Downloading PlantVillage dataset via GitHub...")
    print("This might take a few minutes as it downloads the dataset repository.")
    
    repo_url = "https://github.com/spMohanty/PlantVillage-Dataset.git"
    tmp_dir = "temp_repo"
    
    # Clone the repo deeply
    if not os.path.exists(tmp_dir):
        print("Cloning repository...")
        subprocess.run(["git", "clone", "--depth", "1", repo_url, tmp_dir], check=True)
    
    # The color images are located in the raw/color directory
    source_dir = os.path.join(tmp_dir, "raw", "color")
    dest_dir = "PlantVillage"
    
    if os.path.exists(dest_dir):
        print(f"Removing existing {dest_dir} directory...")
        shutil.rmtree(dest_dir)
        
    print(f"Extracting dataset to {dest_dir}...")
    shutil.copytree(source_dir, dest_dir)
    
    print("Dataset successfully extracted to the PlantVillage folder!")
    
    # Clean up out of scope folders
    print("Cleaning up temporary files...")
    # Using a shell command for windows to force delete the .git folder which can have readonly files
    subprocess.run(f'rmdir /s /q "{tmp_dir}"', shell=True)
    
    print("Done! You can now run model/train.py")

if __name__ == "__main__":
    download_and_extract()
