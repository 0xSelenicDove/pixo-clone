/**
 * Pixo Clone - Local Interactivity Script
 * Adds premium, high-fidelity interactivity to the scraped static pages:
 * 1. PERSISTENT LOCAL CREDITS: Manage and increase credits via local storage.
 * 2. PROMO CODE REDEEM DIALOG: Input codes like PIXO500, OPENCLAW, or HUTAO for custom credits.
 * 3. GET CREDITS PRICING DIALOG: Interactive tiers with simulated secure checkout.
 * 4. INTERACTIVE SETTINGS DROPDOWNS: Toggle model types, ratios (16:9/9:16/1:1), qualities, and audio narrator modes with instant visual feedback.
 * 5. SIMULATED AI GENERATION: Entering a prompt in the textarea and clicking Submit triggers a beautiful dynamic progress bar (0% -> 100%) showing actual GPU render pipeline status.
 * 6. DYNAMIC PROJECTS GRID: Generates and updates high-quality playable video project cards inside your projects directory, backed by localStorage and real loopable video files!
 */

(function () {
  // Ensure we force dark mode styles since Next.js runtime scripts were stripped
  document.documentElement.classList.remove('light');
  document.documentElement.classList.add('dark');
  document.documentElement.style.colorScheme = 'dark';

  // Ensure we initialize localStorage values
  if (!localStorage.getItem('pixo_credits')) {
    localStorage.setItem('pixo_credits', '200');
  }
  if (!localStorage.getItem('pixo_projects')) {
    localStorage.setItem('pixo_projects', JSON.stringify([]));
  }

  // Pre-configured list of beautiful local video loops for dynamic rendering
  const LOCAL_VIDEO_LOOPS = [
    '/scraped-assets/pixo.video/videos/seedance2/gallery-product-ad.mp4',
    '/scraped-assets/pixo.video/videos/seedance2/gallery-social-media.mp4',
    '/scraped-assets/pixo.video/videos/seedance2/gallery-short-film.mp4',
    '/scraped-assets/pixo.video/videos/feature-video-series.mp4',
    '/scraped-assets/pixo.video/videos/feature-ai-agents.mp4',
    '/scraped-assets/pixo.video/videos/feature-team-collab.mp4'
  ];

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
      .local-modal-overlay.active .local-modal-container { transform: scale(1); }
      
      /* Dropdown Popovers */
      .local-popover {
        position: absolute; background: #18181b; border: 1px solid #27272a; border-radius: 8px;
        padding: 4px; z-index: 10001; min-width: 160px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
        opacity: 0; transform: translateY(4px); pointer-events: none; transition: all 0.15s ease;
      }
      .local-popover.active { opacity: 1; transform: translateY(0); pointer-events: auto; }
      .local-popover-item {
        display: flex; align-items: center; width: 100%; padding: 6px 12px; font-size: 13px; color: #a1a1aa;
        border-radius: 4px; cursor: pointer; text-align: left; transition: all 0.1s;
      }
      .local-popover-item:hover { background: #27272a; color: #ffffff; }
      .local-popover-item.active { background: #3f3f46; color: #ffffff; font-weight: 500; }

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

      /* Quick Animations */
      @keyframes localSpinner {
        to { transform: rotate(360deg); }
      }
      .local-spinner {
        animation: localSpinner 0.8s linear infinite;
        border-radius: 50%; border: 2.5px solid rgba(255,255,255,0.1); border-top-color: #a3e635;
      }
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
    setTimeout(() => toast.classList.add('active'), 50);
    setTimeout(() => toast.classList.remove('active'), 4000);
  };

  // ==========================================
  // MODAL INJECTOR (REDEEM / PRICING / VIDEO)
  // ==========================================
  const createModal = (title, contentHTML, isWide = false) => {
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
      <div class="local-modal-container ${isWide ? 'wide' : ''}">
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
          // Accept anything for a high-fidelity mock experience!
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
        document.querySelector('.tier-option').parentNode.style.display = 'none';
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

  // Open Create New Project Modal (Image 3 design!)
  const openCreateProjectModal = () => {
    const content = `
      <div class="space-y-5" style="max-height: 85vh; overflow-y: auto; padding-right: 4px;">
        <!-- Project Type Selection -->
        <div>
          <label class="block text-[11px] font-bold text-zinc-400 tracking-wider uppercase mb-2">Project Type</label>
          <div class="grid grid-cols-2 gap-3">
            <div id="type-video" class="flex items-center gap-3 p-3 rounded-xl border border-lime-400 bg-lime-400/5 cursor-pointer hover:bg-lime-400/10 transition-all project-type-card active" data-type="Video">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-lime-400/10 text-lime-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clapperboard"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>
              </div>
              <div>
                <div class="text-sm font-semibold text-white">Video</div>
                <div class="text-[11px] text-zinc-400">Single video, one timeline</div>
              </div>
            </div>
            <div id="type-series" class="flex items-center gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/40 cursor-pointer hover:bg-zinc-800/50 transition-all project-type-card" data-type="Series">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layers"><path d="m12 3-10 9h3v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8h3L12 3z"/></svg>
              </div>
              <div>
                <div class="text-sm font-semibold text-zinc-300">Series</div>
                <div class="text-[11px] text-zinc-500">Multiple episodes</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Video Title -->
        <div>
          <label class="block text-[11px] font-bold text-zinc-400 tracking-wider uppercase mb-1.5">Video Title</label>
          <input type="text" id="new-proj-title" placeholder="e.g. Summer Campaign V1" class="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-lime-400 transition-all" />
        </div>

        <!-- Agent Selector -->
        <div>
          <label class="block text-[11px] font-bold text-zinc-400 tracking-wider uppercase mb-1.5">Agent</label>
          <div class="relative">
            <button id="agent-selector-btn" class="w-full flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-300 hover:text-white transition-all">
              <span class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot text-lime-400"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                <span id="selected-agent-text">Seedance2 Director</span>
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down text-zinc-500"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div id="agent-dropdown-menu" class="hidden absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 z-10 space-y-0.5">
              <div class="agent-menu-item p-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white rounded cursor-pointer active" data-val="Seedance2 Director">Seedance2 Director</div>
              <div class="agent-menu-item p-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white rounded cursor-pointer" data-val="Vidu Cinema">Vidu Cinema</div>
              <div class="agent-menu-item p-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white rounded cursor-pointer" data-val="Kling Director">Kling Director</div>
              <div class="agent-menu-item p-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white rounded cursor-pointer" data-val="Veo Production">Veo Production</div>
              <div class="agent-menu-item p-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white rounded cursor-pointer" data-val="Hailuo Rapid">Hailuo Rapid</div>
            </div>
          </div>
        </div>

        <!-- Default Format aspect ratio selection -->
        <div>
          <label class="block text-[11px] font-bold text-zinc-400 tracking-wider uppercase mb-2">Default Format</label>
          <div class="grid grid-cols-3 gap-3">
            <div class="format-card flex flex-col items-center justify-center p-3 rounded-lg border border-lime-400 bg-lime-400/5 cursor-pointer text-white font-medium hover:border-lime-300 transition-all active" data-ratio="16:9">
              <div class="w-10 h-6 border-2 border-current rounded mb-2 opacity-80" style="width: 32px; height: 18px;"></div>
              <span class="text-xs">16:9</span>
            </div>
            <div class="format-card flex flex-col items-center justify-center p-3 rounded-lg border border-zinc-800 bg-zinc-900/30 cursor-pointer text-zinc-400 font-medium hover:border-zinc-700 transition-all" data-ratio="9:16">
              <div class="w-6 h-10 border-2 border-current rounded mb-2 opacity-80" style="width: 18px; height: 32px;"></div>
              <span class="text-xs">9:16</span>
            </div>
            <div class="format-card flex flex-col items-center justify-center p-3 rounded-lg border border-zinc-800 bg-zinc-900/30 cursor-pointer text-zinc-400 font-medium hover:border-zinc-700 transition-all" data-ratio="1:1">
              <div class="w-8 h-8 border-2 border-current rounded mb-2 opacity-80" style="width: 24px; height: 24px;"></div>
              <span class="text-xs">1:1</span>
            </div>
          </div>
        </div>

        <!-- Default Resolution with gold coins -->
        <div>
          <label class="block text-[11px] font-bold text-zinc-400 tracking-wider uppercase mb-2">Default Resolution</label>
          <div class="grid grid-cols-3 gap-3">
            <div class="res-card flex items-center justify-between p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/30 cursor-pointer hover:border-zinc-700 transition-all" data-res="480p" data-cost="5">
              <span class="text-xs text-zinc-300 font-semibold">480p</span>
              <span class="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">🪙 x1</span>
            </div>
            <div class="res-card flex items-center justify-between p-2.5 rounded-lg border border-lime-400 bg-lime-400/5 cursor-pointer hover:border-lime-300 transition-all active" data-res="720p" data-cost="10">
              <span class="text-xs text-white font-semibold">720p</span>
              <span class="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">🪙 x2</span>
            </div>
            <div class="res-card flex items-center justify-between p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/30 cursor-pointer hover:border-zinc-700 transition-all" data-res="1080p" data-cost="25">
              <span class="text-xs text-zinc-300 font-semibold">1080p</span>
              <span class="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">🪙 x5</span>
            </div>
          </div>
        </div>

        <!-- Duration Selection Row -->
        <div>
          <label class="block text-[11px] font-bold text-zinc-400 tracking-wider uppercase mb-2">Duration</label>
          <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;" class="duration-pills-row">
            <button class="dur-pill active px-3.5 py-1.5 rounded-full border border-lime-400 bg-lime-400/5 text-xs text-lime-400 font-semibold cursor-pointer whitespace-nowrap transition-all" data-val="Auto">Auto</button>
            <button class="dur-pill px-3.5 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/40 text-xs text-zinc-400 font-medium cursor-pointer whitespace-nowrap transition-all" data-val="5s">5s</button>
            <button class="dur-pill px-3.5 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/40 text-xs text-zinc-400 font-medium cursor-pointer whitespace-nowrap transition-all" data-val="15s">15s</button>
            <button class="dur-pill px-3.5 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/40 text-xs text-zinc-400 font-medium cursor-pointer whitespace-nowrap transition-all" data-val="30s">30s</button>
            <button class="dur-pill px-3.5 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/40 text-xs text-zinc-400 font-medium cursor-pointer whitespace-nowrap transition-all" data-val="45s">45s</button>
            <button class="dur-pill px-3.5 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/40 text-xs text-zinc-400 font-medium cursor-pointer whitespace-nowrap transition-all" data-val="60s">60s</button>
            <button class="dur-pill px-3.5 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/40 text-xs text-zinc-400 font-medium cursor-pointer whitespace-nowrap transition-all" data-val="Custom">Custom</button>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="pt-2 border-t border-zinc-800">
          <button id="create-project-submit" class="w-full flex items-center justify-center gap-1.5 rounded-xl bg-zinc-800 text-zinc-500 py-3 text-sm font-semibold cursor-pointer transition-all hover:scale-[1.01]">
            Create & Enter &rarr;
          </button>
        </div>
      </div>
    `;
    createModal("Create New Project", content, true);

    const titleInput = document.getElementById('new-proj-title');
    const submitBtn = document.getElementById('create-project-submit');

    let selectedType = "Video";
    let selectedAgent = "Seedance2 Director";
    let selectedRatio = "16:9";
    let selectedRes = "720p";
    let selectedResCost = 10;
    let selectedDuration = "Auto";

    // 1. Reactive Input Event to activate Submit Button
    titleInput.addEventListener('input', () => {
      const val = titleInput.value.trim();
      if (val.length > 0) {
        submitBtn.className = "w-full flex items-center justify-center gap-1.5 rounded-xl bg-lime-400 text-black py-3 text-sm font-bold cursor-pointer transition-all hover:bg-lime-300 hover:scale-[1.01]";
      } else {
        submitBtn.className = "w-full flex items-center justify-center gap-1.5 rounded-xl bg-zinc-800 text-zinc-500 py-3 text-sm font-semibold cursor-pointer transition-all hover:scale-[1.01]";
      }
    });

    // 2. Project Type Selector click handlers
    document.querySelectorAll('.project-type-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.project-type-card').forEach(c => {
          c.className = "flex items-center gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/40 cursor-pointer hover:bg-zinc-800/50 transition-all";
          c.querySelector('div').className = "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400";
          c.querySelector('div div').className = "text-sm font-semibold text-zinc-300";
        });
        card.className = "flex items-center gap-3 p-3 rounded-xl border border-lime-400 bg-lime-400/5 cursor-pointer hover:bg-lime-400/10 transition-all active";
        card.querySelector('div').className = "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-lime-400/10 text-lime-400";
        card.querySelector('div div').className = "text-sm font-semibold text-white";
        selectedType = card.getAttribute('data-type');
      });
    });

    // 3. Agent selector click toggle
    const agentBtn = document.getElementById('agent-selector-btn');
    const agentDropdown = document.getElementById('agent-dropdown-menu');
    const agentLabelText = document.getElementById('selected-agent-text');

    agentBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      agentDropdown.classList.toggle('hidden');
    });

    document.querySelectorAll('.agent-menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.agent-menu-item').forEach(i => i.classList.remove('active', 'text-white', 'font-semibold'));
        item.classList.add('active', 'text-white', 'font-semibold');
        selectedAgent = item.getAttribute('data-val');
        agentLabelText.textContent = selectedAgent;
        agentDropdown.classList.add('hidden');
      });
    });

    document.addEventListener('click', () => agentDropdown.classList.add('hidden'));

    // 4. Default Format click toggles
    document.querySelectorAll('.format-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.format-card').forEach(c => {
          c.className = "format-card flex flex-col items-center justify-center p-3 rounded-lg border border-zinc-800 bg-zinc-900/30 cursor-pointer text-zinc-400 font-medium hover:border-zinc-700 transition-all";
        });
        card.className = "format-card flex flex-col items-center justify-center p-3 rounded-lg border border-lime-400 bg-lime-400/5 cursor-pointer text-white font-medium hover:border-lime-300 transition-all active";
        selectedRatio = card.getAttribute('data-ratio');
      });
    });

    // 5. Default Resolution click toggles
    document.querySelectorAll('.res-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.res-card').forEach(c => {
          c.className = "res-card flex items-center justify-between p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/30 cursor-pointer hover:border-zinc-700 transition-all";
          c.querySelector('span').className = "text-xs text-zinc-300 font-semibold";
        });
        card.className = "res-card flex items-center justify-between p-2.5 rounded-lg border border-lime-400 bg-lime-400/5 cursor-pointer hover:border-lime-300 transition-all active";
        card.querySelector('span').className = "text-xs text-white font-semibold";
        selectedRes = card.getAttribute('data-res');
        selectedResCost = parseInt(card.getAttribute('data-cost'), 10);
      });
    });

    // 6. Duration Pills click toggles
    document.querySelectorAll('.dur-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.dur-pill').forEach(p => {
          p.className = "dur-pill px-3.5 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/40 text-xs text-zinc-400 font-medium cursor-pointer whitespace-nowrap transition-all";
        });
        pill.className = "dur-pill active px-3.5 py-1.5 rounded-full border border-lime-400 bg-lime-400/5 text-xs text-lime-400 font-semibold cursor-pointer whitespace-nowrap transition-all";
        selectedDuration = pill.getAttribute('data-val');
      });
    });

    // 7. Handle Submit event
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const title = titleInput.value.trim();
      if (!title) {
        showToast("Please enter a creative video title to begin your project.", "Empty Project Title", false);
        return;
      }

      // Check balance
      const currentCredits = parseInt(localStorage.getItem('pixo_credits') || '200', 10);
      if (currentCredits < selectedResCost) {
        showToast(`Insufficient compute credits (${currentCredits}) for this resolution. Cost: ${selectedResCost} credits. Redeem a code!`, "Insufficient Wallet Balance", false);
        return;
      }

      // Deduct Credits
      localStorage.setItem('pixo_credits', (currentCredits - selectedResCost).toString());
      updateCreditsDisplay();

      // Compile Project Card into storage
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

      // Automatically redirect or refresh to render list
      if (window.location.pathname.includes('/projects')) {
        renderProjectsGrid();
      } else {
        // Redirect to Projects view!
        window.location.href = "/org-9cbd03fa/projects";
      }
    });
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
        options: ["Auto", "5s", "15s", "30s", "45s", "60s", "Custom"],
        active: "Auto"
      }
    ];

    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent.trim();
      
      const config = dropdownConfigs.find(c => text.includes(c.triggerText) || (c.triggerText === "Seedance" && text.includes("Director")));
      if (!config) return;

      // Avoid double-attaching
      if (btn.classList.contains('local-dropdown-attached')) return;
      btn.classList.add('local-dropdown-attached');

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Remove existing popovers
        document.querySelectorAll('.local-popover').forEach(p => p.classList.remove('active'));

        let popover = btn.querySelector('.local-popover');
        if (!popover) {
          popover = document.createElement('div');
          popover.className = 'local-popover';
          btn.appendChild(popover);

          if (config.triggerText === "Auto") {
            // Render beautiful custom horizontal duration pills matching Image 2 perfectly!
            popover.style.width = "310px";
            popover.style.padding = "12px";
            popover.style.left = "auto";
            popover.style.right = "0";
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
                <button class="dur-popover-pill" style="padding: 5px 12px; border-radius: 9999px; border: 1px solid #27272a; background: #09090b; color: #a1a1aa; font-size: 11px; cursor: pointer;" data-val="Custom">Custom</button>
              </div>
            `;

            popover.querySelectorAll('.dur-popover-pill').forEach(pill => {
              pill.addEventListener('click', (ev) => {
                ev.stopPropagation();
                const selected = pill.getAttribute('data-val');
                
                // Update parent button text
                const svg = btn.querySelector('svg');
                btn.innerHTML = '';
                if (svg) btn.appendChild(svg.cloneNode(true));
                btn.appendChild(document.createTextNode(` ${selected}`));

                showToast(`Set AI render duration limit to: ${selected}`, "Timeline Filter Synced");
                popover.classList.remove('active');
              });
            });
          } else {
            // Populate standard vertical list options (ratios, resolutions, models)
            config.options.forEach(opt => {
              const item = document.createElement('div');
              item.className = `local-popover-item ${btn.textContent.includes(opt) ? 'active' : ''}`;
              item.textContent = opt;
              item.addEventListener('click', (ev) => {
                ev.stopPropagation();
                
                // Update button text (retaining any SVG icons)
                const svg = btn.querySelector('svg');
                btn.innerHTML = '';
                if (svg) btn.appendChild(svg.cloneNode(true));
                btn.appendChild(document.createTextNode(svg ? ` ${opt}` : opt));
                
                showToast(`Changed property mode to: ${opt}`, "Model Synced");
                popover.classList.remove('active');
              });
              popover.appendChild(item);
            });
          }
        }

        // Positioning
        popover.classList.toggle('active');
      });
    });

    // Close popovers on page clicks
    document.addEventListener('click', () => {
      document.querySelectorAll('.local-popover').forEach(p => p.classList.remove('active'));
    });
  };

  // ==========================================
  // RENDER DYNAMIC PROJECTS LIST (LOCAL GRID)
  // ==========================================
  const renderProjectsGrid = () => {
    // Check if we are on the projects or dashboard page container
    const mainContainer = document.querySelector('.mx-auto.max-w-7xl, [class*="mx-auto max-w-77xl"]');
    if (!mainContainer) return;

    const noProjectsPlaceholder = document.querySelector('.py-20.text-center');
    const localProjects = JSON.parse(localStorage.getItem('pixo_projects') || '[]');

    if (localProjects.length === 0) {
      if (noProjectsPlaceholder) noProjectsPlaceholder.style.display = 'flex';
      return;
    }

    // Hide placeholder
    if (noProjectsPlaceholder) noProjectsPlaceholder.style.display = 'none';

    // Check if grid already exists, else create it
    let grid = document.getElementById('local-projects-grid');
    if (!grid) {
      grid = document.createElement('div');
      grid.id = 'local-projects-grid';
      grid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full mt-4';
      
      // Inject next to placeholder or append to mainContainer
      if (noProjectsPlaceholder) {
        noProjectsPlaceholder.parentNode.insertBefore(grid, noProjectsPlaceholder.nextSibling);
      } else {
        mainContainer.appendChild(grid);
      }
    }

    // Render cards
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

    // Play hover previews
    grid.querySelectorAll('.local-preview-vid').forEach(vid => {
      vid.parentNode.addEventListener('mouseenter', () => vid.play().catch(() => {}));
      vid.parentNode.addEventListener('mouseleave', () => { vid.pause(); vid.currentTime = 0; });
    });

    // Handle Play triggers
    grid.querySelectorAll('.play-project-btn').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        openVideoPlayerModal(el.getAttribute('data-title'), el.getAttribute('data-url'));
      });
    });

    // Handle Delete triggers
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
  // RUN SIMULATED AI VIDEO GENERATION
  // ==========================================
  const triggerAiGeneration = (prompt) => {
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
      { max: 50, text: "Decomposing prompt into cinematic storyboards..." },
      { max: 75, text: "Synthesizing dynamic 24fps visual frames (Veo 2.5)..." },
      { max: 95, text: "Super-resolving output and synthesizing dialogue stream..." },
      { max: 100, text: "Assembling finished high-fidelity MP4 loop..." }
    ];

    const timer = setInterval(() => {
      pct += Math.floor(Math.random() * 8) + 4;
      if (pct >= 100) {
        pct = 100;
        clearInterval(timer);
        
        // Finalize creation
        setTimeout(() => {
          genPanel.classList.remove('active');
          
          // Create new local project card object
          const currentCredits = parseInt(localStorage.getItem('pixo_credits') || '200', 10);
          localStorage.setItem('pixo_credits', Math.max(0, currentCredits - 10).toString());
          updateCreditsDisplay();

          const randomLoop = LOCAL_VIDEO_LOOPS[Math.floor(Math.random() * LOCAL_VIDEO_LOOPS.length)];
          const newProj = {
            id: 'p_' + Date.now().toString(36),
            title: prompt,
            date: 'Just Now',
            videoUrl: randomLoop,
            ratio: '16:9',
            model: 'Seedance 2.5'
          };

          const projs = JSON.parse(localStorage.getItem('pixo_projects') || '[]');
          projs.unshift(newProj);
          localStorage.setItem('pixo_projects', JSON.stringify(projs));

          showToast("🎬 Dynamic project compiled! Play the loop now.", "AI Creation Complete!");
          
          // Re-render project cards if we are currently on the projects list page
          renderProjectsGrid();
        }, 800);
      }

      bar.style.width = pct + '%';
      pctLabel.textContent = pct + '%';

      const activeStep = steps.find(s => pct <= s.max);
      if (activeStep) statusText.textContent = activeStep.text;

    }, 350);
  };

  // ==========================================
  // CORE EVENT BINDINGS
  // ==========================================
  const initializeInteractivity = () => {
    injectStyles();
    updateCreditsDisplay();
    attachDropdowns();
    renderProjectsGrid();

    // 1. Redeem code buttons
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

    // 2. Get Credits buttons
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

    // 3. Prompt Form Submissions (AI text bar)
    const textarea = document.querySelector('textarea[name="message"]');
    const submitBtn = document.querySelector('button[type="submit"]');

    if (textarea && submitBtn) {
      const handleSubmission = () => {
        const val = textarea.value.trim();
        if (!val) {
          showToast("Please enter a creative video prompt to compile.", "Empty Prompt", false);
          return;
        }

        const credits = parseInt(localStorage.getItem('pixo_credits') || '200', 10);
        if (credits < 10) {
          showToast("Insufficient credits in local compute ledger. Redeem a voucher code first!", "Insufficient Balance", false);
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

    // 4. Handle language triggers
    document.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.includes('English') || btn.textContent.includes('Select language')) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          // Remove existing popovers
          document.querySelectorAll('.local-popover').forEach(p => p.classList.remove('active'));

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

    // 5. Handle User avatar click
    document.querySelectorAll('button').forEach(btn => {
      if (btn.classList && btn.classList.contains('bg-muted') && btn.classList.contains('rounded-full') && !btn.textContent.includes('Credits')) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          document.querySelectorAll('.local-popover').forEach(p => p.classList.remove('active'));

          let popover = btn.querySelector('.local-popover');
          if (!popover) {
            popover = document.createElement('div');
            popover.className = 'local-popover';
            // Offset to fit right-aligned
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

    // 6. Handle "New Project" button click triggers
    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent.trim();
      const aria = btn.getAttribute('aria-label') || '';
      if (text.toLowerCase().includes('new project') || aria.toLowerCase().includes('new project')) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          window.location.href = "/org-9cbd03fa/playground";
        });
      }
    });
  };

  // Run on startup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeInteractivity);
  } else {
    initializeInteractivity();
  }
})();
