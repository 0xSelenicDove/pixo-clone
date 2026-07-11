/**
 * Pixo Clone - Local Interactivity Script
 * Adds premium, high-fidelity interactivity to the scraped static pages:
 * 1. PERSISTENT LOCAL CREDITS: Manage and increase credits via local storage.
 * 2. PROMO CODE REDEEM DIALOG: Input codes like PIXO500, OPENCLAW, or HUTAO for custom credits.
 * 3. GET CREDITS PRICING DIALOG: Interactive tiers with simulated secure checkout.
 * 4. PREMIUM "THEIRS" MODEL/AGENT SELECTOR DROPDOWN: Implements the gorgeous original site design:
 *    - Dual Mode selection (Agent vs. Model) with native tabs.
 *    - White background card popovers matching "their" layout.
 *    - Rich option cards featuring custom outline icons, titles, lime-green "New/Pro" badges, and multi-line descriptions.
 * 5. SIMULATED AI GENERATION & BACKGROUND TASK ENGINE: Initiating renders puts tasks into a background task queue (Cog button in top bar) and shows active progress bar rendering.
 * 6. DYNAMIC PROJECTS GRID: Generates and updates high-quality playable video project cards inside your projects directory, backed by localStorage and real loopable video files!
 * 7. THEME TOGGLE: Active dark/light mode toggle with immediate visual state changes.
 * 8. LIVE WORKSPACE SELECTOR: Switch between different project organization suites.
 * 9. INTERACTIVE GALLERY CARDS: Real-time like (Heart) and star (Favorite) counts, hover video playback, and quick play triggers.
 * 10. FILE ATTACHMENTS FOR PROMPT: Selecting "First Frame" or "References" uploads and shows visual attachments inside the input bar.
 */

(function () {
  // Ensure we force dark mode styles since Next.js runtime scripts were stripped
  if (!localStorage.getItem('pixo_theme')) {
    localStorage.setItem('pixo_theme', 'dark');
  }
  const currentTheme = localStorage.getItem('pixo_theme');
  if (currentTheme === 'dark') {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.documentElement.style.colorScheme = 'light';
  }

  // Ensure we initialize localStorage values
  if (!localStorage.getItem('pixo_credits')) {
    localStorage.setItem('pixo_credits', '200');
  }
  if (!localStorage.getItem('pixo_projects')) {
    localStorage.setItem('pixo_projects', JSON.stringify([]));
  }
  if (!localStorage.getItem('pixo_tasks')) {
    localStorage.setItem('pixo_tasks', JSON.stringify([]));
  }
  if (!localStorage.getItem('pixo_active_workspace')) {
    localStorage.setItem('pixo_active_workspace', 'My Projects');
  }

  // Active prompt mode (defaults to 'agent')
  let currentPromptMode = 'agent'; 

  // Pre-configured list of beautiful local video loops for dynamic rendering
  const LOCAL_VIDEO_LOOPS = [
    '/scraped-assets/pixo.video/videos/seedance2/gallery-product-ad.mp4',
    '/scraped-assets/pixo.video/videos/seedance2/gallery-social-media.mp4',
    '/scraped-assets/pixo.video/videos/seedance2/gallery-short-film.mp4',
    '/scraped-assets/pixo.video/videos/feature-video-series.mp4',
    '/scraped-assets/pixo.video/videos/feature-ai-agents.mp4',
    '/scraped-assets/pixo.video/videos/feature-team-collab.mp4'
  ];

  // Temp holder for attachments
  let promptAttachments = {
    firstFrame: null,
    references: []
  };

  // Model-mode state variables
  let activeModelResolution = '720p';
  let activeModelAspectRatio = '16:9';
  let activeModelDuration = 8;
  let activeModelGenerations = 1;
  let activeModelGenerateAudio = true;
  let activeModelType = 'Video';
  let activeModelSelected = 'Seedance 2.0 Fast';
  let selectedAgent = 'Seedance2 Director';
  let agentIconSvg = null;

  const updateModelSettingsTriggerDisplay = (settingsBtn) => {
    if (!settingsBtn) return;
    settingsBtn.innerHTML = `
      <span>${activeModelAspectRatio} · ${activeModelResolution} · ${activeModelDuration}s</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down size-3 text-muted-foreground hidden sm:block" style="width:12px; height:12px; margin-left:4px; display:inline-block;"><path d="m6 9 6 6 6-6"></path></svg>
    `;
  };

  const updateModelTriggerDisplay = (triggerBtn) => {
    if (!triggerBtn) return;
    triggerBtn.innerHTML = '';

    if (currentPromptMode === 'model') {
      const logoUrl = {
        'Seedance 2.0 Fast': '/images/company/bytedance.svg',
        'Seedance 2.5 Cinema': '/images/company/bytedance.svg',
        'Google Veo': '/images/company/google.svg',
        'Kling Cinema': '/images/company/kuaishou.svg',
        'Hailuo Rapid': '/images/company/minimax.svg',
        'Sora 2': '/images/company/openai.svg',
        'WAN 2.6': '/images/company/qwen.svg'
      }[activeModelSelected] || '/images/company/bytedance.svg';

      const isDarkInvert = activeModelSelected.includes('Hailuo') || activeModelSelected.includes('Sora') || activeModelSelected.includes('WAN');
      const img = document.createElement('img');
      img.src = logoUrl;
      img.width = 16;
      img.height = 16;
      img.className = 'shrink-0 rounded-sm mr-1.5';
      img.style.objectFit = 'contain';
      img.style.display = 'inline-block';
      img.style.verticalAlign = 'middle';
      if (isDarkInvert) img.style.filter = 'invert(1)';
      triggerBtn.appendChild(img);

      const span = document.createElement('span');
      span.textContent = ' ' + activeModelSelected;
      span.style.verticalAlign = 'middle';
      triggerBtn.appendChild(span);
    } else {
      if (agentIconSvg) {
        const clonedSvg = agentIconSvg.cloneNode(true);
        clonedSvg.style.display = 'inline-block';
        clonedSvg.style.verticalAlign = 'middle';
        clonedSvg.style.marginRight = '6px';
        triggerBtn.appendChild(clonedSvg);
      }
      const span = document.createElement('span');
      span.textContent = ' ' + selectedAgent;
      span.style.verticalAlign = 'middle';
      triggerBtn.appendChild(span);
    }

    const chevronContainer = document.createElement('span');
    chevronContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down size-3 text-muted-foreground hidden sm:block" style="width:12px; height:12px; margin-left:6px; display:inline-block; vertical-align:middle;"><path d="m6 9 6 6 6-6"></path></svg>`;
    triggerBtn.appendChild(chevronContainer.firstChild);
  };

  const openModelSelectorDropdown = (anchorBtn) => {
    document.querySelectorAll('.local-popover, .theirs-popover, .ratio-popover').forEach(p => p.remove());

    const popover = document.createElement('div');
    popover.className = 'theirs-popover'; // Reuse card look
    
    const rect = anchorBtn.getBoundingClientRect();
    popover.style.position = 'absolute';
    popover.style.left = `${rect.left + window.scrollX}px`;
    popover.style.top = `${rect.bottom + window.scrollY + 6}px`;
    popover.style.width = '320px';
    document.body.appendChild(popover);

    popover.innerHTML = `
      <div style="padding: 8px;">
        <div style="position: relative;">
          <input id="model-search-input" placeholder="Search models..." style="width: 100%; border: 1px solid #e4e4e7; border-radius: 6px; padding: 6px 10px; font-size: 13px; outline: none; background: #ffffff; color: #18181b;" type="text" value="">
        </div>
      </div>
      <div style="max-height: 320px; overflow-y: auto;">
        <div>
          <div style="padding: 6px 12px; font-size: 11px; font-weight: 700; color: #71717a; text-transform: uppercase; tracking-wider: 0.05em; text-align: left;">Pinned models</div>
          <div style="display:flex; align-items:center; gap:8px; padding: 8px 12px; opacity: 0.5;">
            <img alt="" width="20" height="20" src="/images/company/bytedance.svg" style="width:20px; height:20px; object-fit: contain;">
            <span style="font-size:13px; color:#71717a; flex:1; text-align:left;">Seedance 2.0</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px; color:#a1a1aa;"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
        </div>
        <div>
          <div style="padding: 6px 12px; font-size: 11px; font-weight: 700; color: #71717a; text-transform: uppercase; tracking-wider: 0.05em; text-align: left;">Providers</div>
          ${[
            { name: 'ByteDance', model: 'Seedance 2.0 Fast', logo: '/images/company/bytedance.svg' },
            { name: 'Google', model: 'Google Veo', logo: '/images/company/google.svg' },
            { name: 'Kuaishou', model: 'Kling Cinema', logo: '/images/company/kuaishou.svg' },
            { name: 'MiniMax', model: 'Hailuo Rapid', logo: '/images/company/minimax.svg' },
            { name: 'OpenAI', model: 'Sora 2', logo: '/images/company/openai.svg' },
            { name: 'WAN', model: 'WAN 2.6', logo: '/images/company/qwen.svg' }
          ].map(p => {
            const isSelected = activeModelSelected === p.model;
            return `
              <div class="provider-select-item" style="display:flex; align-items:center; gap:8px; padding:8px 12px; cursor:pointer; transition:all 0.15s ease;" data-val="${p.model}" data-provider="${p.name}">
                <img alt="" width="20" height="20" src="${p.logo}" style="width:20px; height:20px; object-fit: contain;">
                <span style="font-size:13px; color:#18181b; flex:1; text-align:left; font-weight:500;">${p.name}</span>
                ${isSelected ? `
                  <div style="display:flex; align-items:center; gap:2px; font-size:12px; color:#84cc16; font-weight:600;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px; height:12px;"><path d="M20 6 9 17l-5-5"></path></svg>
                    <span>${p.model}</span>
                  </div>
                ` : ''}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px; color:#71717a;"><path d="m9 18 6-6-6-6"></path></svg>
              </div>
            `;
          }).join('')}
        </div>
        <div>
          <div style="padding: 6px 12px; font-size: 11px; font-weight: 700; color: #71717a; text-transform: uppercase; tracking-wider: 0.05em; text-align: left;">Models</div>
          ${[
            { name: 'Grok Imagine Video', logo: '/images/company/xai.svg' },
            { name: 'LTX 2.3 Pro', logo: '/images/company/ltx.svg' },
            { name: 'Pixverse V4.5', logo: '', initial: 'P' }
          ].map(m => `
            <div style="display:flex; align-items:center; gap:8px; padding: 8px 12px; opacity: 0.5;">
              ${m.logo ? `<img alt="" width="20" height="20" src="${m.logo}" style="width:20px; height:20px; object-fit: contain;">` : `<div style="display:flex; align-items:center; justify-content:center; border-radius:50%; background: rgba(139, 92, 246, 0.15); color: rgb(109, 40, 217); width:20px; height:20px; font-size:10px; font-weight:600;">${m.initial}</div>`}
              <span style="font-size:13px; color:#71717a; flex:1; text-align:left;">${m.name}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px; color:#a1a1aa;"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    popover.querySelectorAll('.provider-select-item').forEach(item => {
      item.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const selectedModel = item.getAttribute('data-val');
        activeModelSelected = selectedModel;

        updateModelTriggerDisplay(anchorBtn);
        showToast(`Switched active generation model to: ${selectedModel}`, "Model Synced");
        popover.classList.remove('active');
        setTimeout(() => popover.remove(), 180);
      });

      item.addEventListener('mouseenter', () => { item.style.background = '#f4f4f5'; });
      item.addEventListener('mouseleave', () => { item.style.background = 'transparent'; });
    });

    const searchInput = popover.querySelector('#model-search-input');
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      popover.querySelectorAll('.provider-select-item').forEach(item => {
        const providerName = item.getAttribute('data-provider').toLowerCase();
        const modelName = item.getAttribute('data-val').toLowerCase();
        if (providerName.includes(query) || modelName.includes(query)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });

    setTimeout(() => popover.classList.add('active'), 10);
  };

  const openOutputModeDropdown = (anchorBtn) => {
    document.querySelectorAll('.local-popover, .theirs-popover, .ratio-popover').forEach(p => p.remove());

    const popover = document.createElement('div');
    popover.className = 'ratio-popover'; // Reuse card style
    
    const rect = anchorBtn.getBoundingClientRect();
    popover.style.position = 'absolute';
    popover.style.left = `${rect.left + window.scrollX}px`;
    popover.style.top = `${rect.bottom + window.scrollY + 6}px`;
    popover.style.width = '180px';
    document.body.appendChild(popover);

    popover.innerHTML = `
      <div style="padding: 6px 8px; font-size:11px; font-weight:700; color:#71717a; text-transform:uppercase; tracking-wider:0.05em; text-align:left;">Type</div>
      <div style="display:flex; flex-direction:column; gap:2px; padding:2px;">
        ${[
          { name: 'Video', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" style="width:14px; height:14px;"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M7 3v18"></path><path d="M3 7.5h4"></path><path d="M3 12h18"></path><path d="M3 16.5h4"></path><path d="M17 3v18"></path><path d="M17 7.5h4"></path><path d="M17 16.5h4"></path></svg>' },
          { name: 'Image', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" style="width:14px; height:14px;"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>' },
          { name: 'Audio', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" style="width:14px; height:14px;"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"></path></svg>' },
          { name: 'Text', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" style="width:14px; height:14px;"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"></path></svg>' }
        ].map(item => {
          const isSelected = activeModelType === item.name;
          const bgStyle = isSelected ? 'background: #f4f4f5; font-weight:600;' : 'background: transparent;';
          return `
            <div class="output-mode-item" style="display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:13px; color:#18181b; ${bgStyle}" data-val="${item.name}">
              <span style="color:#84cc16; display:flex; align-items:center;">${item.icon}</span>
              <span style="flex:1; text-align:left;">${item.name}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;

    popover.querySelectorAll('.output-mode-item').forEach(item => {
      item.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const selectedType = item.getAttribute('data-val');
        activeModelType = selectedType;

        const textSpan = anchorBtn.querySelector('.type-text');
        if (textSpan) textSpan.textContent = selectedType;

        const oldSvg = anchorBtn.querySelector('svg:first-child');
        const newSvgContainer = document.createElement('div');
        newSvgContainer.innerHTML = item.querySelector('span:first-child').innerHTML;
        const newSvg = newSvgContainer.firstChild;
        if (oldSvg && newSvg) {
          oldSvg.replaceWith(newSvg);
        }

        showToast(`Changed output compilation format type to: ${selectedType.toUpperCase()}`, "Output Format Mode Updated");
        popover.classList.remove('active');
        setTimeout(() => popover.remove(), 180);
      });

      item.addEventListener('mouseenter', () => { item.style.background = '#f4f4f5'; });
      item.addEventListener('mouseleave', () => {
        item.style.background = activeModelType === item.getAttribute('data-val') ? '#f4f4f5' : 'transparent';
      });
    });

    setTimeout(() => popover.classList.add('active'), 10);
  };

  const openUnifiedSettingsDropdown = (anchorBtn) => {
    document.querySelectorAll('.local-popover, .theirs-popover, .ratio-popover').forEach(p => p.remove());

    const popover = document.createElement('div');
    popover.className = 'ratio-popover'; // Reuse card style
    
    const rect = anchorBtn.getBoundingClientRect();
    popover.style.position = 'absolute';
    popover.style.left = `${rect.right + window.scrollX - 320}px`;
    popover.style.top = `${rect.bottom + window.scrollY + 6}px`;
    popover.style.width = '320px';
    document.body.appendChild(popover);

    popover.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px; padding:4px;">
        <div style="display:flex; flex-direction:column; gap:8px;">
          <h4 style="font-size:11px; font-weight:700; color:#71717a; text-transform:uppercase; letter-spacing:0.05em; margin:0; text-align:left;">Settings</h4>
          
          <div style="display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:12px; color:#71717a; display:flex; align-items:center; gap:4px; text-align:left;">
              Resolution<span style="opacity:0.6;">(default)</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px; height:12px; color:#a1a1aa;"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
            </label>
            <div style="display:flex; gap:6px;">
              ${['480p', '720p'].map(res => {
                const isActive = activeModelResolution === res;
                const mult = res === '480p' ? 1 : 2;
                const borderStyle = isActive ? 'border-color: #84cc16 !important; background: rgba(132, 204, 22, 0.05) !important;' : 'border-color: #e4e4e7; background: #ffffff;';
                return `
                  <button type="button" class="unified-res-btn" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; padding:6px 2px; border-radius:8px; border:2px solid; cursor:pointer; transition:all 0.15s ease; ${borderStyle}" data-val="${res}">
                    <span style="font-size:12px; font-weight:600; color:#18181b;">${res}</span>
                    <span style="display:inline-flex; align-items:center; gap:2px; font-size:10px; color:#eab308; font-weight:600;">
                      <svg viewBox="0 0 24 24" aria-hidden="true" style="width:12px; height:12px; fill:currentColor;"><circle cx="12" cy="12" r="10" fill="currentColor"></circle><circle cx="12" cy="12" r="7.5" fill="none" stroke="rgba(0, 0, 0, 0.22)" stroke-width="1"></circle><text x="12" y="16.5" text-anchor="middle" font-size="12" font-weight="900" font-family="ui-sans-serif, system-ui, sans-serif" fill="rgba(0, 0, 0, 0.55)">$</text></svg>
                      ×${mult}
                    </span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:4px; margin-top:4px;">
            <label style="font-size:12px; color:#71717a; text-align:left;">Aspect Ratio<span style="opacity:0.6;">(default)</span></label>
            <select id="unified-ratio-select" style="width:100%; height:32px; border-radius:6px; border:1px solid #e4e4e7; padding:0 8px; font-size:12px; color:#18181b; background:#ffffff; cursor:pointer; outline:none;">
              <option value="16:9" ${activeModelAspectRatio === '16:9' ? 'selected' : ''}>16:9 (Landscape)</option>
              <option value="9:16" ${activeModelAspectRatio === '9:16' ? 'selected' : ''}>9:16 (Portrait)</option>
              <option value="1:1" ${activeModelAspectRatio === '1:1' ? 'selected' : ''}>1:1 (Square)</option>
            </select>
          </div>

          <div style="display:flex; flex-direction:column; gap:2px; margin-top:4px;">
            <div style="display:flex; align-items:center; justify-content:space-between; font-size:12px; color:#71717a;">
              <span>Duration</span>
              <span id="unified-dur-val" style="font-weight:600; color:#18181b;">${activeModelDuration}s</span>
            </div>
            <input id="unified-dur-slider" type="range" min="4" max="15" step="1" value="${activeModelDuration}" style="width:100%; cursor:pointer; accent-color:#84cc16;">
          </div>

          <div style="display:flex; flex-direction:column; gap:2px; margin-top:4px;">
            <div style="display:flex; align-items:center; justify-content:space-between; font-size:12px; color:#71717a;">
              <span>Num Generations</span>
              <span id="unified-gen-val" style="font-weight:600; color:#18181b;">${activeModelGenerations}</span>
            </div>
            <input id="unified-gen-slider" type="range" min="1" max="4" step="1" value="${activeModelGenerations}" style="width:100%; cursor:pointer; accent-color:#84cc16;">
          </div>

          <div style="display:flex; align-items:center; gap:8px; margin-top:4px; text-align:left;">
            <input id="unified-audio-check" type="checkbox" ${activeModelGenerateAudio ? 'checked' : ''} style="cursor:pointer; width:15px; height:15px; accent-color:#84cc16;">
            <span style="font-size:12px; color:#18181b; cursor:pointer;">Generate Audio</span>
          </div>

        </div>

        <div style="border-top: 1px solid #e4e4e7; margin: 4px 0;"></div>

        <div style="display:flex; flex-direction:column; gap:6px;">
          <h4 style="font-size:11px; font-weight:700; color:#71717a; text-transform:uppercase; letter-spacing:0.05em; margin:0; text-align:left;">Model Settings</h4>
          <button type="button" style="display:flex; justify-content:space-between; align-items:center; width:100%; background:none; border:none; padding:4px 6px; border-radius:6px; font-size:12px; font-weight:600; color:#18181b; cursor:pointer; transition:all 0.15s ease;" id="unified-model-details-btn">
            <span>${activeModelSelected}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px; height:12px; color:#71717a;"><path d="m6 9 6 6 6-6"></path></svg>
          </button>
        </div>
      </div>
    `;

    popover.querySelectorAll('.unified-res-btn').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const selected = btn.getAttribute('data-val');
        activeModelResolution = selected;
        
        popover.querySelectorAll('.unified-res-btn').forEach(b => {
          b.style.borderColor = '#e4e4e7';
          b.style.background = '#ffffff';
        });
        btn.style.borderColor = '#84cc16';
        btn.style.background = 'rgba(132, 204, 22, 0.05)';

        updateModelSettingsTriggerDisplay(anchorBtn);
      });
    });

    const ratioSelect = popover.querySelector('#unified-ratio-select');
    ratioSelect.addEventListener('change', () => {
      activeModelAspectRatio = ratioSelect.value;
      updateModelSettingsTriggerDisplay(anchorBtn);
    });

    const durSlider = popover.querySelector('#unified-dur-slider');
    const durValSpan = popover.querySelector('#unified-dur-val');
    durSlider.addEventListener('input', () => {
      activeModelDuration = parseInt(durSlider.value, 10);
      durValSpan.textContent = `${activeModelDuration}s`;
      updateModelSettingsTriggerDisplay(anchorBtn);
    });

    const genSlider = popover.querySelector('#unified-gen-slider');
    const genValSpan = popover.querySelector('#unified-gen-val');
    genSlider.addEventListener('input', () => {
      activeModelGenerations = parseInt(genSlider.value, 10);
      genValSpan.textContent = activeModelGenerations;
    });

    const audioCheck = popover.querySelector('#unified-audio-check');
    audioCheck.addEventListener('change', () => {
      activeModelGenerateAudio = audioCheck.checked;
    });

    const modelDetailsBtn = popover.querySelector('#unified-model-details-btn');
    modelDetailsBtn.addEventListener('mouseenter', () => { modelDetailsBtn.style.background = '#f4f4f5'; });
    modelDetailsBtn.addEventListener('mouseleave', () => { modelDetailsBtn.style.background = 'transparent'; });
    modelDetailsBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const modelTrigger = document.querySelector('[data-testid="model-dropdown-trigger"]') || document.querySelector('[id*="radix-_r_1f_"]') || document.querySelector('[id*="radix-_r_12_"]');
      if (modelTrigger) {
        popover.remove();
        openModelSelectorDropdown(modelTrigger);
      }
    });

    setTimeout(() => popover.classList.add('active'), 10);
  };

  const toggleModelModeUI = (isModel) => {
    const triggerBtn = document.querySelector('[data-testid="model-dropdown-trigger"]') || document.querySelector('[id*="radix-_r_1f_"]') || document.querySelector('[id*="radix-_r_12_"]');
    const ratioBtn = document.querySelector('[id*="radix-_r_1h_"]');
    const resBtn = document.querySelector('[id*="radix-_r_1j_"]');
    const durBtn = document.querySelector('[id*="radix-_r_1l_"]');
    
    if (!ratioBtn || !resBtn || !durBtn) return;
    const toolbar = ratioBtn.parentElement;
    if (!toolbar) return;

    if (!agentIconSvg && triggerBtn) {
      agentIconSvg = triggerBtn.querySelector('svg')?.cloneNode(true);
    }

    let typeBtn = document.getElementById('model-type-trigger');
    let settingsBtn = document.getElementById('model-settings-trigger');

    if (isModel) {
      ratioBtn.style.display = 'none';
      resBtn.style.display = 'none';
      durBtn.style.display = 'none';

      if (!typeBtn) {
        typeBtn = document.createElement('button');
        typeBtn.id = 'model-type-trigger';
        typeBtn.type = 'button';
        typeBtn.className = 'flex min-h-6 items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-xs font-medium transition-micro hover:bg-accent hover:text-accent-foreground';
        typeBtn.style.display = 'flex';
        typeBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-film size-3.5" style="width:14px; height:14px; color:#84cc16; display:inline-block; vertical-align:middle;"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M7 3v18"></path><path d="M3 7.5h4"></path><path d="M3 12h18"></path><path d="M3 16.5h4"></path><path d="M17 3v18"></path><path d="M17 7.5h4"></path><path d="M17 16.5h4"></path></svg>
          <span class="type-text" style="vertical-align:middle;">Video</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down size-3 text-muted-foreground hidden sm:block" style="width:12px; height:12px; margin-left:4px; display:inline-block; vertical-align:middle;"><path d="m6 9 6 6 6-6"></path></svg>
        `;
        toolbar.appendChild(typeBtn);
        
        typeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openOutputModeDropdown(typeBtn);
        });
      } else {
        typeBtn.style.display = 'flex';
      }

      if (!settingsBtn) {
        settingsBtn = document.createElement('button');
        settingsBtn.id = 'model-settings-trigger';
        settingsBtn.type = 'button';
        settingsBtn.className = 'flex min-h-6 items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-xs font-medium transition-micro hover:bg-accent hover:text-accent-foreground';
        settingsBtn.style.display = 'flex';
        toolbar.appendChild(settingsBtn);

        settingsBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openUnifiedSettingsDropdown(settingsBtn);
        });
      } else {
        settingsBtn.style.display = 'flex';
      }

      updateModelSettingsTriggerDisplay(settingsBtn);
      updateModelTriggerDisplay(triggerBtn);

    } else {
      ratioBtn.style.display = 'flex';
      resBtn.style.display = 'flex';
      durBtn.style.display = 'flex';

      if (typeBtn) typeBtn.style.display = 'none';
      if (settingsBtn) settingsBtn.style.display = 'none';

      updateModelTriggerDisplay(triggerBtn);
    }
  };

  // ==========================================
  // INJECT CSS ANIMATIONS AND INTERACTIVE UI
  // ==========================================
  const injectStyles = () => {
    if (document.getElementById('local-interactivity-styles')) return;
    const styles = document.createElement('style');
    styles.id = 'local-interactivity-styles';
    styles.innerHTML = `
      /* Modals */
      .local-modal-overlay {
        position: fixed; inset: 0; background: rgba(9, 9, 11, 0.85); backdrop-filter: blur(8px);
        display: flex; align-items: center; justify-content: center; z-index: 10000;
        opacity: 0; pointer-events: none; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .local-modal-overlay.active { opacity: 1; pointer-events: auto; }
      .local-modal-container {
        background: #18181b; border: 1px solid #27272a; padding: 24px; border-radius: 16px;
        width: min(100%, 450px); color: #f4f4f5; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        transform: scale(0.95); transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .local-modal-container.wide { width: min(100%, 580px); background: #09090b; }
      .local-modal-container.project-modal {
        background: #ffffff !important;
        color: #18181b !important;
        border: 1px solid #e4e4e7 !important;
        border-radius: 20px !important;
        width: min(100%, 480px) !important;
        padding: 24px !important;
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04) !important;
      }
      .local-modal-container.project-modal h3 { color: #18181b !important; font-weight: 700 !important; }
      .local-modal-container.project-modal .local-modal-close { color: #71717a !important; }
      .local-modal-container.project-modal .local-modal-close:hover { color: #18181b !important; }
      .local-modal-container.project-modal label { color: #71717a !important; font-weight: 600 !important; }
      .local-modal-overlay.active .local-modal-container { transform: scale(1); }
      
      /* Dropdown Popovers */
      .local-popover {
        position: absolute; background: #18181b; border: 1px solid #27272a; border-radius: 8px;
        padding: 4px; z-index: 10001; min-width: 180px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
        opacity: 0; transform: translateY(4px); pointer-events: none; transition: all 0.15s ease;
      }
      .local-popover.active { opacity: 1; transform: translateY(0); pointer-events: auto; }
      .local-popover-item {
        display: flex; align-items: center; width: 100%; padding: 8px 12px; font-size: 13px; color: #a1a1aa;
        border-radius: 4px; cursor: pointer; text-align: left; transition: all 0.1s; gap: 8px;
      }
      .local-popover-item:hover { background: #27272a; color: #ffffff; }
      .local-popover-item.active { background: #3f3f46; color: #ffffff; font-weight: 500; }

      /* "THEIRS" Dynamic Agent/Model White Dropdown popover */
      .theirs-popover {
        position: absolute; background: #ffffff !important; border: 1px solid #e4e4e7 !important;
        border-radius: 14px !important; padding: 14px !important; z-index: 10002 !important;
        width: 380px !important; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.1) !important;
        opacity: 0; transform: translateY(6px); pointer-events: none; transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        color: #18181b !important;
      }
      .theirs-popover.active { opacity: 1; transform: translateY(0); pointer-events: auto; }
      
      /* Gorgeous Ratio Popover matching "theirs" style */
      .ratio-popover {
        position: absolute; background: #ffffff !important; border: 1px solid #e4e4e7 !important;
        border-radius: 16px !important; padding: 16px !important; z-index: 10002 !important;
        width: 300px !important; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04) !important;
        opacity: 0; transform: translateY(6px); pointer-events: none; transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        color: #18181b !important;
        left: 0;
        top: 100%;
      }
      .ratio-popover.active { opacity: 1; transform: translateY(0); pointer-events: auto; }
      .ratio-popover-title {
        font-size: 13px !important; font-weight: 600 !important; color: #71717a !important;
        margin-bottom: 12px !important; text-align: left !important;
      }
      .ratio-options-row {
        display: flex; gap: 8px; width: 100%;
      }
      .ratio-card {
        flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 8px; padding: 12px 8px; border-radius: 12px; border: 2px solid #e4e4e7;
        background: #ffffff; cursor: pointer; transition: all 0.15s ease;
      }
      .ratio-card:hover {
        border-color: #cbd5e1; background: #f8fafc;
      }
      .ratio-card.active {
        border-color: #18181b !important; background: #f4f4f5 !important;
      }
      .ratio-card-label {
        font-size: 13px !important; font-weight: 600 !important; color: #18181b !important;
      }
      .ratio-shape-16-9 {
        width: 22px; height: 12px; border-radius: 4px; border: 2px solid #71717a; background: transparent;
      }
      .ratio-shape-9-16 {
        width: 12px; height: 22px; border-radius: 4px; border: 2px solid #71717a; background: transparent;
      }
      .ratio-shape-1-1 {
        width: 16px; height: 16px; border-radius: 50%; border: 2px solid #71717a; background: transparent;
      }
      .ratio-card.active .ratio-shape-16-9,
      .ratio-card.active .ratio-shape-9-16,
      .ratio-card.active .ratio-shape-1-1 {
        border-color: #18181b !important;
      }

      .theirs-header {
        font-size: 12px !important; font-weight: 700 !important; color: #71717a !important;
        text-transform: uppercase !important; letter-spacing: 0.05em !important;
        margin-bottom: 10px !important; text-align: left !important; padding-left: 2px !important;
      }
      .theirs-options-grid {
        display: flex; flex-direction: column; gap: 8px;
      }
      .theirs-card {
        display: flex; align-items: start; gap: 12px; padding: 12px; border-radius: 10px;
        border: 1px solid #e4e4e7; background: #ffffff; cursor: pointer;
        transition: all 0.15s ease; text-align: left;
      }
      .theirs-card:hover {
        border-color: #cbd5e1; background: #f8fafc;
      }
      .theirs-card.active {
        border-color: #e4e4e7; background: #f4f4f5;
      }
      .theirs-icon-container {
        display: flex; h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-800;
      }
      .theirs-title {
        font-size: 13.5px !important; font-weight: 600 !important; color: #18181b !important;
      }
      .theirs-desc {
        font-size: 11px !important; color: #71717a !important; line-height: 1.4 !important;
        margin-top: 3px !important;
      }
      .theirs-badge-new {
        background: #84cc16 !important; color: #ffffff !important; font-size: 9px !important;
        font-weight: 700 !important; text-transform: uppercase !important; padding: 1px 6px !important;
        border-radius: 9999px !important; display: inline-block !important; letter-spacing: 0.02em !important;
      }
      .theirs-badge-pro {
        background: #18181b !important; color: #ffffff !important; font-size: 9px !important;
        font-weight: 700 !important; text-transform: uppercase !important; padding: 1px 6px !important;
        border-radius: 9999px !important; display: inline-block !important; letter-spacing: 0.02em !important;
      }

      /* Task List Dropdown Specifics */
      .local-tasks-popover {
        width: 320px;
        background: #09090b;
        border-color: #27272a;
        max-height: 400px;
        display: flex;
        flex-direction: column;
      }

      /* Toast Notification */
      .local-toast {
        position: fixed; bottom: 24px; right: 24px; background: #09090b; border: 1px solid #27272a;
        color: white; border-radius: 12px; padding: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);
        display: flex; align-items: center; gap: 12px; z-index: 10002;
        transform: translateY(100px); opacity: 0; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .local-toast.active { transform: translateY(0); opacity: 1; }

      /* Simulated Generation Panel */
      .gen-panel {
        position: fixed; bottom: 24px; right: 24px; background: #09090b; border: 1px solid #a3e635;
        width: 340px; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.6);
        z-index: 9999; transform: translateY(150px); opacity: 0; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .gen-panel.active { transform: translateY(0); opacity: 1; }

      /* Attachments Panel in Prompt Bar */
      .local-attachments-bar {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        padding: 8px 12px;
        border-bottom: 1px solid rgba(39, 39, 42, 0.4);
        background: rgba(9, 9, 11, 0.2);
      }
      .local-attachment-chip {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #18181b;
        border: 1px solid #27272a;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 11px;
        color: #f4f4f5;
      }
      .local-attachment-chip img {
        width: 20px;
        height: 20px;
        object-cover: cover;
        border-radius: 3px;
      }

      /* Quick Animations */
      @keyframes localSpinner {
        to { transform: rotate(360deg); }
      }
      .local-spinner {
        animation: localSpinner 0.8s linear infinite;
        border-radius: 50%; border: 2.5px solid rgba(255,255,255,0.1); border-top-color: #a3e635;
      }
      
      /* Active buttons */
      .btn-glow-green {
        border-color: #a3e635 !important;
        background: rgba(163, 230, 53, 0.05) !important;
        color: #a3e635 !important;
      }

      /* Light Theme Overrides */
      html.light .local-modal-container {
        background: #ffffff; border-color: #e4e4e7; color: #18181b;
      }
      html.light .local-modal-container h3, html.light .local-modal-container h4 { color: #09090b; }
      html.light .local-popover {
        background: #ffffff; border-color: #e4e4e7;
      }
      html.light .local-popover-item { color: #71717a; }
      html.light .local-popover-item:hover { background: #f4f4f5; color: #09090b; }
      html.light .local-popover-item.active { background: #e4e4e7; color: #09090b; }
      html.light .local-toast {
        background: #ffffff; border-color: #e4e4e7; color: #09090b;
      }
      html.light .local-toast h4 { color: #09090b; }
      html.light .gen-panel {
        background: #ffffff; border-color: #84cc16;
      }
      html.light .gen-panel h4, html.light .gen-panel p { color: #09090b; }
    `;
    document.head.appendChild(styles);
  };

  // ==========================================
  // SYNC & ANIMATE CREDIT DISPLAY
  // ==========================================
  const updateCreditsDisplay = () => {
    const credits = localStorage.getItem('pixo_credits') || '200';
    
    // 1. Map to Get Credits button (Header)
    document.querySelectorAll('button').forEach(el => {
      const text = el.textContent || '';
      if (text.includes('Get Credits') && !el.querySelector('.local-credits-pill')) {
        el.innerHTML = `Get Credits <span class="local-credits-pill ml-1.5 px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-400 text-xs font-semibold">${credits}</span>`;
      } else if (el.querySelector('.local-credits-pill')) {
        el.querySelector('.local-credits-pill').textContent = credits;
      }
      
      // Match other simple numbers (like the isolated credits display button on playground)
      if (el.getAttribute('data-testid') === 'generate-button') {
        const textSpan = el.querySelector('span');
        if (textSpan && textSpan.textContent.includes('cr')) {
          textSpan.textContent = `${credits} cr`;
        }
      }
    });

    // 2. Map to local account menus or sub-pages
    document.querySelectorAll('.credit-count-label').forEach(el => {
      el.textContent = `${credits} credits remaining`;
    });
  };

  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  const showToast = (message, title = "System Notification", isSuccess = true) => {
    let toast = document.querySelector('.local-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'local-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isSuccess ? 'bg-lime-500/10 text-lime-400' : 'bg-red-500/10 text-red-400'}">
        ${isSuccess ? '✓' : '✕'}
      </div>
      <div class="flex-1">
        <h4 class="text-sm font-semibold text-white">${title}</h4>
        <p class="text-xs text-zinc-400 mt-0.5">${message}</p>
      </div>
    `;
    toast.className = 'local-toast';
    setTimeout(() => toast.classList.add('active'), 50);
    
    // Auto remove
    if (window.toastTimer) clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => toast.classList.remove('active'), 4000);
  };

  // ==========================================
  // MODAL INJECTOR (REDEEM / PRICING / VIDEO / PROJECT)
  // ==========================================
  const createModal = (title, contentHTML, isWide = false) => {
    // Dismiss any open popovers when opening a modal
    document.querySelectorAll('.local-popover, .theirs-popover, .ratio-popover').forEach(p => p.remove());

    let overlay = document.querySelector('.local-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'local-modal-overlay';
      document.body.appendChild(overlay);
      
      // Close overlay on background click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
      });
    }

    overlay.innerHTML = `
      <div class="local-modal-container ${isWide === true ? 'wide' : (isWide ? isWide : '')}">
        <div class="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <h3 class="text-lg font-bold text-white">${title}</h3>
          <button class="local-modal-close text-zinc-400 hover:text-white text-xl font-bold cursor-pointer">&times;</button>
        </div>
        <div class="local-modal-body">${contentHTML}</div>
      </div>
    `;

    overlay.querySelector('.local-modal-close').addEventListener('click', closeModal);
    overlay.classList.add('active');
  };

  const closeModal = () => {
    const overlay = document.querySelector('.local-modal-overlay');
    if (overlay) overlay.classList.remove('active');
  };

  // Open Redeem Modal
  const openRedeemModal = () => {
    const content = `
      <p class="text-xs text-zinc-400 mb-4">Enter a valid promotion or gift code to add credits directly to your local sandbox account.</p>
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Promo Code</label>
          <input type="text" id="redeem-input" placeholder="e.g. PIXO500" class="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-lime-400 transition-all uppercase" />
        </div>
        <button id="redeem-submit-btn" class="w-full rounded-lg bg-lime-400 text-black py-2.5 text-sm font-semibold hover:bg-lime-300 transition-all">Redeem Code</button>
      </div>
    `;
    createModal("Redeem Voucher Code", content);

    const input = document.getElementById('redeem-input');
    const submitBtn = document.getElementById('redeem-submit-btn');

    submitBtn.addEventListener('click', () => {
      const code = input.value.trim().toUpperCase();
      if (!code) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="inline-block w-4 h-4 local-spinner mr-2"></span>Validating...`;

      setTimeout(() => {
        let added = 100;
        let success = true;

        if (code === "PIXO500") added = 500;
        else if (code === "OPENCLAW") added = 1000;
        else if (code === "HUTAO") added = 9999;
        else if (code === "VOUCHER") added = 200;
        else {
          added = 50;
        }

        const current = parseInt(localStorage.getItem('pixo_credits') || '200', 10);
        localStorage.setItem('pixo_credits', (current + added).toString());
        updateCreditsDisplay();

        showToast(`Successfully redeemed voucher ${code}! added +${added} credits!`, "Voucher Redeemed");
        closeModal();
      }, 1200);
    });
  };

  // Open Get Credits Modal
  const openGetCreditsModal = () => {
    const content = `
      <p class="text-xs text-zinc-400 mb-4">Add more local computation credits. Select a tier to securely simulate a transaction.</p>
      <div class="space-y-3">
        <div class="flex items-center justify-between p-3.5 border border-zinc-800 rounded-xl bg-zinc-900/50 cursor-pointer hover:border-lime-400 hover:bg-zinc-900 transition-all tier-option" data-credits="100" data-price="10">
          <div>
            <h4 class="text-sm font-bold text-white">Starter Tier</h4>
            <p class="text-xs text-zinc-400 mt-0.5">Perfect for small AI experiments</p>
          </div>
          <div class="text-right">
            <span class="text-lime-400 font-bold block text-sm">+100 Credits</span>
            <span class="text-zinc-500 text-xs">$10.00 USD</span>
          </div>
        </div>
        <div class="flex items-center justify-between p-3.5 border border-zinc-800 rounded-xl bg-zinc-900/50 cursor-pointer hover:border-lime-400 hover:bg-zinc-900 transition-all tier-option" data-credits="500" data-price="35">
          <div>
            <h4 class="text-sm font-bold text-white">Creator Tier</h4>
            <p class="text-xs text-zinc-400 mt-0.5">Most popular among digital artists</p>
          </div>
          <div class="text-right">
            <span class="text-lime-400 font-bold block text-sm">+500 Credits</span>
            <span class="text-zinc-500 text-xs">$35.00 USD</span>
          </div>
        </div>
        <div class="flex items-center justify-between p-3.5 border border-zinc-800 rounded-xl bg-zinc-900/50 cursor-pointer hover:border-lime-400 hover:bg-zinc-900 transition-all tier-option" data-credits="2000" data-price="99">
          <div>
            <h4 class="text-sm font-bold text-white">Production Elite</h4>
            <p class="text-xs text-zinc-400 mt-0.5">Continuous rendering and scale</p>
          </div>
          <div class="text-right">
            <span class="text-lime-400 font-bold block text-sm">+2,000 Credits</span>
            <span class="text-zinc-500 text-xs">$99.00 USD</span>
          </div>
        </div>
      </div>
      <div id="checkout-status" class="hidden mt-4 text-center p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
        <div class="inline-block w-4 h-4 local-spinner mr-2 vertical-middle"></div>
        <span id="checkout-status-text">Simulating secure checkout via payment gateway...</span>
      </div>
    `;
    createModal("Add Compute Credits", content);

    document.querySelectorAll('.tier-option').forEach(el => {
      el.addEventListener('click', () => {
        const creditsToAdd = parseInt(el.getAttribute('data-credits'), 10);
        const price = el.getAttribute('data-price');
        
        // Hide options, show status
        el.parentNode.style.display = 'none';
        const statusDiv = document.getElementById('checkout-status');
        const statusText = document.getElementById('checkout-status-text');
        statusDiv.classList.remove('hidden');

        setTimeout(() => {
          statusText.textContent = "Processing authorization code...";
          setTimeout(() => {
            statusText.textContent = "Updating credits vault...";
            setTimeout(() => {
              const current = parseInt(localStorage.getItem('pixo_credits') || '200', 10);
              localStorage.setItem('pixo_credits', (current + creditsToAdd).toString());
              updateCreditsDisplay();

              showToast(`Simulated transaction complete! Added +${creditsToAdd} credits.`, `Invoice Approved ($${price}.00)`);
              closeModal();
            }, 1000);
          }, 1000);
        }, 1200);
      });
    });
  };

  // Open Video Player Modal
  const openVideoPlayerModal = (title, videoUrl) => {
    const content = `
      <div class="aspect-video w-full rounded-xl overflow-hidden bg-black border border-zinc-800">
        <video src="${videoUrl}" controls autoplay loop class="w-full h-full object-cover"></video>
      </div>
      <div class="mt-4 flex items-center justify-between">
        <div>
          <h4 class="text-sm font-semibold text-white truncate max-w-[280px]">${title}</h4>
          <p class="text-xs text-zinc-500 mt-0.5">High-Fidelity AI Simulated Loop Render</p>
        </div>
        <button class="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-all local-modal-close-inst">Close</button>
      </div>
    `;
    createModal("AI Video Player", content);
    document.querySelector('.local-modal-close-inst').addEventListener('click', closeModal);
  };

  // Open Create New Project Modal
  const openCreateProjectModal = () => {
    const content = `
      <div style="display:flex; flex-direction:column; gap:14px; text-align:left; color:#18181b;">
        <!-- Project Type Selection -->
        <div>
          <label style="font-size:11px; font-weight:700; color:#71717a; text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:6px;">Project Type</label>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div id="type-video" class="project-type-card active" data-type="Video" style="display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:10px; border:2px solid #84cc16; cursor:pointer; background:rgba(132, 204, 22, 0.05); transition:all 0.15s ease;">
              <div style="display:flex; align-items:center; justify-content:center; border-radius:8px; background:#00b37a; color:#ffffff; width:32px; height:32px; flex-shrink:0;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18M17 3v18M3 7.5h4M3 16.5h4M17 7.5h4M17 16.5h4M3 12h18"/></svg>
              </div>
              <div>
                <div style="font-size:13px; font-weight:700; color:#18181b;">Video</div>
                <div style="font-size:10px; color:#71717a;">Single video, one timeline</div>
              </div>
            </div>
            <div id="type-series" class="project-type-card" data-type="Series" style="display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:10px; border:2px solid #e4e4e7; background:#ffffff; cursor:pointer; transition:all 0.15s ease;">
              <div style="display:flex; align-items:center; justify-content:center; border-radius:8px; background:#f4f4f5; color:#71717a; width:32px; height:32px; flex-shrink:0;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <div>
                <div style="font-size:13px; font-weight:700; color:#71717a;">Series</div>
                <div style="font-size:10px; color:#a1a1aa;">Multiple episodes</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Video Title -->
        <div style="display:flex; flex-direction:column; gap:4px;">
          <label style="font-size:11px; font-weight:700; color:#71717a; text-transform:uppercase; letter-spacing:0.05em;">Video Title</label>
          <input type="text" id="new-proj-title" placeholder="e.g. Summer Campaign V1" style="width:100%; border:1px solid #e4e4e7; border-radius:8px; background:#ffffff; padding:10px 12px; font-size:13px; color:#18181b; outline:none; transition:all 0.15s ease;" />
        </div>

        <!-- Agent -->
        <div style="display:flex; flex-direction:column; gap:4px;">
          <label style="font-size:11px; font-weight:700; color:#71717a; text-transform:uppercase; letter-spacing:0.05em;">Agent</label>
          <div style="position:relative;">
            <button id="agent-selector-btn" style="width:100%; display:flex; justify-content:space-between; align-items:center; border:1px solid #e4e4e7; border-radius:8px; background:#ffffff; padding:10px 12px; font-size:13px; color:#18181b; cursor:pointer;">
              <span style="display:flex; align-items:center; gap:6px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#84cc16;"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" x2="8" y1="16" y2="16"/><line x1="16" x2="16" y1="16" y2="16"/></svg>
                <span id="selected-agent-text">Seedance2 Director</span>
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#71717a;"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            
            <div id="agent-dropdown-menu" style="display:none; position:absolute; top:100%; left:0; right:0; margin-top:4px; background:#ffffff; border:1px solid #e4e4e7; border-radius:12px; padding:6px; z-index:10050; flex-direction:column; gap:4px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
              ${[
                { name: 'Seedance2 Director', desc: 'Our most advanced agent. Beginner-friendly.', icon: '🤖' },
                { name: 'MV Director', desc: 'Turn mp3 into a music video with Seedance 2.0.', icon: '🎵' },
                { name: 'Cinematic Storyteller', desc: 'Translate stories into episodic visual scenes.', icon: '🎬' }
              ].map(item => `
                <div class="agent-menu-item" data-val="${item.name}" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:6px; cursor:pointer; transition:all 0.15s ease;">
                  <span style="font-size:16px;">${item.icon}</span>
                  <div style="text-align:left;">
                    <div style="font-size:12px; font-weight:600; color:#18181b;">${item.name}</div>
                    <div style="font-size:10px; color:#71717a;">${item.desc}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Format & Resolution Grid -->
        <div style="display:grid; grid-template-columns: 1.1fr 1fr; gap:16px;">
          <!-- Format aspect ratio selection -->
          <div>
            <label style="font-size:11px; font-weight:700; color:#71717a; text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:6px; text-align:left;">Default Format</label>
            <div style="display:flex; gap:6px;">
              ${[
                { ratio: '16:9', w: 24, h: 14 },
                { ratio: '9:16', w: 14, h: 24 },
                { ratio: '1:1', w: 18, h: 18 }
              ].map(f => {
                const isActive = f.ratio === '16:9';
                const borderStyle = isActive ? 'border-color: #84cc16 !important; background: rgba(132, 204, 22, 0.05) !important;' : 'border-color: #e4e4e7; background: #ffffff;';
                return `
                  <div class="format-card" data-ratio="${f.ratio}" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:6px 2px; border-radius:8px; border:2px solid; cursor:pointer; transition:all 0.15s ease; ${borderStyle}">
                    <div style="width:${f.w}px; height:${f.h}px; border:2px solid currentColor; border-radius:3px; margin-bottom:4px; opacity:0.8;"></div>
                    <span style="font-size:11px; font-weight:600; color:#18181b;">${f.ratio}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Default Resolution selection -->
          <div>
            <label style="font-size:11px; font-weight:700; color:#71717a; text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:6px; text-align:left;">Default Resolution</label>
            <div style="display:flex; gap:4px;">
              ${[
                { res: '480p', cost: 5, mult: 1 },
                { res: '720p', cost: 10, mult: 2 },
                { res: '1080p', cost: 25, mult: 5 }
              ].map(r => {
                const isActive = r.res === '720p';
                const borderStyle = isActive ? 'border-color: #84cc16 !important; background: rgba(132, 204, 22, 0.05) !important;' : 'border-color: #e4e4e7; background: #ffffff;';
                return `
                  <div class="res-card" data-res="${r.res}" data-cost="${r.cost}" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:6px 2px; border-radius:8px; border:2px solid; cursor:pointer; transition:all 0.15s ease; ${borderStyle}">
                    <span style="font-size:11px; font-weight:600; color:#18181b; margin-bottom:2px;">${r.res}</span>
                    <span style="display:inline-flex; align-items:center; gap:1px; font-size:9px; color:#eab308; font-weight:600;">
                      <svg viewBox="0 0 24 24" aria-hidden="true" style="width:10px; height:10px; fill:currentColor;"><circle cx="12" cy="12" r="10" fill="currentColor"></circle><circle cx="12" cy="12" r="7.5" fill="none" stroke="rgba(0, 0, 0, 0.22)" stroke-width="1"></circle><text x="12" y="16.5" text-anchor="middle" font-size="12" font-weight="900" font-family="ui-sans-serif, system-ui, sans-serif" fill="rgba(0, 0, 0, 0.55)">$</text></svg>
                      x${r.mult}
                    </span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Duration selection -->
        <div>
          <label style="font-size:11px; font-weight:700; color:#71717a; text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:6px;">Duration</label>
          <div style="display:flex; gap:4px; flex-wrap:wrap;">
            ${['Auto', '5s', '15s', '30s', '45s', '60s', 'Custom'].map(dur => {
              const isActive = dur === 'Auto';
              const borderStyle = isActive ? 'border-color: #84cc16 !important; background: rgba(132, 204, 22, 0.05) !important;' : 'border-color: #e4e4e7; background: #ffffff;';
              return `
                <button type="button" class="dur-pill" data-val="${dur}" style="flex:1 0 auto; min-width:38px; height:28px; padding:0 6px; border-radius:6px; border:2px solid; font-size:11px; font-weight:600; color:#18181b; cursor:pointer; transition:all 0.15s ease; ${borderStyle}">
                  ${dur}
                </button>
              `;
            }).join('')}
          </div>
          <!-- Custom duration text input box (hidden by default) -->
          <div id="custom-duration-container" style="display:none; align-items:center; gap:8px; margin-top:8px;">
            <input type="number" id="custom-duration-input" placeholder="e.g. 10" min="5" max="180" style="width:100px; border:1px solid #e4e4e7; border-radius:6px; background:#ffffff; padding:6px 10px; font-size:12px; color:#18181b; outline:none; transition:all 0.15s ease;" />
            <span style="font-size:12px; color:#71717a; font-weight:600;">seconds (5-180s)</span>
          </div>
        </div>

        <!-- Submit button -->
        <button id="create-project-submit" style="width:100%; display:flex; align-items:center; justify-content:center; gap:6px; border-radius:10px; background:#71717a; border:none; color:#ffffff; padding:12px; font-size:13px; font-weight:700; cursor:not-allowed; transition:all 0.15s ease; margin-top:8px;">
          <span>Create & Enter</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    `;

    createModal("Create New Project", content, 'project-modal');

    const titleInput = document.getElementById('new-proj-title');
    const submitBtn = document.getElementById('create-project-submit');

    let selectedType = "Video";
    let selectedAgent = "Seedance2 Director";
    let selectedRatio = "16:9";
    let selectedRes = "720p";
    let selectedResCost = 10;
    let selectedDuration = "Auto";

    titleInput.addEventListener('input', () => {
      const val = titleInput.value.trim();
      if (val.length > 0) {
        submitBtn.style.background = '#84cc16'; // Brand green
        submitBtn.style.cursor = 'pointer';
      } else {
        submitBtn.style.background = '#71717a'; // Grey
        submitBtn.style.cursor = 'not-allowed';
      }
    });

    document.querySelectorAll('.project-type-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.project-type-card').forEach(c => {
          c.style.borderColor = '#e4e4e7';
          c.style.background = '#ffffff';
          const title = c.querySelector('div:last-child div:first-child');
          if (title) title.style.color = '#71717a';
        });
        card.style.borderColor = '#84cc16';
        card.style.background = 'rgba(132, 204, 22, 0.05)';
        const activeTitle = card.querySelector('div:last-child div:first-child');
        if (activeTitle) activeTitle.style.color = '#18181b';
        selectedType = card.getAttribute('data-type');
      });
    });

    const agentBtn = document.getElementById('agent-selector-btn');
    const agentDropdown = document.getElementById('agent-dropdown-menu');
    const agentLabelText = document.getElementById('selected-agent-text');

    agentBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      agentDropdown.style.display = agentDropdown.style.display === 'flex' ? 'none' : 'flex';
    });

    document.querySelectorAll('.agent-menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedAgent = item.getAttribute('data-val');
        agentLabelText.textContent = selectedAgent;
        agentDropdown.style.display = 'none';
      });
      item.addEventListener('mouseenter', () => { item.style.background = '#f4f4f5'; });
      item.addEventListener('mouseleave', () => { item.style.background = 'transparent'; });
    });

    document.addEventListener('click', () => {
      if (agentDropdown) agentDropdown.style.display = 'none';
    });

    document.querySelectorAll('.format-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.format-card').forEach(c => {
          c.style.borderColor = '#e4e4e7';
          c.style.background = '#ffffff';
        });
        card.style.borderColor = '#84cc16';
        card.style.background = 'rgba(132, 204, 22, 0.05)';
        selectedRatio = card.getAttribute('data-ratio');
      });
    });

    document.querySelectorAll('.res-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.res-card').forEach(c => {
          c.style.borderColor = '#e4e4e7';
          c.style.background = '#ffffff';
        });
        card.style.borderColor = '#84cc16';
        card.style.background = 'rgba(132, 204, 22, 0.05)';
        selectedRes = card.getAttribute('data-res');
        selectedResCost = parseInt(card.getAttribute('data-cost'), 10);
      });
    });

    const customDurContainer = document.getElementById('custom-duration-container');
    const customDurInput = document.getElementById('custom-duration-input');

    document.querySelectorAll('.dur-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.dur-pill').forEach(p => {
          p.style.borderColor = '#e4e4e7';
          p.style.background = '#ffffff';
        });
        pill.style.borderColor = '#84cc16';
        pill.style.background = 'rgba(132, 204, 22, 0.05)';
        
        const val = pill.getAttribute('data-val');
        if (val === 'Custom') {
          customDurContainer.style.display = 'flex';
          customDurInput.focus();
          const curVal = customDurInput.value.trim();
          selectedDuration = curVal ? (curVal + 's') : '10s';
        } else {
          customDurContainer.style.display = 'none';
          selectedDuration = val;
        }
      });
    });

    customDurInput.addEventListener('input', () => {
      const val = customDurInput.value.trim();
      selectedDuration = val ? (val + 's') : '10s';
    });

    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const title = titleInput.value.trim();
      if (!title) {
        showToast("Please enter a creative video title to begin your project.", "Empty Project Title", false);
        return;
      }

      if (selectedDuration === 'Custom' || (selectedDuration.includes('s') && !['5s', '15s', '30s', '45s', '60s'].includes(selectedDuration))) {
        const secondsVal = parseInt(selectedDuration.replace('s', ''), 10);
        if (isNaN(secondsVal) || secondsVal < 5 || secondsVal > 180) {
          showToast("Custom project duration must be between 5 and 180 seconds.", "Invalid Duration Value", false);
          return;
        }
      }

      const currentCredits = parseInt(localStorage.getItem('pixo_credits') || '200', 10);
      if (currentCredits < selectedResCost) {
        showToast(`Insufficient compute credits (${currentCredits}) for this resolution. Cost: ${selectedResCost} credits. Redeem a code!`, "Insufficient Wallet Balance", false);
        return;
      }

      localStorage.setItem('pixo_credits', (currentCredits - selectedResCost).toString());
      updateCreditsDisplay();

      const randomLoop = LOCAL_VIDEO_LOOPS[Math.floor(Math.random() * LOCAL_VIDEO_LOOPS.length)];
      const newProj = {
        id: 'p_' + Date.now().toString(36),
        title: title,
        date: 'Just Now',
        videoUrl: randomLoop,
        ratio: selectedRatio,
        model: selectedAgent
      };

      const projs = JSON.parse(localStorage.getItem('pixo_projects') || '[]');
      projs.unshift(newProj);
      localStorage.setItem('pixo_projects', JSON.stringify(projs));

      showToast(`Successfully initialized project "${title}"! Deducted -${selectedResCost} credits.`, "New Project Activated");
      closeModal();

      if (window.location.pathname.includes('/projects')) {
        renderProjectsGrid();
      } else {
        window.location.href = "/org-9cbd03fa/projects";
      }
    });
  };

  // ==========================================
  // "THEIRS" MODEL & AGENT SELECTOR INJECTOR
  // ==========================================
  const openTheirsDropdown = (anchorBtn) => {
    const isAgent = currentPromptMode === 'agent';
    if (!isAgent) {
      openModelSelectorDropdown(anchorBtn);
      return;
    }

    // Remove any existing dropdowns first
    document.querySelectorAll('.local-popover, .theirs-popover, .ratio-popover').forEach(p => p.remove());

    const popover = document.createElement('div');
    popover.className = 'theirs-popover';
    
    // Position body-relative to prevent overflow clipping
    const rect = anchorBtn.getBoundingClientRect();
    popover.style.position = 'absolute';
    popover.style.left = `${rect.right + window.scrollX - 380}px`;
    popover.style.top = `${rect.bottom + window.scrollY + 6}px`;
    document.body.appendChild(popover);

    if (isAgent) {
      popover.innerHTML = `
        <div class="theirs-header">Agent</div>
        <div class="theirs-options-grid">
          <div class="theirs-card theirs-opt" data-val="Seedance2 Director">
            <div class="theirs-icon-container">🤖</div>
            <div class="text-left">
              <div class="theirs-title">Seedance2 Director</div>
              <p class="theirs-desc">Our most advanced agent, powered by the latest video model. Beginner-friendly.</p>
            </div>
          </div>
          <div class="theirs-card theirs-opt" data-val="MV Director">
            <div class="theirs-icon-container">🎵</div>
            <div class="text-left">
              <div class="theirs-title">MV Director <span class="theirs-badge-new ml-1">New</span></div>
              <p class="theirs-desc">Turn a song into a music video. Upload an mp3 and the agent designs scenes to your music with Seedance 2.0.</p>
            </div>
          </div>
          <div class="theirs-card theirs-opt" data-val="Cinematic Storyteller">
            <div class="theirs-icon-container">🎬</div>
            <div class="text-left">
              <div class="theirs-title">Cinematic Storyteller</div>
              <p class="theirs-desc">Translate scripts or text stories into fully staged episodic visual scenes.</p>
            </div>
          </div>
        </div>
      `;
    } else {
      popover.innerHTML = `
        <div class="theirs-header">Model</div>
        <div class="theirs-options-grid">
          <div class="theirs-card theirs-opt" data-val="Seedance 2.5 Cinema">
            <div class="theirs-icon-container">⚡</div>
            <div class="text-left">
              <div class="theirs-title">Seedance 2.5 Cinema <span class="theirs-badge-pro ml-1">Pro</span></div>
              <p class="theirs-desc">Ultra-high quality photorealistic generation with perfect physical consistency and lighting.</p>
            </div>
          </div>
          <div class="theirs-card theirs-opt" data-val="Vidu Dynamic">
            <div class="theirs-icon-container">🌊</div>
            <div class="text-left">
              <div class="theirs-title">Vidu Dynamic</div>
              <p class="theirs-desc">Optimized for sweeping camera pans, intense action, and fluid organic simulations.</p>
            </div>
          </div>
          <div class="theirs-card theirs-opt" data-val="Kling Cinema">
            <div class="theirs-icon-container">🎥</div>
            <div class="text-left">
              <div class="theirs-title">Kling Cinema</div>
              <p class="theirs-desc">High temporal coherence, perfect human hand anatomy, and cinematic film grading.</p>
            </div>
          </div>
          <div class="theirs-card theirs-opt" data-val="Hailuo Rapid">
            <div class="theirs-icon-container">🚀</div>
            <div class="text-left">
              <div class="theirs-title">Hailuo Rapid</div>
              <p class="theirs-desc">Ultra-fast synthesis under 10 seconds. Excellent for quick storyboarding.</p>
            </div>
          </div>
          <div class="theirs-card theirs-opt" data-val="Google Veo">
            <div class="theirs-icon-container">🌟</div>
            <div class="text-left">
              <div class="theirs-title">Google Veo</div>
              <p class="theirs-desc">Creative director styling with 4K resolution support and robust stylistic adherence.</p>
            </div>
          </div>
        </div>
      `;
    }

    // Mark current selected card active
    const activeLabel = anchorBtn.textContent.trim();
    popover.querySelectorAll('.theirs-opt').forEach(card => {
      const cardVal = card.getAttribute('data-val');
      if (activeLabel.includes(cardVal) || selectedAgent === cardVal) {
        card.classList.add('active');
        card.style.borderColor = '#84cc16';
        card.style.background = '#f1f8e9';
      }

      card.addEventListener('click', (ev) => {
        ev.stopPropagation();
        
        selectedAgent = cardVal;
        
        // Update Trigger Display
        const svg = anchorBtn.querySelector('svg');
        anchorBtn.innerHTML = '';
        if (svg) anchorBtn.appendChild(svg.cloneNode(true));
        
        // Add text node
        anchorBtn.appendChild(document.createTextNode(` ${cardVal}`));
        
        showToast(`Changed prompt runner mode to: ${cardVal}`, "Workflow Filter Synced");
        popover.classList.remove('active');
        setTimeout(() => popover.remove(), 180);
      });
    });

    setTimeout(() => popover.classList.add('active'), 10);
  };

  // Custom high-fidelity dropdown for aspect ratio format
  const openRatioDropdown = (anchorBtn) => {
    document.querySelectorAll('.local-popover, .theirs-popover, .ratio-popover').forEach(p => p.remove());

    const popover = document.createElement('div');
    popover.className = 'ratio-popover';
    
    // Position body-relative to prevent overflow clipping
    const rect = anchorBtn.getBoundingClientRect();
    popover.style.position = 'absolute';
    popover.style.left = `${rect.left + window.scrollX}px`;
    popover.style.top = `${rect.bottom + window.scrollY + 6}px`;
    document.body.appendChild(popover);

    const currentVal = anchorBtn.textContent.trim();

    popover.innerHTML = `
      <div class="ratio-popover-title">Format</div>
      <div class="ratio-options-row">
        <div class="ratio-card ${currentVal.includes('16:9') ? 'active' : ''}" data-val="16:9">
          <div class="ratio-shape-16-9"></div>
          <span class="ratio-card-label">16:9</span>
        </div>
        <div class="ratio-card ${currentVal.includes('9:16') ? 'active' : ''}" data-val="9:16">
          <div class="ratio-shape-9-16"></div>
          <span class="ratio-card-label">9:16</span>
        </div>
        <div class="ratio-card ${currentVal.includes('1:1') ? 'active' : ''}" data-val="1:1">
          <div class="ratio-shape-1-1"></div>
          <span class="ratio-card-label">1:1</span>
        </div>
      </div>
    `;

    popover.querySelectorAll('.ratio-card').forEach(card => {
      card.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const selectedVal = card.getAttribute('data-val');
        
        // Update button text and keep icon
        const svg = anchorBtn.querySelector('svg');
        anchorBtn.innerHTML = '';
        
        // Dynamic preview icon inside the button
        const iconDiv = document.createElement('div');
        iconDiv.className = 'rounded-sm border-2 border-current mr-1.5';
        if (selectedVal === '16:9') {
          iconDiv.style.width = '16px';
          iconDiv.style.height = '9px';
          iconDiv.style.borderRadius = '2px';
        } else if (selectedVal === '9:16') {
          iconDiv.style.width = '9px';
          iconDiv.style.height = '16px';
          iconDiv.style.borderRadius = '2px';
        } else if (selectedVal === '1:1') {
          iconDiv.style.width = '12px';
          iconDiv.style.height = '12px';
          iconDiv.style.borderRadius = '50%';
        }
        anchorBtn.appendChild(iconDiv);

        // Add text node
        const textSpan = document.createElement('span');
        textSpan.className = 'hidden sm:inline';
        textSpan.textContent = selectedVal;
        anchorBtn.appendChild(textSpan);
        
        if (svg) anchorBtn.appendChild(svg.cloneNode(true));

        showToast(`Changed aspect ratio format to: ${selectedVal}`, "Format Synced");
        popover.classList.remove('active');
        setTimeout(() => popover.remove(), 180);
      });
    });

    setTimeout(() => popover.classList.add('active'), 10);
  };

  // Custom high-fidelity dropdown for Resolution settings
  const openResolutionDropdown = (anchorBtn) => {
    document.querySelectorAll('.local-popover, .theirs-popover, .ratio-popover').forEach(p => p.remove());

    const popover = document.createElement('div');
    popover.className = 'ratio-popover'; // Reuse base styles (shadow, white bg, transitions)
    
    // Position body-relative to prevent overflow clipping
    const rect = anchorBtn.getBoundingClientRect();
    popover.style.position = 'absolute';
    popover.style.left = `${rect.left + window.scrollX}px`;
    popover.style.top = `${rect.bottom + window.scrollY + 6}px`;
    popover.style.width = '240px'; // Exact custom width
    document.body.appendChild(popover);

    const currentVal = anchorBtn.textContent.trim();

    popover.innerHTML = `
      <div class="px-2 py-1.5 font-semibold flex items-center gap-1 text-xs text-muted-foreground" style="color: #71717a; margin-bottom: 8px;">
        <span>Resolution</span>
        <button type="button" aria-label="Multipliers are approximate. Actual cost depends on model and duration." class="inline-flex cursor-help items-center text-muted-foreground/60 hover:text-muted-foreground" style="background:none; border:none; padding:0; cursor:pointer; color: #a1a1aa;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3" style="width:12px; height:12px;"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
        </button>
      </div>
      <div class="flex gap-1.5 p-1" style="display:flex; gap:6px;">
        ${['480p', '720p', '1080p'].map(res => {
          const isActive = currentVal.includes(res);
          const mult = res === '480p' ? 1 : res === '720p' ? 2 : 5;
          const borderStyle = isActive ? 'border-color: #84cc16 !important; background: rgba(132, 204, 22, 0.05) !important;' : 'border-color: #e4e4e7; background: #ffffff;';
          return `
            <button type="button" class="res-card-item" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; padding:8px 4px; border-radius:10px; border:2px solid; cursor:pointer; transition:all 0.15s ease; ${borderStyle}" data-val="${res}">
              <span class="text-xs font-medium" style="font-size:12px; font-weight:600; color:#18181b;">${res}</span>
              <span role="img" class="inline-flex items-center gap-0.5 text-xs tabular-nums" style="display:inline-flex; align-items:center; gap:2px; font-size:11px; color:#eab308; font-weight:600;">
                <svg viewBox="0 0 24 24" aria-hidden="true" class="size-3.5" style="width:14px; height:14px; fill:currentColor;"><circle cx="12" cy="12" r="10" fill="currentColor"></circle><circle cx="12" cy="12" r="7.5" fill="none" stroke="rgba(0, 0, 0, 0.22)" stroke-width="1"></circle><text x="12" y="16.5" text-anchor="middle" font-size="12" font-weight="900" font-family="ui-sans-serif, system-ui, sans-serif" fill="rgba(0, 0, 0, 0.55)">$</text></svg>
                ×${mult}
              </span>
            </button>
          `;
        }).join('')}
      </div>
    `;

    popover.querySelectorAll('.res-card-item').forEach(card => {
      card.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const selectedVal = card.getAttribute('data-val');

        // Update trigger button content
        const svg = anchorBtn.querySelector('svg');
        anchorBtn.innerHTML = '';
        if (svg) anchorBtn.appendChild(svg.cloneNode(true));
        
        const textSpan = document.createElement('span');
        textSpan.textContent = selectedVal;
        anchorBtn.appendChild(textSpan);
        
        showToast(`Changed generation resolution limit to: ${selectedVal}`, "Resolution Settings Updated");
        popover.classList.remove('active');
        setTimeout(() => popover.remove(), 180);
      });
      
      // Hover effects
      if (!card.style.background.includes('rgba')) {
        card.addEventListener('mouseenter', () => { card.style.borderColor = '#cbd5e1'; card.style.background = '#f8fafc'; });
        card.addEventListener('mouseleave', () => { card.style.borderColor = '#e4e4e7'; card.style.background = '#ffffff'; });
      }
    });

    setTimeout(() => popover.classList.add('active'), 10);
  };

  // Custom high-fidelity dropdown for Duration settings
  const openDurationDropdown = (anchorBtn) => {
    window.activeDurationAnchor = anchorBtn;
    document.querySelectorAll('.local-popover, .theirs-popover, .ratio-popover').forEach(p => p.remove());

    const popover = document.createElement('div');
    popover.className = 'ratio-popover'; // Reuse base styles (shadow, white bg, transitions)
    
    // Position body-relative to prevent overflow clipping
    const rect = anchorBtn.getBoundingClientRect();
    popover.style.position = 'absolute';
    popover.style.left = `${rect.right + window.scrollX - 360}px`;
    popover.style.top = `${rect.bottom + window.scrollY + 6}px`;
    popover.style.width = '360px'; // Exact custom width
    document.body.appendChild(popover);

    const currentVal = anchorBtn.textContent.trim();

    popover.innerHTML = `
      <div class="px-2 py-1.5 font-semibold text-xs text-muted-foreground" style="color: #71717a; margin-bottom: 8px;">Duration</div>
      <div class="flex flex-wrap gap-1 p-1" style="display:flex; flex-wrap:wrap; gap:6px;">
        ${['Auto', '5s', '15s', '30s', '45s', '60s', 'Custom'].map(dur => {
          const isActive = currentVal.includes(dur) || (dur === 'Auto' && currentVal === 'Auto');
          const borderStyle = isActive ? 'border-color: #84cc16 !important; background: rgba(132, 204, 22, 0.05) !important;' : 'border-color: #e4e4e7; background: #ffffff;';
          return `
            <button type="button" class="dur-card-item" style="flex: 1 0 44px; display:flex; min-height:36px; min-width:44px; align-items:center; justify-content:center; border-2 rounded-lg cursor-pointer transition-all; transition:all 0.15s ease; border-radius:8px; border:2px solid; font-size:12px; font-weight:600; color:#18181b; ${borderStyle}" data-val="${dur}">
              <span>${dur}</span>
            </button>
          `;
        }).join('')}
      </div>
      <!-- Inline Custom Duration Input -->
      <div id="dashboard-custom-duration-container" style="display:none; align-items:center; gap:8px; margin-top:10px; padding:4px 8px;">
        <input type="number" id="dashboard-custom-duration-input" placeholder="e.g. 10" min="5" max="180" style="width:100px; border:1px solid #e4e4e7; border-radius:6px; background:#ffffff; padding:6px 10px; font-size:12px; color:#18181b; outline:none; transition:all 0.15s ease;" />
        <span style="font-size:12px; color:#71717a; font-weight:600; flex:1; text-align:left;">seconds (5-180s)</span>
      </div>
    `;

    const customContainer = popover.querySelector('#dashboard-custom-duration-container');
    const customInput = popover.querySelector('#dashboard-custom-duration-input');

    // Prevent click event in container/input from closing the dropdown popover
    customContainer.addEventListener('click', (ev) => ev.stopPropagation());
    customInput.addEventListener('click', (ev) => ev.stopPropagation());

    // If currently Custom, show the input initially!
    const isCurrentlyCustom = !['Auto', '5s', '15s', '30s', '45s', '60s'].some(d => currentVal.includes(d));
    if (isCurrentlyCustom && currentVal.includes('s')) {
      const secondsVal = parseInt(currentVal.replace('s', ''), 10);
      if (!isNaN(secondsVal)) {
        customInput.value = secondsVal;
      }
      customContainer.style.display = 'flex';
      
      // Mark the Custom button active
      popover.querySelectorAll('.dur-card-item').forEach(c => {
        if (c.getAttribute('data-val') === 'Custom') {
          c.style.borderColor = '#84cc16';
          c.style.background = 'rgba(132, 204, 22, 0.05)';
        } else {
          c.style.borderColor = '#e4e4e7';
          c.style.background = '#ffffff';
        }
      });
    }

    popover.querySelectorAll('.dur-card-item').forEach(card => {
      card.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const selectedVal = card.getAttribute('data-val');

        popover.querySelectorAll('.dur-card-item').forEach(c => {
          c.style.borderColor = '#e4e4e7';
          c.style.background = '#ffffff';
        });
        card.style.borderColor = '#84cc16';
        card.style.background = 'rgba(132, 204, 22, 0.05)';

        if (selectedVal === 'Custom') {
          customContainer.style.display = 'flex';
          customInput.focus();
        } else {
          customContainer.style.display = 'none';
          updateDurationTrigger(selectedVal);
        }
      });
    });

    customInput.addEventListener('input', () => {
      let customSec = parseInt(customInput.value.trim(), 10);
      if (!isNaN(customSec) && customSec >= 5 && customSec <= 180) {
        updateDurationTriggerText(`${customSec}s`);
      }
    });

    customInput.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.stopPropagation();
        let customSec = parseInt(customInput.value.trim(), 10);
        if (isNaN(customSec) || customSec < 5 || customSec > 180) {
          showToast("Please enter a custom duration between 5 and 180 seconds.", "Invalid Duration", false);
          return;
        }
        updateDurationTriggerText(`${customSec}s`);
        popover.classList.remove('active');
        setTimeout(() => popover.remove(), 180);
      }
    });

    function updateDurationTriggerText(val) {
      const svg = anchorBtn.querySelector('svg');
      anchorBtn.innerHTML = '';
      if (svg) anchorBtn.appendChild(svg.cloneNode(true));
      
      const textSpan = document.createElement('span');
      textSpan.textContent = ` ${val}`;
      anchorBtn.appendChild(textSpan);
    }

    function updateDurationTrigger(val) {
      updateDurationTriggerText(val);
      showToast(`Set AI render duration limit to: ${val}`, "Timeline Filter Synced");
      popover.classList.remove('active');
      setTimeout(() => popover.remove(), 180);
    }

    popover.querySelectorAll('.dur-card-item').forEach(card => {
      // Hover effects
      if (!card.style.background.includes('rgba')) {
        card.addEventListener('mouseenter', () => { card.style.borderColor = '#cbd5e1'; card.style.background = '#f8fafc'; });
        card.addEventListener('mouseleave', () => { card.style.borderColor = '#e4e4e7'; card.style.background = '#ffffff'; });
      }
    });

    setTimeout(() => popover.classList.add('active'), 10);
  };

  // ==========================================
  // ATTACH POPUPS TO MODELS/SETTINGS
  // ==========================================
  const attachDropdowns = () => {
    const dropdownConfigs = [
      {
        triggerText: "16:9",
        options: ["16:9", "9:16", "1:1", "2.35:1", "4:3"],
        active: "16:9"
      },
      {
        triggerText: "720p",
        options: ["720p", "1080p", "4K Ultra", "8K IMAX"],
        active: "720p"
      },
      {
        triggerText: "Seedance",
        options: ["Seedance 2.5", "Vidu Dynamic", "Kling Cinema", "Hailuo Rapid", "Google Veo"],
        active: "Seedance2 Director"
      },
      {
        triggerText: "Auto",
        options: ["Auto", "5s", "15s", "30s", "45s", "60s"],
        active: "Auto"
      }
    ];

    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent.trim();
      
      const config = dropdownConfigs.find(c => text.includes(c.triggerText) || (c.triggerText === "Seedance" && text.includes("Director")) || text.includes("Seedance 2.0 Fast"));
      if (!config) return;

      if (btn.classList.contains('local-dropdown-attached')) return;
      btn.classList.add('local-dropdown-attached');

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Clear all active popovers
        document.querySelectorAll('.local-popover, .theirs-popover, .ratio-popover').forEach(p => p.remove());

        // "THEIRS" premium dropdown for Agents and Models
        if (config.triggerText === "Seedance" || text.includes("Director") || text.includes("Seedance 2.0 Fast") || btn.getAttribute('data-testid') === 'model-dropdown-trigger' || btn.id.includes('radix-_r_1f_') || btn.id.includes('radix-_r_12_')) {
          openTheirsDropdown(btn);
          return;
        }

        // Custom high-fidelity Ratio dropdown popover
        if (config.triggerText === "16:9" || btn.id.includes('radix-_r_1h_')) {
          openRatioDropdown(btn);
          return;
        }

        // Custom high-fidelity Resolution dropdown popover
        if (config.triggerText === "720p" || btn.id.includes('radix-_r_1j_')) {
          openResolutionDropdown(btn);
          return;
        }

        // Custom high-fidelity Duration dropdown popover
        if (config.triggerText === "Auto" || btn.id.includes('radix-_r_1l_')) {
          openDurationDropdown(btn);
          return;
        }

        const popover = document.createElement('div');
        popover.className = 'local-popover';
        document.body.appendChild(popover);

        // Position generic popover relative to body coords
        const rect = btn.getBoundingClientRect();
        popover.style.position = 'absolute';
        if (config.triggerText === "Auto") {
          popover.style.width = "310px";
          popover.style.padding = "12px";
          popover.style.left = `${rect.right + window.scrollX - 310}px`;
        } else {
          popover.style.left = `${rect.left + window.scrollX}px`;
        }
        popover.style.top = `${rect.bottom + window.scrollY + 6}px`;

        if (config.triggerText === "Auto") {
          popover.style.display = "flex";
          popover.style.flexDirection = "column";

          popover.innerHTML = `
            <span class="text-xs text-zinc-500 font-semibold mb-2 block uppercase tracking-wider text-left">Duration</span>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;" class="local-duration-popover-row">
              <button class="dur-popover-pill active" style="padding: 5px 12px; border-radius: 9999px; border: 1px solid #a3e635; background: rgba(163,230,53,0.05); color: #a3e635; font-size: 11px; font-weight: 600; cursor: pointer;" data-val="Auto">Auto</button>
              <button class="dur-popover-pill" style="padding: 5px 12px; border-radius: 9999px; border: 1px solid #27272a; background: #09090b; color: #a1a1aa; font-size: 11px; cursor: pointer;" data-val="5s">5s</button>
              <button class="dur-popover-pill" style="padding: 5px 12px; border-radius: 9999px; border: 1px solid #27272a; background: #09090b; color: #a1a1aa; font-size: 11px; cursor: pointer;" data-val="15s">15s</button>
              <button class="dur-popover-pill" style="padding: 5px 12px; border-radius: 9999px; border: 1px solid #27272a; background: #09090b; color: #a1a1aa; font-size: 11px; cursor: pointer;" data-val="30s">30s</button>
              <button class="dur-popover-pill" style="padding: 5px 12px; border-radius: 9999px; border: 1px solid #27272a; background: #09090b; color: #a1a1aa; font-size: 11px; cursor: pointer;" data-val="45s">45s</button>
              <button class="dur-popover-pill" style="padding: 5px 12px; border-radius: 9999px; border: 1px solid #27272a; background: #09090b; color: #a1a1aa; font-size: 11px; cursor: pointer;" data-val="60s">60s</button>
            </div>
          `;

          popover.querySelectorAll('.dur-popover-pill').forEach(pill => {
            pill.addEventListener('click', (ev) => {
              ev.stopPropagation();
              const selected = pill.getAttribute('data-val');
              
              const svg = btn.querySelector('svg');
              btn.innerHTML = '';
              if (svg) btn.appendChild(svg.cloneNode(true));
              btn.appendChild(document.createTextNode(` ${selected}`));

              showToast(`Set AI render duration limit to: ${selected}`, "Timeline Filter Synced");
              popover.classList.remove('active');
              setTimeout(() => popover.remove(), 180);
            });
          });
        } else {
          config.options.forEach(opt => {
            const item = document.createElement('div');
            item.className = `local-popover-item ${btn.textContent.includes(opt) ? 'active' : ''}`;
            item.textContent = opt;
            item.addEventListener('click', (ev) => {
              ev.stopPropagation();
              
              const svg = btn.querySelector('svg');
              btn.innerHTML = '';
              if (svg) btn.appendChild(svg.cloneNode(true));
              btn.appendChild(document.createTextNode(svg ? ` ${opt}` : opt));
              
              showToast(`Changed property mode to: ${opt}`, "Model Synced");
              popover.classList.remove('active');
              setTimeout(() => popover.remove(), 180);
            });
            popover.appendChild(item);
          });
        }

        setTimeout(() => popover.classList.add('active'), 10);
      });
    });

    document.addEventListener('click', () => {
      // Sanitize custom duration input on close if present and visible
      const customInput = document.getElementById('dashboard-custom-duration-input');
      if (customInput && customInput.offsetParent !== null) {
        let customSec = parseInt(customInput.value.trim(), 10);
        if (isNaN(customSec) || customSec < 5 || customSec > 180) {
          const anchor = window.activeDurationAnchor;
          if (anchor) {
            const svg = anchor.querySelector('svg');
            anchor.innerHTML = '';
            if (svg) anchor.appendChild(svg.cloneNode(true));
            const textSpan = document.createElement('span');
            textSpan.textContent = ` 10s`;
            anchor.appendChild(textSpan);
          }
          showToast("Custom duration must be between 5s and 180s. Defaulted to 10s.", "Invalid Duration Value", false);
        } else {
          showToast(`Set AI render duration limit to: ${customSec}s`, "Timeline Filter Synced");
        }
      }

      document.querySelectorAll('.local-popover, .theirs-popover, .ratio-popover').forEach(p => {
        p.classList.remove('active');
        setTimeout(() => { if (p.parentNode) p.remove(); }, 200);
      });
    });
  };

  // ==========================================
  // RENDER DYNAMIC PROJECTS LIST (LOCAL GRID)
  // ==========================================
  const renderProjectsGrid = () => {
    const mainContainer = document.querySelector('.mx-auto.max-w-7xl, [class*="mx-auto max-w-77xl"], [class*="max-w-screen-2xl"] section');
    if (!mainContainer) return;

    const noProjectsPlaceholder = document.querySelector('.py-20.text-center');
    const localProjects = JSON.parse(localStorage.getItem('pixo_projects') || '[]');

    if (localProjects.length === 0) {
      if (noProjectsPlaceholder) noProjectsPlaceholder.style.display = 'flex';
      return;
    }

    if (noProjectsPlaceholder) noProjectsPlaceholder.style.display = 'none';

    let grid = document.getElementById('local-projects-grid');
    if (!grid) {
      grid = document.createElement('div');
      grid.id = 'local-projects-grid';
      grid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full mt-4';
      
      const parent = noProjectsPlaceholder ? noProjectsPlaceholder.parentNode : mainContainer;
      if (noProjectsPlaceholder) {
        parent.insertBefore(grid, noProjectsPlaceholder.nextSibling);
      } else {
        const insertionPoint = parent.querySelector('.grid') || parent;
        insertionPoint.appendChild(grid);
      }
    }

    grid.innerHTML = localProjects.map((p, idx) => `
      <div class="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-300" data-pid="${p.id}">
        <div class="relative aspect-video rounded-lg overflow-hidden bg-black mb-3 border border-zinc-800/80">
          <video src="${p.videoUrl}" muted loop class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 local-preview-vid"></video>
          <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button class="play-project-btn flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 text-black shadow-lg hover:scale-110 transition-all font-bold" data-title="${p.title}" data-url="${p.videoUrl}">▶</button>
          </div>
          <span class="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-zinc-300 font-semibold tracking-wider uppercase">${p.ratio}</span>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-semibold text-white truncate pr-6 mb-1" title="${p.title}">${p.title}</h4>
          <div class="flex items-center justify-between text-[11px] text-zinc-500">
            <span>${p.model}</span>
            <span>${p.date}</span>
          </div>
        </div>
        <button class="delete-project-btn absolute top-3 right-3 opacity-0 group-hover:opacity-100 h-6 w-6 rounded-md bg-zinc-950/80 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center text-xs" data-id="${p.id}">&times;</button>
      </div>
    `).join('');

    grid.querySelectorAll('.local-preview-vid').forEach(vid => {
      vid.parentNode.addEventListener('mouseenter', () => vid.play().catch(() => {}));
      vid.parentNode.addEventListener('mouseleave', () => { vid.pause(); vid.currentTime = 0; });
    });

    grid.querySelectorAll('.play-project-btn').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        openVideoPlayerModal(el.getAttribute('data-title'), el.getAttribute('data-url'));
      });
    });

    grid.querySelectorAll('.delete-project-btn').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = el.getAttribute('data-id');
        let projs = JSON.parse(localStorage.getItem('pixo_projects') || '[]');
        projs = projs.filter(x => x.id !== id);
        localStorage.setItem('pixo_projects', JSON.stringify(projs));
        showToast("Project deleted from local sandbox database.", "Project Removed");
        renderProjectsGrid();
      });
    });
  };

  // ==========================================
  // RENDER / UDPATE GENERATION TASKS LIST
  // ==========================================
  const renderTasksDropdown = (popover) => {
    const tasks = JSON.parse(localStorage.getItem('pixo_tasks') || '[]');
    const tasksList = popover.querySelector('.local-tasks-list');
    
    if (!tasksList) return;

    if (tasks.length === 0) {
      tasksList.innerHTML = `<div class="py-8 text-center text-zinc-600 text-xs">No active or recent renders.</div>`;
      return;
    }

    tasksList.innerHTML = tasks.map(t => {
      const isRendering = t.status === 'rendering';
      return `
        <div class="p-2 border border-zinc-800 rounded bg-zinc-900/40 space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-zinc-300 truncate max-w-[180px]">${t.prompt}</span>
            <span class="text-[10px] ${isRendering ? 'text-lime-400' : 'text-zinc-500'} font-semibold">
              ${isRendering ? `${t.progress}%` : 'Done'}
            </span>
          </div>
          ${isRendering ? `
            <div class="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
              <div class="bg-lime-400 h-full" style="width: ${t.progress}%"></div>
            </div>
          ` : `
            <div class="flex justify-between items-center text-[10px] text-zinc-500">
              <span>${t.model} · ${t.ratio}</span>
              <button class="play-task-btn text-lime-400 hover:text-lime-300 font-bold" data-title="${t.prompt}" data-url="${t.videoUrl}">Play Loop 🎬</button>
            </div>
          `}
        </div>
      `;
    }).join('');

    // Attach play loop triggers
    tasksList.querySelectorAll('.play-task-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openVideoPlayerModal(btn.getAttribute('data-title'), btn.getAttribute('data-url'));
      });
    });
  };

  // ==========================================
  // RUN SIMULATED AI VIDEO GENERATION
  // ==========================================
  const triggerAiGeneration = (prompt) => {
    // 1. Check/Deduct Credits
    const currentCredits = parseInt(localStorage.getItem('pixo_credits') || '200', 10);
    if (currentCredits < 10) {
      showToast("Insufficient credits in local compute ledger. Redeem a voucher code first!", "Insufficient Balance", false);
      return;
    }
    localStorage.setItem('pixo_credits', (currentCredits - 10).toString());
    updateCreditsDisplay();

    // 2. Setup task object
    const taskId = 't_' + Date.now().toString(36);
    
    // Determine active model and ratio dynamically based on workspace mode
    const isModel = currentPromptMode === 'model';
    const activeModelName = isModel ? activeModelSelected : (selectedAgent || "Seedance2 Director");
    
    let activeRatio = '16:9';
    if (isModel) {
      activeRatio = activeModelAspectRatio;
    } else {
      const ratioBtn = document.querySelector('[id*="radix-_r_1h_"]');
      if (ratioBtn) activeRatio = ratioBtn.textContent.trim();
    }

    const newJob = {
      id: taskId,
      prompt: prompt,
      model: activeModelName,
      ratio: activeRatio,
      progress: 0,
      status: 'rendering',
      videoUrl: LOCAL_VIDEO_LOOPS[Math.floor(Math.random() * LOCAL_VIDEO_LOOPS.length)],
      date: 'Just Now'
    };

    let tasks = JSON.parse(localStorage.getItem('pixo_tasks') || '[]');
    tasks.unshift(newJob);
    localStorage.setItem('pixo_tasks', JSON.stringify(tasks));

    // Show panel bottom right
    let genPanel = document.querySelector('.gen-panel');
    if (!genPanel) {
      genPanel = document.createElement('div');
      genPanel.className = 'gen-panel';
      document.body.appendChild(genPanel);
    }

    genPanel.innerHTML = `
      <div class="p-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
        <h4 class="text-xs font-bold text-lime-400 uppercase tracking-wider flex items-center gap-2">
          <span class="inline-block w-3.5 h-3.5 local-spinner"></span>
          AI Video Rendering
        </h4>
        <span id="gen-pct" class="text-xs font-semibold text-lime-400">0%</span>
      </div>
      <div class="p-4 space-y-3">
        <p class="text-xs font-medium text-white truncate">Prompt: <span class="text-zinc-300 font-normal">"${prompt}"</span></p>
        <div class="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
          <div id="gen-bar" class="bg-lime-400 h-full w-[0%] transition-all duration-300"></div>
        </div>
        <p id="gen-status-text" class="text-[10px] text-zinc-500 italic">Initiating neural pipeline...</p>
      </div>
    `;

    genPanel.classList.add('active');

    let pct = 0;
    const bar = document.getElementById('gen-bar');
    const pctLabel = document.getElementById('gen-pct');
    const statusText = document.getElementById('gen-status-text');

    const steps = [
      { max: 20, text: "Allocating GPU node in high-performance cluster..." },
      { max: 40, text: "Decomposing prompt into cinematic storyboards..." },
      { max: 65, text: "Synthesizing dynamic 24fps visual frames (Pixo v2.5)..." },
      { max: 85, text: "Super-resolving output and compiling pixel pipeline..." },
      { max: 100, text: "Assembling finished high-fidelity MP4 loop..." }
    ];

    const timer = setInterval(() => {
      pct += Math.floor(Math.random() * 8) + 4;
      
      // Keep track of tasks in localStorage
      tasks = JSON.parse(localStorage.getItem('pixo_tasks') || '[]');
      const activeJob = tasks.find(j => j.id === taskId);

      if (pct >= 100) {
        pct = 100;
        clearInterval(timer);
        
        if (activeJob) {
          activeJob.progress = 100;
          activeJob.status = 'completed';
          localStorage.setItem('pixo_tasks', JSON.stringify(tasks));
        }

        // Add to project files
        const projs = JSON.parse(localStorage.getItem('pixo_projects') || '[]');
        const newProj = {
          id: 'p_' + Date.now().toString(36),
          title: prompt,
          date: 'Just Now',
          videoUrl: newJob.videoUrl,
          ratio: activeRatio,
          model: activeModelName
        };
        projs.unshift(newProj);
        localStorage.setItem('pixo_projects', JSON.stringify(projs));

        setTimeout(() => {
          genPanel.classList.remove('active');
          showToast("🎬 Dynamic project compiled! Play the loop now.", "AI Creation Complete!");
          
          renderProjectsGrid();
        }, 800);
      } else {
        if (activeJob) {
          activeJob.progress = pct;
          localStorage.setItem('pixo_tasks', JSON.stringify(tasks));
        }
      }

      if (bar) bar.style.width = pct + '%';
      if (pctLabel) pctLabel.textContent = pct + '%';

      const activeStep = steps.find(s => pct <= s.max);
      if (activeStep && statusText) statusText.textContent = activeStep.text;

      // Update dropdown list live if visible
      const openTasksPopover = document.querySelector('.local-tasks-popover.active');
      if (openTasksPopover) renderTasksDropdown(openTasksPopover);

    }, 350);
  };

  // ==========================================
  // ATTACH CORE EVENT BINDINGS
  // ==========================================
  const initializeInteractivity = () => {
    injectStyles();
    updateCreditsDisplay();
    attachDropdowns();
    renderProjectsGrid();

    // 1. Sidebar Nav "New Project" + Dashboard creations "New Project" + Projects page "New Project" buttons
    const newProjButtons = [];
    document.querySelectorAll('[aria-label="New Project"], [aria-label="Create New Project"]').forEach(el => newProjButtons.push(el));
    document.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.trim().includes('New Project') || btn.textContent.trim() === 'New Project') {
        newProjButtons.push(btn);
      }
    });

    newProjButtons.forEach(el => {
      if (el.classList.contains('local-new-proj-attached')) return;
      el.classList.add('local-new-proj-attached');

      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openCreateProjectModal();
      });
    });

    // 2. Redeem code buttons
    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent.trim();
      if (text.toLowerCase().includes('redeem')) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          openRedeemModal();
        });
      }
    });

    // 3. Get Credits / Credit pill buttons
    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent.trim();
      if (text.toLowerCase().includes('get credits')) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          openGetCreditsModal();
        });
      }
    });
    
    const pill = document.querySelector('[data-testid="credit-pill"]');
    if (pill) {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openGetCreditsModal();
      });
    }

    // 4. Prompt Form Submissions (Dashboard textarea prompt bar)
    const textarea = document.querySelector('textarea[name="message"]');
    const submitBtn = document.querySelector('button[type="submit"]');

    if (textarea && submitBtn) {
      const handleSubmission = () => {
        const val = textarea.value.trim();
        if (!val) {
          showToast("Please enter a creative video prompt to compile.", "Empty Prompt", false);
          return;
        }

        textarea.value = '';
        triggerAiGeneration(val);
      };

      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSubmission();
      });

      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSubmission();
        }
      });
    }

    // 5. Playground TipTap contenteditable and Submit button
    const tiptapEditor = document.querySelector('.tiptap.ProseMirror');
    const playgroundSubmit = document.querySelector('[data-testid="generate-button"]');
    const tiptapPlaceholder = document.querySelector('.pointer-events-none.absolute.inset-0.text-muted-foreground\\/50');

    if (tiptapEditor && playgroundSubmit) {
      const updatePlaygroundSubmitState = () => {
        const hasText = tiptapEditor.textContent.trim().length > 0 || promptAttachments.firstFrame || promptAttachments.references.length > 0;
        if (hasText) {
          playgroundSubmit.removeAttribute('disabled');
          playgroundSubmit.setAttribute('data-ready', 'true');
          playgroundSubmit.classList.remove('bg-muted-foreground', 'text-background');
          playgroundSubmit.classList.add('bg-lime-400', 'text-black', 'hover:bg-lime-300', 'scale-105');
          if (tiptapPlaceholder) tiptapPlaceholder.style.display = 'none';
        } else {
          playgroundSubmit.setAttribute('disabled', 'true');
          playgroundSubmit.removeAttribute('data-ready');
          playgroundSubmit.classList.add('bg-muted-foreground', 'text-background');
          playgroundSubmit.classList.remove('bg-lime-400', 'text-black', 'hover:bg-lime-300', 'scale-105');
          if (tiptapPlaceholder) tiptapPlaceholder.style.display = 'block';
        }
      };

      tiptapEditor.addEventListener('input', updatePlaygroundSubmitState);
      tiptapEditor.addEventListener('keyup', updatePlaygroundSubmitState);

      tiptapEditor.addEventListener('focus', () => {
        if (tiptapPlaceholder) tiptapPlaceholder.style.display = 'none';
      });
      tiptapEditor.addEventListener('blur', () => {
        if (tiptapEditor.textContent.trim().length === 0 && !promptAttachments.firstFrame && promptAttachments.references.length === 0) {
          if (tiptapPlaceholder) tiptapPlaceholder.style.display = 'block';
        }
      });

      // Submit prompt on click
      playgroundSubmit.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const text = tiptapEditor.textContent.trim();
        if (!text && !promptAttachments.firstFrame && promptAttachments.references.length === 0) return;

        let finalPrompt = text || "Reference Guided Render";
        tiptapEditor.innerHTML = '<p><br class="ProseMirror-trailingBreak"></p>';
        
        // Remove attachment bar
        const attBar = document.getElementById('playground-attachments-bar');
        if (attBar) attBar.remove();
        promptAttachments = { firstFrame: null, references: [] };

        updatePlaygroundSubmitState();
        triggerAiGeneration(finalPrompt);
      });

      tiptapEditor.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          playgroundSubmit.click();
        }
      });
    }

    // 6. Language selectors
    document.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.includes('English') || btn.textContent.includes('Select language')) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          document.querySelectorAll('.local-popover, .theirs-popover').forEach(p => p.classList.remove('active'));

          let popover = btn.querySelector('.local-popover');
          if (!popover) {
            popover = document.createElement('div');
            popover.className = 'local-popover';
            btn.appendChild(popover);

            const langs = [
              { name: "🇺🇸 English", href: "/index.html" },
              { name: "🇨🇳 简体中文", href: "/zh.html" },
              { name: "🇪🇸 Español", href: "/es.html" },
              { name: "🇫🇷 Français", href: "/fr.html" },
              { name: "🇯🇵 日本語", href: "/ja.html" }
            ];

            langs.forEach(lang => {
              const item = document.createElement('div');
              item.className = 'local-popover-item';
              item.textContent = lang.name;
              item.addEventListener('click', (ev) => {
                ev.stopPropagation();
                window.location.href = lang.href;
              });
              popover.appendChild(item);
            });
          }
          popover.classList.toggle('active');
        });
      }
    });

    // 7. User avatar click
    document.querySelectorAll('button').forEach(btn => {
      if (btn.classList && btn.classList.contains('bg-muted') && btn.classList.contains('rounded-full') && !btn.textContent.includes('Credits')) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          document.querySelectorAll('.local-popover, .theirs-popover').forEach(p => p.classList.remove('active'));

          let popover = btn.querySelector('.local-popover');
          if (!popover) {
            popover = document.createElement('div');
            popover.className = 'local-popover';
            popover.style.right = '0';
            popover.style.top = '100%';
            btn.style.position = 'relative';
            btn.appendChild(popover);

            const menuItems = [
              { name: "👤 Logged in as Hutao", class: "font-semibold text-white pointer-events-none" },
              { name: "⚙️ Profile Settings", action: () => window.location.href = "/org-9cbd03fa/settings" },
              { name: "💳 Billing (Local ledger)", action: () => openGetCreditsModal() },
              { name: "🚪 Sign Out", action: () => window.location.href = "/auth/sign-in.html" }
            ];

            menuItems.forEach(mi => {
              const item = document.createElement('div');
              item.className = `local-popover-item ${mi.class || ''}`;
              item.textContent = mi.name;
              if (mi.action) {
                item.addEventListener('click', (ev) => {
                  ev.stopPropagation();
                  mi.action();
                });
              }
              popover.appendChild(item);
            });
          }
          popover.classList.toggle('active');
        });
      }
    });

    // 8. Workspace selector ("My Projects" with folder-kanban)
    document.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.includes('My Projects') && btn.querySelector('svg')) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          document.querySelectorAll('.local-popover, .theirs-popover').forEach(p => p.classList.remove('active'));

          let popover = btn.querySelector('.local-popover');
          if (!popover) {
            popover = document.createElement('div');
            popover.className = 'local-popover';
            popover.style.left = '0';
            popover.style.top = '100%';
            btn.style.position = 'relative';
            btn.appendChild(popover);

            const workspaces = [
              "My Projects",
              "Hutao's Creative Lab",
              "Collaborative Org",
              "Personal Studio"
            ];

            workspaces.forEach(w => {
              const item = document.createElement('div');
              const activeVal = localStorage.getItem('pixo_active_workspace') || 'My Projects';
              item.className = `local-popover-item ${w === activeVal ? 'active text-lime-400 font-bold' : ''}`;
              item.textContent = w;
              item.addEventListener('click', (ev) => {
                ev.stopPropagation();
                localStorage.setItem('pixo_active_workspace', w);
                
                const textNode = btn.querySelector('span');
                if (textNode) textNode.textContent = w;

                showToast(`Switched workspace directory to "${w}"`, "Organization Active");
                popover.classList.remove('active');
              });
              popover.appendChild(item);
            });
          }
          popover.classList.toggle('active');
        });
      }
    });

    // 9. Theme / Dark Mode toggle
    const themeBtn = document.querySelector('[aria-label="Dark mode"]');
    if (themeBtn) {
      themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const theme = localStorage.getItem('pixo_theme') === 'dark' ? 'light' : 'dark';
        localStorage.setItem('pixo_theme', theme);
        
        if (theme === 'dark') {
          document.documentElement.classList.remove('light');
          document.documentElement.classList.add('dark');
          document.documentElement.style.colorScheme = 'dark';
          showToast("Simulated light mode deactivated. Dark zinc themes restored.", "Dark Mode Restored");
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
          document.documentElement.style.colorScheme = 'light';
          showToast("Simulated dark theme deactivated. Contrast elements visible.", "Light Mode Activated");
        }
      });
    }

    // 10. Generation Tasks (Cog / gear button in top header)
    const taskBtn = document.querySelector('[aria-label="Generation tasks"]');
    if (taskBtn) {
      taskBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.local-popover, .theirs-popover').forEach(p => p.classList.remove('active'));

        let popover = taskBtn.querySelector('.local-popover');
        if (!popover) {
          popover = document.createElement('div');
          popover.className = 'local-popover local-tasks-popover';
          popover.style.right = '0';
          popover.style.top = '100%';
          taskBtn.style.position = 'relative';
          taskBtn.appendChild(popover);

          popover.innerHTML = `
            <div class="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2 p-1">
              <h4 class="text-xs font-bold text-zinc-400 uppercase tracking-wider">Generation Tasks</h4>
              <button class="clear-tasks-btn text-[10px] text-zinc-500 hover:text-red-400 cursor-pointer">Clear All</button>
            </div>
            <div class="space-y-2 max-h-60 overflow-y-auto local-tasks-list p-1">
              <!-- Tasks go here -->
            </div>
          `;

          popover.querySelector('.clear-tasks-btn').addEventListener('click', (ev) => {
            ev.stopPropagation();
            localStorage.setItem('pixo_tasks', JSON.stringify([]));
            renderTasksDropdown(popover);
            showToast("Cleared recent task logs.", "Tasks Cleared");
          });
        }
        
        renderTasksDropdown(popover);
        popover.classList.toggle('active');
      });
    }

    // 11. Interactive Gallery Star / Like / Play
    document.querySelectorAll('.group.relative.w-full.cursor-pointer, [class*="community-scene"] .group').forEach(card => {
      const likeBtn = card.querySelector('button:has(.lucide-heart)');
      const starBtn = card.querySelector('button:has(.lucide-star)');
      const videoEl = card.querySelector('video');

      if (likeBtn) {
        likeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const heartSvg = likeBtn.querySelector('svg');
          const countSpan = likeBtn.querySelector('span');
          let count = parseInt(countSpan.textContent, 10);

          if (likeBtn.classList.contains('text-rose-400')) {
            likeBtn.classList.remove('text-rose-400');
            heartSvg.classList.remove('fill-rose-400');
            count--;
          } else {
            likeBtn.classList.add('text-rose-400');
            heartSvg.classList.add('fill-rose-400');
            count++;
            showToast("Liked creation! Added to your community bookmarks.", "Creation Liked ❤️");
          }
          countSpan.textContent = count.toString();
        });
      }

      if (starBtn) {
        starBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const starSvg = starBtn.querySelector('svg');
          const countSpan = starBtn.querySelector('span');
          let count = parseInt(countSpan.textContent, 10);

          if (starBtn.classList.contains('text-amber-400')) {
            starBtn.classList.remove('text-amber-400');
            starSvg.classList.remove('fill-amber-400');
            count--;
          } else {
            starBtn.classList.add('text-amber-400');
            starSvg.classList.add('fill-amber-400');
            count++;
            showToast("Added to favorites ledger!", "Added to Favorites ⭐");
          }
          countSpan.textContent = count.toString();
        });
      }

      // Clicking on card triggers full screen preview
      card.addEventListener('click', () => {
        if (videoEl) {
          const title = card.querySelector('p.truncate') ? card.querySelector('p.truncate').textContent : "Dynamic Creation";
          openVideoPlayerModal(title, videoEl.getAttribute('src'));
        }
      });
      
      // Force play video on card hover
      card.addEventListener('mouseenter', () => {
        if (videoEl) {
          videoEl.style.opacity = '1';
          videoEl.play().catch(() => {});
        }
      });
      card.addEventListener('mouseleave', () => {
        if (videoEl) {
          videoEl.style.opacity = '0';
          videoEl.pause();
          videoEl.currentTime = 0;
        }
      });
    });

    // 12. Create Hidden Image Uploader
    let fileInput = document.getElementById('local-image-uploader');
    if (!fileInput) {
      fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.id = 'local-image-uploader';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
    }

    const firstFrameSlot = document.querySelector('[data-testid="first-frame-slot"]');
    const referenceSlot = document.querySelector('[data-testid="reference-add-button"]');

    if (firstFrameSlot && tiptapEditor) {
      firstFrameSlot.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        fileInput.onchange = (ev) => {
          const file = ev.target.files[0];
          if (!file) return;

          const fakeUrl = URL.createObjectURL(file);
          promptAttachments.firstFrame = { name: file.name, url: fakeUrl };
          showToast(`Attached image "${file.name}" as First Frame.`, "Attachment Ready");
          renderAttachmentsBar();
        };
        fileInput.click();
      });
    }

    if (referenceSlot && tiptapEditor) {
      referenceSlot.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        fileInput.onchange = (ev) => {
          const file = ev.target.files[0];
          if (!file) return;

          const fakeUrl = URL.createObjectURL(file);
          promptAttachments.references.push({ name: file.name, url: fakeUrl });
          showToast(`Attached image "${file.name}" as Reference asset.`, "Attachment Ready");
          renderAttachmentsBar();
        };
        fileInput.click();
      });
    }

    const renderAttachmentsBar = () => {
      let attBar = document.getElementById('playground-attachments-bar');
      if (!attBar) {
        attBar = document.createElement('div');
        attBar.id = 'playground-attachments-bar';
        attBar.className = 'local-attachments-bar';
        
        const promptWrapper = tiptapEditor.closest('.group\\/input-group');
        if (promptWrapper) {
          promptWrapper.insertBefore(attBar, promptWrapper.firstChild);
        }
      }

      attBar.innerHTML = '';

      if (promptAttachments.firstFrame) {
        const chip = document.createElement('div');
        chip.className = 'local-attachment-chip';
        chip.innerHTML = `
          <img src="${promptAttachments.firstFrame.url}" />
          <span><b>First Frame:</b> ${promptAttachments.firstFrame.name}</span>
          <button class="remove-att-btn text-zinc-500 hover:text-white font-bold ml-1" data-type="first">&times;</button>
        `;
        chip.querySelector('.remove-att-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          promptAttachments.firstFrame = null;
          chip.remove();
          checkEmptyAttachments();
        });
        attBar.appendChild(chip);
      }

      promptAttachments.references.forEach((ref, idx) => {
        const chip = document.createElement('div');
        chip.className = 'local-attachment-chip';
        chip.innerHTML = `
          <img src="${ref.url}" />
          <span><b>Ref #${idx+1}:</b> ${ref.name}</span>
          <button class="remove-att-btn text-zinc-500 hover:text-white font-bold ml-1" data-type="ref" data-idx="${idx}">&times;</button>
        `;
        chip.querySelector('.remove-att-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          promptAttachments.references.splice(idx, 1);
          renderAttachmentsBar();
          checkEmptyAttachments();
        });
        attBar.appendChild(chip);
      });

      if (typeof playgroundSubmit !== 'undefined' && playgroundSubmit) {
        playgroundSubmit.removeAttribute('disabled');
        playgroundSubmit.setAttribute('data-ready', 'true');
        playgroundSubmit.classList.remove('bg-muted-foreground', 'text-background');
        playgroundSubmit.classList.add('bg-lime-400', 'text-black', 'hover:bg-lime-300', 'scale-105');
        if (tiptapPlaceholder) tiptapPlaceholder.style.display = 'none';
      }
    };

    const checkEmptyAttachments = () => {
      const attBar = document.getElementById('playground-attachments-bar');
      if (!promptAttachments.firstFrame && promptAttachments.references.length === 0) {
        if (attBar) attBar.remove();
        if (tiptapEditor && tiptapEditor.textContent.trim().length === 0) {
          if (playgroundSubmit) {
            playgroundSubmit.setAttribute('disabled', 'true');
            playgroundSubmit.removeAttribute('data-ready');
            playgroundSubmit.classList.add('bg-muted-foreground', 'text-background');
            playgroundSubmit.classList.remove('bg-lime-400', 'text-black', 'hover:bg-lime-300', 'scale-105');
          }
          if (tiptapPlaceholder) tiptapPlaceholder.style.display = 'block';
        }
      }
    };

    // 13. Pixo Partnership modal
    const partnershipBtn = document.querySelector('[aria-label*="Partnership Program"]');
    if (partnershipBtn) {
      partnershipBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const formHtml = `
          <p class="text-xs text-zinc-400 mb-4">Apply for exclusive perks, free computing credits, and commercial distribution exposure.</p>
          <div class="space-y-4">
            <div>
              <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Email Address</label>
              <input type="email" id="partner-email" value="hutao@example.com" class="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-lime-400" />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Portfolio or Social Handle</label>
              <input type="text" id="partner-portfolio" placeholder="https://vimeo.com/my-work" class="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-lime-400" />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Primary Tool Category</label>
              <select id="partner-category" class="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-lime-400">
                <option>Cinematic Short Films</option>
                <option>Social Media Marketing</option>
                <option>3D Product Visualizations</option>
                <option>Music Videos</option>
              </select>
            </div>
            <button id="partner-submit-btn" class="w-full rounded-lg bg-lime-400 text-black py-2.5 text-sm font-semibold hover:bg-lime-300 transition-all mt-2">Submit Application</button>
          </div>
        `;
        createModal("Apply for Partnership", formHtml);

        document.getElementById('partner-submit-btn').addEventListener('click', () => {
          const submitBtn = document.getElementById('partner-submit-btn');
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<span class="inline-block w-4 h-4 local-spinner mr-2"></span>Submitting...`;

          setTimeout(() => {
            showToast("Your creator credentials have been authorized!", "Application Approved ✅");
            
            const current = parseInt(localStorage.getItem('pixo_credits') || '200', 10);
            localStorage.setItem('pixo_credits', (current + 500).toString());
            updateCreditsDisplay();

            closeModal();
          }, 1500);
        });
      });
    }

    // 14. INBOUND TAB SELECTOR (Agent vs Model toggle listener)
    document.querySelectorAll('[role="tab"]').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const tabText = tab.textContent.trim().toLowerCase();
        currentPromptMode = tabText; // Update global state
        
        // Remove selection state visual from sibling tabs
        const list = tab.closest('[role="tablist"]');
        if (list) {
          list.querySelectorAll('[role="tab"]').forEach(t => {
            t.setAttribute('aria-selected', 'false');
            t.className = "relative rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring text-muted-foreground hover:text-foreground";
            const indicator = t.querySelector('.absolute');
            if (indicator) indicator.remove();
          });
        }

        // Set this active
        tab.setAttribute('aria-selected', 'true');
        tab.className = "relative rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring text-foreground";
        
        const backgroundSpan = document.createElement('span');
        backgroundSpan.className = "absolute inset-0 rounded-md bg-card shadow-sm";
        backgroundSpan.style.opacity = "1";
        tab.insertBefore(backgroundSpan, tab.firstChild);

        // Dismiss any open popovers on mode switch
        document.querySelectorAll('.local-popover, .theirs-popover, .ratio-popover').forEach(p => p.remove());

        // Toggle the entire Prompt toolbar between Agent and Model visual layouts
        toggleModelModeUI(tabText === 'model');

        showToast(`Switched input compilation mode to: ${tabText.toUpperCase()}`, "Prompt Workspace Updated");
      });
    });

    // Run layout toggle initialization on load
    toggleModelModeUI(currentPromptMode === 'model');
  };

  // Run on startup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeInteractivity);
  } else {
    initializeInteractivity();
  }

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
