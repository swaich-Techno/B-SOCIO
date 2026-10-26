import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootDirectory = path.resolve(sourceDirectory, '..');
const outputDirectory = path.join(rootDirectory, 'dist');
const canonicalOrigin = 'https://www.bsocio.in';

const escapeJson = (value) => JSON.stringify(value).replaceAll('<', '\\u003c');

function decorativeQr() {
  const rows = ['111111101', '100000101', '101110101', '101110101', '100000101', '111111101', '000000000', '110101011', '101000111'];
  return rows.map((row) => [...row].map((bit) => `<i${bit === '1' ? ' class="on"' : ''}></i>`).join('')).join('');
}

const phoneDisplay = '+91 70094 64475';
const whatsappUrl = 'https://wa.me/917009464475';

const navigation = [
  ['/services', 'Services'],
  ['/work', 'Work'],
  ['/about', 'About'],
  ['/contact', 'Contact'],
];

const serviceSectionPaths = new Set(['/services', '/websites', '/automations', '/qr-ar-studio']);

function navCurrent(href, currentPath) {
  if (href === '/services' && serviceSectionPaths.has(currentPath)) {
    return currentPath === href ? 'page' : 'true';
  }
  if (href === '/work' && (currentPath === '/work' || currentPath.startsWith('/work/'))) {
    return currentPath === href ? 'page' : 'true';
  }
  return currentPath === href ? 'page' : '';
}

function header(currentPath) {
  return `
    <header class="site-header">
      <div class="container nav-shell">
        <a class="brand" href="/" aria-label="B Socio home">
          <img class="brand-mark" src="/assets/logo-b-socio.png" width="1759" height="463" alt="B Socio">
        </a>
        <button class="menu-button" type="button" aria-expanded="false" aria-controls="site-navigation" aria-label="Open navigation" data-menu-button>
          <span aria-hidden="true"></span><span aria-hidden="true"></span>
        </button>
        <nav class="main-nav" id="site-navigation" aria-label="Main navigation" data-menu data-open="false">
          ${navigation.map(([href, label]) => {
            const current = navCurrent(href, currentPath);
            return `<a href="${href}"${current ? ` aria-current="${current}"` : ''}>${label}</a>`;
          }).join('')}
          <a class="button" href="/contact"${currentPath === '/contact' ? ' aria-current="page"' : ''}>Start a project</a>
        </nav>
      </div>
    </header>`;
}

function footer() {
  return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-intro">
            <a class="brand" href="/" aria-label="B Socio home">
              <img class="brand-mark" src="/assets/logo-b-socio.png" width="1759" height="463" alt="B Socio">
            </a>
            <p>Human-led websites, ecommerce experiences and practical automations for growing businesses in Punjab and beyond.</p>
          </div>
          <nav class="footer-nav" aria-label="Services">
            <h2>Services</h2>
            <ul>
              <li><a href="/websites">Websites &amp; Ecommerce</a></li>
              <li><a href="/automations">AI &amp; Automation</a></li>
              <li><a href="/services#growth">Branding &amp; Growth</a></li>
              <li><a href="/qr-ar-studio">QR/AR Experiences</a></li>
            </ul>
          </nav>
          <nav class="footer-nav" aria-label="Contact and related links">
            <h2>Connect</h2>
            <ul>
              <li><a href="mailto:connect@bsocio.in">connect@bsocio.in</a></li>
              <li><a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">WhatsApp · ${phoneDisplay}</a></li>
              <li><a href="https://ar.bsocio.in" target="_blank" rel="noopener noreferrer">B Socio AR</a></li>
              <li><a href="/privacy">Privacy</a></li>
            </ul>
          </nav>
        </div>
        <div class="footer-bottom">
          <span>© <span data-year>2026</span> B Socio · Punjab, India</span>
          <span>Built for useful digital work.</span>
        </div>
      </div>
    </footer>`;
}

function page({
  title,
  description,
  pathName,
  body,
  schema,
  pageClass = '',
  robots = 'index, follow',
  ogType = 'website',
  socialImage = '/assets/og-card.png',
  socialImageAlt = 'B Socio — Distinct websites. Simpler workflows.',
  socialImageWidth = 1200,
  socialImageHeight = 630,
}) {
  const canonical = `${canonicalOrigin}${pathName === '/' ? '' : pathName}`;
  const fullTitle = pathName === '/' ? title : `${title} | B Socio`;
  const absoluteSocialImage = `${canonicalOrigin}${socialImage}`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#f5f4f0">
    <meta name="description" content="${description}">
    <meta name="robots" content="${robots}">
    <link rel="canonical" href="${canonical}">
    <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
    <meta property="og:type" content="${ogType}">
    <meta property="og:site_name" content="B Socio">
    <meta property="og:title" content="${fullTitle}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${absoluteSocialImage}">
    <meta property="og:image:width" content="${socialImageWidth}">
    <meta property="og:image:height" content="${socialImageHeight}">
    <meta property="og:image:alt" content="${socialImageAlt}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${fullTitle}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${absoluteSocialImage}">
    <meta name="twitter:image:alt" content="${socialImageAlt}">
    <title>${fullTitle}</title>
    <link rel="stylesheet" href="/assets/styles.css">
    ${schema ? `<script type="application/ld+json">${escapeJson(schema)}</script>` : ''}
    <script src="/assets/site.js" defer></script>
  </head>
  <body class="${pageClass}">
    <a class="skip-link" href="#main-content">Skip to content</a>
    ${header(pathName)}
    <main id="main-content">${body}</main>
    ${footer()}
  </body>
</html>`;
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'B Socio',
  url: canonicalOrigin,
  email: 'connect@bsocio.in',
  telephone: '+917009464475',
  logo: `${canonicalOrigin}/assets/logo-b-socio.png`,
  areaServed: 'India',
  address: {
    '@type': 'PostalAddress',
    addressRegion: 'Punjab',
    addressCountry: 'IN',
  },
};

const home = page({
  title: 'B Socio — Websites, Ecommerce & Business Automation',
  description: 'B Socio designs websites that attract attention and automation systems that keep the work moving.',
  pathName: '/',
  pageClass: 'page-home',
  schema: organizationSchema,
  body: `
    <section class="hero-home" aria-labelledby="home-title">
      <div class="container hero-home-grid">
        <div>
          <p class="eyebrow">Websites + AI automation</p>
          <h1 id="home-title">From click to outcome.</h1>
          <p class="lede">We design websites that attract attention—and automation systems that keep the work moving.</p>
          <div class="button-row">
            <a class="button" href="/contact">Start a project <span aria-hidden="true">↗</span></a>
            <a class="button-ghost" href="/work">See our work</a>
          </div>
        </div>
        <div class="hero-stage" data-draw-stage>
          <svg class="hero-ribbon" viewBox="0 0 640 420" fill="none" aria-hidden="true">
            <path data-draw d="M150 250 C 250 250, 300 90, 560 78" stroke="#2f6bff" stroke-width="18" stroke-linecap="round"/>
          </svg>
          <div class="browser-card">
            <div class="browser-top" aria-hidden="true"><span></span><span></span><span></span></div>
            <div class="browser-shot" aria-hidden="true"></div>
            <div class="browser-lines" aria-hidden="true"><span></span><span></span><span></span></div>
            <span class="browser-action">Start</span>
          </div>
          <ul class="outcome-list">
            <li class="outcome-card"><span class="icon-bubble" aria-hidden="true">✉</span><div><strong>Follow-up</strong><p>The enquiry leaves the page with a next step.</p></div></li>
            <li class="outcome-card"><span class="icon-bubble" aria-hidden="true">▦</span><div><strong>Schedule</strong><p>A time can be offered without another chase.</p></div></li>
            <li class="outcome-card"><span class="icon-bubble" aria-hidden="true">✓</span><div><strong>Done</strong><p>The team can see the action close.</p></div></li>
          </ul>
        </div>
      </div>
    </section>
    <nav class="service-strip" aria-label="Primary services">
      <a href="/websites"><span class="icon-bubble" aria-hidden="true">▣</span> Web Design</a>
      <a href="/automations"><span class="icon-bubble" aria-hidden="true">⚙</span> AI Automation</a>
      <a href="/qr-ar-studio"><span class="icon-bubble" aria-hidden="true">⧉</span> QR + AR</a>
    </nav>
    <section class="band band--dark" aria-labelledby="system-title">
      <div class="container system-grid">
        <div>
          <p class="eyebrow">The B Socio system</p>
          <h2 id="system-title">Built to keep moving.</h2>
          <p class="lede">Attract attention. Capture intent. Automate the follow-through.</p>
        </div>
        <div class="system-cards">
          <article class="system-card"><span>Website</span><h3>A clear first click</h3><p>Pages arranged around the decision a visitor needs to make.</p></article>
          <article class="system-card"><span>Enquiry</span><h3>A recorded ask</h3><p>Requests that arrive with enough context to review.</p></article>
          <article class="system-card"><span>Action</span><h3>A visible next step</h3><p>Routing, reminders and handoff back to a person.</p></article>
        </div>
      </div>
    </section>`,
});

const services = page({
  title: 'Services',
  description: 'Websites, AI automation, branding and QR/AR from B Socio, connected as one practical system.',
  pathName: '/services',
  pageClass: 'page-services',
  body: `
    <section class="page-intro" aria-labelledby="services-title">
      <div class="container split">
        <div>
          <p class="eyebrow">Services</p>
          <h1 id="services-title">Everything digital, working together.</h1>
          <p class="lede">Websites, AI automation and QR + AR, built to attract, engage and keep things moving. One connected system. Real outcomes.</p>
          <div class="button-row">
            <a class="button" href="/contact">Start a project <span aria-hidden="true">↗</span></a>
            <a class="button-ghost" href="/work">See our work</a>
          </div>
        </div>
        <div class="path-map" data-draw-stage>
          <svg class="path-ribbon" viewBox="0 0 640 520" fill="none" aria-hidden="true">
            <path data-draw d="M120 260 C 220 260, 250 90, 390 90" stroke="#2f6bff" stroke-width="14" stroke-linecap="round"/>
            <path data-draw d="M120 260 C 230 260, 260 260, 390 260" stroke="#2f6bff" stroke-width="14" stroke-linecap="round"/>
            <path data-draw d="M120 260 C 220 260, 250 430, 390 430" stroke="#2f6bff" stroke-width="14" stroke-linecap="round"/>
          </svg>
          <img class="path-hub" src="/assets/logo-b-socio.png" width="1759" height="463" alt="">
          <ol class="path-list">
            <li><a class="path-card" href="/websites"><p class="eyebrow">01</p><h2>Websites</h2><p>Presence, story and a clear next action.</p></a></li>
            <li><a class="path-card" href="/automations"><p class="eyebrow">02</p><h2>AI Automation</h2><p>Enquiry, follow-up and a path back to a person.</p></a></li>
            <li><a class="path-card" href="/qr-ar-studio"><p class="eyebrow">03</p><h2>QR + AR</h2><p>A physical moment that opens a digital layer.</p></a></li>
          </ol>
        </div>
      </div>
    </section>
    <section class="benefit-row" aria-label="How the services connect">
      <article class="benefit"><h2>One connected system</h2><p>Web, automation and physical touchpoints can be planned together.</p></article>
      <article class="benefit"><h2>From attention to action</h2><p>Attract, engage and keep the next step visible.</p></article>
      <article class="benefit"><h2>Built for real outcomes</h2><p>Scope follows the business need. Results are published only when they are real.</p></article>
    </section>
    <section class="stack container" aria-labelledby="start-title">
      <div class="section-head"><h2 id="start-title">Choose your starting point.</h2><p>Each service can stand alone, and it can also connect to the others.</p></div>
      <div class="start-grid">
        <article class="start-card" id="websites"><h3>Website Development &amp; Ecommerce</h3><p>Business sites, storefronts, landing pages and custom interfaces.</p><a class="text-link" href="/websites">Explore websites</a></article>
        <article class="start-card" id="automation"><h3>AI &amp; Business Automation</h3><p>Enquiry flows, reminders and tools with a human handoff.</p><a class="text-link" href="/automations">Explore automation</a></article>
        <article class="start-card" id="growth"><h3>Branding &amp; Digital Growth</h3><p>Identity direction, campaign creative, paid social and WhatsApp marketing.</p></article>
        <article class="start-card" id="immersive"><h3>QR/AR Experiences</h3><p>Scan-to-open previews for products, menus, spaces, packaging and events.</p><a class="text-link" href="/qr-ar-studio">Explore QR + AR</a></article>
      </div>
    </section>`,
});

const websites = page({
  title: 'Website Development & Ecommerce',
  description: 'B Socio designs responsive business websites, ecommerce stores, landing pages and custom web applications.',
  pathName: '/websites',
  pageClass: 'page-websites',
  body: `
    <section class="page-hero--dark page-intro" aria-labelledby="websites-hero">
      <div class="container split">
        <div>
          <p class="eyebrow">Websites</p>
          <h1 id="websites-hero">Websites built to move people.</h1>
          <p class="lede">Strategic, responsive websites that attract attention and turn interest into action.</p>
          <div class="button-row">
            <a class="button" href="/contact">Start a project <span aria-hidden="true">↗</span></a>
            <a class="button-ghost" href="/work">See our work</a>
          </div>
        </div>
        <div class="assemble" data-assemble>
          <article class="layer layer--wire"><p class="eyebrow">01 · Structure</p><h2>The frame</h2><div class="wire-box" aria-hidden="true"></div></article>
          <article class="layer layer--story"><p class="eyebrow">02 · Story</p><h2>The page</h2><div class="shot-block" aria-hidden="true"></div></article>
          <article class="layer layer--launch"><p class="eyebrow">03 · Launch</p><h2>The site</h2><span class="browser-action">Open</span></article>
        </div>
      </div>
    </section>
    <section class="stack container" aria-labelledby="website-capabilities">
      <div class="section-head"><div><p class="eyebrow">Designed around decisions</p><h2 id="website-capabilities">From focused launches to complete storefronts.</h2></div><p>The scope follows the job. No framework or commerce platform is chosen before the requirements are understood.</p></div>
      <div class="capability-grid">
        <article class="capability"><h3>Business Websites</h3><p>Clear positioning, services, work and contact journeys.</p></article>
        <article class="capability"><h3>Ecommerce</h3><p>Product discovery, brand storytelling and purchase paths.</p></article>
        <article class="capability"><h3>Landing Pages</h3><p>Campaign pages with one clear action.</p></article>
        <article class="capability"><h3>Custom Applications</h3><p>Portals, dashboards, booking tools and purpose-built interfaces.</p></article>
        <article class="capability"><h3>Thoughtful Redesigns</h3><p>Stronger hierarchy without discarding a working system by reflex.</p></article>
        <article class="capability"><h3>Launch Foundations</h3><p>Responsive QA, accessibility, metadata, performance and handover.</p></article>
      </div>
    </section>`,
});

const automations = page({
  title: 'AI & Business Automation',
  description: 'B Socio plans enquiry workflows, follow-ups and practical AI automation with a human handoff.',
  pathName: '/automations',
  pageClass: 'page-automation',
  body: `
    <section class="page-intro" aria-labelledby="automation-hero">
      <div class="container">
        <p class="eyebrow">AI automation</p>
        <h1 id="automation-hero">Make the follow-through automatic.</h1>
        <p class="lede">Capture enquiries, qualify, notify, schedule and keep things moving—with a person still accountable for the decision.</p>
        <div class="button-row">
          <a class="button" href="/contact">Start a project <span aria-hidden="true">↗</span></a>
          <a class="button-ghost" href="/work">See our work</a>
        </div>
        <ol class="flow" data-flow aria-label="Enquiry workflow preview">
          <li class="flow-step" data-step><span>01</span><h2>Enquiry</h2><p>A new request arrives with a name, need and contact path.</p></li>
          <li class="flow-step" data-step><span>02</span><h2>Qualify</h2><p>The request is checked for fit before anyone spends a call on it.</p></li>
          <li class="flow-step" data-step><span>03</span><h2>Notify</h2><p>The right person is told there is something ready to review.</p></li>
          <li class="flow-step" data-step><span>04</span><h2>Schedule</h2><p>A time can be offered from the tools the business already uses.</p></li>
          <li class="flow-step" data-step><span>05</span><h2>Complete</h2><p>The follow-up is marked done, or handed back when it needs a person.</p></li>
        </ol>
      </div>
    </section>
    <section class="benefit-row" aria-labelledby="moving-title">
      <article class="benefit"><h2 id="moving-title">What keeps moving</h2><p>The workflow is designed to keep the next action visible.</p></article>
      <article class="benefit"><h2>Less manual routing</h2><p>Capture and filter enquiries so the team sees the useful ones.</p></article>
      <article class="benefit"><h2>A human handoff</h2><p>Assistants answer from approved information and pass on the rest.</p></article>
    </section>
    <section class="stack container" aria-labelledby="automation-boundaries">
      <div class="section-head"><h2 id="automation-boundaries">Clear about what needs access.</h2><p>CRM, calendar, messaging, payments, AI models and reporting tools each have their own credentials, permissions, costs and limits. Those are confirmed before an integration is treated as part of the delivery.</p></div>
      <div class="capability-grid">
        <article class="capability"><h3>Enquiry workflows</h3><p>Validate, route and record incoming requests.</p></article>
        <article class="capability"><h3>Follow-ups</h3><p>Coordinate reminders without relying on memory.</p></article>
        <article class="capability"><h3>Knowledge assistants</h3><p>Answer from approved information, then hand off.</p></article>
        <article class="capability"><h3>Connected tools</h3><p>Forms, inboxes, sheets, calendars and CRMs after review.</p></article>
        <article class="capability"><h3>Internal interfaces</h3><p>A calmer view of requests, records and actions.</p></article>
        <article class="capability"><h3>Exception paths</h3><p>Validation, retries and manual recovery before launch.</p></article>
      </div>
    </section>`,
});

const qrAr = page({
  title: 'QR + AR',
  description: 'B Socio creates branded QR codes and labelled AR previews for products, menus, spaces, packaging and campaigns.',
  pathName: '/qr-ar-studio',
  pageClass: 'page-qr',
  body: `
    <section class="band band--cobalt page-intro" aria-labelledby="qr-hero">
      <div class="container" data-switch-root>
        <div class="split">
          <div>
            <p class="eyebrow">QR + AR</p>
            <h1 id="qr-hero">Turn physical moments into digital action.</h1>
            <p class="lede">Branded QR codes and AR previews that connect a printed object to a page, a product or a next step.</p>
            <div class="button-row">
              <a class="button button--light" href="/contact">Start a project <span aria-hidden="true">↗</span></a>
              <a class="button-ghost" href="/work">See our work</a>
            </div>
            <div class="mode-switch" data-switch role="group" aria-label="Experience mode">
              <button type="button" data-switch-value="qr" aria-pressed="true">QR Experiences</button>
              <button type="button" data-switch-value="ar" aria-pressed="false">AR Experiences</button>
            </div>
          </div>
          <div>
            <div data-panel="qr" class="qr-layout">
              <div class="qr-stage qr-card is-settled" data-scan>
                <div class="qr-pattern" aria-hidden="true">${decorativeQr()}</div>
                <span class="scan-line" aria-hidden="true"></span>
                <p id="qr-note">Preview pattern, not a live code.</p>
              </div>
              <div class="phone-preview">
                <div class="phone-screen">
                  <p class="eyebrow">Revealed page</p>
                  <h2>The scan opens a page.</h2>
                  <p>Menu, product, campaign or lead capture—shown here as a preview, not a camera session.</p>
                  <span class="browser-action">Act</span>
                </div>
              </div>
            </div>
            <div data-panel="ar">
              <div class="ar-stage" data-switch-root>
                <p class="eyebrow">Interactive preview</p>
                <div class="ar-card"><strong>Printed card</strong><p>The physical object stays in view. Nothing here requests camera access.</p></div>
                <div class="overlay-switch" data-switch role="group" aria-label="AR overlay example">
                  <button type="button" data-switch-value="product" aria-pressed="true">Product</button>
                  <button type="button" data-switch-value="place" aria-pressed="false">Place</button>
                  <button type="button" data-switch-value="campaign" aria-pressed="false">Campaign</button>
                </div>
                <div class="ar-overlay" data-overlay-copy="product"><h2>Product</h2><p>Details, variants or a buying path anchored to the object.</p></div>
                <div class="ar-overlay" data-overlay-copy="place"><h2>Place</h2><p>A space, installation or property note shown beside the print.</p></div>
                <div class="ar-overlay" data-overlay-copy="campaign"><h2>Campaign</h2><p>A short story and one action, tied to the poster or pack.</p></div>
              </div>
              <p>This is an interactive preview, not live browser AR. The same three layers—product, place and campaign—are written out above so they remain available without animation or a camera.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="stack container" aria-labelledby="qr-steps">
      <h2 id="qr-steps" class="visually-hidden">How a QR experience is used</h2>
      <div class="use-grid">
        <article class="use-card"><h3>1. Scan</h3><p>A simple scan with any camera app. The pattern on this page is decorative and is not a working code.</p></article>
        <article class="use-card"><h3>2. Reveal</h3><p>A page opens with the product, menu, place or campaign.</p></article>
        <article class="use-card"><h3>3. Act</h3><p>The visit ends in an enquiry, a choice or a sale.</p></article>
      </div>
      <div class="capability-grid">
        <article class="capability"><h3>Menus</h3><p>Printed menus that open current dishes and details.</p></article>
        <article class="capability"><h3>Products</h3><p>Packaging that reveals variants, instructions or a story.</p></article>
        <article class="capability"><h3>Campaigns</h3><p>Posters that land on one clear action.</p></article>
        <article class="capability"><h3>Lead capture</h3><p>A scan that starts an enquiry instead of a dead end.</p></article>
      </div>
      <div class="button-row">
        <a class="button" href="/contact">Discuss a branded QR project</a>
        <a class="button-ghost" href="https://ar.bsocio.in" target="_blank" rel="noopener noreferrer">Open the AR studio</a>
      </div>
    </section>`,
});

const work = page({
  title: 'Selected Work',
  description: 'B Socio work directions for websites, automation and QR/AR. Concepts are labelled, and client results are shown only when they can be verified.',
  pathName: '/work',
  pageClass: 'page-work',
  body: `
    <section class="page-intro">
      <div class="container">
        <p class="eyebrow">Our work</p>
        <div class="section-head">
          <h1>Directions, labelled clearly.</h1>
          <div class="filters" data-filter-group role="group" aria-label="Filter work">
            <button type="button" data-filter="all" aria-pressed="true">All</button>
            <button type="button" data-filter="websites" aria-pressed="false">Websites</button>
            <button type="button" data-filter="automation" aria-pressed="false">Automation</button>
            <button type="button" data-filter="qr" aria-pressed="false">QR + AR</button>
            <button type="button" data-filter="concept" aria-pressed="false">Concepts</button>
          </div>
        </div>
        <p class="lede">Published client projects are added only when they can be shown accurately. The tiles below open real services, a client-neutral engagement shape, or labelled concepts.</p>
        <div class="bento">
          <a class="tile tile--feature" href="/websites" data-kind="websites"><span class="tile-media"><p class="eyebrow">Websites</p><h2>Websites built to move people.</h2><p>Structure, story and launch, designed around a decision.</p></span><span class="tile-ribbon" aria-hidden="true"></span><span>Explore websites</span></a>
          <a class="tile" href="/automations" data-kind="automation"><span class="tile-media"><p class="eyebrow">Automation</p><h2>Follow-through, made visible.</h2><p>Enquiry to completion, with a person still accountable.</p></span><span class="tile-ribbon" aria-hidden="true"></span><span>Explore automation</span></a>
          <a class="tile tile--cobalt" href="/qr-ar-studio" data-kind="qr"><span class="tile-media"><p class="eyebrow">QR + AR</p><h2>From a scan to an action.</h2><p>Printed moments that open a page. Previews are labelled as previews.</p></span><span class="tile-ribbon" aria-hidden="true"></span><span>Explore QR + AR</span></a>
          <a class="tile" href="/work/engagement" data-kind="engagement"><span class="tile-media"><span class="label">Not a client project</span><p class="eyebrow">Engagement shape</p><h2>From presence to progress.</h2><p>How a website and automation engagement is structured. No client result is claimed here.</p></span><span class="tile-ribbon" aria-hidden="true"></span><span>Read the shape</span></a>
          <a class="tile" href="/work#concepts" data-kind="concept"><span class="tile-media"><span class="label">Concept</span><h2>Service Enquiry Workspace</h2><p>A concept for turning an unstructured enquiry into a review-ready record.</p></span><span class="tile-ribbon" aria-hidden="true"></span></a>
          <a class="tile" href="/work#concepts" data-kind="concept"><span class="tile-media"><span class="label">Concept</span><h2>Operations Portal</h2><p>A concept for tracking requests, ownership and next actions.</p></span><span class="tile-ribbon" aria-hidden="true"></span></a>
        </div>
        <div id="concepts" class="stack">
          <h2>Concepts stay labelled.</h2>
          <p>Service Enquiry Workspace and Operations Portal are studies, not completed client projects.</p>
        </div>
      </div>
    </section>`,
});

const engagement = page({
  title: 'How an engagement is shaped',
  description: 'A client-neutral view of how B Socio structures a website and automation engagement. This page is not a published client result.',
  pathName: '/work/engagement',
  pageClass: 'page-engagement',
  body: `
    <section class="page-intro">
      <div class="container split">
        <div>
          <p class="eyebrow">Engagement shape · not a client case study</p>
          <h1>From presence to progress.</h1>
          <p class="lede">A client-neutral view of how a website and an automation system can be shaped together. It does not describe a named client or a measured result.</p>
          <div class="button-row"><a class="button" href="/contact">Start a project <span aria-hidden="true">↗</span></a></div>
        </div>
        <div class="hero-stage" data-draw-stage aria-hidden="true">
          <svg class="hero-ribbon" viewBox="0 0 640 360" fill="none">
            <path data-draw d="M40 220 C 180 220, 220 80, 520 110" stroke="#2f6bff" stroke-width="16" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
    </section>
    <div class="container chapter-layout">
      <nav class="reading-rail" data-spine aria-label="On this page">
        <a href="#challenge">Challenge</a>
        <a href="#system">System</a>
        <a href="#outcome">Outcome</a>
      </nav>
      <div>
        <section class="chapter" id="challenge" aria-labelledby="challenge-title">
          <div class="chapter-copy"><h2 id="challenge-title">Challenge</h2><p>A strong offer can still be hard to find, understand and follow up. The useful starting point is the gap between the public site and the work behind it.</p></div>
        </section>
        <section class="chapter" id="system" aria-labelledby="system-title-chapter">
          <div class="chapter-copy"><h2 id="system-title-chapter">System</h2><p>Websites, enquiry handling and a clear next action, connected only where the workflow, access and cost have been reviewed. Nothing here is presented as a finished client build.</p></div>
        </section>
        <section class="chapter" id="outcome" aria-labelledby="outcome-title">
          <div class="chapter-copy"><h2 id="outcome-title">Outcome</h2><p>The intended result is a clearer presence and a follow-through the team can run. Measured results are published only when they belong to a real project that can be shown accurately.</p></div>
        </section>
      </div>
    </div>`,
});

const about = page({
  title: 'About',
  description: 'B Socio is an independent studio in Punjab combining websites, automation and digital growth in one working relationship.',
  pathName: '/about',
  pageClass: 'page-about',
  body: `
    <section class="page-intro" aria-labelledby="about-hero">
      <div class="container about-grid">
        <div>
          <p class="eyebrow">About</p>
          <h1 id="about-hero">Small team. Systems thinking.</h1>
          <p class="lede">B Socio is an independent digital studio in Punjab, India. We combine websites, ecommerce, automation and digital growth in one practical working relationship.</p>
          <div class="button-row">
            <a class="button" href="/contact">Start a project <span aria-hidden="true">↗</span></a>
            <a class="button-ghost" href="/work">Our work</a>
          </div>
        </div>
        <div class="sketch-board" data-draw-stage>
          <svg class="sketch-line" viewBox="0 0 640 420" fill="none" aria-hidden="true">
            <path data-draw d="M90 120 C 180 150, 240 180, 330 210" stroke="#1d4ed8" stroke-width="4" stroke-linecap="round"/>
            <path data-draw d="M360 230 C 430 250, 480 280, 560 300" stroke="#1d4ed8" stroke-width="4" stroke-linecap="round"/>
          </svg>
          <article class="note note--clarity" data-parallax="0.03"><h2>Clarity</h2><p>Understand the opportunity before choosing a tool.</p></article>
          <article class="note note--craft" data-parallax="-0.02"><h2>Craft</h2><p>Design and build the part people actually use.</p></article>
          <article class="note note--momentum" data-parallax="0.04"><h2>Momentum</h2><p>Automate the follow-through and keep it moving.</p></article>
        </div>
      </div>
    </section>
    <section class="method-row" aria-labelledby="method-title">
      <h2 id="method-title" class="visually-hidden">How we work</h2>
      <article class="method"><h3>Clarity</h3><p>Audience, workflow and constraints come before a feature list.</p></article>
      <article class="method"><h3>Craft</h3><p>The interface is built to be understood, reviewed and handed over.</p></article>
      <article class="method"><h3>Momentum</h3><p>Automation supports judgment. It does not replace accountability.</p></article>
    </section>
    <section class="stack container">
      <h2>Real work is labelled clearly.</h2>
      <p>Results and technologies are not invented. A concept stays a concept until a real project can be shown.</p>
    </section>`,
});

const contact = page({
  title: 'Start a Project',
  description: 'Send B Socio a website, ecommerce, automation, branding or QR/AR enquiry by email or WhatsApp.',
  pathName: '/contact',
  pageClass: 'page-contact',
  body: `
    <section class="page-intro">
      <div class="container contact-split">
        <aside class="contact-aside">
          <p class="eyebrow">Contact</p>
          <h1>Let’s build what happens next.</h1>
          <p class="lede">Tell us a little about the project. This form opens your email app or WhatsApp. The website does not store the message.</p>
          <div class="contact-chips">
            <a class="contact-chip" href="mailto:connect@bsocio.in">connect@bsocio.in</a>
            <a class="contact-chip" href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">WhatsApp · ${phoneDisplay}</a>
          </div>
          <p>Punjab, India</p>
        </aside>
        <form class="inquiry-form" data-inquiry-form data-whatsapp="917009464475">
          <div class="form-progress" aria-hidden="true"><span data-progress-bar></span></div>
          <div class="field-grid">
            <div class="field field--wide"><label for="name">Name</label><input id="name" name="name" autocomplete="name" maxlength="80" required></div>
            <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" inputmode="email" autocomplete="email" spellcheck="false" maxlength="254" required></div>
            <div class="field"><label for="phone">Phone</label><input id="phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+91 …" maxlength="32"></div>
            <div class="field field--wide"><label for="business">Company</label><input id="business" name="business" autocomplete="organization" maxlength="120"></div>
            <div class="field field--wide"><label for="service">What do you need?</label><select id="service" name="service" required><option value="">Select a service</option><option>Website Development &amp; Ecommerce</option><option>AI &amp; Business Automation</option><option>Branding &amp; Digital Growth</option><option>QR/AR Experience</option><option>Not sure yet</option></select></div>
            <div class="field field--wide"><label for="message">Project details</label><textarea id="message" name="message" placeholder="Tell us about your project…" aria-describedby="message-help" maxlength="2000" required></textarea><small id="message-help">Include useful context, existing links and any fixed launch constraints. Maximum 2,000 characters.</small></div>
          </div>
          <div class="button-row">
            <button class="button" type="submit">Send enquiry <span aria-hidden="true">↗</span></button>
            <button class="button-ghost" type="button" data-whatsapp-submit>Send on WhatsApp</button>
          </div>
          <p class="form-note">Email and WhatsApp open external applications. Their own privacy terms apply.</p>
          <p class="form-status" aria-live="polite" data-form-status></p>
        </form>
      </div>
    </section>
    <section class="stack container faq" aria-labelledby="faq-title">
      <h2 id="faq-title">Common questions</h2>
      <div class="faq-grid">
        <details><summary>What types of projects do you take on?</summary><p>Websites and ecommerce, AI and business automation, branding and digital growth, and QR/AR experiences.</p></details>
        <details><summary>What happens after I send an enquiry?</summary><p>The form opens your own email app or WhatsApp with the message prepared. This website does not store it.</p></details>
        <details><summary>Do you publish client results?</summary><p>Only when a real project can be shown accurately. Concepts on the work page are labelled as concepts.</p></details>
      </div>
    </section>`,
});

const privacy = page({
  title: 'Privacy',
  description: 'How the B Socio website handles browsing and project enquiries sent through email or WhatsApp.',
  pathName: '/privacy',
  pageClass: 'page-privacy',
  body: `
    <section class="page-intro">
      <div class="container privacy-layout">
        <nav class="reading-rail" data-spine aria-label="On this page">
          <a href="#overview">Overview</a>
          <a href="#collect">Information we collect</a>
          <a href="#use">How we use it</a>
          <a href="#choices">Your choices</a>
          <a href="#privacy-contact">Contact</a>
        </nav>
        <div>
          <p class="eyebrow">Privacy</p>
          <h1>Privacy, in plain language.</h1>
          <p class="lede">We keep this simple, so you can understand what this website does and what it does not do.</p>
          <p><strong>Updated 25 October 2026</strong></p>
          <section class="chapter" id="overview" aria-labelledby="overview-title"><div class="chapter-copy"><h2 id="overview-title">Overview</h2><p>This static website does not set optional advertising cookies or run a customer tracking script in its source code.</p></div></section>
          <section class="chapter" id="collect" aria-labelledby="collect-title"><div class="chapter-copy"><h2 id="collect-title">Information we collect</h2><p>If you use the project form, you choose what to include. The website prepares that message and opens your email application or WhatsApp. It does not store the form contents.</p></div></section>
          <section class="chapter" id="use" aria-labelledby="use-title"><div class="chapter-copy"><h2 id="use-title">How we use it</h2><p>Information you choose to send is handled by the email or WhatsApp service you open, and is used to respond to your enquiry. We do not sell personal information from this website.</p></div></section>
          <section class="chapter" id="choices" aria-labelledby="choices-title"><div class="chapter-copy"><h2 id="choices-title">Your choices</h2><p>You can contact us by email or WhatsApp, and you can ask for a correction or deletion of information you have sent us.</p></div></section>
          <section class="chapter" id="privacy-contact" aria-labelledby="privacy-contact-title"><div class="chapter-copy"><h2 id="privacy-contact-title">Contact</h2><p>Links to B Socio AR and WhatsApp open third-party services with their own privacy practices. For privacy questions, email <a href="mailto:connect@bsocio.in">connect@bsocio.in</a>.</p></div></section>
        </div>
      </div>
    </section>`,
});

const notFound = page({
  title: 'Page Not Found',
  description: 'The requested B Socio page could not be found.',
  pathName: '/404',
  pageClass: 'page-404',
  robots: 'noindex, follow',
  body: `
    <section class="not-found">
      <svg class="not-found-ribbon" viewBox="0 0 980 220" fill="none" aria-hidden="true" data-draw-stage>
        <path data-draw d="M40 120 C 180 20, 260 200, 420 110 S 680 20, 940 130" stroke="#2f6bff" stroke-width="22" stroke-linecap="round"/>
      </svg>
      <div>
        <p class="not-found-code" aria-hidden="true">404</p>
        <h1>This path went nowhere.</h1>
        <p>Let’s get you moving again.</p>
        <a class="button button--light" href="/">Back to home</a>
      </div>
    </section>`,
});

const pages = new Map([
  ['index.html', home],
  ['services/index.html', services],
  ['websites/index.html', websites],
  ['automations/index.html', automations],
  ['qr-ar-studio/index.html', qrAr],
  ['work/index.html', work],
  ['work/engagement/index.html', engagement],
  ['about/index.html', about],
  ['contact/index.html', contact],
  ['privacy/index.html', privacy],
  ['404.html', notFound],
]);

const sitemapPaths = ['/', '/services', '/websites', '/automations', '/qr-ar-studio', '/work', '/work/engagement', '/about', '/contact', '/privacy'];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPaths.map((pathName) => `  <url><loc>${canonicalOrigin}${pathName === '/' ? '' : pathName}</loc></url>`).join('\n')}
</urlset>`;

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(path.join(outputDirectory, 'assets'), { recursive: true });

for (const [relativePath, content] of pages) {
  const destination = path.join(outputDirectory, relativePath);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, content, 'utf8');
}

await cp(path.join(sourceDirectory, 'styles.css'), path.join(outputDirectory, 'assets', 'styles.css'));
await cp(path.join(sourceDirectory, 'site.js'), path.join(outputDirectory, 'assets', 'site.js'));
await cp(path.join(rootDirectory, 'assets', 'favicon.svg'), path.join(outputDirectory, 'assets', 'favicon.svg'));
await cp(path.join(rootDirectory, 'assets', 'logo-b-socio.png'), path.join(outputDirectory, 'assets', 'logo-b-socio.png'));
await cp(path.join(rootDirectory, 'assets', 'og-card.svg'), path.join(outputDirectory, 'assets', 'og-card.svg'));
await cp(path.join(rootDirectory, 'assets', 'og-card.png'), path.join(outputDirectory, 'assets', 'og-card.png'));
await writeFile(path.join(outputDirectory, 'sitemap.xml'), sitemap, 'utf8');
await writeFile(path.join(outputDirectory, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${canonicalOrigin}/sitemap.xml\n`, 'utf8');

console.log(`Built ${pages.size} pages in ${path.relative(rootDirectory, outputDirectory)}.`);
