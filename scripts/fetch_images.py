import os
import requests

def download_image(url, filename):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, stream=True, headers=headers)
        if response.status_code == 200:
            with open(filename, 'wb') as f:
                for chunk in response.iter_content(1024):
                    f.write(chunk)
            print(f"Downloaded: {filename}")
        else:
            print(f"Failed to download {filename}: Status {response.status_code}")
    except Exception as e:
        print(f"Error downloading {filename}: {e}")

def main():
    # Target directory
    target_dir = os.path.join('DHARA', 'public', 'assets', 'images')
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)

    images = {
        "tractor.png": "https://loremflickr.com/800/600/tractor,farm",
        "drone.png": "https://loremflickr.com/800/600/drone,agriculture",
        "harvester.png": "https://loremflickr.com/800/600/harvester,farm",
        "jcb.png": "https://loremflickr.com/800/600/excavator,construction"
    }

    for filename, url in images.items():
        path = os.path.join(target_dir, filename)
        download_image(url, path)

if __name__ == "__main__":
    main()
