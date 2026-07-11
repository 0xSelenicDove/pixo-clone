import os

file_path = "/Users/hutao/github/pixo-clone/public/scraped-assets/pixo.video/local-interactivity.js"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's replace the setupProjectCardInteractivity block with the smart environment-aware version
old_block = """  // Set up click listeners for static project cards and their action buttons
  const setupProjectCardInteractivity = () => {
    document.querySelectorAll('[data-testid^="project-card-"]').forEach(card => {
      // Card click redirects to editor page
      card.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        const testId = card.getAttribute('data-testid');
        const projectId = testId.replace('project-card-', '');
        if (projectId) {
          window.location.href = `/org-9cbd03fa/projects/${projectId}`;
        }
      });"""

new_block = """  // Set up click listeners for static project cards and their action buttons
  const setupProjectCardInteractivity = () => {
    document.querySelectorAll('[data-testid^="project-card-"]').forEach(card => {
      // Card click redirects to editor page
      card.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        const testId = card.getAttribute('data-testid');
        const projectId = testId.replace('project-card-', '');
        if (projectId) {
          const isGhPages = window.location.pathname.startsWith('/pixo-clone');
          const basePrefix = isGhPages ? '/pixo-clone' : '';
          const ext = isGhPages ? '.html' : '';
          window.location.href = `${basePrefix}/org-9cbd03fa/projects/${projectId}${ext}`;
        }
      });"""

if old_block in content:
    new_content = content.replace(old_block, new_block)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully patched local-interactivity.js with environment-aware prefix routing!")
else:
    # If not found directly, let's write a python regex search and replace
    import re
    pattern = r"window\.location\.href = `/org-9cbd03fa/projects/\${projectId}`;"
    replacement = "const isGhPages = window.location.pathname.startsWith('/pixo-clone'); const basePrefix = isGhPages ? '/pixo-clone' : ''; const ext = isGhPages ? '.html' : ''; window.location.href = `${basePrefix}/org-9cbd03fa/projects/${projectId}${ext}`;"
    if re.search(pattern, content):
        new_content = re.sub(pattern, replacement, content)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Successfully patched local-interactivity.js via regex!")
    else:
        print("Could not find the target project card click block in local-interactivity.js!")
