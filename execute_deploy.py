import subprocess
import os

script_path = "/Users/hutao/github/pixo-clone/deploy_gh_pages.py"
log_path = "/Users/hutao/github/pixo-clone/deploy_output_log.txt"

# Let's run deploy_gh_pages.py
res = subprocess.run(["python3", script_path], cwd="/Users/hutao/github/pixo-clone", stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

with open(log_path, "w", encoding="utf-8") as f:
    f.write("STDOUT:\n")
    f.write(res.stdout)
    if res.stderr:
        f.write("\nSTDERR:\n")
        f.write(res.stderr)

print("Deploy executed and logged!")
