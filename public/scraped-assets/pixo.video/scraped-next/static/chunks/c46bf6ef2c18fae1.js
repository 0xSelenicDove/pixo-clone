;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="c443d4f5-7808-e6a5-ddbe-f9416d5f1dc7")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,847260,e=>{"use strict";function t(){let e=[];for(let t=0;t<localStorage.length;t++){let r=localStorage.key(t);r?.toLowerCase().startsWith("pixo")&&e.push(r)}for(let t of e)localStorage.removeItem(t);document.cookie="last-org-slug=; path=/; max-age=0",console.info("[Storage] Cleared app storage",{keysRemoved:e.length,keys:e})}e.s(["clearAppStorage",()=>t])},931823,e=>{"use strict";var t=e.i(604362);e.i(577478);var r=e.i(745658),a=e.i(846644),o=e.i(127460),i=e.i(847260);let n={en:{title:"Something went wrong",description:"An unexpected error occurred. You can try again or reset the app data to start fresh.",tryAgain:"Try Again",resetData:"Reset App Data",resetWarning:"This will clear your local preferences and reload the page.",retryFailed:"If the issue persists, try resetting the app data."},zh:{title:"出错了",description:"发生了意外错误。您可以重试或重置应用数据以重新开始。",tryAgain:"重试",resetData:"重置应用数据",resetWarning:"这将清除您的本地偏好设置并重新加载页面。",retryFailed:"如果问题持续存在，请尝试重置应用数据。"}};function s({error:e,reset:s}){let[l,d]=(0,o.useState)("en"),[c,g]=(0,o.useState)(0);(0,o.useEffect)(()=>{console.error("[GlobalError] Unhandled error:",e.message,{digest:e.digest}),(0,r.isAlreadyReported)(e)||(0,a.reportError)(e,{source:"error-boundary",operation:"global-error",domain:{digest:e.digest}});let t=window.location.pathname.split("/")[1];d(t in n?t:"en")},[e]);let p=n[l];return(0,t.jsxs)("html",{lang:l,children:[(0,t.jsxs)("head",{children:[(0,t.jsx)("meta",{charSet:"utf-8"}),(0,t.jsx)("meta",{name:"viewport",content:"width=device-width, initial-scale=1"}),(0,t.jsxs)("title",{children:[p.title," - Pixo"]}),(0,t.jsx)("style",{dangerouslySetInnerHTML:{__html:`
            :root {
              --bg: #ffffff;
              --fg: #1a1a1a;
              --muted-text: #737373;
              --muted-bg: #f5f5f5;
              --primary-btn: #1a1a1a;
              --primary-btn-text: #f5f5f5;
              --lime: #a3e635;
            }

            @media (prefers-color-scheme: dark) {
              :root {
                --bg: #1a1a1a;
                --fg: #f5f5f5;
                --muted-text: #a3a3a3;
                --muted-bg: #262626;
                --primary-btn: #f5f5f5;
                --primary-btn-text: #1a1a1a;
              }
            }

            @keyframes gradient-shift {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }

            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              background-color: var(--bg);
              color: var(--fg);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 24px;
            }

            .gradient-line {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              height: 2px;
              background: linear-gradient(90deg, var(--lime), transparent, var(--lime));
              background-size: 200% 100%;
              animation: gradient-shift 3s ease-in-out infinite;
            }

            .container {
              max-width: 420px;
              width: 100%;
            }

            h1 {
              font-size: 28px;
              font-weight: 700;
              letter-spacing: -0.02em;
              margin-bottom: 12px;
            }

            .description {
              font-size: 16px;
              font-weight: 400;
              line-height: 1.6;
              color: var(--muted-text);
              margin-bottom: 32px;
            }

            .digest {
              font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
              font-size: 13px;
              color: var(--muted-text);
              background-color: var(--muted-bg);
              padding: 6px 12px;
              border-radius: 6px;
              margin-bottom: 32px;
              display: inline-block;
            }

            .buttons {
              display: flex;
              flex-direction: column;
              gap: 12px;
            }

            button {
              font-size: 14px;
              font-weight: 600;
              padding: 12px 24px;
              border-radius: 12px;
              border: none;
              cursor: pointer;
              transition: all 0.15s ease;
              font-family: inherit;
            }

            .primary {
              background-color: var(--primary-btn);
              color: var(--primary-btn-text);
            }

            .primary:hover {
              opacity: 0.9;
            }

            .secondary {
              background-color: transparent;
              color: var(--fg);
              border: 1px solid var(--muted-bg);
            }

            .secondary:hover {
              background-color: var(--muted-bg);
            }

            .warning {
              font-size: 13px;
              color: var(--muted-text);
              margin-top: 8px;
              text-align: center;
            }
          `}})]}),(0,t.jsxs)("body",{children:[(0,t.jsx)("div",{className:"gradient-line","aria-hidden":"true"}),(0,t.jsxs)("main",{className:"container",children:[(0,t.jsx)("h1",{children:p.title}),(0,t.jsx)("p",{className:"description",children:p.description}),e.digest&&(0,t.jsxs)("output",{className:"digest","aria-label":"Error reference ID",children:["Error ID: ",e.digest]}),(0,t.jsxs)("div",{className:"buttons",children:[(0,t.jsx)("button",{type:"button",className:"primary",onClick:()=>{g(e=>e+1),s()},children:p.tryAgain}),(0,t.jsx)("button",{type:"button",className:"secondary",onClick:()=>{try{(0,i.clearAppStorage)(),window.location.reload()}catch(e){console.error("[GlobalError] Failed to clear localStorage:",e),window.location.reload()}},children:p.resetData})]}),(0,t.jsx)("p",{className:"warning",children:p.resetWarning}),c>0&&(0,t.jsx)("p",{className:"warning",children:p.retryFailed})]})]})]})}e.s(["default",()=>s])}]);

//# debugId=c443d4f5-7808-e6a5-ddbe-f9416d5f1dc7
//# sourceMappingURL=a257bcf4820edabc.js.map