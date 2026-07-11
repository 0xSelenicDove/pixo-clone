import re

file_path = "/Users/hutao/github/pixo-clone/public/scraped-assets/pixo.video/local-interactivity.js"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

matches = list(re.finditer(r"\}\)\(\);", content))
print(f"Total occurrences of '}})();': {len(matches)}")
for idx, m in enumerate(matches):
    start = max(0, m.start() - 100)
    end = min(len(content), m.end() + 100)
    print(f"Match {idx} at position {m.start()}:\n{content[start:end]}\n" + "="*40)
