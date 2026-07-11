import os
import urllib.request
import ssl

repo_path = "/Users/hutao/github/pixo-clone"
base_dir = os.path.join(repo_path, "public/scraped-next")

assets = [
    ("static/chunks/593c515e612b2798.css", "https://pixo.video/_next/static/chunks/593c515e612b2798.css"),
    ("static/chunks/8fbdf37b65524b90.css", "https://pixo.video/_next/static/chunks/8fbdf37b65524b90.css"),
    ("static/chunks/0efcae7f1cc97b30.js", "https://pixo.video/_next/static/chunks/0efcae7f1cc97b30.js"),
    ("static/media/caa3a2e1cccd8315-s.p.3b6cae6d.woff2", "https://pixo.video/_next/static/media/caa3a2e1cccd8315-s.p.3b6cae6d.woff2")
]

# Create unverified SSL context to bypass macOS python certificate issues
ssl_context = ssl._create_unverified_context()

for rel_path, url in assets:
    local_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    
    print(f"Downloading {url} to {local_path}...")
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}
        )
        with urllib.request.urlopen(req, context=ssl_context) as response:
            with open(local_path, 'wb') as out_file:
                out_file.write(response.read())
        print(f"Successfully downloaded {rel_path}")
    except Exception as e:
        print(f"Failed to download {rel_path}: {e}")

print("Asset downloads completed!")
