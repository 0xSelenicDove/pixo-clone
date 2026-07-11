import os

file_path = "/Users/hutao/github/pixo-clone/public/scraped-assets/pixo.video/local-interactivity.js"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the last occurrence of })();
r_idx = content.rfind("})();")
if r_idx == -1:
    print("Could not find })(); at the end of the file.")
    exit(1)

patched_js = """
  // Set up click listeners for static project cards and their action buttons
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
      });

      // Delete project action
      const deleteBtn = card.querySelector('[aria-label="Delete Project"]');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm("Are you sure you want to delete this project?")) {
            card.remove();
            showToast("Project deleted from local sandbox database.", "Project Removed");
          }
        });
      }

      // Move project action
      const moveBtn = card.querySelector('[aria-label="Move Project"]');
      if (moveBtn) {
        moveBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          showToast("Project moved to archive folders.", "Project Organized");
        });
      }

      // Publish to community action
      const publishBtn = card.querySelector('[aria-label="Publish to Community"]');
      if (publishBtn) {
        publishBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          showToast("Project shared to Community Gallery!", "Published Successfully");
        });
      }
    });
  };

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupProjectCardInteractivity);
  } else {
    setupProjectCardInteractivity();
  }
})();
"""

# Replace the last })(); with the patched block
new_content = content[:r_idx] + patched_js

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully patched local-interactivity.js!")
