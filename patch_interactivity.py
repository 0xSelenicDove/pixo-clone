import re

file_path = "/Users/hutao/github/pixo-clone/public/scraped-assets/pixo.video/local-interactivity.js"
log_path = "/Users/hutao/github/pixo-clone/patch_log.txt"

logs = []

def log(msg):
    print(msg)
    logs.append(msg)

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    log(f"File size: {len(content)} chars")

    # Search for DOMContentLoaded or initializeInteractivity
    matches = list(re.finditer(r"initializeInteractivity", content))
    log(f"Found {len(matches)} matches for 'initializeInteractivity'")
    
    for idx, m in enumerate(matches):
        start = max(0, m.start() - 150)
        end = min(len(content), m.end() + 150)
        log(f"Match {idx} at position {m.start()}:\n{content[start:end]}\n" + "-"*40)

except Exception as e:
    log(f"Error: {e}")

with open(log_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(logs))
