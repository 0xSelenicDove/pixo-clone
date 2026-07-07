import os
import subprocess
from pathlib import Path

# Define destinations
base_dir = Path("/Users/hutao/github/pixo-clone/public/scraped-assets/pixo.video")
org_dir = base_dir / "org-9cbd03fa"
org_dir.mkdir(parents=True, exist_ok=True)

pages = {
    "projects": org_dir / "projects.html",
    "media": org_dir / "media.html",
    "dashboard": org_dir / "dashboard.html",
    "community": org_dir / "community.html",
    "playground": org_dir / "playground.html",
    "settings": org_dir / "settings.html"
}

def get_safari_source(url):
    print(f"Navigating Safari to {url}...")
    script = f'''
    tell application "Safari"
        tell front window
            set newTab to make new tab with properties {{URL:"{url}"}}
            set current tab to newTab
        end tell
        delay 8 -- wait 8 seconds for client-side React rendering
        tell application "Safari"
            set src to source of front document
        end tell
        tell application "Safari"
            tell front window
                close newTab
            end tell
        end tell
        return src
    end tell
    '''
    proc = subprocess.Popen(['osascript', '-e', script], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    stdout, stderr = proc.communicate()
    
    if proc.returncode != 0:
        print(f"AppleScript Error: {stderr}")
        return None
    return stdout

any_scraped = False
for key, file_path in pages.items():
    url = f"https://pixo.video/org-9cbd03fa/{key}"
    html = get_safari_source(url)
    if html:
        file_path.write_text(html, encoding='utf-8')
        print(f"Successfully scraped and saved: {file_path}")
        any_scraped = True
    else:
        print(f"Failed to scrape page: {key}")

# Run the patcher script to resolve asset mappings
if any_scraped:
    print("Running patch_html.js to resolve link paths...")
    subprocess.run(["node", "/Users/hutao/github/pixo-clone/patch_html.js"], check=True)
    print("All pages patched successfully!")
