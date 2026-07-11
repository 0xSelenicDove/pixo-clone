import os
import re
import urllib.request

repo_path = "/Users/hutao/github/pixo-clone"
projects_html_path = os.path.join(repo_path, "public/scraped-assets/pixo.video/org-9cbd03fa/projects.html")

with open(projects_html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Find all /scraped-next/ links
scraped_next_links = re.findall(r'\"/scraped-next/[^\"]*\"', html)
scraped_next_links += re.findall(r'\'/scraped-next/[^\"]*\'', html)

missing_files = []
downloaded_files = []

for link in scraped_next_links:
    link = link.strip('"\'')
    # Convert to local path
    # Link starts with /scraped-next/
    rel_path = link.replace("/scraped-next/", "")
    local_path = os.path.join(repo_path, "public/scraped-next", rel_path)
    
    if not os.path.exists(local_path):
        missing_files.append((link, local_path))
        print(f"Missing file: {link}")
    else:
        print(f"Exists: {link}")

# Try to download missing files from the production site!
for link, local_path in missing_files:
    # Production URL
    prod_url = f"https://pixo.video/_next/{link.replace('/scraped-next/', '')}"
    print(f"Downloading {prod_url} to {local_path}...")
    try:
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        # Add user agent to prevent blocks
        req = urllib.request.Request(
            prod_url, 
            headers={'User-Agent': 'Mozilla/5.5 (Macintosh; Intel Mac OS X 10_15_7)'}
        )
        with urllib.request.urlopen(req) as response:
            with open(local_path, 'wb') as out_file:
                out_file.write(response.read())
        downloaded_files.append(link)
        print(f"Successfully downloaded {link}")
    except Exception as e:
        print(f"Failed to download {link}: {e}")

print(f"Download complete. Total missing: {len(missing_files)}, downloaded: {len(downloaded_files)}")
