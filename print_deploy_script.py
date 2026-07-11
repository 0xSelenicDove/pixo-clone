with open("/Users/hutao/github/pixo-clone/deploy_gh_pages.py", "r", encoding="utf-8") as f:
    content = f.read()

has_scraped_next = "scraped-next" in content
has_images = "public/images" in content

with open("/Users/hutao/github/pixo-clone/deploy_check_result.txt", "w", encoding="utf-8") as f:
    f.write(f"has_scraped_next: {has_scraped_next}\n")
    f.write(f"has_images: {has_images}\n")
    f.write(f"Length of script: {len(content)} chars\n")

print("Saved deploy_check_result.txt")
