import os

file_path = "/Users/hutao/github/pixo-clone/deploy_gh_pages.py"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find the loop copying logic:
# for item in os.listdir(source_dir):
#     s = os.path.join(source_dir, item)
#     d = os.path.join(temp_dir, item)
#     if os.path.isdir(s):
#         shutil.copytree(s, d)
#     else:
#         shutil.copy2(s, d)

# We want to replace the block after the loop with our copies.
# Let's search for:
#         else:
#             shutil.copy2(s, d)

target_str = """        else:
            shutil.copy2(s, d)"""

patched_block = """        else:
            shutil.copy2(s, d)
            
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

if target_str in content:
    new_content = content.replace(target_str, patched_block)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully patched deploy_gh_pages.py with direct string replacement!")
else:
    # Let's check with a looser target
    target_str_loose = "shutil.copy2(s, d)"
    if target_str_loose in content:
        # Replace the first occurrence of copy2(s, d)
        new_content = content.replace(target_str_loose, "shutil.copy2(s, d)\n            \n    # Also copy scraped-next, images, and videos to the build directory so they are published to gh-pages!\n    scraped_next_src = os.path.join(repo_path, \"public/scraped-next\")\n    scraped_next_dst = os.path.join(temp_dir, \"scraped-next\")\n    if os.path.exists(scraped_next_src):\n        shutil.copytree(scraped_next_src, scraped_next_dst, dirs_exist_ok=True)\n        print(\"Copied scraped-next assets successfully!\")\n        \n    images_src = os.path.join(repo_path, \"public/images\")\n    images_dst = os.path.join(temp_dir, \"images\")\n    if os.path.exists(images_src):\n        shutil.copytree(images_src, images_dst, dirs_exist_ok=True)\n        print(\"Copied images successfully!\")\n        \n    videos_src = os.path.join(repo_path, \"public/videos\")\n    videos_dst = os.path.join(temp_dir, \"videos\")\n    if os.path.exists(videos_src):\n        shutil.copytree(videos_src, videos_dst, dirs_exist_ok=True)\n        print(\"Copied videos successfully!\")", 1)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Successfully patched deploy_gh_pages.py with loose string replacement!")
    else:
        print("Could not find any matching shutil copy block in deploy_gh_pages.py!")
