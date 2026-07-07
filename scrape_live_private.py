import os
import re
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

def get_safari_live_source(url):
    print(f"Navigating Safari to {url}...")
    script = f'''
    tell application "Safari"
        tell front window
            set newTab to make new tab with properties {{URL:"{url}"}}
            set current tab to newTab
        end tell
        delay 8 -- wait 8 seconds for client-side React rendering
        tell application "Safari"
            set liveHtml to do JavaScript "document.documentElement.outerHTML" in current tab of front window
        end tell
        tell application "Safari"
            tell front window
                close newTab
            end tell
        end tell
        return liveHtml
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
    html = get_safari_live_source(url)
    if html:
        # Strip all script tags to prevent client-side Next.js hydration overwrite (skeleton loader)
        html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL)
        # Inject our custom local interactivity helper
        interactivity_script = '<script src="/scraped-assets/pixo.video/local-interactivity.js"></script>'
        body_idx = html.lower().rfind('</body>')
        if body_idx != -1:
            html = html[:body_idx] + interactivity_script + html[body_idx:]
        else:
            html = html + interactivity_script
        # Force dark mode theme since Next.js theme toggles were stripped
        html = re.sub(r'<html([^>]*)\bclass="light"([^>]*)>', r'<html\1class="dark"\2>', html)
        html = html.replace('color-scheme: light;', 'color-scheme: dark;')
        # Prepend doctype if missing from outerHTML
        if not html.lstrip().lower().startswith("<!doctype"):
            html = "<!DOCTYPE html>\n" + html
        file_path.write_text(html, encoding='utf-8')
        print(f"Successfully scraped, stripped scripts, and saved live DOM: {file_path}")
        any_scraped = True
    else:
        print(f"Failed to scrape live DOM for page: {key}")

# Run the patcher script to resolve asset mappings
if any_scraped:
    print("Running patch_html.js to resolve link paths...")
    subprocess.run(["node", "/Users/hutao/github/pixo-clone/patch_html.js"], check=True)
    print("All pages patched successfully!")
