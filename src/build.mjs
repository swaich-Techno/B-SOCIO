import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootDirectory = path.resolve(sourceDirectory, '..');
const outputDirectory = path.join(rootDirectory, 'dist');
const canonicalOrigin = 'https://www.bsocio.in';
const imagePath = '/assets/images/projects/rehmat-panjab-homepage.png';

const escapeJson = (value) => JSON.stringify(value).replaceAll('<', '\\u003c');

const navigation = [
  ['/', 'Home'],
  ['/services', 'Services'],
  ['/work', 'Work'],
  ['/about', 'About'],
];

function header(currentPath) {
  return `
    <header class="site-header">
      <div class="container nav-shell">
        <a class="brand" href="/" aria-label="B Socio home">
          <span class="brand-mark" aria-hidden="true">B</span>
          <span class="brand-copy"><strong>B Socio</strong><small>Design + Development</small></span>
        </a>
        <button class="menu-button" type="button" aria-expanded="false" aria-controls="site-navigation" aria-label="Open navigation" data-menu-button>
          <span aria-hidden="true"></span><span aria-hidden="true"></span>
        </button>
        <nav class="main-nav" id="site-navigation" aria-label="Main navigation" data-menu data-open="false">
          ${navigation.map(([href, label]) => `<a href="${href}"${currentPath === href ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
          <a class="button button--small" href="/contact"${currentPath === '/contact' ? ' aria-current="page"' : ''}>Start a Project</a>
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
              <span class="brand-mark" aria-hidden="true">B</span>
              <span class="brand-copy"><strong>B Socio</strong><small>Design + Development</small></span>
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
              <li><a href="https://wa.me/919781580475" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
              <li><a href="https://ar.bsocio.in" target="_blank" rel="noopener noreferrer">B Socio AR</a></li>
              <li><a href="https://studio.bsocio.in" target="_blank" rel="noopener noreferrer">Studio Login</a></li>
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
  preloadImage = false,
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
    <meta name="theme-color" content="#f2efe6">
    <meta name="description" content="${description}">
    <meta name="robots" content="${robots}">
    <link rel="canonical" href="${canonical}">
    <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
    ${preloadImage ? `<link rel="preload" as="image" href="${imagePath}">` : ''}
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
  telephone: '+91 97815 80475',
  logo: `${canonicalOrigin}/assets/favicon.svg`,
  areaServed: 'India',
  address: {
    '@type': 'PostalAddress',
    addressRegion: 'Punjab',
    addressCountry: 'IN',
  },
};

const home = page({
  title: 'B Socio — Websites, Ecommerce & Business Automation',
  description: 'B Socio designs distinctive websites, ecommerce experiences and practical business automations for growing businesses.',
  pathName: '/',
  preloadImage: true,
  schema: organizationSchema,
  body: `
    <section class="container hero" aria-labelledby="home-title">
      <div class="hero-copy">
        <p class="eyebrow">Independent digital studio · Punjab</p>
        <h1 id="home-title">Distinct websites. <em>Simpler business workflows.</em></h1>
        <p class="hero-lede">We design and build websites, ecommerce experiences, and practical automations for growing businesses.</p>
        <div class="button-row">
          <a class="button" href="/work">Explore Our Work</a>
          <a class="button button--outline" href="/contact">Start a Project</a>
        </div>
      </div>
      <figure class="hero-project">
        <a href="/work/rehmat-panjab" aria-label="Read the Rehmat Panjab case study">
          <img src="${imagePath}" width="1265" height="713" alt="Rehmat Panjab ecommerce homepage featuring Oud Rose perfume oil" decoding="async" fetchpriority="high">
        </a>
        <figcaption><span>New in the portfolio · Rehmat Panjab</span><span>Ecommerce / Fragrance</span></figcaption>
      </figure>
    </section>

    <section class="section section--dark" aria-labelledby="featured-title">
      <div class="container">
        <div class="section-heading" data-reveal>
          <div><p class="eyebrow">01 · Featured Work</p><h2 id="featured-title">A fragrance house, made discoverable.</h2></div>
          <div><p>Real work leads the portfolio. Rehmat Panjab brings product discovery, brand storytelling and a curated collection of concentrated perfume oils together.</p></div>
        </div>
        <article class="featured-grid" data-reveal>
          <div class="featured-copy">
            <p class="eyebrow">Live Project</p>
            <h3>Rehmat Panjab</h3>
            <p>An editorial ecommerce experience built around mood, fragrance notes, testers and guided discovery.</p>
            <div class="project-meta"><span>Ecommerce</span><span>Brand Experience</span><span>Next.js</span></div>
            <div class="button-row">
              <a class="button button--light" href="/work/rehmat-panjab">Read Case Study</a>
              <a class="text-link" href="https://www.rehmatpanjab.com" target="_blank" rel="noopener noreferrer">View Live Website <span class="arrow" aria-hidden="true">↗</span></a>
            </div>
          </div>
          <figure class="project-media">
            <a href="/work/rehmat-panjab" aria-label="Read the Rehmat Panjab case study"><img src="${imagePath}" width="1265" height="713" alt="Rehmat Panjab ecommerce homepage featuring Oud Rose perfume oil" loading="lazy" decoding="async"></a>
            <figcaption><span>Live ecommerce experience</span><span>Rehmat Panjab</span></figcaption>
          </figure>
        </article>
      </div>
    </section>

    <section class="section" aria-labelledby="services-title">
      <div class="container">
        <div class="section-heading" data-reveal>
          <div><p class="eyebrow">02 · Services</p><h2 id="services-title">Built around the customer experience—and the work behind it.</h2></div>
          <div><p>Start with one focused need or connect the website, workflow and growth systems into a coherent whole.</p></div>
        </div>
        <ol class="service-index" data-reveal>
          <li><h3>Website Development &amp; Ecommerce</h3><p>Distinctive business sites, storefronts, landing pages and web applications designed to work across every screen.</p><a href="/websites" aria-label="Explore website development and ecommerce">↗</a></li>
          <li><h3>AI &amp; Business Automation</h3><p>Useful assistants, enquiry flows, follow-ups, reporting and connected workflows—with a clear path back to a person.</p><a href="/automations" aria-label="Explore AI and business automation">↗</a></li>
          <li><h3>Branding &amp; Digital Growth</h3><p>Visual direction, campaign pages, content systems, paid ads and WhatsApp marketing for a more coherent presence.</p><a href="/services#growth" aria-label="Explore branding and digital growth">↗</a></li>
          <li><h3>QR/AR Experiences</h3><p>Practical interactive previews for products, spaces, menus, catalogues, packaging and events.</p><a href="/qr-ar-studio" aria-label="Explore QR and AR experiences">↗</a></li>
        </ol>
      </div>
    </section>

    <section class="section section--dark" aria-labelledby="process-title">
      <div class="container">
        <div class="section-heading" data-reveal>
          <div><p class="eyebrow">03 · How We Work</p><h2 id="process-title">Clear decisions. Reviewable stages.</h2></div>
          <div><p>Every engagement is shaped around the business, audience and constraints—not a fixed package disguised as discovery.</p></div>
        </div>
        <ol class="process-list" data-reveal>
          <li><span>01</span><h3>Discover</h3><p>Clarify the audience, business need, existing tools and useful constraints.</p></li>
          <li><span>02</span><h3>Define</h3><p>Agree on scope, approach, responsibilities and review milestones before building.</p></li>
          <li><span>03</span><h3>Make</h3><p>Design and develop in reviewable stages, testing decisions as the experience takes shape.</p></li>
          <li><span>04</span><h3>Launch</h3><p>Complete quality checks, prepare handover and support the agreed release path.</p></li>
        </ol>
      </div>
    </section>

    <section class="section" aria-labelledby="about-title">
      <div class="container about-split" data-reveal>
        <h2 id="about-title">Useful digital work, without the theatre.</h2>
        <div class="about-copy">
          <p>B Socio is an independent digital studio in Punjab, India. We bring design, development, automation and digital growth into one practical working relationship.</p>
          <p>We stay honest about what is live, what needs access and what still needs to be decided.</p>
          <a class="text-link" href="/about">About B Socio <span class="arrow" aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>

    <section class="section--signal" aria-labelledby="contact-cta-title">
      <div class="container cta-band" data-reveal>
        <h2 id="contact-cta-title">Have something useful to build?</h2>
        <div><p>Tell us what the business needs, where the friction is and what a good outcome should make easier.</p><div class="button-row"><a class="button" href="/contact">Start a Project</a></div></div>
      </div>
    </section>`,
});

const services = page({
  title: 'Services',
  description: 'Website development, ecommerce, AI automation, branding, digital growth and QR/AR services from B Socio.',
  pathName: '/services',
  body: `
    <section class="container page-hero">
      <div><p class="eyebrow">Services</p><h1>One studio. Four connected capabilities.</h1></div>
      <div><p>Build the customer-facing experience, improve the workflow behind it, or connect both around a clear business need.</p></div>
    </section>
    <div class="container">
      <section class="service-detail" id="websites" aria-labelledby="websites-title" data-reveal>
        <header><p class="eyebrow">01 · Digital Products</p><h2 id="websites-title">Website Development &amp; Ecommerce</h2></header>
        <div><p>Business websites, ecommerce storefronts, campaign pages and custom interfaces with clear content hierarchy, responsive behavior and technical SEO foundations.</p><ul class="plain-list"><li>UX, content structure and visual direction</li><li>Responsive frontend development</li><li>Ecommerce and product-discovery experiences</li><li>Landing pages, booking journeys and custom web apps</li><li>Deployment, testing and handover</li></ul><a class="text-link" href="/websites">Explore Websites <span class="arrow" aria-hidden="true">↗</span></a></div>
      </section>
      <section class="service-detail" id="automation" aria-labelledby="automation-title" data-reveal>
        <header><p class="eyebrow">02 · Operations</p><h2 id="automation-title">AI &amp; Business Automation</h2></header>
        <div><p>Practical workflows for enquiries, reminders, reporting and knowledge access. Every provider connection is reviewed for permissions, reliability and cost before it is promised.</p><ul class="plain-list"><li>Workflow discovery and process mapping</li><li>AI assistants with human handoff</li><li>Enquiry qualification and routing</li><li>CRM, calendar and messaging integrations after review</li><li>Custom dashboards and internal tools</li></ul><a class="text-link" href="/automations">Explore Automation <span class="arrow" aria-hidden="true">↗</span></a></div>
      </section>
      <section class="service-detail" id="growth" aria-labelledby="growth-title" data-reveal>
        <header><p class="eyebrow">03 · Brand</p><h2 id="growth-title">Branding &amp; Digital Growth</h2></header>
        <div><p>A coherent visual presence and practical campaign support for businesses that need to be easier to recognize, understand and contact.</p><ul class="plain-list"><li>Brand colors, identity direction and digital systems</li><li>Social media planning and management</li><li>Reels, short video concepts and edits</li><li>Posters, menus, product and campaign creative</li><li>Paid social campaigns and WhatsApp marketing</li></ul></div>
      </section>
      <section class="service-detail" id="immersive" aria-labelledby="immersive-title" data-reveal>
        <header><p class="eyebrow">04 · Interactive</p><h2 id="immersive-title">QR/AR Experiences</h2></header>
        <div><p>Interactive, scan-to-open experiences where a spatial or visual preview genuinely helps the customer understand the offer.</p><ul class="plain-list"><li>Product and packaging experiences</li><li>Menus and catalogues</li><li>Furniture and real-estate previews</li><li>Event and campaign activations</li></ul><a class="text-link" href="/qr-ar-studio">Explore QR/AR <span class="arrow" aria-hidden="true">↗</span></a></div>
      </section>
    </div>
    <section class="section--signal"><div class="container cta-band"><h2>Not sure where the project starts?</h2><div><p>Describe the business problem. We will help identify whether the useful first step is a website, a workflow or a smaller focused improvement.</p><div class="button-row"><a class="button" href="/contact">Start a Conversation</a></div></div></div></section>`,
});

const websites = page({
  title: 'Website Development & Ecommerce',
  description: 'B Socio designs and develops responsive business websites, ecommerce stores, landing pages and custom web applications.',
  pathName: '/websites',
  body: `
    <section class="page-hero--dark"><div class="container page-hero"><div><p class="eyebrow">Websites &amp; Ecommerce</p><h1>Make the website part of how the business works.</h1></div><div><p>A distinctive digital presence should also be clear, responsive, maintainable and useful to the people behind it.</p><div class="button-row"><a class="button button--light" href="/contact">Discuss a Website</a></div></div></div></section>
    <section class="section" aria-labelledby="website-capabilities"><div class="container"><div class="section-heading"><div><p class="eyebrow">What We Build</p><h2 id="website-capabilities">From focused launches to complete storefronts.</h2></div><div><p>The scope follows the job. No framework or commerce platform is chosen before the requirements are understood.</p></div></div><div class="principles-grid"><article class="principle"><span>01</span><h3>Business Websites</h3><p>Clear positioning, services, work and contact journeys.</p></article><article class="principle"><span>02</span><h3>Ecommerce</h3><p>Product discovery, brand storytelling, merchandising and purchase paths.</p></article><article class="principle"><span>03</span><h3>Landing Pages</h3><p>Focused campaign and lead-generation experiences with one clear action.</p></article><article class="principle"><span>04</span><h3>Custom Applications</h3><p>Portals, dashboards, booking tools and purpose-built business interfaces.</p></article><article class="principle"><span>05</span><h3>Thoughtful Redesigns</h3><p>Stronger hierarchy and usability without discarding working systems by reflex.</p></article><article class="principle"><span>06</span><h3>Launch Foundations</h3><p>Responsive QA, accessibility, metadata, performance and handover.</p></article></div></div></section>
    <section class="section section--dark" aria-labelledby="web-process"><div class="container"><div class="section-heading"><div><p class="eyebrow">Working Principles</p><h2 id="web-process">Content, craft and code stay connected.</h2></div><div><p>Design decisions are tested against the real content and implementation—not handed off as static decoration.</p></div></div><ol class="process-list"><li><span>01</span><h3>Structure</h3><p>Map the audience, pages, content and primary journeys.</p></li><li><span>02</span><h3>Direction</h3><p>Establish type, color, spacing, imagery and interaction rules.</p></li><li><span>03</span><h3>Build</h3><p>Implement responsive, semantic and maintainable interfaces.</p></li><li><span>04</span><h3>Verify</h3><p>Test links, forms, devices, metadata and launch conditions.</p></li></ol></div></section>`,
});

const automations = page({
  title: 'AI & Business Automation',
  description: 'B Socio plans and builds practical AI assistants, enquiry workflows and business automations with human handoff.',
  pathName: '/automations',
  body: `
    <section class="container page-hero"><div><p class="eyebrow">AI &amp; Automation</p><h1>Less repetitive work. More visible next steps.</h1></div><div><p>We map the real workflow first, then introduce automation only where it can be tested, monitored and handed back to a person.</p><div class="button-row"><a class="button" href="/contact">Map a Workflow</a></div></div></section>
    <section class="section section--dark" aria-labelledby="automation-capabilities"><div class="container"><div class="section-heading"><div><p class="eyebrow">Capabilities</p><h2 id="automation-capabilities">Practical systems, not automation theatre.</h2></div><div><p>External services, model providers and data connections require an access, cost and reliability review before implementation.</p></div></div><div class="principles-grid"><article class="principle"><span>01</span><h3>Enquiry Workflows</h3><p>Validate, route and record incoming requests with clear ownership.</p></article><article class="principle"><span>02</span><h3>Follow-ups</h3><p>Coordinate reminders and next steps without relying on memory.</p></article><article class="principle"><span>03</span><h3>Knowledge Assistants</h3><p>Answer from approved information and provide a clear human handoff.</p></article><article class="principle"><span>04</span><h3>Connected Tools</h3><p>Join forms, inboxes, sheets, calendars and CRMs after provider review.</p></article><article class="principle"><span>05</span><h3>Internal Interfaces</h3><p>Give teams a calmer view of requests, records and actions.</p></article><article class="principle"><span>06</span><h3>Exception Paths</h3><p>Plan validation, retries and manual recovery before launch.</p></article></div></div></section>
    <section class="section" aria-labelledby="automation-boundaries"><div class="container about-split"><h2 id="automation-boundaries">Clear about what needs access.</h2><div class="about-copy"><p>CRM, calendar, messaging, payments, AI models and reporting platforms each have their own credentials, permissions, costs and limitations.</p><p>We confirm those conditions before treating an integration as part of the delivery.</p><a class="text-link" href="/contact">Discuss Your Workflow <span class="arrow" aria-hidden="true">↗</span></a></div></div></section>`,
});

const qrAr = page({
  title: 'QR/AR Studio',
  description: 'B Socio creates practical QR and augmented reality experiences for products, menus, spaces, packaging and events.',
  pathName: '/qr-ar-studio',
  body: `
    <section class="container page-hero"><div><p class="eyebrow">QR/AR Studio</p><h1>Let customers see more before they decide.</h1></div><div><p>Scan-to-open experiences for products, spaces and campaigns—used where an interactive preview makes the choice clearer.</p><div class="button-row"><a class="button" href="https://ar.bsocio.in" target="_blank" rel="noopener noreferrer">Visit AR Studio</a><a class="button button--outline" href="/contact">Plan an Experience</a></div></div></section>
    <section class="section section--dark" aria-labelledby="ar-uses"><div class="container"><div class="section-heading"><div><p class="eyebrow">Relevant Uses</p><h2 id="ar-uses">A useful layer between the physical and digital.</h2></div><div><p>The format follows the object and the customer decision, not the novelty of the technology.</p></div></div><div class="principles-grid"><article class="principle"><span>01</span><h3>Products</h3><p>Reveal details, variations or contextual previews from packaging and displays.</p></article><article class="principle"><span>02</span><h3>Spaces</h3><p>Preview furniture, property ideas or installations in context.</p></article><article class="principle"><span>03</span><h3>Menus &amp; Catalogues</h3><p>Connect printed material to richer, updateable product information.</p></article><article class="principle"><span>04</span><h3>Events</h3><p>Add guided information or interactive campaign moments.</p></article><article class="principle"><span>05</span><h3>Packaging</h3><p>Extend a physical product with instructions, stories or digital content.</p></article><article class="principle"><span>06</span><h3>Campaigns</h3><p>Build a measurable scan-to-experience journey around a clear action.</p></article></div></div></section>`,
});

const work = page({
  title: 'Selected Work',
  description: 'Explore real B Socio client work and clearly labelled digital product and automation concepts.',
  pathName: '/work',
  body: `
    <section class="container page-hero"><div><p class="eyebrow">Work</p><h1>Real work first. Concepts labelled.</h1></div><div><p>The portfolio separates published client work from demonstrations, so the evidence stays clear.</p></div></section>
    <section class="section section--ruled" aria-label="Portfolio projects"><div class="container work-grid">
      <article class="work-card work-card--featured" data-reveal><a class="work-card-media" href="/work/rehmat-panjab"><img src="${imagePath}" width="1265" height="713" alt="Rehmat Panjab ecommerce homepage featuring Oud Rose perfume oil" loading="lazy" decoding="async"></a><div class="work-card-head"><div><h2>Rehmat Panjab</h2><p>An ecommerce fragrance experience bringing product discovery, brand storytelling and a curated collection of concentrated perfume oils together.</p><div class="project-meta"><span>Ecommerce</span><span>Fragrance Website</span><span>Next.js</span></div></div><span class="label label--real">Live Project</span></div><a class="text-link" href="/work/rehmat-panjab">Read Case Study <span class="arrow" aria-hidden="true">↗</span></a></article>
      <article class="work-card" data-reveal><div class="concept-visual" aria-hidden="true"><span>01 / ENQ</span></div><div class="work-card-head"><div><h3>Service Enquiry Workspace</h3><p>A landing page and lead workspace concept for turning an unstructured enquiry into a review-ready record.</p></div><span class="label">Concept</span></div></article>
      <article class="work-card" data-reveal><div class="concept-visual" aria-hidden="true"><span>02 / OPS</span></div><div class="work-card-head"><div><h3>Operations Portal</h3><p>A calm internal-tool concept for tracking requests, ownership, documents and next actions.</p></div><span class="label">Concept</span></div></article>
    </div></section>
    <section class="section--signal"><div class="container cta-band"><h2>Ready to make the next case study real?</h2><div><p>Bring the business need, the existing constraints and the outcome you want to make possible.</p><div class="button-row"><a class="button" href="/contact">Start a Project</a></div></div></div></section>`,
});

const caseStudySchema = {
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: 'Rehmat Panjab Ecommerce Website',
  creator: { '@type': 'Organization', name: 'B Socio', url: canonicalOrigin },
  url: `${canonicalOrigin}/work/rehmat-panjab`,
  about: 'Ecommerce fragrance website for Rehmat Panjab',
  image: `${canonicalOrigin}${imagePath}`,
};

const rehmatPanjab = page({
  title: 'Rehmat Panjab Case Study',
  description: 'A B Socio case study for Rehmat Panjab, an ecommerce fragrance experience for concentrated perfume oils.',
  pathName: '/work/rehmat-panjab',
  preloadImage: true,
  ogType: 'article',
  socialImage: imagePath,
  socialImageAlt: 'Rehmat Panjab ecommerce homepage featuring Oud Rose perfume oil',
  socialImageWidth: 1265,
  socialImageHeight: 713,
  schema: caseStudySchema,
  body: `
    <article>
      <header class="container case-hero">
        <div class="case-hero-top"><div><p class="eyebrow">Live Project · Ecommerce / Fragrance</p><h1>Rehmat Panjab</h1></div><div><p class="case-hero-summary">An ecommerce fragrance experience that brings product discovery, brand storytelling and a curated collection of concentrated perfume oils together.</p><div class="button-row"><a class="button" href="https://www.rehmatpanjab.com" target="_blank" rel="noopener noreferrer">View Live Website</a></div></div></div>
        <figure class="case-hero-media"><img src="${imagePath}" width="1265" height="713" alt="Rehmat Panjab homepage showing Oud Rose perfume oil, fragrance notes and product actions" decoding="async" fetchpriority="high"><figcaption><span>Rehmat Panjab homepage</span><span>Captured 24 October 2026</span></figcaption></figure>
        <nav aria-label="Case study sections"><ol class="case-index"><li><a href="#overview">01 Overview</a></li><li><a href="#experience">02 Experience</a></li><li><a href="#features">03 Features</a></li><li><a href="#design">04 Design</a></li><li><a href="#contribution">05 Contribution</a></li><li><a href="#technology">06 Technology</a></li></ol></nav>
      </header>
      <div class="container">
        <section class="case-section" id="overview" aria-labelledby="overview-title"><header><span>01</span><h2 id="overview-title">Project Overview</h2></header><div class="case-content"><p>Rehmat Panjab is a Punjab-based perfume-oil house. Its public website presents concentrated fragrances for everyday wear, gifting and memorable occasions, with product information grounded in notes, mood and occasion.</p><dl class="fact-list"><div><dt>Project</dt><dd>Rehmat Panjab</dd></div><div><dt>Category</dt><dd>Ecommerce / Fragrance Website</dd></div><div><dt>Status</dt><dd>Live</dd></div><div><dt>Market</dt><dd>India</dd></div></dl></div></section>
        <section class="case-section" id="experience" aria-labelledby="experience-title"><header><span>02</span><h2 id="experience-title">Brand &amp; Website Experience</h2></header><div class="case-content"><p>The experience treats fragrance as atmosphere and personal ritual rather than a conventional product grid. An editorial homepage introduces a daily fragrance, its notes and an immediate path into the collection.</p><p>Customers can begin with testers, browse the house, use guided scent discovery or move directly into product detail and purchase paths.</p></div></section>
        <section class="case-section" id="features" aria-labelledby="features-title"><header><span>03</span><h2 id="features-title">Key Features</h2></header><div class="case-content"><ul class="feature-list"><li><strong>Product Discovery</strong><span>Collection browsing, product pages and visible size and availability information.</span></li><li><strong>Guided Choice</strong><span>A scent finder and Rehmat AI entry point organized around mood, occasion and fragrance family.</span></li><li><strong>Tester Journey</strong><span>Individual 3 ml testers and build-your-own set pathways for lower-commitment discovery.</span></li><li><strong>Commerce</strong><span>Cart actions, live offers and product variants are visible in the public experience.</span></li><li><strong>Fragrance Education</strong><span>Top, heart and base notes are explained through product content and published guides.</span></li></ul></div></section>
        <section class="case-section" id="design" aria-labelledby="design-title"><header><span>04</span><h2 id="design-title">Design &amp; Development</h2></header><div class="case-content"><p>A dark green, cream and copper palette supports a premium fragrance position. High-contrast serif typography, detailed product imagery and ingredient notes give the collection a distinctive editorial voice.</p><p>The public interface adapts across navigation, product discovery and purchasing flows, includes semantic headings and labels, and provides motion controls for the cinematic hero scene.</p></div></section>
        <section class="case-section" id="contribution" aria-labelledby="contribution-title"><header><span>05</span><h2 id="contribution-title">B Socio’s Contribution</h2></header><div class="case-content"><p>B Socio created the Rehmat Panjab website experience. The recovered B Socio repository does not contain the original project records, so this public case study intentionally does not claim a more detailed role split, timeline or measured business result.</p></div></section>
        <section class="case-section" id="technology" aria-labelledby="technology-title"><header><span>06</span><h2 id="technology-title">Technology Stack</h2></header><div class="case-content"><p>The publicly served markup confirms a Next.js frontend. Hosting, database, CMS, payment services and private infrastructure are not identified here because they cannot be verified from the public interface alone.</p><div class="button-row"><a class="button" href="https://www.rehmatpanjab.com" target="_blank" rel="noopener noreferrer">View Live Website</a><a class="button button--outline" href="/contact">Discuss a Similar Project</a></div></div></section>
      </div>
    </article>`,
});

const about = page({
  title: 'About',
  description: 'B Socio is an independent digital studio in Punjab designing websites, ecommerce experiences and practical business automations.',
  pathName: '/about',
  body: `
    <section class="container page-hero"><div><p class="eyebrow">About B Socio</p><h1>Design and development, close to the work.</h1></div><div><p>B Socio is an independent digital studio in Punjab, India, bringing websites, ecommerce, automation and digital growth into one practical working relationship.</p></div></section>
    <section class="section section--dark" aria-labelledby="about-belief"><div class="container about-split"><h2 id="about-belief">The useful answer is usually specific.</h2><div class="about-copy"><p>We begin with the audience, workflow and constraints—not a trend, a framework or a list of features.</p><p>That keeps the work focused on what customers need to understand and what the team needs to operate.</p></div></div></section>
    <section class="section" aria-labelledby="principles"><div class="container"><div class="section-heading"><div><p class="eyebrow">Principles</p><h2 id="principles">A straightforward way to work.</h2></div><div><p>Clear scope, reviewable decisions and honest boundaries from discovery through handover.</p></div></div><div class="principles-grid"><article class="principle"><span>01</span><h3>Human-led</h3><p>Automation supports judgment; it does not replace accountability.</p></article><article class="principle"><span>02</span><h3>Evidence first</h3><p>Real work is labelled clearly. Results and technologies are never invented.</p></article><article class="principle"><span>03</span><h3>Built to hand over</h3><p>The finished system should be understandable to the people who own it.</p></article></div></div></section>`,
});

const contact = page({
  title: 'Start a Project',
  description: 'Tell B Socio about your website, ecommerce, automation, branding or QR/AR project.',
  pathName: '/contact',
  body: `
    <section class="container page-hero"><div><p class="eyebrow">Start a Project</p><h1>Tell us what needs to work better.</h1></div><div><p>Share the business context, the current friction and the outcome you want. We will reply with a useful next step.</p></div></section>
    <section class="section section--ruled"><div class="container contact-layout">
      <aside class="contact-aside"><h2>Direct, simple contact.</h2><p>This form opens your own email app or WhatsApp. Your enquiry is not stored by this website.</p><div class="contact-details"><a href="mailto:connect@bsocio.in">connect@bsocio.in</a><a href="https://wa.me/919781580475" target="_blank" rel="noopener noreferrer">+91 97815 80475</a><span>Punjab, India</span></div></aside>
      <form class="inquiry-form" data-inquiry-form>
        <div class="field-grid">
          <div class="field"><label for="name">Name</label><input id="name" name="name" autocomplete="name" maxlength="80" required></div>
          <div class="field"><label for="business">Business Name</label><input id="business" name="business" autocomplete="organization" maxlength="120"></div>
          <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" inputmode="email" autocomplete="email" spellcheck="false" maxlength="254" required></div>
          <div class="field"><label for="phone">Phone</label><input id="phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+91 …" maxlength="32"></div>
          <div class="field field--wide"><label for="service">What do you need?</label><select id="service" name="service" required><option value="">Select a service</option><option>Website Development &amp; Ecommerce</option><option>AI &amp; Business Automation</option><option>Branding &amp; Digital Growth</option><option>QR/AR Experience</option><option>Not sure yet</option></select></div>
          <div class="field field--wide"><label for="message">Project Details</label><textarea id="message" name="message" placeholder="What should the project make easier? …" aria-describedby="message-help" maxlength="2000" required></textarea><small id="message-help">Include useful context, existing links and any fixed launch constraints. Maximum 2,000 characters.</small></div>
        </div>
        <div class="button-row"><button class="button" type="submit">Send by Email</button><button class="button button--outline" type="button" data-whatsapp-submit>Send on WhatsApp</button></div>
        <p class="form-note">Email and WhatsApp open external applications. Their own privacy terms apply.</p>
        <p class="form-status" aria-live="polite" data-form-status></p>
      </form>
    </div></section>`,
});

const privacy = page({
  title: 'Privacy',
  description: 'Privacy information for the B Socio website and project enquiry contact options.',
  pathName: '/privacy',
  body: `
    <section class="container page-hero"><div><p class="eyebrow">Privacy</p><h1>A simple website with minimal data collection.</h1></div><div><p>This page explains what happens when you browse the B Socio website or choose to contact the studio.</p></div></section>
    <section class="section section--ruled"><div class="container legal-copy"><p><strong>Last updated:</strong> 24 October 2026</p><h2>Website browsing</h2><p>This static website does not set optional advertising cookies or run a customer tracking script in its source code.</p><h2>Project enquiries</h2><p>The project form prepares a message and opens your email application or WhatsApp. The website itself does not store the form contents. Information you choose to send is handled through the selected service and used to respond to your enquiry.</p><h2>External websites</h2><p>Links to Rehmat Panjab, B Socio AR, WhatsApp and the private studio open third-party services with their own privacy practices.</p><h2>Contact</h2><p>For privacy questions, email <a href="mailto:connect@bsocio.in">connect@bsocio.in</a>.</p></div></section>`,
});

const notFound = page({
  title: 'Page Not Found',
  description: 'The requested B Socio page could not be found.',
  pathName: '/404',
  robots: 'noindex, follow',
  body: `<section class="container not-found"><div><strong aria-hidden="true">404</strong><h1>That page is not here.</h1><p>The link may be out of date, or the page may have moved.</p><a class="button" href="/">Return Home</a></div></section>`,
});

const pages = new Map([
  ['index.html', home],
  ['services/index.html', services],
  ['websites/index.html', websites],
  ['automations/index.html', automations],
  ['qr-ar-studio/index.html', qrAr],
  ['work/index.html', work],
  ['work/rehmat-panjab/index.html', rehmatPanjab],
  ['about/index.html', about],
  ['contact/index.html', contact],
  ['privacy/index.html', privacy],
  ['404.html', notFound],
]);

const sitemapPaths = ['/', '/services', '/websites', '/automations', '/qr-ar-studio', '/work', '/work/rehmat-panjab', '/about', '/contact', '/privacy'];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPaths.map((pathName) => `  <url><loc>${canonicalOrigin}${pathName === '/' ? '' : pathName}</loc></url>`).join('\n')}
</urlset>`;

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(path.join(outputDirectory, 'assets', 'images', 'projects'), { recursive: true });

for (const [relativePath, content] of pages) {
  const destination = path.join(outputDirectory, relativePath);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, content, 'utf8');
}

await cp(path.join(sourceDirectory, 'styles.css'), path.join(outputDirectory, 'assets', 'styles.css'));
await cp(path.join(sourceDirectory, 'site.js'), path.join(outputDirectory, 'assets', 'site.js'));
await cp(path.join(rootDirectory, 'assets', 'favicon.svg'), path.join(outputDirectory, 'assets', 'favicon.svg'));
await cp(path.join(rootDirectory, 'assets', 'og-card.svg'), path.join(outputDirectory, 'assets', 'og-card.svg'));
await cp(path.join(rootDirectory, 'assets', 'og-card.png'), path.join(outputDirectory, 'assets', 'og-card.png'));
await cp(path.join(rootDirectory, 'assets', 'images', 'projects', 'rehmat-panjab-homepage.png'), path.join(outputDirectory, 'assets', 'images', 'projects', 'rehmat-panjab-homepage.png'));
await writeFile(path.join(outputDirectory, 'sitemap.xml'), sitemap, 'utf8');
await writeFile(path.join(outputDirectory, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${canonicalOrigin}/sitemap.xml\n`, 'utf8');

console.log(`Built ${pages.size} pages in ${path.relative(rootDirectory, outputDirectory)}.`);
