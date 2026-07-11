import subprocess

res = subprocess.run(["git", "status"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

with open("/Users/hutao/github/pixo-clone/git_status_result.txt", "w", encoding="utf-8") as f:
    f.write(res.stdout)
    if res.stderr:
        f.write("\nSTDERR:\n" + res.stderr)

print("Saved git status to git_status_result.txt")
