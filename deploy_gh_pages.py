import os
import shutil
import subprocess

def deploy():
    repo_path = "/Users/hutao/github/pixo-clone"
    source_dir = os.path.join(repo_path, "public/scraped-assets/pixo.video")
    temp_dir = os.path.join(repo_path, "temp_gh_pages")
    
    print("Initiating deployment build process...")

    # 1. Clean old temp_dir if exists
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    os.makedirs(temp_dir)
    
    # 2. Copy source files to temp_dir
    print(f"Copying assets from {source_dir} to temp directory...")
    for item in os.listdir(source_dir):
        s = os.path.join(source_dir, item)
        d = os.path.join(temp_dir, item)
        if os.path.isdir(s):
            shutil.copytree(s, d)
        else:
            shutil.copy2(s, d)
            
    # 3. Recursively replace paths in HTML, JS, CSS files for GitHub Pages subdirectory compatibility
    base_prefix = "/pixo-clone"
    replacements = [
        ('"/scraped-assets/pixo.video/', f'"{base_prefix}/'),
        ('\'/scraped-assets/pixo.video/', f'\'{base_prefix}/'),
        ('"/scraped-next/', f'"{base_prefix}/scraped-next/'),
        ('\'/scraped-next/', f'\'{base_prefix}/scraped-next/'),
        ('"/images/', f'"{base_prefix}/images/'),
        ('\'/images/', f'\'{base_prefix}/images/'),
        ('"/videos/', f'"{base_prefix}/videos/'),
        ('\'/videos/', f'\'{base_prefix}/videos/'),
        ('"/pixo-logo.svg', f'"{base_prefix}/pixo-logo.svg'),
        ('\'/pixo-logo.svg', f'\'{base_prefix}/pixo-logo.svg'),
        ('"/pixo-logo-dark.svg', f'"{base_prefix}/pixo-logo-dark.svg'),
        ('\'/pixo-logo-dark.svg', f'\'{base_prefix}/pixo-logo-dark.svg'),
        ('"/icon@d266dcc34ef99e73', f'"{base_prefix}/icon@d266dcc34ef99e73'),
        ('\'/icon@d266dcc34ef99e73', f'\'{base_prefix}/icon@d266dcc34ef99e73'),
        # CSS url bindings
        ('url(/scraped-assets/pixo.video/', f'url({base_prefix}/'),
        ('url(/images/', f'url({base_prefix}/images/'),
        ('url(/videos/', f'url({base_prefix}/videos/'),
        # Interactivity links and routing
        ('href="/org-9cbd03fa/projects"', f'href="{base_prefix}/org-9cbd03fa/projects.html"'),
        ('href="/org-9cbd03fa/dashboard"', f'href="{base_prefix}/org-9cbd03fa/dashboard.html"'),
        ('href="/org-9cbd03fa/playground"', f'href="{base_prefix}/org-9cbd03fa/playground.html"'),
        ('href="/org-9cbd03fa/media"', f'href="{base_prefix}/org-9cbd03fa/media.html"'),
        ('href="/org-9cbd03fa/community"', f'href="{base_prefix}/org-9cbd03fa/community.html"'),
        ('href="/org-9cbd03fa/settings"', f'href="{base_prefix}/org-9cbd03fa/settings.html"'),
        ('href="/auth/sign-in"', f'href="{base_prefix}/auth/sign-in.html"'),
        ('href="/dashboard"', f'href="{base_prefix}/org-9cbd03fa/dashboard.html"'),
        # Local interactivity js scripts redirects
        ('href = "/org-9cbd03fa/projects"', f'href = "{base_prefix}/org-9cbd03fa/projects.html"'),
        ('href = "/org-9cbd03fa/dashboard"', f'href = "{base_prefix}/org-9cbd03fa/dashboard.html"'),
        ('window.location.href = "/org-9cbd03fa/projects"', f'window.location.href = "{base_prefix}/org-9cbd03fa/projects.html"'),
        ('window.location.href = "/org-9cbd03fa/dashboard"', f'window.location.href = "{base_prefix}/org-9cbd03fa/dashboard.html"')
    ]
    
    print("Normalizing static asset URLs and route links...")
    count = 0
    for root, dirs, files in os.walk(temp_dir):
        for file in files:
            if file.endswith(('.html', '.js', '.css')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    # Apply replacements
                    modified = False
                    for old, new in replacements:
                        if old in content:
                            content = content.replace(old, new)
                            modified = True
                            
                    if modified:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(content)
                        count += 1
                except Exception as e:
                    print(f"Skipping file {file}: {e}")

    print(f"Patched path prefixes on {count} text files.")
    
    # 4. Initialize temporary git repository and force push to origin gh-pages branch
    print("Initializing deployment commit...")
    subprocess.run(["git", "init"], cwd=temp_dir, stdout=subprocess.DEVNULL)
    subprocess.run(["git", "add", "."], cwd=temp_dir, stdout=subprocess.DEVNULL)
    subprocess.run(["git", "commit", "-m", "Deploy static build to gh-pages"], cwd=temp_dir, stdout=subprocess.DEVNULL)
    subprocess.run(["git", "remote", "add", "origin", "https://github.com/0xSelenicDove/pixo-clone.git"], cwd=temp_dir, stdout=subprocess.DEVNULL)
    
    print("Pushing static build to GitHub gh-pages branch...")
    res = subprocess.run(["git", "push", "-f", "origin", "main:gh-pages"], cwd=temp_dir)
    
    # 5. Clean up temporary files
    shutil.rmtree(temp_dir)
    if res.returncode == 0:
        print("\n🎉 Static build successfully published to GitHub Pages!")
        print("🔗 Live Link: https://0xselenicdove.github.io/pixo-clone/org-9cbd03fa/dashboard.html")
    else:
        print("\n❌ Git push encountered an error. Check authentication and permissions.")

if __name__ == "__main__":
    deploy()
