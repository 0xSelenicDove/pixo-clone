import re

file_path = "/Users/hutao/github/pixo-clone/public/scraped-assets/pixo.video/local-interactivity.js"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's search for initializeInteractivity or DOMContentLoaded
matches = [m.start() for m in re.finditer(r"initializeInteractivity", content)]
print(f"Found {len(matches)} matches")
for idx, m in enumerate(matches):
    print(f"Match {idx}:")
    print(content[m-200:m+200])
