import os

repo_path = "/Users/hutao/github/pixo-clone"
scraped_next_css = os.path.join(repo_path, "public/scraped-next/static/chunks/8fbdf37b65524b90.css")

log_lines = []
log_lines.append(f"scraped_next_css exists: {os.path.exists(scraped_next_css)}")
if os.path.exists(scraped_next_css):
    log_lines.append(f"Size of css: {os.path.getsize(scraped_next_css)} bytes")

# Let's check the size of public/scraped-assets/pixo.video/org-9cbd03fa/projects.html
projects_html = os.path.join(repo_path, "public/scraped-assets/pixo.video/org-9cbd03fa/projects.html")
log_lines.append(f"projects_html exists: {os.path.exists(projects_html)}")
if os.path.exists(projects_html):
    log_lines.append(f"Size of projects.html: {os.path.getsize(projects_html)} bytes")

with open("/Users/hutao/github/pixo-clone/verification_results.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(log_lines))

print("Saved verification_results.txt")
