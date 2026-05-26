// Trigger build
import { useState, useEffect, useRef } from "react";
import executiveImg from "./assets/executive.png";
import creativeImg from "./assets/creative.png";
import techImg from "./assets/tech.png";

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────────── */
interface DeploymentStep {
  step: number;
  title: string;
  description: string;
  command: string | null;
  tip: string | null;
}

interface PreviewSite {
  name: string;
  url: string;
  description: string;
  badge: string;
}

interface GenerationResult {
  html: string;
  css: string;
  js: string;
  deploymentSteps: DeploymentStep[];
  previewSites: PreviewSite[];
}

/* ─────────────────────────────────────────────────────────────────────────────
   GLOBAL STYLES — injected once into <head>
───────────────────────────────────────────────────────────────────────────── */
const G = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Manrope:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#07070F;color:#F2EEE8;font-family:'Manrope',sans-serif;-webkit-font-smoothing:antialiased;scroll-behavior:smooth}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#C9A84C;border-radius:2px}

/* ── Keyframes ── */
@keyframes float1{0%,100%{transform:perspective(600px) rotateX(22deg) rotateY(32deg) translateY(0px)}50%{transform:perspective(600px) rotateX(30deg) rotateY(42deg) translateY(-20px)}}
@keyframes float2{0%,100%{transform:perspective(600px) rotateX(-14deg) rotateY(-28deg) translateY(0px)}50%{transform:perspective(600px) rotateX(-20deg) rotateY(-36deg) translateY(-24px)}}
@keyframes float3{0%,100%{transform:perspective(600px) rotateX(6deg) rotateY(18deg) translateY(0px)}50%{transform:perspective(600px) rotateX(12deg) rotateY(26deg) translateY(-14px)}}
@keyframes spin3d{from{transform:rotateX(0deg) rotateY(0deg) rotateZ(0deg)}to{transform:rotateX(360deg) rotateY(540deg) rotateZ(180deg)}}
@keyframes shimmer{from{background-position:-200% 0}to{background-position:200% 0}}
@keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
@keyframes dotBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-10px)}}
@keyframes pulseGold{0%{box-shadow:0 0 0 0 rgba(201,168,76,0.5)}100%{box-shadow:0 0 0 16px rgba(201,168,76,0)}}
@keyframes scanLine{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
@keyframes gridFade{from{opacity:0}to{opacity:1}}

/* ── Floating 3D shapes ── */
.f1{animation:float1 7s ease-in-out infinite}
.f2{animation:float2 9s ease-in-out infinite}
.f3{animation:float3 11s ease-in-out infinite}
.f1r{animation:float1 7s ease-in-out infinite reverse}

/* ── 3D Cube (loading) ── */
.cube-wrap{width:96px;height:96px;transform-style:preserve-3d;animation:spin3d 9s linear infinite;position:relative}
.cface{position:absolute;width:96px;height:96px;border:1px solid rgba(201,168,76,0.38);background:rgba(201,168,76,0.028)}
.cface.fr{transform:translateZ(48px)}
.cface.bk{transform:translateZ(-48px)}
.cface.lt{transform:rotateY(90deg) translateZ(48px)}
.cface.rt{transform:rotateY(-90deg) translateZ(48px)}
.cface.tp{transform:rotateX(90deg) translateZ(48px)}
.cface.bt{transform:rotateX(-90deg) translateZ(48px)}

/* ── Gradient text ── */
.gt{background:linear-gradient(115deg,#B8902E 0%,#E8C76B 38%,#F5DC90 55%,#C9A84C 80%,#B8902E 100%);background-size:220%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 5s linear infinite}

/* ── Staggered reveal ── */
.u1{animation:fadeUp 0.55s 0.08s ease both}
.u2{animation:fadeUp 0.55s 0.16s ease both}
.u3{animation:fadeUp 0.55s 0.24s ease both}
.u4{animation:fadeUp 0.55s 0.32s ease both}
.u5{animation:fadeUp 0.55s 0.40s ease both}
.u6{animation:fadeUp 0.55s 0.48s ease both}
.u7{animation:fadeUp 0.55s 0.56s ease both}

/* ── Buttons ── */
.btn-prime{background:linear-gradient(130deg,#C4952A,#E5C66B,#C9A84C);color:#07070F;border:none;border-radius:9px;font-family:'Manrope',sans-serif;font-weight:700;letter-spacing:.065em;text-transform:uppercase;cursor:pointer;transition:transform .2s,box-shadow .2s;position:relative;overflow:hidden}
.btn-prime::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent 30%,rgba(255,255,255,0.22) 50%,transparent 70%);background-size:200%;transform:translateX(-100%);transition:transform .4s}
.btn-prime:hover::after{transform:translateX(100%)}
.btn-prime:hover{transform:translateY(-2px);box-shadow:0 14px 48px rgba(201,168,76,.32)}
.btn-prime:active{transform:translateY(0)}
.btn-prime:disabled{opacity:.38;cursor:not-allowed;transform:none!important;box-shadow:none!important}
.btn-outline{background:transparent;color:#C9A84C;border:1px solid rgba(201,168,76,.35);border-radius:9px;font-family:'Manrope',sans-serif;font-weight:600;cursor:pointer;transition:all .2s}
.btn-outline:hover{background:rgba(201,168,76,.08);border-color:#C9A84C}
.btn-ghost{background:rgba(255,255,255,.04);color:#888;border:1px solid rgba(255,255,255,.07);border-radius:9px;font-family:'Manrope',sans-serif;cursor:pointer;transition:all .2s}
.btn-ghost:hover{background:rgba(255,255,255,.09);color:#F2EEE8}

/* ── Grid bg ── */
.grid-bg{background-image:linear-gradient(rgba(255,255,255,.016) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.016) 1px,transparent 1px);background-size:68px 68px}

/* ── Card hover ── */
.card-h{background:rgba(255,255,255,.022);border:1px solid rgba(255,255,255,.065);border-radius:14px;transition:all .28s}
.card-h:hover{border-color:rgba(201,168,76,.28);background:rgba(201,168,76,.025);transform:translateY(-3px)}

/* ── Code block ── */
.code-pre{font-family:'JetBrains Mono',monospace;font-size:12.5px;line-height:1.78;background:#030307;color:#CCC8C2;border:1px solid rgba(255,255,255,.06);border-top:none;border-radius:0 0 12px 12px;padding:22px;height:400px;overflow:auto;white-space:pre;margin:0}
.code-pre::-webkit-scrollbar{width:3px;height:3px}
.code-pre::-webkit-scrollbar-thumb{background:rgba(201,168,76,.3);border-radius:2px}

/* ── Textarea ── */
.resume-ta{width:100%;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:13px;color:#F2EEE8;font-family:'Manrope',sans-serif;font-size:14px;line-height:1.82;padding:20px 22px;resize:vertical;outline:none;transition:border-color .3s;min-height:440px}
.resume-ta::placeholder{color:rgba(242,238,232,.2)}
.resume-ta:focus{border-color:rgba(201,168,76,.48)}

/* ── Command snippet ── */
.cmd{background:#020205;border:1px solid rgba(201,168,76,.14);border-radius:7px;padding:9px 14px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#C9A84C;display:block;margin-top:10px;word-break:break-all}

/* ── Dots loader ── */
.dot-loader span{display:inline-block;width:9px;height:9px;border-radius:50%;background:#C9A84C;margin:0 4px;animation:dotBounce 1.4s ease-in-out infinite}
.dot-loader span:nth-child(1){animation-delay:0s}
.dot-loader span:nth-child(2){animation-delay:.18s}
.dot-loader span:nth-child(3){animation-delay:.36s}

/* ── Pulse dot ── */
.pulse-dot{width:8px;height:8px;border-radius:50%;background:#C9A84C;animation:pulseGold 1.4s ease-out infinite}

/* ── Scan line ── */
.scan{position:absolute;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,.35),transparent);animation:scanLine 3s ease-in-out infinite;pointer-events:none}

/* ── Tab ── */
.tab-btn{background:none;border:none;font-family:'JetBrains Mono',monospace;font-size:13px;cursor:pointer;padding:11px 22px;border-bottom:2px solid transparent;transition:all .2s;letter-spacing:.02em}
.tab-btn.active{color:#C9A84C;border-bottom-color:#C9A84C}
.tab-btn.inactive{color:#55536A}
.tab-btn:hover{color:#E8C76B}

/* ── Site link card ── */
.site-card{display:block;background:rgba(255,255,255,.022);border:1px solid rgba(255,255,255,.065);border-radius:14px;padding:22px;text-decoration:none;transition:all .26s;cursor:pointer}
.site-card:hover{border-color:rgba(201,168,76,.32);background:rgba(201,168,76,.032);transform:translateY(-3px);box-shadow:0 16px 48px rgba(0,0,0,.4)}

/* ── Step card ── */
.step-card{background:rgba(255,255,255,.018);border:1px solid rgba(255,255,255,.06);border-radius:14px;transition:all .26s}
.step-card:hover{border-color:rgba(201,168,76,.22);background:rgba(201,168,76,.018)}

/* ── Nav bar ── */
.app-nav{padding:22px 48px;border-bottom:1px solid rgba(255,255,255,.05);display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:rgba(7,7,15,.92);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);z-index:100}

/* ── Badge ── */
.badge{display:inline-block;background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.22);border-radius:5px;padding:2px 9px;font-size:10px;font-weight:700;color:#C9A84C;letter-spacing:.08em;text-transform:uppercase;flex-shrink:0}
.badge.green{background:rgba(47,200,122,.1);border-color:rgba(47,200,122,.25);color:#2FC87A}


`;

/* ─────────────────────────────────────────────────────────────────────────────
   MASTER PROMPT — elite portfolio generation
───────────────────────────────────────────────────────────────────────────── */
const MASTER_PROMPT = `You are a Principal Frontend Engineer and Creative Director who has shipped award-winning portfolio sites for CTOs, Y Combinator founders, Google Fellows, and Fortune 500 executives. You write code that is clean, semantic, accessible, performant, and visually exceptional. Your work has been featured in Awwwards, CSS Design Awards, and The FWA.

MISSION: Generate a complete, production-grade personal portfolio website from the resume data below. Output THREE separate, complete, deployable files.

══════════════════════════════════════════
█ FILE 1 — index.html
══════════════════════════════════════════

REQUIRED DOCUMENT STRUCTURE:
- HTML5 doctype + lang attribute
- <head>: charset, X-UA-Compatible, viewport (width=device-width,initial-scale=1)
- SEO: <title>, <meta name="description">, <meta name="keywords">, <meta name="author">
- Open Graph: og:title, og:description, og:type="website", og:url (use https://[firstname][lastname].dev)
- Twitter Card: twitter:card="summary_large_image", twitter:title, twitter:description
- Canonical: <link rel="canonical" href="...">
- Google Fonts: Pick TWO carefully paired fonts (NEVER Inter, Roboto, Lato, Arial, or Open Sans).
  Excellent choices: Clash Display, DM Sans, Outfit, Plus Jakarta Sans, Space Grotesk, Fraunces, Cabinet Grotesk, General Sans, Instrument Sans, Satoshi, Switzer. Pick based on the person's industry.
- Link to: styles.css, main.js (deferred)
- Schema.org JSON-LD: Person type with name, jobTitle, url, sameAs (social links)

REQUIRED SECTIONS (exact order, with id attributes):
  1. <nav id="navbar"> — fixed/sticky, logo (name initials or name), nav links, hamburger icon (SVG)
  2. <section id="hero"> — full viewport height
  3. <section id="about"> — two-column layout
  4. <section id="experience"> — vertical timeline
  5. <section id="skills"> — skill categories with bars
  6. <section id="projects"> — card grid
  7. <section id="education"> — cards
  8. <section id="contact"> — form + socials
  9. <footer>
  10. <div id="loader"> — full-screen loading overlay (hides after JS runs)
  11. <div id="back-top"> — scroll-to-top button
  12. <div id="progress-bar"> — thin scroll progress bar at top of page

HERO SECTION DETAILS:
- Full viewport height (min-height: 100vh), vertically + horizontally centered text
- Headline: person's name in large display font
- Animated subtitle: <span id="typed-text"> with cursor <span class="cursor">|</span>
- Tagline/short bio underneath
- Two CTA buttons: "View My Work" (→ #projects) and "Get In Touch" (→ #contact)
- Decorative floating elements: 3-4 abstract geometric shapes (divs with CSS animation)
- Scroll indicator arrow at bottom center

ABOUT SECTION:
- Two-column grid: left = bio paragraph(s) + highlighted quote or tagline, right = stat cards
- Stat cards: years of experience, number of projects, companies/clients worked with, etc.

EXPERIENCE SECTION:
- Vertical timeline with a central connecting line
- Each entry: company logo placeholder (colored initial circle), company name, role/title, date range, 3-4 bullet points from resume
- Alternate entries left/right on desktop, single column on mobile
- Add class="animate" to each timeline entry (for JS scroll animation)

SKILLS SECTION:
- Group skills into 2-3 categories (e.g., Frontend, Backend, Tools & DevOps)
- Each skill: name + animated CSS progress bar
- Add data-width attribute on bar fill (e.g., data-width="90") for JS animation
- Add class="skill-bar-fill animate" for Intersection Observer to trigger

PROJECTS SECTION:
- 2-3 column responsive card grid
- Each card: gradient placeholder image (use CSS gradient unique per project), project title, short description, tech stack badges, links (GitHub + Live URL as "#" if not provided)
- Card hover: lift + slight scale + reveal overlay with links

EDUCATION SECTION:
- 1-2 cards per degree: institution, degree type, field, graduation year, GPA if provided, honors/achievements

CONTACT SECTION:
- Centered layout, max-width 640px
- Form: name input, email input, textarea (message), submit button
- Show success message div (hidden by default, shown via JS)
- Social links row: use SVG icons for GitHub, LinkedIn, Twitter/X, email

FOOTER:
- Copyright © [year] [Name]. All rights reserved.
- "Designed & built from scratch" tagline
- Back-to-top link

══════════════════════════════════════════
█ FILE 2 — styles.css
══════════════════════════════════════════

DESIGN SYSTEM — commit to these as CSS custom properties:
  --color-bg: #0A0A0F (or similar very dark)
  --color-surface: #111119
  --color-surface-2: #1A1A27
  --color-border: rgba(255,255,255,0.07)
  --color-accent: [CHOOSE ONE: NOT generic blue. Options: electric violet #7C4DFF, warm coral #FF6847, teal #00D4AA, rose gold #E8956D, cyber green #39FF6E, or derive from their industry]
  --color-accent-light: [lighter variant of accent]
  --color-text: #F0EDE6
  --color-text-muted: #6B697A
  --color-text-dim: #3A384A
  --font-display: [heading font from Google Fonts]
  --font-body: [body font from Google Fonts]
  --font-mono: 'Courier New', monospace
  --radius: 12px
  --radius-sm: 8px
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)

MANDATORY STYLES:
  Global: *, html, body resets; smooth scrolling on html; custom scrollbar; ::selection style
  Typography: h1-h6 scale, body, p, strong, code, blockquote styles
  Layout: .container (max-width 1200px, centered, padding 0 24px)
  
  Navbar: transparent initially, backdrop-blur + border-bottom on scroll (.scrolled class), shrink effect
  
  Hero: gradient mesh or animated gradient background; text staggered animation classes (.reveal, .reveal-1 through .reveal-5); floating geometric shapes with @keyframes float animation; gradient text on name or tagline; typing cursor blink animation
  
  Sections: alternating subtle background; section padding 100px 0; section titles with decorative accent line
  
  Timeline: ::before pseudo-element for center line; entry reveal animations (.slide-left, .slide-right); connector dots; hover highlight on entries
  
  Skill bars: background track; fill div with transition: width 1.5s cubic-bezier(0.4,0,0.2,1); shimmer overlay animation on fill
  
  Project cards: gradient image placeholder per card (each different); hover transform: translateY(-8px) scale(1.01); box-shadow increase on hover; tech badge pill styles; overlay reveal with backdrop-filter
  
  Buttons: primary (accent bg, dark text, shimmer hover effect); secondary (transparent, accent border); icon buttons
  
  Form: styled inputs with focus ring using accent color; floating label animation; submit button with loading state
  
  Animations (@keyframes): fadeInUp, fadeInLeft, fadeInRight, float, floatReverse, gradientShift, progressFill, cursorBlink, shimmer, rotateIn, pulseAccent
  
  Responsive breakpoints: 1024px (tablet), 768px (mobile) — adjust grid, font sizes, nav, timeline

══════════════════════════════════════════
█ FILE 3 — main.js
══════════════════════════════════════════

'use strict'; at top.

REQUIRED FUNCTIONALITY:

1. PAGE LOADER
   - On DOMContentLoaded: add 'loaded' class to body, fade out #loader after 800ms, remove from DOM after transition

2. SCROLL PROGRESS BAR
   - #progress-bar: width = (scrollY / (document.body.scrollHeight - window.innerHeight)) * 100 + '%'
   - Update on scroll event (use requestAnimationFrame for performance)

3. NAVBAR BEHAVIOR
   - Add class 'scrolled' to #navbar when scrollY > 80
   - Highlight active nav link based on current section in viewport
   - Smooth scroll for all anchor links (event.preventDefault + scrollIntoView)

4. HAMBURGER MENU (mobile)
   - Toggle .open class on nav menu
   - Toggle aria-expanded on hamburger button
   - Close menu when a link is clicked

5. INTERSECTION OBSERVER — scroll animations
   - Target all elements with class 'animate'
   - When intersecting: add class 'is-visible'
   - rootMargin: '0px 0px -80px 0px', threshold: 0.15
   - Once seen, do not re-animate (unobserve)

6. SKILL BARS
   - Second IntersectionObserver for .skill-bar-fill elements
   - On intersect: set element.style.width = element.dataset.width + '%'

7. TYPING EFFECT
   - Array of 2-3 job titles derived from resume
   - Type each character, pause, delete, move to next
   - Speeds: typeSpeed: 80ms, deleteSpeed: 45ms, pauseAfterType: 2000ms, pauseAfterDelete: 600ms
   - Target: #typed-text

8. BACK TO TOP
   - Show #back-top when scrollY > 400
   - Click scrolls to top smoothly

9. CONTACT FORM
   - event.preventDefault on submit
   - Simulate async send (setTimeout 1200ms)
   - Show loading state on button during "send"
   - Show success message on completion
   - Reset form

10. UTILITY: debounce(fn, delay) function — wrap all scroll/resize handlers

══════════════════════════════════════════
█ RESUME DATA
══════════════════════════════════════════
{RESUME}

══════════════════════════════════════════
█ OUTPUT FORMAT — STRICT JSON ONLY
══════════════════════════════════════════

Respond with ONLY a valid JSON object. No markdown fences. No explanation before or after. No comments inside JSON. Start your response with { and end with }.

The JSON must contain exactly these keys:
{
  "html": "<COMPLETE contents of index.html — properly JSON-escaped>",
  "css": "<COMPLETE contents of styles.css — properly JSON-escaped>",
  "js": "<COMPLETE contents of main.js — properly JSON-escaped>",
  "deploymentSteps": [
    {
      "step": 1,
      "title": "Save your three files",
      "description": "Create a new folder on your desktop named 'my-portfolio'. Save the three files exactly as: index.html, styles.css, and main.js — all in the same folder. Do not rename them, as index.html links to the other two by filename.",
      "command": null,
      "tip": "Keep all three files in the same directory or the styles and scripts won't load."
    },
    {
      "step": 2,
      "title": "Preview locally in your browser",
      "description": "Double-click index.html to open it in your browser for a quick preview. For full functionality including fonts and animations, run a local dev server using Node.js or Python.",
      "command": "npx serve . --open",
      "tip": "Install Node.js from nodejs.org first (free). Then open Terminal/Command Prompt, navigate to your folder, and run the command."
    },
    {
      "step": 3,
      "title": "Create a free GitHub account",
      "description": "Go to github.com and sign up for a free account. Once logged in, click the '+' icon → 'New repository'. Name it exactly: yourusername.github.io (replace 'yourusername' with your actual GitHub username). Set it to Public. Do NOT initialize with a README.",
      "command": null,
      "tip": "The repository name must match your GitHub username exactly. If your username is jsmith, the repo must be jsmith.github.io."
    },
    {
      "step": 4,
      "title": "Upload your portfolio files",
      "description": "In your new repository on GitHub, click 'uploading an existing file'. Drag and drop all three files (index.html, styles.css, main.js) from your folder into the upload area. Write a commit message like 'Launch my portfolio', then click 'Commit changes'.",
      "command": "git init && git add . && git commit -m 'Launch portfolio' && git branch -M main && git remote add origin https://github.com/USERNAME/USERNAME.github.io.git && git push -u origin main",
      "tip": "If you're comfortable with Git, use the terminal command above instead. Replace USERNAME with your GitHub username."
    },
    {
      "step": 5,
      "title": "Enable GitHub Pages",
      "description": "In your repository, go to Settings (top tab) → Pages (left sidebar) → Under 'Source', select 'Deploy from a branch' → Choose 'main' branch and '/ (root)' folder → Click Save. Your site will be live within 1-5 minutes.",
      "command": null,
      "tip": "Refresh the Pages settings page after 2 minutes. GitHub will show your live URL: https://yourusername.github.io"
    },
    {
      "step": 6,
      "title": "Add your live URL everywhere",
      "description": "Once live, copy your portfolio URL (https://yourusername.github.io) and add it to: your LinkedIn profile URL field, your resume header, your email signature, your GitHub profile bio, and any job applications. Update your portfolio anytime by uploading new files to the same repo.",
      "command": null,
      "tip": "Want a custom domain like yourname.dev? Buy one from Namecheap (~$10/year) and follow GitHub's custom domain guide in the Pages settings."
    }
  ],
  "previewSites": [
    {"name": "Netlify Drop", "url": "https://app.netlify.com/drop", "description": "Drag and drop your entire portfolio folder for a live URL in under 10 seconds. No account needed to start.", "badge": "Fastest"},
    {"name": "GitHub Pages", "url": "https://pages.github.com", "description": "Free, permanent hosting tied to your GitHub. Best long-term option. Your URL becomes yourusername.github.io.", "badge": "Recommended"},
    {"name": "Vercel", "url": "https://vercel.com/new", "description": "Connect your GitHub repo for automatic deployments on every push. Blazing fast CDN included.", "badge": "Free"},
    {"name": "Tiiny.host", "url": "https://tiiny.host", "description": "Zip your three files and upload. Get a shareable link instantly — perfect for sharing with recruiters before going permanent.", "badge": "Instant"},
    {"name": "Surge.sh", "url": "https://surge.sh", "description": "One terminal command deploys your site. Run: npx surge — follow prompts. Assign a custom surge.sh subdomain.", "badge": "CLI"},
    {"name": "Render", "url": "https://render.com", "description": "Free static site hosting with auto-deploy from GitHub. Includes SSL, CDN, and pull request previews.", "badge": "Free"}
  ]
}`;

/* ─────────────────────────────────────────────────────────────────────────────
   FALLBACK PORTFOLIO GENERATOR - Fortune 500 Grade
───────────────────────────────────────────────────────────────────────────── */
function generateFallbackPortfolio(resumeText: string, templateId: string = "executive"): GenerationResult {
  let fontLinks = '';
  let rootVariables = '';
  if (templateId === 'creative') {
    fontLinks = `<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">`;
    rootVariables = `
    --color-bg: #0D0714;
    --color-surface: #170C22;
    --color-surface-2: #241335;
    --color-border: rgba(255, 0, 127, 0.12);
    --color-accent: #FF007F;
    --color-accent-light: #7C4DFF;
    --color-accent-glow: rgba(255, 0, 127, 0.25);
    --color-text: #F8F5FC;
    --color-text-muted: #A39BB0;
    --color-text-dim: #544D60;
    --color-success: #00FFBB;
    --color-error: #FF5A79;
    --font-display: 'Outfit', sans-serif;
    --font-body: 'Outfit', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    --radius: 28px;
    --radius-sm: 12px;
    --radius-full: 9999px;
    --transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);`;
  } else if (templateId === 'tech') {
    fontLinks = `<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap" rel="stylesheet">`;
    rootVariables = `
    --color-bg: #000000;
    --color-surface: #0A0A0A;
    --color-surface-2: #141414;
    --color-border: rgba(0, 255, 102, 0.2);
    --color-accent: #00FF66;
    --color-accent-light: #00E5FF;
    --color-accent-glow: rgba(0, 255, 102, 0.15);
    --color-text: #D1FFDE;
    --color-text-muted: #728F79;
    --color-text-dim: #324D39;
    --color-success: #00FF66;
    --color-error: #FF3366;
    --font-display: 'JetBrains Mono', monospace;
    --font-body: 'JetBrains Mono', monospace;
    --font-mono: 'JetBrains Mono', monospace;
    --radius: 0px;
    --radius-sm: 0px;
    --radius-full: 0px;
    --transition: all 0.15s steps(4, end);`;
  } else {
    fontLinks = `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">`;
    rootVariables = `
    --color-bg: #0F172A;
    --color-surface: #1E293B;
    --color-surface-2: #334155;
    --color-border: rgba(255, 255, 255, 0.06);
    --color-accent: #C9A84C;
    --color-accent-light: #E8C76B;
    --color-accent-glow: rgba(201, 168, 76, 0.15);
    --color-text: #F8FAFC;
    --color-text-muted: #94A3B8;
    --color-text-dim: #475569;
    --color-success: #10B981;
    --color-error: #EF4444;
    --font-display: 'Playfair Display', serif;
    --font-body: 'Inter', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    --radius: 12px;
    --radius-sm: 6px;
    --radius-full: 9999px;
    --transition: all 0.25s ease-in-out;`;
  }

  const labels = {
    aboutLabel: templateId === 'tech' ? './about_me' : 'About Me',
    aboutTitle: templateId === 'tech' ? 'system.out.print(info);' : 'Passionate About Creating Impact',
    expLabel: templateId === 'tech' ? './experience' : 'Career Journey',
    expTitle: templateId === 'tech' ? 'cat career_history.log' : 'Professional Experience',
    skillsLabel: templateId === 'tech' ? './skills' : 'Expertise',
    skillsTitle: templateId === 'tech' ? 'npm run list-tech' : 'Skills & Technologies',
    projectsLabel: templateId === 'tech' ? './projects' : 'Portfolio',
    projectsTitle: templateId === 'tech' ? 'ls -la ./featured_works' : 'Featured Projects',
    contactLabel: templateId === 'tech' ? './contact' : 'Get In Touch',
    contactTitle: templateId === 'tech' ? 'ssh contact@forge.io' : 'Let\'s Work Together'
  };

  // Parse resume data
  const lines = resumeText.split('\n').filter(l => l.trim());
  
  // Extract name (loop through first 5 lines to find a valid capitalized name candidate)
  let name = "Professional Portfolio";
  const forbiddenNames = /^(resume|curriculum|vitae|cv|contact|info|summary|about|portfolio|experience|skills|education|certifications|projects)$/i;
  
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const candidate = lines[i].trim();
    if (!candidate) continue;
    
    // Check if candidate line consists of 1-4 words, starts with capital letters, and does not contain forbidden keywords
    const cleanCandidate = candidate.split(/[—\-·,]/)[0].trim();
    const words = cleanCandidate.split(/\s+/);
    if (words.length >= 1 && words.length <= 4) {
      const isCapitalized = words.every(w => /^[A-Z]/.test(w));
      const isForbidden = forbiddenNames.test(cleanCandidate);
      if (isCapitalized && !isForbidden) {
        name = cleanCandidate;
        break;
      }
    }
  }

  // Strip "Name:" or other header prefixes if present
  name = name.replace(/^(name|resume|portfolio)[:\s\-—–·|]*/i, '').trim();

  const firstName = name.split(' ')[0] || 'Professional';
  const lastName = name.split(' ').slice(1).join(' ') || '';
  const initials = (firstName[0] || 'P') + (lastName[0] || 'F');
  
  // Extract email
  const emailMatch = resumeText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const email = emailMatch ? emailMatch[1] : 'contact@example.com';
  
  // Extract LinkedIn
  const linkedinMatch = resumeText.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/i);
  const linkedin = linkedinMatch ? `https://linkedin.com/in/${linkedinMatch[1]}` : '#';
  
  // Extract GitHub
  const githubMatch = resumeText.match(/github\.com\/([a-zA-Z0-9-]+)/i);
  const github = githubMatch ? `https://github.com/${githubMatch[1]}` : '#';
  
  // Extract title/role
  const titlePatterns = [
    /(?:^|\n)([A-Z][a-zA-Z\s&]+(?:Developer|Engineer|Designer|Manager|Director|Lead|Architect|Analyst|Consultant|Specialist))/m,
    /(?:Title|Role|Position)[:\s]+([^\n]+)/i,
    /(?:—|–|-)\s*([A-Z][a-zA-Z\s&]+(?:Developer|Engineer|Designer|Manager|Lead))/
  ];
  let title = "Full Stack Developer";
  for (const pattern of titlePatterns) {
    const match = resumeText.match(pattern);
    if (match) { title = match[1].trim(); break; }
  }
  
  // Strip common label prefixes and headers (e.g. "Title:", "Role:", "Experience", etc.) from the title
  title = title.replace(/^(title|role|experience|education|summary|about|skills|projects|work|history|employment|professional)[:\s\-—–·|]*/i, '').trim();
  
  // Extract location (used in meta tags if needed)
  const locationMatch = resumeText.match(/(?:^|\s)([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*,\s*[A-Z]{2})/m) ||
                        resumeText.match(/([A-Z][a-zA-Z]+,\s*[A-Z][a-zA-Z]+)/);
  const _location = locationMatch ? locationMatch[1] : 'United States';
  void _location;
  
  // Calculate years of experience
  const yearMatches = resumeText.match(/\b(19|20)\d{2}\b/g);
  const years = yearMatches ? Math.max(1, new Date().getFullYear() - Math.min(...yearMatches.map(Number))) : 5;

  // Extract about/summary
  const aboutMatch = resumeText.match(/(?:ABOUT|SUMMARY|PROFILE|OBJECTIVE)[:\s]*\n?([\s\S]*?)(?=\n[A-Z]{2,}|\n\n[A-Z]|$)/i);
  const about = aboutMatch ? aboutMatch[1].trim().substring(0, 500) : 
    `Passionate ${title} with extensive experience in building scalable solutions and delivering exceptional results. Committed to continuous learning and innovation.`;

  // Extract experience section text
  const expMatch = resumeText.match(/(?:EXPERIENCE|WORK HISTORY|EMPLOYMENT|WORK EXPERIENCE)[:\s]*\n?([\s\S]*?)(?=\n(?:SKILLS|EDUCATION|PROJECTS|CERTIFICATIONS|ACHIEVEMENTS|LICENSES|HONORS|PUBLICATIONS)|$)/i);
  const expText = expMatch ? expMatch[1] : '';
  const expLines = expText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const experiences: Array<{company: string, role: string, period: string, bullets: string[]}> = [];
  const dateRangeRegex = /(?:\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\b\d{4}|\b\d{2}\/\d{4})\s*(?:-|–|—|to)\s*(?:\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\b\d{4}|\b\d{2}\/\d{4}|Present|Current|Active)/i;
  
  let currentEntry: typeof experiences[0] | null = null;
  
  for (let i = 0; i < expLines.length; i++) {
    const line = expLines[i];
    const hasDate = dateRangeRegex.test(line);
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line);
    
    if (hasDate) {
      if (currentEntry) {
        experiences.push(currentEntry);
      }
      
      const dateMatch = line.match(dateRangeRegex);
      const period = dateMatch ? dateMatch[0] : '2021 - Present';
      
      let headerText = line.replace(dateRangeRegex, '').replace(/[()]/g, '').trim();
      if (headerText.length < 4 && i > 0) {
        const prevLine = expLines[i - 1];
        if (!dateRangeRegex.test(prevLine) && !prevLine.startsWith('•') && !prevLine.startsWith('-') && !prevLine.startsWith('*')) {
          headerText = prevLine + ' ' + headerText;
        }
      }
      
      headerText = headerText.replace(/^[—–\-·,|:\s]+/, '').replace(/[—–\-·,|:\s]+$/, '').trim();
      
      let company = 'Company';
      let role = title;
      
      const parts = headerText.split(/\s*(?:—|–|-|\||·|,|at\s+)\s*/);
      if (parts.length >= 2) {
        const roleKeywords = /(?:Engineer|Developer|Designer|Manager|Lead|Architect|Analyst|Consultant|Director|Specialist|Writer|Expert|Scientist|VP|Head|Intern)/i;
        if (roleKeywords.test(parts[1])) {
          company = parts[0];
          role = parts[1];
        } else if (roleKeywords.test(parts[0])) {
          role = parts[0];
          company = parts[1];
        } else {
          company = parts[0];
          role = parts[1];
        }
      } else if (parts.length === 1 && parts[0].length > 0) {
        const atMatch = parts[0].match(/(.+?)\s+at\s+(.+)/i);
        if (atMatch) {
          role = atMatch[1].trim();
          company = atMatch[2].trim();
        } else {
          if (/(?:Engineer|Developer|Designer|Manager|Lead|Architect|Analyst|Consultant)/i.test(parts[0])) {
            role = parts[0];
            company = 'Company';
          } else {
            company = parts[0];
            role = title;
          }
        }
      }
      
      currentEntry = {
        company: company.trim() || 'Company',
        role: role.trim() || title,
        period: period.trim(),
        bullets: []
      };
    } else {
      if (currentEntry) {
        if (isBullet || line.length > 10) {
          const cleanedBullet = line.replace(/^[\s•\-*]+/, '').replace(/^\d+\.\s*/, '').trim();
          if (cleanedBullet.length > 5) {
            currentEntry.bullets.push(cleanedBullet);
          }
        }
      } else {
        const nextLineHasDate = (i + 1 < expLines.length) && dateRangeRegex.test(expLines[i + 1]);
        if (nextLineHasDate && !isBullet) {
          // Lookahead header handled by next iteration's prevLine check
        }
      }
    }
  }
  
  if (currentEntry) {
    experiences.push(currentEntry);
  }

  // Fallback to simpler line parser if no date ranges were found
  if (experiences.length === 0) {
    let currentExp: typeof experiences[0] | null = null;
    for (const line of expLines) {
      const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line);
      if (!isBullet && /^[A-Z]/.test(line)) {
        if (currentExp) experiences.push(currentExp);
        let rest = line.replace(/[()]/g, '').trim();
        let company = 'Company';
        let role = title;
        let period = '2020 - Present';
        
        const parts = rest.split(/\s*(?:—|–|-|\||·|,|at\s+)\s*/);
        if (parts.length >= 2) {
          company = parts[0];
          role = parts[1];
        } else {
          company = parts[0];
        }
        currentExp = { company, role, period, bullets: [] };
      } else if (currentExp && (isBullet || line.length > 8)) {
        currentExp.bullets.push(line.replace(/^[\s•\-*]+/, '').trim());
      }
    }
    if (currentExp) experiences.push(currentExp);
  }
  
  if (experiences.length === 0) {
    experiences.push({
      company: 'Leading Technology Company',
      role: title,
      period: '2020 - Present',
      bullets: ['Led development of scalable solutions', 'Mentored team members', 'Improved system performance by 40%']
    });
  }
  
  // Extract skills
  const skillsMatch = resumeText.match(/(?:SKILLS|TECHNOLOGIES|TECH STACK|TECHNICAL SKILLS)[:\s]*\n?([\s\S]*?)(?=\n(?:EXPERIENCE|EDUCATION|PROJECTS|CERTIFICATIONS|ABOUT)|$)/i);
  const skillsText = skillsMatch ? skillsMatch[1] : resumeText;
  
  const skillKeywords = [
    'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'C++', 'C#',
    'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'SQL', 'PostgreSQL', 'MongoDB', 'Redis',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'GraphQL', 'REST', 'Git', 'CI/CD', 'Agile',
    'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'HTML', 'CSS', 'SASS', 'Tailwind',
    'Next.js', 'Express', 'Django', 'Flask', 'Spring', 'TensorFlow', 'PyTorch', 'Machine Learning'
  ];
  
  const foundSkills = skillKeywords.filter(skill => 
    new RegExp(skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(skillsText)
  ).slice(0, 12);
  
  const skills = foundSkills.length >= 4 ? foundSkills : 
    ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'SQL', 'Git', 'AWS'];
  
  // Extract education
  const eduMatch = resumeText.match(/(?:EDUCATION|ACADEMIC)[:\s]*\n?([\s\S]*?)(?=\n(?:SKILLS|EXPERIENCE|PROJECTS|CERTIFICATIONS)|$)/i);
  const eduText = eduMatch ? eduMatch[1] : '';
  
  const degreeMatch = eduText.match(/(?:B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|Ph\.?D\.?|Bachelor|Master|Doctor)[^\n]*/i);
  const degree = degreeMatch ? degreeMatch[0].trim() : 'Bachelor of Science in Computer Science';
  
  const universityMatch = eduText.match(/(?:University|College|Institute|School)[^\n,]*/i);
  const university = universityMatch ? universityMatch[0].trim() : 'University';
  
  // Extract projects
  const projMatch = resumeText.match(/(?:PROJECTS|PORTFOLIO|WORK)[:\s]*\n?([\s\S]*?)(?=\n(?:SKILLS|EDUCATION|EXPERIENCE|CERTIFICATIONS)|$)/i);
  const projText = projMatch ? projMatch[1] : '';
  
  const projects: Array<{name: string, desc: string, tech: string[]}> = [];
  const projLines = projText.split('\n').filter(l => l.trim());
  
  for (let i = 0; i < projLines.length && projects.length < 3; i++) {
    const line = projLines[i];
    if (line.match(/^[A-Z]/) && !line.startsWith('•')) {
      const projName = line.split(/[—\-·(]/)[0].trim();
      const desc = projLines[i + 1]?.replace(/^[\s•\-*]+/, '').trim() || 'A sophisticated solution built with modern technologies';
      const techInDesc = skills.filter(s => line.toLowerCase().includes(s.toLowerCase()) || desc.toLowerCase().includes(s.toLowerCase())).slice(0, 3);
      projects.push({
        name: projName.substring(0, 40),
        desc: desc.substring(0, 150),
        tech: techInDesc.length > 0 ? techInDesc : skills.slice(0, 3)
      });
    }
  }
  
  if (projects.length === 0) {
    projects.push(
      { name: 'Enterprise Platform', desc: 'Scalable cloud-native application serving thousands of users', tech: skills.slice(0, 3) },
      { name: 'Analytics Dashboard', desc: 'Real-time data visualization and reporting system', tech: skills.slice(1, 4) },
      { name: 'Mobile Application', desc: 'Cross-platform mobile app with seamless user experience', tech: skills.slice(2, 5) }
    );
  }
  
  // Extract tagline (look for a single sentence right under the name or in the bio)
  let tagline = '';
  const nameIndex = lines.indexOf(name);
  if (nameIndex !== -1 && lines[nameIndex + 1]) {
    const nextLine = lines[nameIndex + 1].trim();
    if (nextLine.length > 10 && nextLine.length < 80 && !nextLine.includes('@') && !nextLine.includes('linkedin.com')) {
      tagline = nextLine;
    }
  }
  if (!tagline) {
    tagline = `Passionate ${title} with ${years}+ years of experience crafting modern, high-performance solutions.`;
  }

  // Extract certifications
  const certsMatch = resumeText.match(/(?:CERTIFICATIONS|LICENSES|CREDENTIALS|ACHIEVEMENTS)[:\s]*\n?([\s\S]*?)(?=\n(?:SKILLS|EXPERIENCE|PROJECTS|EDUCATION|ABOUT)|$)/i);
  const certsText = certsMatch ? certsMatch[1] : '';
  const certifications: Array<{name: string, issuer: string, date: string}> = [];
  
  if (certsText.trim()) {
    const certLines = certsText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    for (const line of certLines) {
      let cleanedLine = line.replace(/^[\s•\-*]+/, '').trim();
      const yearMatch = cleanedLine.match(/\b(19|20)\d{2}\b/);
      const date = yearMatch ? yearMatch[0] : '';
      if (yearMatch) {
        cleanedLine = cleanedLine.replace(new RegExp(`\\s*\\(?${yearMatch[0]}\\)?`), '').trim();
      }
      cleanedLine = cleanedLine.replace(/^[—–\-·,|:\s]+/, '').replace(/[—–\-·,|:\s]+$/, '').trim();
      
      const parts = cleanedLine.split(/\s*(?:—|–|-|,)\s*/);
      let name = cleanedLine;
      let issuer = 'Verified Credential';
      if (parts.length >= 2) {
        name = parts[0];
        issuer = parts[1];
      }
      certifications.push({
        name: name.trim(),
        issuer: issuer.trim(),
        date: date.trim() || 'Active'
      });
    }
  }

  const certsHtml = certifications.length > 0 ? `
    <!-- Certifications Section -->
    <section id="certifications" class="section">
        <div class="container">
            <div class="section-header animate">
                <span class="section-label">${templateId === 'tech' ? './credentials' : 'Certifications'}</span>
                <h2 class="section-title">${templateId === 'tech' ? 'cat certs_and_licenses.txt' : 'Licenses & Certifications'}</h2>
            </div>
            <div class="certs-grid">
                ${certifications.map(cert => `
                <div class="cert-card animate">
                    <div class="cert-icon">🏆</div>
                    <div class="cert-info">
                        <h3 class="cert-name">${cert.name}</h3>
                        <p class="cert-issuer">${cert.issuer}</p>
                        <span class="cert-date">${cert.date}</span>
                    </div>
                </div>`).join('\n                ')}
            </div>
        </div>
    </section>
  ` : '';

  // Generate HTML
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${name} - ${title}. Professional portfolio showcasing expertise and projects.">
    <meta name="keywords" content="${name}, ${title}, ${skills.slice(0, 5).join(', ')}, portfolio">
    <meta name="author" content="${name}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${name} | ${title}">
    <meta property="og:description" content="Professional portfolio of ${name}, a ${title} with ${years}+ years of experience.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://${firstName.toLowerCase()}${lastName.toLowerCase()}.dev">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${name} | ${title}">
    <meta name="twitter:description" content="Professional portfolio of ${name}">
    
    <title>${name} | ${title}</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    ${fontLinks}
    
    <link rel="stylesheet" href="styles.css">
    
    <!-- Schema.org -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "${name}",
        "jobTitle": "${title}",
        "url": "https://${firstName.toLowerCase()}${lastName.toLowerCase()}.dev",
        "sameAs": [
            "${linkedin}",
            "${github}"
        ]
    }
    </script>
</head>
<body>
    <!-- Progress Bar -->
    <div id="progress-bar"></div>
    
    <!-- Loader -->
    <div id="loader">
        <div class="loader-content">
            <div class="loader-spinner"></div>
            <span class="loader-text">Loading</span>
        </div>
    </div>

    <!-- Navigation -->
    <nav id="navbar">
        <div class="nav-container">
            <a href="#hero" class="nav-logo">${initials}</a>
            <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <ul class="nav-menu">
                <li><a href="#about" class="nav-link">About</a></li>
                <li><a href="#experience" class="nav-link">Experience</a></li>
                <li><a href="#skills" class="nav-link">Skills</a></li>
                <li><a href="#projects" class="nav-link">Projects</a></li>
                ${certifications.length > 0 ? `<li><a href="#certifications" class="nav-link">Certifications</a></li>` : ''}
                <li><a href="#contact" class="nav-link nav-cta">Contact</a></li>
            </ul>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="hero">
        <div class="hero-bg">
            <div class="hero-gradient"></div>
            <div class="hero-grid"></div>
            <div class="floating-shape shape-1"></div>
            <div class="floating-shape shape-2"></div>
            <div class="floating-shape shape-3"></div>
        </div>
        <div class="hero-content">
            <p class="hero-greeting reveal reveal-1">Hello, I'm</p>
            <h1 class="hero-name reveal reveal-2">${name}</h1>
            <div class="hero-title reveal reveal-3">
                <span id="typed-text"></span><span class="cursor">|</span>
            </div>
            <p class="hero-tagline reveal reveal-4">${tagline}</p>
            <div class="hero-cta reveal reveal-5">
                <a href="#projects" class="btn btn-primary">View My Work</a>
                <a href="#contact" class="btn btn-secondary">Get In Touch</a>
            </div>
        </div>
        <a href="#about" class="scroll-indicator" aria-label="Scroll to about">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M19 12l-7 7-7-7"/>
            </svg>
        </a>
    </section>

    <!-- About Section -->
    <section id="about" class="section">
        <div class="container">
            <div class="section-header animate">
                <span class="section-label">${labels.aboutLabel}</span>
                <h2 class="section-title">${labels.aboutTitle}</h2>
            </div>
            <div class="about-grid">
                <div class="about-content animate">
                    <p class="about-text">${about}</p>
                    <blockquote class="about-quote">
                        "Building solutions that make a difference, one line of code at a time."
                    </blockquote>
                </div>
                <div class="about-stats">
                    <div class="stat-card animate">
                        <span class="stat-number">${years}+</span>
                        <span class="stat-label">Years Experience</span>
                    </div>
                    <div class="stat-card animate">
                        <span class="stat-number">${Math.max(projects.length * 10, 20)}+</span>
                        <span class="stat-label">Projects Completed</span>
                    </div>
                    <div class="stat-card animate">
                        <span class="stat-number">${experiences.length}+</span>
                        <span class="stat-label">Companies</span>
                    </div>
                    <div class="stat-card animate">
                        <span class="stat-number">${skills.length}+</span>
                        <span class="stat-label">Technologies</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Experience Section -->
    <section id="experience" class="section section-alt">
        <div class="container">
            <div class="section-header animate">
                <span class="section-label">${labels.expLabel}</span>
                <h2 class="section-title">${labels.expTitle}</h2>
            </div>
            <div class="timeline">
                ${experiences.map((exp, i) => `
                <div class="timeline-entry ${i % 2 === 0 ? 'left' : 'right'} animate">
                    <div class="timeline-dot"></div>
                    <div class="timeline-card">
                        <div class="timeline-header">
                            <div class="company-logo">${exp.company[0]}</div>
                            <div class="timeline-info">
                                <h3 class="timeline-company">${exp.company}</h3>
                                <p class="timeline-role">${exp.role}</p>
                                <span class="timeline-period">${exp.period}</span>
                            </div>
                        </div>
                        <ul class="timeline-bullets">
                            ${exp.bullets.map(b => `<li>${b}</li>`).join('\n                            ')}
                        </ul>
                    </div>
                </div>`).join('\n                ')}
            </div>
        </div>
    </section>

    <!-- Skills Section -->
    <section id="skills" class="section">
        <div class="container">
            <div class="section-header animate">
                <span class="section-label">${labels.skillsLabel}</span>
                <h2 class="section-title">${labels.skillsTitle}</h2>
            </div>
            <div class="skills-grid">
                ${skills.map((skill, i) => `
                <div class="skill-item animate">
                    <div class="skill-header">
                        <span class="skill-name">${skill}</span>
                        <span class="skill-percent">${90 - (i * 5)}%</span>
                    </div>
                    <div class="skill-bar">
                        <div class="skill-bar-fill" data-width="${90 - (i * 5)}"></div>
                    </div>
                </div>`).join('\n                ')}
            </div>
        </div>
    </section>

    <!-- Projects Section -->
    <section id="projects" class="section section-alt">
        <div class="container">
            <div class="section-header animate">
                <span class="section-label">${labels.projectsLabel}</span>
                <h2 class="section-title">${labels.projectsTitle}</h2>
            </div>
            <div class="projects-grid">
                ${projects.map((proj, i) => `
                <div class="project-card animate">
                    <div class="project-image gradient-${(i % 3) + 1}">
                        <div class="project-overlay">
                            <a href="#" class="project-link" aria-label="View project">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                    <polyline points="15 3 21 3 21 9"/>
                                    <line x1="10" y1="14" x2="21" y2="3"/>
                                </svg>
                            </a>
                            <a href="#" class="project-link" aria-label="View code">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div class="project-content">
                        <h3 class="project-title">${proj.name}</h3>
                        <p class="project-desc">${proj.desc}</p>
                        <div class="project-tech">
                            ${proj.tech.map(t => `<span class="tech-badge">${t}</span>`).join('\n                            ')}
                        </div>
                    </div>
                </div>`).join('\n                ')}
            </div>
        </div>
    </section>

    ${certsHtml}

    <!-- Education Section -->
    <section id="education" class="section">
        <div class="container">
            <div class="section-header animate">
                <span class="section-label">Education</span>
                <h2 class="section-title">Academic Background</h2>
            </div>
            <div class="education-grid">
                <div class="education-card animate">
                    <div class="education-icon">🎓</div>
                    <h3 class="education-degree">${degree}</h3>
                    <p class="education-school">${university}</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="section section-alt">
        <div class="container">
            <div class="section-header animate">
                <span class="section-label">${labels.contactLabel}</span>
                <h2 class="section-title">${labels.contactTitle}</h2>
                <p class="section-subtitle">Have a project in mind? Let's create something amazing.</p>
            </div>
            <div class="contact-wrapper">
                <form id="contact-form" class="contact-form animate">
                    <div class="form-group">
                        <input type="text" id="name" name="name" required placeholder=" ">
                        <label for="name">Your Name</label>
                    </div>
                    <div class="form-group">
                        <input type="email" id="email" name="email" required placeholder=" ">
                        <label for="email">Your Email</label>
                    </div>
                    <div class="form-group">
                        <textarea id="message" name="message" rows="5" required placeholder=" "></textarea>
                        <label for="message">Your Message</label>
                    </div>
                    <button type="submit" class="btn btn-primary btn-full">
                        <span>Send Message</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"/>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                    </button>
                </form>
                <div id="form-success" class="form-success">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <h3>Message Sent!</h3>
                    <p>Thank you for reaching out. I'll get back to you soon.</p>
                </div>
                <div class="contact-social animate">
                    <a href="mailto:${email}" class="social-link" aria-label="Email">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                    </a>
                    <a href="${linkedin}" class="social-link" aria-label="LinkedIn" target="_blank" rel="noopener">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                            <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
                        </svg>
                    </a>
                    <a href="${github}" class="social-link" aria-label="GitHub" target="_blank" rel="noopener">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p>&copy; ${new Date().getFullYear()} ${name}. All rights reserved.</p>
            <p class="footer-tagline">Designed & built from scratch</p>
            <a href="#hero" class="footer-top">Back to top ↑</a>
        </div>
    </footer>

    <!-- Back to Top -->
    <button id="back-top" aria-label="Back to top">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="18 15 12 9 6 15"/>
        </svg>
    </button>

    <script src="main.js" defer></script>
</body>
</html>`;

  // Generate CSS
  const css = `/* ═══════════════════════════════════════════════════════════════════════════
   ${name} - Portfolio Styles
   Fortune 500 Grade | 2026 Industry Standard
═══════════════════════════════════════════════════════════════════════════ */

/* ─── CSS Custom Properties ─── */
:root {
    ${rootVariables}
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
    --shadow-md: 0 8px 32px rgba(0, 0, 0, 0.4);
    --shadow-lg: 0 16px 64px rgba(0, 0, 0, 0.5);
    --shadow-accent: 0 8px 32px var(--color-accent-glow);
}

/* ─── Reset & Base ─── */
*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

html {
    scroll-behavior: smooth;
    scroll-padding-top: 80px;
}

body {
    font-family: var(--font-body);
    font-size: 16px;
    line-height: 1.6;
    color: var(--color-text);
    background: var(--color-bg);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
}

body.loaded #loader {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
}

::selection {
    background: var(--color-accent);
    color: var(--color-bg);
}

::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: var(--color-surface);
}

::-webkit-scrollbar-thumb {
    background: var(--color-accent);
    border-radius: 3px;
}

img, video {
    max-width: 100%;
    height: auto;
    display: block;
}

a {
    color: inherit;
    text-decoration: none;
}

button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
}

ul, ol {
    list-style: none;
}

/* ─── Typography ─── */
h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
}

h1 { font-size: clamp(3rem, 8vw, 5.5rem); }
h2 { font-size: clamp(2rem, 5vw, 3rem); }
h3 { font-size: clamp(1.25rem, 3vw, 1.5rem); }

p {
    color: var(--color-text-muted);
    line-height: 1.8;
}

/* ─── Layout ─── */
.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
}

.section {
    padding: 120px 0;
    position: relative;
}

.section-alt {
    background: var(--color-surface);
}

.section-header {
    text-align: center;
    margin-bottom: 64px;
}

.section-label {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-accent);
    margin-bottom: 16px;
    padding: 8px 16px;
    background: var(--color-accent-glow);
    border-radius: var(--radius-full);
}

.section-title {
    color: var(--color-text);
    margin-bottom: 16px;
}

.section-subtitle {
    font-size: 1.125rem;
    max-width: 500px;
    margin: 0 auto;
}

/* ─── Progress Bar ─── */
#progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--color-accent), var(--color-accent-light));
    width: 0%;
    z-index: 9999;
    transition: width 0.1s;
}

/* ─── Loader ─── */
#loader {
    position: fixed;
    inset: 0;
    background: var(--color-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    transition: opacity 0.5s, visibility 0.5s;
}

.loader-content {
    text-align: center;
}

.loader-spinner {
    width: 48px;
    height: 48px;
    border: 3px solid var(--color-border);
    border-top-color: var(--color-accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
}

.loader-text {
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--color-text-muted);
    letter-spacing: 0.1em;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* ─── Navigation ─── */
#navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 20px 0;
    transition: var(--transition);
}

#navbar.scrolled {
    background: rgba(10, 10, 15, 0.9);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--color-border);
    padding: 12px 0;
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.nav-logo {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 700;
    color: var(--color-text);
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--color-accent), var(--color-accent-light));
    border-radius: var(--radius-sm);
    transition: var(--transition);
}

.nav-logo:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-accent);
}

.nav-menu {
    display: flex;
    align-items: center;
    gap: 8px;
}

.nav-link {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-muted);
    padding: 10px 20px;
    border-radius: var(--radius-full);
    transition: var(--transition);
}

.nav-link:hover,
.nav-link.active {
    color: var(--color-text);
    background: var(--color-surface-2);
}

.nav-link.nav-cta {
    background: var(--color-accent);
    color: white;
}

.nav-link.nav-cta:hover {
    background: var(--color-accent-light);
    box-shadow: var(--shadow-accent);
}

.nav-toggle {
    display: none;
    width: 32px;
    height: 24px;
    flex-direction: column;
    justify-content: space-between;
    padding: 4px 0;
}

.nav-toggle span {
    display: block;
    height: 2px;
    background: var(--color-text);
    border-radius: 1px;
    transition: var(--transition);
}

/* ─── Hero Section ─── */
#hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.hero-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
}

.hero-gradient {
    position: absolute;
    inset: 0;
    background: 
        radial-gradient(ellipse 80% 50% at 50% -20%, var(--color-accent-glow), transparent),
        radial-gradient(ellipse 60% 40% at 80% 60%, var(--color-accent-glow), transparent);
}

.hero-grid {
    position: absolute;
    inset: 0;
    background-image: 
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse at center, black, transparent 80%);
}

.floating-shape {
    position: absolute;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--color-accent-glow);
    opacity: 0.1;
}

.shape-1 {
    width: 120px;
    height: 120px;
    top: 15%;
    right: 10%;
    animation: float 8s ease-in-out infinite;
}

.shape-2 {
    width: 80px;
    height: 80px;
    bottom: 20%;
    left: 8%;
    border-radius: 50%;
    animation: float 10s ease-in-out infinite reverse;
}

.shape-3 {
    width: 60px;
    height: 60px;
    top: 40%;
    left: 15%;
    animation: float 12s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
}

.hero-content {
    position: relative;
    z-index: 1;
    text-align: center;
    max-width: 900px;
    padding: 0 24px;
}

.hero-greeting {
    font-family: var(--font-mono);
    font-size: 16px;
    color: var(--color-accent);
    margin-bottom: 16px;
    letter-spacing: 0.1em;
}

.hero-name {
    background: linear-gradient(135deg, var(--color-text) 0%, var(--color-accent-light) 50%, var(--color-accent) 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 4s linear infinite;
    margin-bottom: 16px;
}

@keyframes shimmer {
    to { background-position: 200% center; }
}

.hero-title {
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    color: var(--color-text);
    margin-bottom: 24px;
    min-height: 1.5em;
}

.cursor {
    display: inline-block;
    animation: blink 1s step-end infinite;
    color: var(--color-accent);
}

@keyframes blink {
    50% { opacity: 0; }
}

.hero-tagline {
    font-size: 1.125rem;
    max-width: 600px;
    margin: 0 auto 40px;
}

.hero-cta {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
}

.scroll-indicator {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    color: var(--color-text-muted);
    animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(10px); }
}

/* ─── Reveal Animations ─── */
.reveal {
    opacity: 0;
    transform: translateY(30px);
    animation: revealUp 0.8s ease forwards;
}

.reveal-1 { animation-delay: 0.1s; }
.reveal-2 { animation-delay: 0.2s; }
.reveal-3 { animation-delay: 0.3s; }
.reveal-4 { animation-delay: 0.4s; }
.reveal-5 { animation-delay: 0.5s; }

@keyframes revealUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}

.animate.is-visible {
    opacity: 1;
    transform: translateY(0);
}

/* ─── Buttons ─── */
.btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 600;
    padding: 16px 32px;
    border-radius: var(--radius-full);
    transition: var(--transition);
    position: relative;
    overflow: hidden;
}

.btn-primary {
    background: linear-gradient(135deg, var(--color-accent), var(--color-accent-light));
    color: white;
}

.btn-primary::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transform: translateX(-100%);
    transition: transform 0.5s;
}

.btn-primary:hover::before {
    transform: translateX(100%);
}

.btn-primary:hover {
    box-shadow: var(--shadow-accent);
    transform: translateY(-2px);
}

.btn-secondary {
    background: transparent;
    color: var(--color-text);
    border: 1px solid var(--color-border);
}

.btn-secondary:hover {
    background: var(--color-surface-2);
    border-color: var(--color-accent);
}

.btn-full {
    width: 100%;
    justify-content: center;
}

/* ─── About Section ─── */
.about-grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 64px;
    align-items: start;
}

.about-text {
    font-size: 1.125rem;
    line-height: 1.9;
    margin-bottom: 32px;
}

.about-quote {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-style: italic;
    color: var(--color-text);
    padding-left: 24px;
    border-left: 3px solid var(--color-accent);
}

.about-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

.stat-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 32px 24px;
    text-align: center;
    transition: var(--transition);
}

.stat-card:hover {
    border-color: var(--color-accent);
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
}

.stat-number {
    display: block;
    font-family: var(--font-display);
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--color-accent);
    margin-bottom: 8px;
}

.stat-label {
    font-size: 14px;
    color: var(--color-text-muted);
}

/* ─── Timeline ─── */
.timeline {
    position: relative;
    max-width: 900px;
    margin: 0 auto;
}

.timeline::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, var(--color-accent), var(--color-border));
    transform: translateX(-50%);
}

.timeline-entry {
    position: relative;
    width: 50%;
    padding: 0 40px 60px;
}

.timeline-entry.left {
    padding-right: 60px;
    text-align: right;
}

.timeline-entry.right {
    margin-left: 50%;
    padding-left: 60px;
}

.timeline-dot {
    position: absolute;
    top: 0;
    width: 16px;
    height: 16px;
    background: var(--color-accent);
    border: 3px solid var(--color-bg);
    border-radius: 50%;
    z-index: 1;
}

.timeline-entry.left .timeline-dot {
    right: -8px;
}

.timeline-entry.right .timeline-dot {
    left: -8px;
}

.timeline-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 28px;
    transition: var(--transition);
}

.timeline-card:hover {
    border-color: var(--color-accent);
    box-shadow: var(--shadow-md);
}

.timeline-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
}

.timeline-entry.left .timeline-header {
    flex-direction: row-reverse;
}

.company-logo {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--color-accent), var(--color-accent-light));
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 20px;
    color: white;
    flex-shrink: 0;
}

.timeline-company {
    font-size: 1.125rem;
    color: var(--color-text);
    margin-bottom: 4px;
}

.timeline-role {
    font-size: 14px;
    color: var(--color-accent);
    margin-bottom: 4px;
}

.timeline-period {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-text-dim);
}

.timeline-bullets {
    text-align: left;
}

.timeline-bullets li {
    position: relative;
    padding-left: 20px;
    margin-bottom: 10px;
    font-size: 14px;
    color: var(--color-text-muted);
}

.timeline-bullets li::before {
    content: '▸';
    position: absolute;
    left: 0;
    color: var(--color-accent);
}

/* ─── Skills ─── */
.skills-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 32px 64px;
    max-width: 900px;
    margin: 0 auto;
}

.skill-item {
    transition: var(--transition);
}

.skill-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
}

.skill-name {
    font-weight: 600;
    color: var(--color-text);
}

.skill-percent {
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--color-accent);
}

.skill-bar {
    height: 8px;
    background: var(--color-surface-2);
    border-radius: 4px;
    overflow: hidden;
}

.skill-bar-fill {
    height: 100%;
    width: 0;
    background: linear-gradient(90deg, var(--color-accent), var(--color-accent-light));
    border-radius: 4px;
    transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
}

.skill-bar-fill::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: skillShimmer 2s ease-in-out infinite;
}

@keyframes skillShimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

/* ─── Projects ─── */
.projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    gap: 32px;
}

.project-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    overflow: hidden;
    transition: var(--transition);
}

.project-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-accent);
}

.project-image {
    height: 200px;
    position: relative;
    overflow: hidden;
}

.gradient-1 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.gradient-2 { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.gradient-3 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }

.project-overlay {
    position: absolute;
    inset: 0;
    background: rgba(10, 10, 15, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    opacity: 0;
    transition: var(--transition);
}

.project-card:hover .project-overlay {
    opacity: 1;
}

.project-link {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-accent);
    border-radius: 50%;
    color: white;
    transform: translateY(20px);
    transition: var(--transition);
}

.project-card:hover .project-link {
    transform: translateY(0);
}

.project-link:hover {
    background: var(--color-accent-light);
    transform: scale(1.1);
}

.project-content {
    padding: 28px;
}

.project-title {
    font-size: 1.25rem;
    color: var(--color-text);
    margin-bottom: 12px;
}

.project-desc {
    font-size: 14px;
    margin-bottom: 20px;
}

.project-tech {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.tech-badge {
    font-family: var(--font-mono);
    font-size: 11px;
    padding: 6px 12px;
    background: var(--color-accent-glow);
    color: var(--color-accent-light);
    border-radius: var(--radius-full);
}

/* ─── Education ─── */
.education-grid {
    max-width: 600px;
    margin: 0 auto;
}

.education-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 40px;
    text-align: center;
    transition: var(--transition);
}

.education-card:hover {
    border-color: var(--color-accent);
    box-shadow: var(--shadow-md);
}

.education-icon {
    font-size: 48px;
    margin-bottom: 20px;
}

.education-degree {
    color: var(--color-text);
    margin-bottom: 8px;
}

.education-school {
    color: var(--color-text-muted);
}

/* ─── Contact ─── */
.contact-wrapper {
    max-width: 560px;
    margin: 0 auto;
}

.contact-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.form-group {
    position: relative;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 20px;
    padding-top: 28px;
    font-family: var(--font-body);
    font-size: 16px;
    color: var(--color-text);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    outline: none;
    transition: var(--transition);
    resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px var(--color-accent-glow);
}

.form-group label {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: var(--color-text-muted);
    pointer-events: none;
    transition: var(--transition);
}

.form-group textarea ~ label {
    top: 28px;
}

.form-group input:focus ~ label,
.form-group input:not(:placeholder-shown) ~ label,
.form-group textarea:focus ~ label,
.form-group textarea:not(:placeholder-shown) ~ label {
    top: 12px;
    font-size: 11px;
    color: var(--color-accent);
}

.form-success {
    display: none;
    text-align: center;
    padding: 48px;
    background: var(--color-surface);
    border: 1px solid var(--color-success);
    border-radius: var(--radius);
}

.form-success.show {
    display: block;
}

.form-success svg {
    color: var(--color-success);
    margin-bottom: 16px;
}

.form-success h3 {
    color: var(--color-text);
    margin-bottom: 8px;
}

.contact-social {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 48px;
}

.social-link {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 50%;
    color: var(--color-text-muted);
    transition: var(--transition);
}

.social-link:hover {
    color: var(--color-accent);
    border-color: var(--color-accent);
    transform: translateY(-4px);
    box-shadow: var(--shadow-accent);
}

/* ─── Footer ─── */
.footer {
    padding: 48px 0;
    text-align: center;
    border-top: 1px solid var(--color-border);
}

.footer p {
    font-size: 14px;
    margin-bottom: 8px;
}

.footer-tagline {
    font-family: var(--font-mono);
    font-size: 12px !important;
    color: var(--color-text-dim) !important;
}

.footer-top {
    display: inline-block;
    margin-top: 16px;
    font-size: 14px;
    color: var(--color-accent);
    transition: var(--transition);
}

.footer-top:hover {
    color: var(--color-accent-light);
}

/* ─── Back to Top ─── */
#back-top {
    position: fixed;
    bottom: 32px;
    right: 32px;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-accent);
    color: white;
    border-radius: 50%;
    opacity: 0;
    visibility: hidden;
    transform: translateY(20px);
    transition: var(--transition);
    z-index: 100;
    box-shadow: var(--shadow-accent);
}

#back-top.visible {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

#back-top:hover {
    background: var(--color-accent-light);
    transform: translateY(-4px);
}

/* ─── Responsive ─── */
@media (max-width: 1024px) {
    .about-grid {
        grid-template-columns: 1fr;
        gap: 48px;
    }
    
    .about-stats {
        max-width: 400px;
        margin: 0 auto;
    }
}

@media (max-width: 768px) {
    .nav-menu {
        position: fixed;
        top: 0;
        right: -100%;
        width: 80%;
        max-width: 320px;
        height: 100vh;
        background: var(--color-surface);
        flex-direction: column;
        padding: 100px 32px 32px;
        gap: 8px;
        transition: right 0.3s ease;
    }
    
    .nav-menu.open {
        right: 0;
    }
    
    .nav-link {
        width: 100%;
        text-align: center;
    }
    
    .nav-toggle {
        display: flex;
        z-index: 1001;
    }
    
    .nav-toggle.open span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .nav-toggle.open span:nth-child(2) {
        opacity: 0;
    }
    
    .nav-toggle.open span:nth-child(3) {
        transform: rotate(-45deg) translate(5px, -5px);
    }
    
    .section {
        padding: 80px 0;
    }
    
    .timeline::before {
        left: 0;
    }
    
    .timeline-entry,
    .timeline-entry.left,
    .timeline-entry.right {
        width: 100%;
        margin-left: 0;
        padding: 0 0 40px 40px;
        text-align: left;
    }
    
    .timeline-entry.left .timeline-header {
        flex-direction: row;
    }
    
    .timeline-dot,
    .timeline-entry.left .timeline-dot,
    .timeline-entry.right .timeline-dot {
        left: -8px;
        right: auto;
    }
    
    .skills-grid {
        grid-template-columns: 1fr;
        gap: 24px;
    }
    
    .projects-grid {
        grid-template-columns: 1fr;
    }
    
    .hero-cta {
        flex-direction: column;
        align-items: center;
    }
    
    .btn {
        width: 100%;
        max-width: 280px;
        justify-content: center;
    }
}

/* ─── Certifications ─── */
.certs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    margin-top: 32px;
}

.cert-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 24px;
    display: flex;
    gap: 20px;
    align-items: flex-start;
    transition: var(--transition);
}

.cert-card:hover {
    transform: translateY(-5px);
    border-color: var(--color-accent);
    box-shadow: var(--shadow-md);
}

.cert-icon {
    font-size: 28px;
    background: var(--color-accent-glow);
    width: 56px;
    height: 56px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.cert-info {
    flex: 1;
}

.cert-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 4px;
}

.cert-issuer {
    font-size: 14px;
    color: var(--color-text-muted);
    margin-bottom: 8px;
}

.cert-date {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-accent);
    background: var(--color-accent-glow);
    padding: 2px 8px;
    border-radius: var(--radius-full);
}
`;

  // Generate JavaScript
  const js = `'use strict';

/* ═══════════════════════════════════════════════════════════════════════════
   ${name} - Portfolio Scripts
   Fortune 500 Grade | 2026 Industry Standard
═══════════════════════════════════════════════════════════════════════════ */

// Utility: Debounce
function debounce(fn, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
}

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    // ─── Page Loader ───
    setTimeout(() => {
        document.body.classList.add('loaded');
        setTimeout(() => {
            const loader = document.getElementById('loader');
            if (loader) loader.remove();
        }, 500);
    }, 800);

    // ─── Scroll Progress Bar ───
    const progressBar = document.getElementById('progress-bar');
    const updateProgress = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        if (progressBar) progressBar.style.width = progress + '%';
    };
    window.addEventListener('scroll', debounce(updateProgress, 10));

    // ─── Navbar Behavior ───
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    const handleScroll = () => {
        // Scrolled class
        if (navbar) {
            navbar.classList.toggle('scrolled', window.scrollY > 80);
        }

        // Active section
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', debounce(handleScroll, 50));

    // ─── Smooth Scroll ───
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                // Close mobile menu
                document.querySelector('.nav-menu')?.classList.remove('open');
                document.querySelector('.nav-toggle')?.classList.remove('open');
            }
        });
    });

    // ─── Mobile Menu ───
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('open');
            navMenu.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', navMenu.classList.contains('open'));
        });
    }

    // ─── Intersection Observer - Animations ───
    const animateElements = document.querySelectorAll('.animate');
    const animateObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                animateObserver.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.15
    });

    animateElements.forEach(el => animateObserver.observe(el));

    // ─── Skill Bars ───
    const skillBars = document.querySelectorAll('.skill-bar-fill');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.dataset.width;
                entry.target.style.width = width + '%';
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => skillObserver.observe(bar));

    // ─── Typing Effect ───
    const typedElement = document.getElementById('typed-text');
    const titles = ${JSON.stringify([title, ...skills.slice(0, 2).map(s => s + ' Expert')])};
    let titleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentTitle = titles[titleIndex];
        
        if (isDeleting) {
            charIndex--;
            typedElement.textContent = currentTitle.substring(0, charIndex);
        } else {
            charIndex++;
            typedElement.textContent = currentTitle.substring(0, charIndex);
        }

        let typeSpeed = isDeleting ? 45 : 80;

        if (!isDeleting && charIndex === currentTitle.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            titleIndex = (titleIndex + 1) % titles.length;
            typeSpeed = 600;
        }

        setTimeout(type, typeSpeed);
    }

    if (typedElement) {
        setTimeout(type, 1000);
    }

    // ─── Back to Top ───
    const backTop = document.getElementById('back-top');
    
    const toggleBackTop = () => {
        if (backTop) {
            backTop.classList.toggle('visible', window.scrollY > 400);
        }
    };
    window.addEventListener('scroll', debounce(toggleBackTop, 100));

    if (backTop) {
        backTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ─── Contact Form ───
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Sending...</span>';
            submitBtn.disabled = true;

            setTimeout(() => {
                contactForm.style.display = 'none';
                if (formSuccess) formSuccess.classList.add('show');
                contactForm.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 1200);
        });
    }
});`;

  // Deployment steps and preview sites
  const deploymentSteps: DeploymentStep[] = [
    {
      step: 1,
      title: "Save your three files",
      description: "Create a new folder on your desktop named 'my-portfolio'. Save the three files exactly as: index.html, styles.css, and main.js — all in the same folder.",
      command: null,
      tip: "Keep all three files in the same directory or the styles and scripts won't load."
    },
    {
      step: 2,
      title: "Preview locally in your browser",
      description: "Double-click index.html to open it in your browser for a quick preview.",
      command: "npx serve . --open",
      tip: "For full functionality, run a local dev server using the command above."
    },
    {
      step: 3,
      title: "Create a free GitHub account",
      description: "Go to github.com and sign up. Create a new repository named: yourusername.github.io",
      command: null,
      tip: "The repository name must match your GitHub username exactly."
    },
    {
      step: 4,
      title: "Upload your portfolio files",
      description: "In your repository, click 'uploading an existing file' and drag all three files.",
      command: "git init && git add . && git commit -m 'Launch portfolio' && git push -u origin main",
      tip: "Use the terminal command if you're comfortable with Git."
    },
    {
      step: 5,
      title: "Enable GitHub Pages",
      description: "Go to Settings → Pages → Select 'main' branch → Save. Your site will be live in 1-5 minutes.",
      command: null,
      tip: "Your live URL will be: https://yourusername.github.io"
    },
    {
      step: 6,
      title: "Share your portfolio",
      description: "Add your portfolio URL to LinkedIn, your resume, email signature, and job applications.",
      command: null,
      tip: "Consider getting a custom domain like yourname.dev for ~$10/year."
    }
  ];

  const previewSites: PreviewSite[] = [
    { name: "Netlify Drop", url: "https://app.netlify.com/drop", description: "Drag and drop your folder for instant deployment.", badge: "Fastest" },
    { name: "GitHub Pages", url: "https://pages.github.com", description: "Free permanent hosting with your GitHub account.", badge: "Recommended" },
    { name: "Vercel", url: "https://vercel.com/new", description: "Connect GitHub for automatic deployments.", badge: "Free" },
    { name: "Tiiny.host", url: "https://tiiny.host", description: "Zip and upload for instant sharing.", badge: "Instant" },
    { name: "Surge.sh", url: "https://surge.sh", description: "One command deployment from terminal.", badge: "CLI" },
    { name: "Render", url: "https://render.com", description: "Free static hosting with SSL and CDN.", badge: "Free" }
  ];

  return { html, css, js, deploymentSteps, previewSites };
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function PortfolioForge() {
  const [page, setPage] = useState("landing");
  const [resumeText, setResumeText] = useState("");
  const [results, setResults] = useState<GenerationResult | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("html");
  const [copied, setCopied] = useState<string | null>(null);
  const [loadingIdx, setLoadingIdx] = useState(0);
  
  // New workflow states
  const [method, setMethod] = useState<"ai" | "template">("ai");
  const [aiProvider, setAiProvider] = useState<"openai" | "gemini">("openai");
  const [aiModel, setAiModel] = useState("gpt-4o");
  const [apiKey, setApiKey] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("executive");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [sandboxTab, setSandboxTab] = useState<"preview" | "upload">("preview");
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadingMsgs = [
    "Parsing your career narrative…",
    "Architecting section layouts…",
    "Selecting typography & colour palette…",
    "Writing production-grade HTML…",
    "Crafting animations & interactions…",
    "Building responsive CSS grid…",
    "Wiring up JavaScript behaviours…",
    "Polishing every pixel…",
    "Generating deployment guide…",
    "Almost there — final review…",
  ];

  /* inject global styles once */
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = G;
    document.head.appendChild(el);
    return () => { try { document.head.removeChild(el); } catch (_) {} };
  }, []);

  /* rotate loading messages */
  useEffect(() => {
    if (page !== "generating") return;
    timerRef.current = setInterval(
      () => setLoadingIdx(p => (p + 1) % loadingMsgs.length),
      2400
    );
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [page]);

  /* ── generate ── */
  const generate = async () => {
    if (method === "template") {
      setPage("generating");
      setLoadingIdx(0);
      setTimeout(() => {
        try {
          const fallbackResult = generateFallbackPortfolio(resumeText.trim(), selectedTemplate);
          setResults(fallbackResult);
          setActiveTab("html");
          setPage("results");
        } catch (fallbackErr) {
          setError(fallbackErr instanceof Error ? fallbackErr.message : "Generation failed.");
          setPage("method");
        }
      }, 2000);
      return;
    }

    if (!apiKey.trim()) {
      setError("Please provide an API key for the selected provider.");
      return;
    }

    setError("");
    setPage("generating");
    setLoadingIdx(0);
    try {
      const prompt = MASTER_PROMPT.replace("{RESUME}", resumeText.trim());
      
      let res;
      if (aiProvider === "openai") {
        res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: aiModel.trim() || "gpt-4o",
            messages: [{ role: "user", content: prompt }],
          }),
        });
      } else {
        // Gemini
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${aiModel.trim() || "gemini-1.5-pro"}:generateContent?key=${apiKey.trim()}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed with status ${res.status}`);
      }
      
      const data = await res.json();
      let raw = "";
      if (aiProvider === "openai") {
        raw = data.choices?.[0]?.message?.content || "";
      } else {
        raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
      
      /* robust JSON extraction */
      let clean = raw.replace(/^```json\s*/m, "").replace(/^```\s*/m, "").replace(/\s*```$/m, "").trim();
      if (!clean.startsWith("{")) {
        const s = clean.indexOf("{"), e = clean.lastIndexOf("}");
        if (s !== -1 && e !== -1) clean = clean.slice(s, e + 1);
      }
      const parsed = JSON.parse(clean);
      setResults(parsed);
      setActiveTab("html");
      setPage("results");
    } catch (err) {
      console.error("API failed:", err);
      setError(err instanceof Error ? err.message : "Generation failed. Please try again.");
      setPage("method");
    }
  };

  /* ── utils ── */
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2200);
    });
  };

  const download = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const getPreviewSrcDoc = (html: string, css: string, js: string) => {
    let srcDoc = html || "";
    // Remove references to external styles.css to prevent 404 console errors in iframe
    srcDoc = srcDoc.replace(/<link\s+[^>]*href=["'](?:\.\/)?styles\.css["'][^>]*>/gi, "");
    // Inject CSS before </head>
    if (srcDoc.includes("</head>")) {
      srcDoc = srcDoc.replace("</head>", `<style>${css}</style></head>`);
    } else {
      srcDoc = `<style>${css}</style>` + srcDoc;
    }
    // Remove references to external main.js
    srcDoc = srcDoc.replace(/<script\s+[^>]*src=["'](?:\.\/)?main\.js["'][^>]*><\/script>/gi, "");
    // Inject JS before </body>
    if (srcDoc.includes("</body>")) {
      srcDoc = srcDoc.replace("</body>", `<script>${js}</script></body>`);
    } else {
      srcDoc = srcDoc + `<script>${js}</script>`;
    }
    return srcDoc;
  };

  const NavBar = ({ onBack, showBack = true }: { onBack: () => void; showBack?: boolean }) => (
    <nav className="app-nav">
      {showBack
        ? <button onClick={onBack} style={{ background: "none", border: "none", color: "#55536A", cursor: "pointer", fontFamily: "'Manrope',sans-serif", fontSize: 13, display: "flex", alignItems: "center", gap: 7, transition: "color .2s" }} onMouseOver={e => (e.target as HTMLElement).style.color = "#C9A84C"} onMouseOut={e => (e.target as HTMLElement).style.color = "#55536A"}>← Back</button>
        : <div />}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 9, height: 9, borderRadius: 3, background: "linear-gradient(135deg,#C9A84C,#E8C76B)" }} />
        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: "0.14em", color: "#F2EEE8", textTransform: "uppercase" }}>PortfolioForge</span>
      </div>
      <div />
    </nav>
  );

  /* ═══════════════════════════════════════════════════════════════════════════
     PAGE: LANDING
  ═══════════════════════════════════════════════════════════════════════════ */
  if (page === "landing") return (
    <div style={{ minHeight: "100vh", background: "#07070F", overflow: "hidden", position: "relative" }} className="grid-bg">
      {/* Radial glow */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(201,168,76,0.065) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "60%", height: 1, background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.15),transparent)" }} />

      {/* crosshair deco */}
      <div style={{ position: "absolute", bottom: "28%", right: "4%" }} className="f1">
        <div style={{ width: 100, height: 1, background: "linear-gradient(90deg,transparent,rgba(201,168,76,.25),transparent)" }} />
        <div style={{ width: 1, height: 100, background: "linear-gradient(180deg,transparent,rgba(201,168,76,.25),transparent)", margin: "-50px 0 0 50px" }} />
      </div>

      {/* ── Top nav ── */}
      <div style={{ padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 9, height: 9, borderRadius: 3, background: "linear-gradient(135deg,#C9A84C,#E8C76B)" }} />
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: "0.14em", color: "#F2EEE8", textTransform: "uppercase" }}>PortfolioForge</span>
        </div>
        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
          {[0.12, 0.12, 1].map((o, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: `rgba(201,168,76,${o})` }} />)}
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 80px)", textAlign: "center", padding: "60px 24px 40px", gap: 0 }}>

        {/* pill */}
        <div className="u1" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "rgba(201,168,76,.08)", border: "1px solid rgba(201,168,76,.22)", borderRadius: 100, padding: "7px 18px", marginBottom: 36 }}>
          <div className="pulse-dot" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#C9A84C", letterSpacing: "0.12em", textTransform: "uppercase" }}>AI-Powered · Zero Setup · Plug In & Play</span>
        </div>

        {/* headline */}
        <h1 className="u2" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(40px,8.5vw,92px)", fontWeight: 800, lineHeight: 1.04, letterSpacing: "-0.035em", marginBottom: 26, maxWidth: 940 }}>
          Your Resume.<br />
          <span className="gt">Your Portfolio.</span><br />
          <span style={{ color: "#F2EEE8" }}>Live in Minutes.</span>
        </h1>

        {/* sub */}
        <p className="u3" style={{ fontSize: "clamp(15px,2vw,18px)", color: "#6D6B7B", lineHeight: 1.75, maxWidth: 580, marginBottom: 52 }}>
          Paste your resume text. Our AI generates a complete portfolio website — semantic HTML, responsive CSS, and interactive JS — crafted to impress hiring managers.
        </p>

        {/* CTAs */}
        <div className="u4" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 80 }}>
          <button className="btn-prime" onClick={() => setPage("input")} style={{ padding: "16px 44px", fontSize: 14 }}>
            Build My Portfolio →
          </button>
          <button className="btn-ghost" onClick={() => document.getElementById("lhow")?.scrollIntoView({ behavior: "smooth" })} style={{ padding: "16px 28px", fontSize: 14 }}>
            See How It Works
          </button>
        </div>

        {/* stats row */}
        <div className="u5" style={{ display: "flex", gap: 56, flexWrap: "wrap", justifyContent: "center", borderTop: "1px solid rgba(255,255,255,.05)", paddingTop: 40 }}>
          {[["3", "Files Output"], ["6+", "Deploy Platforms"], ["< 60s", "Generation Time"], ["0", "Config Required"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 800, color: "#C9A84C", lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 11, color: "#55536A", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 7 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <div id="lhow" style={{ maxWidth: 1000, margin: "0 auto", padding: "100px 24px 120px" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 }}>Process</p>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, color: "#F2EEE8", letterSpacing: "-0.025em" }}>Three Steps to Live</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
          {[
            { n: "01", t: "Paste Your Resume", d: "Copy-paste your resume text — experience, skills, projects, education, contact info. The more detail, the richer your site." },
            { n: "02", t: "AI Writes Your Code", d: "Our AI crafts production-grade HTML, CSS & JS — unique design, animations, responsive layout — tailored to your background." },
            { n: "03", t: "Deploy & Share", d: "Follow our 6-step walkthrough to publish on GitHub Pages, Netlify, or Vercel in minutes. No coding experience needed." },
          ].map(({ n, t, d }) => (
            <div key={n} className="card-h" style={{ padding: "32px 28px" }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 52, fontWeight: 800, color: "rgba(201,168,76,.12)", marginBottom: 18, lineHeight: 1 }}>{n}</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 19, fontWeight: 700, color: "#F2EEE8", marginBottom: 12 }}>{t}</div>
              <div style={{ fontSize: 14, color: "#6D6B7B", lineHeight: 1.78 }}>{d}</div>
            </div>
          ))}
        </div>

        {/* What you get */}
        <div style={{ marginTop: 52, background: "rgba(255,255,255,.018)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 16, padding: "32px 36px", display: "flex", gap: 48, flexWrap: "wrap", justifyContent: "center" }}>
          <div>
            <p style={{ fontSize: 11, color: "#55536A", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>What You'll Receive</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[["index.html", "Semantic, SEO-ready markup"], ["styles.css", "Responsive, animated styles"], ["main.js", "Scroll effects, typing, forms"], ["Deploy Guide", "6 plain-English steps"], ["6 Host Options", "Free platforms to go live"]].map(([f, d]) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "#C9A84C", minWidth: 100 }}>{f}</span>
                  <span style={{ fontSize: 13, color: "#55536A" }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <button className="btn-prime" onClick={() => setPage("input")} style={{ padding: "18px 52px", fontSize: 15 }}>
              Start Building →
            </button>
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,.04)", padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#3A384A" }}>Built by Sai Kiran</span>
        <span style={{ fontSize: 12, color: "#3A384A" }}>© 2026 PortfolioForge</span>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════════════════
     PAGE: INPUT
  ═══════════════════════════════════════════════════════════════════════════ */
  if (page === "input") return (
    <div style={{ minHeight: "100vh", background: "#07070F", display: "flex", flexDirection: "column" }} className="grid-bg">
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 55% 40% at 50% 0%, rgba(201,168,76,.042) 0%, transparent 60%)", pointerEvents: "none" }} />
      <NavBar onBack={() => setPage("landing")} />

      {/* Step indicator */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,.04)", padding: "12px 48px", display: "flex", alignItems: "center", gap: 10 }}>
        {["Input Resume", "→", "AI Generates", "→", "Your Portfolio"].map((s, i) => (
          <span key={i} style={{ fontSize: 12, color: i === 0 ? "#C9A84C" : "#3A384A", fontWeight: i === 0 ? 600 : 400, letterSpacing: "0.04em" }}>{s}</span>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 320px", maxWidth: 1100, margin: "0 auto", width: "100%", padding: "48px 24px", gap: 0 }}>

        {/* Left: textarea */}
        <div style={{ paddingRight: 44 }}>
          <div className="u1" style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>Step 01 of 01</p>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 700, letterSpacing: "-0.022em", color: "#F2EEE8", marginBottom: 8 }}>Paste Your Resume</h2>
            <p style={{ fontSize: 14, color: "#6D6B7B", lineHeight: 1.75 }}>Copy your resume from a Word doc, Google Doc, or PDF. Include all sections — the AI uses everything. Plain text is perfect.</p>
          </div>

          <div className="u3">
            <textarea
              className="resume-ta"
              placeholder={`Jane Smith — Product Designer & UX Lead
jane@design.co · linkedin.com/in/janesmith · behance.net/janesmith · San Francisco, CA

ABOUT
Award-winning Product Designer with 8+ years crafting user-centred digital experiences for fintech, health, and SaaS products. I bridge the gap between user research insights and pixel-perfect execution.

EXPERIENCE

Stripe — Senior Product Designer  (Jan 2021 – Present)
• Redesigned the Stripe Dashboard onboarding, reducing time-to-first-payment by 38%
• Led a 3-person design team to ship 6 major product features in 2023
• Established Stripe's first component library (Mosaic) used across 12 product teams

Airbnb — Product Designer  (May 2018 – Dec 2020)
• Designed Airbnb Experiences discovery flow (now used by 4M guests annually)
• Ran 15+ usability studies; findings drove a 22% uplift in booking completion
• Collaborated with engineering on a shared design system across iOS, Android, and web

SKILLS
Design: Figma, Sketch, Prototyping, Wireframing, Design Systems, Motion Design
Research: User Interviews, Usability Testing, A/B Testing, Heuristic Evaluation
Technical: HTML/CSS basics, Lottie animations, Storybook

PROJECTS
MediFlow — UX Case Study (mediflow.design)
Designed an end-to-end patient intake system for a telehealth startup. 0→1 product, shipped in 4 months.

EDUCATION
RISD — Rhode Island School of Design, BFA Graphic Design (2018)
Dean's List · Graduated with Distinction`}
              value={resumeText}
              onChange={e => { setResumeText(e.target.value); setError(""); }}
            />

            {error && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, background: "rgba(224,90,79,.06)", border: "1px solid rgba(224,90,79,.2)", borderRadius: 8, padding: "10px 14px" }}>
                <span style={{ fontSize: 13, color: "#E05A4F" }}>{error}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              <span style={{ fontSize: 12, color: resumeText.length < 120 ? "#E05A4F" : "#2FC87A", fontFamily: "'JetBrains Mono',monospace" }}>
                {resumeText.length} chars {resumeText.length < 120 ? `· need ${120 - resumeText.length} more` : "· ready ✓"}
              </span>
              <button
                className="btn-prime"
                onClick={() => setPage("method")}
                disabled={resumeText.trim().length < 120}
                style={{ padding: "14px 40px", fontSize: 14 }}
              >
                Next Step →
              </button>
            </div>
          </div>
        </div>

        {/* Right: tips */}
        <div className="u4" style={{ borderLeft: "1px solid rgba(255,255,255,.05)", paddingLeft: 40 }}>
          <p style={{ fontSize: 11, color: "#55536A", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 22 }}>Tips for Best Results</p>

          {[
            ["Contact info", "Email, LinkedIn, GitHub, city — used in the contact section and Open Graph meta tags."],
            ["Job entries", "Company name, title, dates (month + year), and 2–4 achievement bullets per role."],
            ["Projects", "Name, short description, tech stack, GitHub or live URL if you have one."],
            ["Specific skills", "Name exact tools (React, Figma, PostgreSQL) rather than vague categories."],
            ["Professional bio", "A 2–3 sentence summary generates a compelling About section and hero tagline."],
            ["Education", "Institution, degree, field, graduation year, GPA or honours if strong."],
          ].map(([t, d]) => (
            <div key={t} style={{ marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid rgba(255,255,255,.04)" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "#C9A84C", fontSize: 8, marginTop: 5, flexShrink: 0 }}>◆</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#F2EEE8", marginBottom: 4 }}>{t}</div>
                  <div style={{ fontSize: 12, color: "#6D6B7B", lineHeight: 1.65 }}>{d}</div>
                </div>
              </div>
            </div>
          ))}

          {/* Output preview card */}
          <div style={{ background: "rgba(201,168,76,.05)", border: "1px solid rgba(201,168,76,.14)", borderRadius: 12, padding: 18, marginTop: 4 }}>
            <p style={{ fontSize: 11, color: "#C9A84C", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>You'll Receive</p>
            {[["index.html", "Complete HTML document"], ["styles.css", "Responsive CSS with animations"], ["main.js", "Scroll effects & interactions"], ["Deploy Guide", "6-step instructions"], ["6 Platforms", "Free hosting options"]].map(([f, d]) => (
              <div key={f} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "#C9A84C" }}>{f}</span>
                <span style={{ fontSize: 11, color: "#6D6B7B" }}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════════════════
     PAGE: METHOD / CONFIG
  ═══════════════════════════════════════════════════════════════════════════ */
  if (page === "method") return (
    <div style={{ minHeight: "100vh", background: "#07070F", display: "flex", flexDirection: "column" }} className="grid-bg">
      <NavBar onBack={() => setPage("input")} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 24px", maxWidth: 1000, margin: "0 auto", width: "100%" }}>
        <div className="u1" style={{ textAlign: "center", marginBottom: 52 }}>
          <p style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 }}>Step 02 of 02</p>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(28px,4vw,36px)", fontWeight: 700, color: "#F2EEE8", letterSpacing: "-0.02em" }}>Choose Generation Method</h2>
        </div>

        {/* Method selector tabs */}
        <div className="u2" style={{ display: "flex", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: 6, marginBottom: 48, width: "100%", maxWidth: 600 }}>
          <button 
            style={{ flex: 1, padding: "14px", borderRadius: 8, fontSize: 15, fontWeight: 600, transition: "all .2s", background: method === "ai" ? "rgba(201,168,76,.15)" : "transparent", color: method === "ai" ? "#C9A84C" : "#6D6B7B" }}
            onClick={() => setMethod("ai")}
          >
            AI Powered
          </button>
          <button 
            style={{ flex: 1, padding: "14px", borderRadius: 8, fontSize: 15, fontWeight: 600, transition: "all .2s", background: method === "template" ? "rgba(201,168,76,.15)" : "transparent", color: method === "template" ? "#C9A84C" : "#6D6B7B" }}
            onClick={() => setMethod("template")}
          >
            Pre-built Templates
          </button>
        </div>

        <div className="u3" style={{ width: "100%" }}>
          {method === "ai" ? (
            <div style={{ maxWidth: 600, margin: "0 auto", background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 16, padding: "40px" }}>
              
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontSize: 13, color: "#F2EEE8", fontWeight: 600, marginBottom: 12 }}>AI Provider</label>
                <div style={{ display: "flex", gap: 16 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: aiProvider === "openai" ? "#F2EEE8" : "#6D6B7B" }}>
                    <input type="radio" name="provider" value="openai" checked={aiProvider === "openai"} onChange={() => { setAiProvider("openai"); setAiModel("gpt-4o"); }} style={{ accentColor: "#C9A84C" }} />
                    OpenAI
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: aiProvider === "gemini" ? "#F2EEE8" : "#6D6B7B" }}>
                    <input type="radio" name="provider" value="gemini" checked={aiProvider === "gemini"} onChange={() => { setAiProvider("gemini"); setAiModel("gemini-1.5-pro"); }} style={{ accentColor: "#C9A84C" }} />
                    Google Gemini
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontSize: 13, color: "#F2EEE8", fontWeight: 600, marginBottom: 8 }}>Model Name</label>
                <p style={{ fontSize: 12, color: "#6D6B7B", marginBottom: 12 }}>Specify the exact model version (e.g. gpt-4o, gpt-4-turbo, gemini-1.5-pro, gemini-2.0-flash)</p>
                <input 
                  type="text" 
                  value={aiModel} 
                  onChange={e => setAiModel(e.target.value)}
                  style={{ width: "100%", background: "rgba(0,0,0,.2)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "14px 18px", color: "#F2EEE8", fontSize: 15, outline: "none", fontFamily: "'JetBrains Mono',monospace" }}
                />
              </div>

              <div style={{ marginBottom: 40 }}>
                <label style={{ display: "block", fontSize: 13, color: "#F2EEE8", fontWeight: 600, marginBottom: 8 }}>API Key</label>
                <p style={{ fontSize: 12, color: "#6D6B7B", marginBottom: 12 }}>Your key is never stored and only sent directly to the provider.</p>
                <input 
                  type="password" 
                  value={apiKey} 
                  onChange={e => { setApiKey(e.target.value); setError(""); }}
                  placeholder={aiProvider === "openai" ? "sk-..." : "AIzaSy..."}
                  style={{ width: "100%", background: "rgba(0,0,0,.2)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "14px 18px", color: "#F2EEE8", fontSize: 15, outline: "none", fontFamily: "'JetBrains Mono',monospace" }}
                />
              </div>

              {error && (
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 24, background: "rgba(224,90,79,.06)", border: "1px solid rgba(224,90,79,.2)", borderRadius: 8, padding: "10px 14px" }}>
                  <span style={{ fontSize: 13, color: "#E05A4F" }}>{error}</span>
                </div>
              )}

              <button className="btn-prime" onClick={generate} style={{ width: "100%", padding: "16px", fontSize: 15 }}>
                Generate Portfolio →
              </button>
            </div>
          ) : (
            <div>
              <p style={{ textAlign: "center", color: "#6D6B7B", marginBottom: 32, fontSize: 14 }}>Select a premium template. More templates arriving soon.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 48 }}>
                {[
                  { id: "executive", name: "Executive Standard", desc: "Fortune 500 grade, minimalist, highly professional.", img: executiveImg },
                  { id: "creative", name: "Creative Excellence", desc: "Vibrant, motion-heavy, designed for awards.", img: creativeImg },
                  { id: "tech", name: "Tech Innovator", desc: "Dark mode, cyber aesthetics, developer focused.", img: techImg }
                ].map(tmpl => (
                  <div 
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    style={{ 
                      background: selectedTemplate === tmpl.id ? "rgba(201,168,76,.05)" : "rgba(255,255,255,.02)", 
                      border: `1px solid ${selectedTemplate === tmpl.id ? "#C9A84C" : "rgba(255,255,255,.06)"}`,
                      borderRadius: 16, padding: "24px", cursor: "pointer", transition: "all .2s"
                    }}
                  >
                    <div style={{ height: 140, background: "rgba(0,0,0,.3)", borderRadius: 8, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      <img src={tmpl.img} alt={tmpl.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: selectedTemplate === tmpl.id ? 0.95 : 0.65, transition: "opacity .2s" }} />
                    </div>
                    <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, color: selectedTemplate === tmpl.id ? "#C9A84C" : "#F2EEE8", marginBottom: 8 }}>{tmpl.name}</h3>
                    <p style={{ fontSize: 13, color: "#6D6B7B" }}>{tmpl.desc}</p>
                  </div>
                ))}
              </div>
              
              <div style={{ textAlign: "center" }}>
                <button className="btn-prime" onClick={generate} style={{ padding: "16px 48px", fontSize: 15 }}>
                  Build with Template →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════════════════
     PAGE: GENERATING
  ═══════════════════════════════════════════════════════════════════════════ */
  if (page === "generating") return (
    <div style={{ minHeight: "100vh", background: "#07070F", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }} className="grid-bg">
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(201,168,76,.055) 0%, transparent 65%)", pointerEvents: "none" }} />
      {/* scan line */}
      <div className="scan" />

      {/* 3D cube */}
      <div style={{ perspective: "500px", perspectiveOrigin: "50% 50%", marginBottom: 52 }}>
        <div className="cube-wrap">
          <div className="cface fr" /><div className="cface bk" />
          <div className="cface lt" /><div className="cface rt" />
          <div className="cface tp" /><div className="cface bt" />
        </div>
      </div>

      <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 700, color: "#F2EEE8", marginBottom: 14, letterSpacing: "-0.022em", textAlign: "center" }}>Building Your Portfolio</h2>

      {/* rotating message */}
      <div style={{ height: 30, overflow: "hidden", marginBottom: 48 }}>
        <p key={loadingIdx} style={{ fontSize: 15, color: "#6D6B7B", textAlign: "center", animation: "fadeUp .4s ease both" }}>
          {loadingMsgs[loadingIdx]}
        </p>
      </div>

      <div className="dot-loader"><span /><span /><span /></div>

      <div style={{ marginTop: 52, maxWidth: 380, textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#3A384A", lineHeight: 1.8 }}>
          Writing HTML, CSS & JS in one pass. Typically 20–50 seconds depending on resume length.
        </p>
      </div>

      {/* corner deco */}
      {[["0%","0%"],["0%","100%"],["100%","0%"],["100%","100%"]].map(([t,l],i) => (
        <div key={i} style={{ position: "absolute", top: t, left: l, width: 24, height: 24, border: `1px solid rgba(201,168,76,.18)`, borderRadius: [" 0 0 8px 0"," 0 8px 0 0","8px 0 0 0","0 0 0 8px"][i], margin: 24 }} />
      ))}
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════════════════
     PAGE: RESULTS
  ═══════════════════════════════════════════════════════════════════════════ */
  if (page === "results" && results) {
    const tabs = [
      { key: "html", label: "index.html", content: results.html || "" },
      { key: "css",  label: "styles.css",  content: results.css  || "" },
      { key: "js",   label: "main.js",     content: results.js   || "" },
    ];
    const active = tabs.find(t => t.key === activeTab) || tabs[0];

    return (
      <div style={{ minHeight: "100vh", background: "#07070F" }}>
        <NavBar onBack={() => { setResults(null); setResumeText(""); setPage("input"); }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 24px 100px" }}>

          {/* ── Success banner ── */}
          <div className="u1" style={{ background: "rgba(47,200,122,.055)", border: "1px solid rgba(47,200,122,.2)", borderRadius: 14, padding: "18px 26px", display: "flex", alignItems: "center", gap: 18, marginBottom: 48 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(47,200,122,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, color: "#2FC87A" }}>✓</div>
            <div>
              <div style={{ fontWeight: 700, color: "#2FC87A", fontSize: 14, marginBottom: 3 }}>Portfolio generated successfully</div>
              <div style={{ fontSize: 13, color: "#6D6B7B" }}>3 files ready below. Copy or download each file, save into one folder, then follow the deployment guide.</div>
            </div>
            <button className="btn-ghost" onClick={() => { setResults(null); setResumeText(""); setPage("input"); }} style={{ marginLeft: "auto", padding: "8px 16px", fontSize: 12, flexShrink: 0 }}>
              Start Over
            </button>
          </div>

          {/* ── Section header ── */}
          <div className="u2" style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>Generated Files</p>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 700, color: "#F2EEE8", letterSpacing: "-0.02em" }}>Your Portfolio Code</h2>
            <p style={{ fontSize: 13, color: "#6D6B7B", marginTop: 8 }}>Three separate, self-contained files. Save them in the same folder and open index.html in your browser.</p>
          </div>

          {/* ── Tab bar ── */}
          <div className="u3" style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,.06)", alignItems: "center" }}>
            {tabs.map(t => (
              <button key={t.key} className={`tab-btn ${activeTab === t.key ? "active" : "inactive"}`} onClick={() => setActiveTab(t.key)}>
                {t.label}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", gap: 8, padding: "0 4px" }}>
              <button className="btn-outline" onClick={() => copy(active.content, active.key)} style={{ padding: "6px 15px", fontSize: 12 }}>
                {copied === active.key ? "✓ Copied" : "Copy"}
              </button>
              <button className="btn-ghost" onClick={() => download(active.content, active.label)} style={{ padding: "6px 15px", fontSize: 12 }}>
                ↓ Download
              </button>
            </div>
          </div>

          {/* ── Code meta bar ── */}
          <div style={{ background: "#030307", border: "1px solid rgba(255,255,255,.06)", borderTop: "1px solid rgba(255,255,255,.04)", padding: "7px 18px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#3A384A" }}>
              {active.content.split("\n").length.toLocaleString()} lines · {(active.content.length / 1024).toFixed(1)} KB
            </span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#3A384A" }}>
              {active.key === "html" ? "HTML" : active.key === "css" ? "CSS" : "JavaScript"}
            </span>
          </div>

          {/* ── Code block ── */}
          <pre className="code-pre">{active.content || "(No content generated — try regenerating)"}</pre>

          {/* ── Download all ── */}
          <div className="u4" style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "#55536A", alignSelf: "center", marginRight: 4 }}>Download all:</span>
            {tabs.map(t => (
              <button key={t.key} className="btn-ghost" onClick={() => download(t.content, t.label)} style={{ padding: "8px 18px", fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", color: "#C9A84C", fontSize: 11 }}>{t.label}</span>
                <span>↓</span>
              </button>
            ))}
          </div>

          {/* ════════════════════════════════════
              INSTANT WEB PREVIEW SECTION
          ════════════════════════════════════ */}
          <div style={{ marginTop: 60, textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
              <div>
                <p style={{ fontSize: 10, color: "#C9A84C", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, marginBottom: 2 }}>Instant Sandbox Preview</p>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 700, color: "#F2EEE8" }}>Preview & Verify Your Site</h3>
              </div>
              
              {/* Tab Selector */}
              <div style={{ display: "flex", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, padding: 4 }}>
                <button
                  onClick={() => setSandboxTab("preview")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 6,
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all .2s",
                    border: "none",
                    background: sandboxTab === "preview" ? "rgba(201,168,76,.15)" : "transparent",
                    color: sandboxTab === "preview" ? "#C9A84C" : "#6D6B7B"
                  }}
                >
                  Live Sandbox Preview
                </button>
                <button
                  onClick={() => setSandboxTab("upload")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 6,
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all .2s",
                    border: "none",
                    background: sandboxTab === "upload" ? "rgba(201,168,76,.15)" : "transparent",
                    color: sandboxTab === "upload" ? "#C9A84C" : "#6D6B7B"
                  }}
                >
                  Alternative Upload Sandboxes
                </button>
              </div>
            </div>

            {sandboxTab === "preview" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Control Bar for Viewport */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: 10, padding: "10px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F56" }} />
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFBD2E" }} />
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#27C93F" }} />
                    </div>
                    <span style={{ fontSize: 12, color: "#55536A", fontFamily: "'JetBrains Mono', monospace" }}>
                      sandbox_preview.html
                    </span>
                  </div>

                  {/* Device Toggles */}
                  <div style={{ display: "flex", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 6, padding: 3 }}>
                    <button
                      onClick={() => setPreviewMode("desktop")}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all .2s",
                        border: "none",
                        background: previewMode === "desktop" ? "rgba(201,168,76,.15)" : "transparent",
                        color: previewMode === "desktop" ? "#C9A84C" : "#6D6B7B",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                        <line x1="8" y1="21" x2="16" y2="21"/>
                        <line x1="12" y1="17" x2="12" y2="21"/>
                      </svg>
                      Desktop
                    </button>
                    <button
                      onClick={() => setPreviewMode("mobile")}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all .2s",
                        border: "none",
                        background: previewMode === "mobile" ? "rgba(201,168,76,.15)" : "transparent",
                        color: previewMode === "mobile" ? "#C9A84C" : "#6D6B7B",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                        <line x1="12" y1="18" x2="12.01" y2="18"/>
                      </svg>
                      Mobile
                    </button>
                  </div>
                </div>

                {/* Live Sandbox Iframe Viewport */}
                <div style={{ 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center", 
                  background: "#030307", 
                  border: "1px solid rgba(255, 255, 255, 0.05)", 
                  borderRadius: 16, 
                  padding: previewMode === "mobile" ? "32px 16px" : "0", 
                  minHeight: "500px",
                  overflow: "hidden"
                }}>
                  {previewMode === "desktop" ? (
                    <iframe
                      srcDoc={getPreviewSrcDoc(results.html, results.css, results.js)}
                      title="Portfolio Desktop Preview"
                      style={{
                        width: "100%",
                        height: "600px",
                        border: "none",
                        background: "#fff",
                        borderRadius: 8
                      }}
                      sandbox="allow-scripts allow-same-origin"
                    />
                  ) : (
                    /* Phone Frame Mockup */
                    <div style={{
                      width: "360px",
                      height: "640px",
                      border: "12px solid #1E1C26",
                      borderRadius: "36px",
                      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                      background: "#fff",
                      overflow: "hidden",
                      position: "relative"
                    }}>
                      {/* Phone Speaker/Camera Notch */}
                      <div style={{
                        position: "absolute",
                        top: 0,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "120px",
                        height: "18px",
                        background: "#1E1C26",
                        borderBottomLeftRadius: "12px",
                        borderBottomRightRadius: "12px",
                        zIndex: 10
                      }} />
                      <iframe
                        srcDoc={getPreviewSrcDoc(results.html, results.css, results.js)}
                        title="Portfolio Mobile Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          border: "none",
                          background: "#fff"
                        }}
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Alternative Upload Sandbox */
              <div style={{ padding: "28px 32px", background: "rgba(201,168,76,.03)", border: "1px solid rgba(201,168,76,.15)", borderRadius: 16 }}>
                <p style={{ fontSize: 13.5, color: "#9E9CAE", lineHeight: 1.65, marginBottom: 24 }}>
                  Want to see how your portfolio website looks before setting up permanent hosting? Download your files above and upload them to one of these free sandbox tools:
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                  {[
                    { name: "Netlify Drop", url: "https://app.netlify.com/drop", action: "Drag & Drop Folder", desc: "Open Netlify Drop, drag your portfolio folder onto the screen, and see your live site instantly without signing up." },
                    { name: "Tiiny.host", url: "https://tiiny.host", action: "Upload Zip File", desc: "Compress your three files into a .zip archive, drag it onto Tiiny.host, and get an instant shareable preview URL." }
                  ].map(site => (
                    <a key={site.name} href={site.url} target="_blank" rel="noopener noreferrer" className="site-card" style={{ padding: "20px", display: "flex", flexDirection: "column", height: "100%", textAlign: "left" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: "#F2EEE8" }}>{site.name}</span>
                        <span className="badge green" style={{ padding: "3px 8px", fontSize: 10 }}>{site.action}</span>
                      </div>
                      <p style={{ fontSize: 12.5, color: "#6D6B7B", lineHeight: 1.6, marginBottom: 16, flexGrow: 1 }}>{site.desc}</p>
                      <div style={{ fontSize: 12, color: "#C9A84C", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                        Go to {site.name} <span>↗</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ════════════════════════════════════
              DEPLOYMENT GUIDE
          ════════════════════════════════════ */}
          <div style={{ marginTop: 80 }}>
            <div className="u1" style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>Deployment</p>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 700, color: "#F2EEE8", letterSpacing: "-0.02em", marginBottom: 8 }}>Get It Live in 6 Steps</h2>
              <p style={{ fontSize: 13, color: "#6D6B7B" }}>No coding experience required. Follow these steps in order.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(results.deploymentSteps || []).map((step) => (
                <div key={step.step} className="step-card" style={{ padding: "24px 26px" }}>
                  <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.22)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, color: "#C9A84C", flexShrink: 0 }}>
                      {String(step.step).padStart(2, "0")}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: "#F2EEE8", marginBottom: 7 }}>{step.title}</div>
                      <div style={{ fontSize: 13, color: "#6D6B7B", lineHeight: 1.75, marginBottom: step.command ? 12 : 0 }}>{step.description}</div>
                      {step.command && <code className="cmd">$ {step.command}</code>}
                      {step.tip && (
                        <div style={{ display: "flex", gap: 9, alignItems: "flex-start", marginTop: 12, background: "rgba(201,168,76,.04)", border: "1px solid rgba(201,168,76,.1)", borderRadius: 8, padding: "9px 14px" }}>
                          <span style={{ fontSize: 10, color: "#C9A84C", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0, marginTop: 2 }}>Tip</span>
                          <span style={{ fontSize: 12, color: "#6D6B7B", lineHeight: 1.7 }}>{step.tip}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ════════════════════════════════════
              PREVIEW PLATFORMS
          ════════════════════════════════════ */}
          <div style={{ marginTop: 80 }}>
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>Hosting Platforms</p>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 700, color: "#F2EEE8", letterSpacing: "-0.02em", marginBottom: 8 }}>Deploy Anywhere — All Free</h2>
              <p style={{ fontSize: 13, color: "#6D6B7B" }}>Click any platform to open it. Netlify Drop is the fastest way to preview instantly.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
              {(results.previewSites || []).map((site, i) => (
                <a key={site.name} href={site.url} target="_blank" rel="noopener noreferrer" className="site-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: "#F2EEE8" }}>{site.name}</div>
                    <span className={`badge ${i === 0 ? "green" : ""}`}>{site.badge}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#6D6B7B", lineHeight: 1.7, marginBottom: 14 }}>{site.description}</div>
                  <div style={{ fontSize: 12, color: "#C9A84C", display: "flex", alignItems: "center", gap: 5 }}>
                    Open {site.name} <span style={{ fontSize: 10 }}>↗</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* ── Footer CTA ── */}
          <div style={{ marginTop: 80, borderTop: "1px solid rgba(255,255,255,.05)", paddingTop: 52, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#6D6B7B", marginBottom: 22 }}>Update your resume or want a different design?</p>
            <button className="btn-prime" onClick={() => { setResults(null); setResumeText(""); setPage("input"); }} style={{ padding: "16px 44px", fontSize: 14 }}>
              Generate Another Portfolio
            </button>
            <p style={{ fontSize: 11, color: "#3A384A", marginTop: 52, letterSpacing: "0.06em" }}>
              PORTFOLIOFORGE · BUILT BY SAI KIRAN · © 2026
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
