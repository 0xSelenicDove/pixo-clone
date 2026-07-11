import os
import re
import subprocess
from pathlib import Path

repo_path = "/Users/hutao/github/pixo-clone"
base_dir = Path(repo_path) / "public/scraped-assets/pixo.video"
projects_dir = base_dir / "org-9cbd03fa/projects"
projects_dir.mkdir(parents=True, exist_ok=True)

project_id = "019f5170-9b28-7b83-a23f-3c31474c2aee"
url = f"https://pixo.video/org-9cbd03fa/projects/{project_id}"
file_path = projects_dir / f"{project_id}.html"

print(f"Scraping editor page from Safari: {url}")

script = f'''
tell application "Safari"
    set targetTab to missing value
    repeat with w in windows
        repeat with t in tabs of w
            if URL of t starts with "{url}" then
                set targetTab to t
                set current tab of w to t
                set index of w to 1
                exit repeat
            end if
        end repeat
        if targetTab is not missing value then exit repeat
    end repeat
    
    if targetTab is missing value then
        tell front window
            set newTab to make new tab with properties {{URL:"{url}"}}
            set current tab to newTab
            delay 8
            set targetTab to newTab
        end tell
    end if
    
    tell application "Safari"
        set liveHtml to do JavaScript "document.documentElement.outerHTML" in targetTab
    end tell
    return liveHtml
end tell
'''

proc = subprocess.Popen(['osascript', '-e', script], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
stdout, stderr = proc.communicate()

if proc.returncode != 0:
    print(f"AppleScript Error: {stderr}")
    exit(1)

html = stdout
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
    print(f"Successfully scraped, stripped scripts, and saved live DOM to: {file_path}")
    
    print("Running patch_html.js to resolve link paths...")
    subprocess.run(["node", os.path.join(repo_path, "patch_html.js")], check=True)
    print("Editor page patched successfully!")
else:
    print("Failed to scrape live DOM for editor page.")
