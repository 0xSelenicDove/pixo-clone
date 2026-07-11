import re
import os

script_path = "/Users/hutao/github/pixo-clone/deploy_gh_pages.py"

with open(script_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's search for shutil.copytree or any folder copying
# Let's print out the matches first inside our python code to check
# If it copies public/scraped-assets/pixo.video, let's see what is there
# We want to make sure it copies public/scraped-next, public/images, public/videos as well!

# Let's see:
# shutil.copytree(src_dir, dest_dir)
# We can find shutil.copytree and see what is the src and dst.
# Usually:
# src = os.path.join(repo_path, "public/scraped-assets/pixo.video")
# dst = temp_dir
# So:
# shutil.copytree(src, dst) or similar.

# Let's check if there is shutil.copytree inside deploy_gh_pages.py
# We can search for the term 'shutil.copytree' in the content:
copytree_matches = list(re.finditer(r"shutil\.copytree\(([^\)]*)\)", content))
print(f"Found {len(copytree_matches)} matches for shutil.copytree")

# Let's write a python script to replace the main copytree call or append after it!
# Wait! Let's check what shutil calls are made. Let's write them to a log.
log_data = []
for idx, m in enumerate(copytree_matches):
    log_data.append(f"Match {idx}: {m.group(0)}")

# Let's inspect the code lines that deal with copying:
# shutil.copytree(assets_dir, build_dir, ...)
# Let's look for:
# shutil.copytree(assets_source, temp_dir)
# Or similar.
# If we find it, we want to copy scraped-next to temp_dir / 'scraped-next':
# shutil.copytree(os.path.join(repo_path, "public/scraped-next"), os.path.join(temp_dir, "scraped-next"))
# And also copy images to temp_dir / 'images':
# shutil.copytree(os.path.join(repo_path, "public/images"), os.path.join(temp_dir, "images"))
# And copy videos to temp_dir / 'videos':
# shutil.copytree(os.path.join(repo_path, "public/videos"), os.path.join(temp_dir, "videos"))

# Let's check how the temp_dir and repo_path are named in deploy_gh_pages.py
# We can search for 'temp' or 'dir' in the script.
# Let's write a script that replaces the copying logic.
