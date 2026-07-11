with open("/Users/hutao/github/pixo-clone/deploy_gh_pages.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

copy_lines = []
for idx, line in enumerate(lines):
    if "copy" in line or "shutil" in line or "temp" in line or "public" in line:
        copy_lines.append(f"Line {idx+1}: {line.strip()}")

with open("/Users/hutao/github/pixo-clone/shutil_log.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(copy_lines))

print(f"Logged {len(copy_lines)} lines to shutil_log.txt")
