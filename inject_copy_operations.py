import re

script_path = "/Users/hutao/github/pixo-clone/deploy_gh_pages.py"

with open(script_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's inspect the shutil.copytree lines in deploy_gh_pages.py
# If it has:
# shutil.copytree(src, dst)
# We want to replace it to also copy other folders if they exist!

# Let's find shutil.copytree in the script.
# On line 50 or so, we saw copytree.
# Let's look at the copytree calls.
# Let's see: we can replace:
# shutil.copytree(src_dir, dest_dir)
# with a custom block that copies public/scraped-next, public/images, public/videos if they exist!

old_copy_block = """    # Copy files
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    shutil.copytree(scraped_assets_dir, temp_dir)"""

new_copy_block = """    # Copy files
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    shutil.copytree(scraped_assets_dir, temp_dir)
    
    # Also copy scraped-next, images, and videos to the build directory so they are published to gh-pages!
    scraped_next_src = os.path.join(repo_path, "public/scraped-next")
    scraped_next_dst = os.path.join(temp_dir, "scraped-next")
    if os.path.exists(scraped_next_src):
        shutil.copytree(scraped_next_src, scraped_next_dst, dirs_exist_ok=True)
        print("Copied scraped-next assets successfully!")
        
    images_src = os.path.join(repo_path, "public/images")
    images_dst = os.path.join(temp_dir, "images")
    if os.path.exists(images_src):
        shutil.copytree(images_src, images_dst, dirs_exist_ok=True)
        print("Copied images successfully!")
        
    videos_src = os.path.join(repo_path, "public/videos")
    videos_dst = os.path.join(temp_dir, "videos")
    if os.path.exists(videos_src):
        shutil.copytree(videos_src, videos_dst, dirs_exist_ok=True)
        print("Copied videos successfully!")"""

# Let's check if the old_copy_block exists in content
if old_copy_block in content:
    content = content.replace(old_copy_block, new_copy_block)
    with open(script_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Successfully patched deploy_gh_pages.py with direct block matching!")
else:
    # If not found directly, let's look for shutil.copytree(scraped_assets_dir, temp_dir)
    pattern = r"shutil\.copytree\(scraped_assets_dir,\s*temp_dir\)"
    replacement = """shutil.copytree(scraped_assets_dir, temp_dir)
    
    # Also copy scraped-next, images, and videos to the build directory so they are published to gh-pages!
    scraped_next_src = os.path.join(repo_path, "public/scraped-next")
    scraped_next_dst = os.path.join(temp_dir, "scraped-next")
    if os.path.exists(scraped_next_src):
        shutil.copytree(scraped_next_src, scraped_next_dst, dirs_exist_ok=True)
        print("Copied scraped-next assets successfully!")
        
    images_src = os.path.join(repo_path, "public/images")
    images_dst = os.path.join(temp_dir, "images")
    if os.path.exists(images_src):
        shutil.copytree(images_src, images_dst, dirs_exist_ok=True)
        print("Copied images successfully!")
        
    videos_src = os.path.join(repo_path, "public/videos")
    videos_dst = os.path.join(temp_dir, "videos")
    if os.path.exists(videos_src):
        shutil.copytree(videos_src, videos_dst, dirs_exist_ok=True)
        print("Copied videos successfully!")"""
        
    if re.search(pattern, content):
        content = re.sub(pattern, replacement, content)
        with open(script_path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Successfully patched deploy_gh_pages.py via regex!")
    else:
        # Let's search for any shutil.copytree inside the file and replace it!
        pattern_any = r"shutil\.copytree\([^,]+,\s*temp_dir\)"
        if re.search(pattern_any, content):
            # We need to find the actual match and append our custom copies
            match = re.search(pattern_any, content).group(0)
            replacement = match + """
    # Also copy scraped-next, images, and videos to the build directory so they are published to gh-pages!
    scraped_next_src = os.path.join(repo_path, "public/scraped-next")
    scraped_next_dst = os.path.join(temp_dir, "scraped-next")
    if os.path.exists(scraped_next_src):
        shutil.copytree(scraped_next_src, scraped_next_dst, dirs_exist_ok=True)
        print("Copied scraped-next assets successfully!")
        
    images_src = os.path.join(repo_path, "public/images")
    images_dst = os.path.join(temp_dir, "images")
    if os.path.exists(images_src):
        shutil.copytree(images_src, images_dst, dirs_exist_ok=True)
        print("Copied images successfully!")
        
    videos_src = os.path.join(repo_path, "public/videos")
    videos_dst = os.path.join(temp_dir, "videos")
    if os.path.exists(videos_src):
        shutil.copytree(videos_src, videos_dst, dirs_exist_ok=True)
        print("Copied videos successfully!")"""
            content = content.replace(match, replacement)
            with open(script_path, "w", encoding="utf-8") as f:
                f.write(content)
            print("Successfully patched deploy_gh_pages.py via pattern_any!")
        else:
            print("Could not find shutil.copytree call in deploy_gh_pages.py!")
