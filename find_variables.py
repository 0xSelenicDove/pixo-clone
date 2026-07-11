import re

script_path = "/Users/hutao/github/pixo-clone/deploy_gh_pages.py"

with open(script_path, "r", encoding="utf-8") as f:
    content = f.read()

lines = content.split('\n')
out_lines = []

for idx, line in enumerate(lines):
    if "shutil" in line or "copy" in line or "temp" in line or "assets" in line:
        # Get lines around it
        start = max(0, idx - 3)
        end = min(len(lines), idx + 4)
        out_lines.append(f"--- Around Line {idx+1} ---")
        for i in range(start, end):
            prefix = "-> " if i == idx else "   "
            out_lines.append(f"{prefix}Line {i+1}: {lines[i]}")
        out_lines.append("-" * 30)

with open("/Users/hutao/github/pixo-clone/variables_log.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(out_lines))

print("Saved variables_log.txt")
