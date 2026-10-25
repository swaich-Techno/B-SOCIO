import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootDirectory = path.resolve(sourceDirectory, '..');
const outputDirectory = path.join(rootDirectory, 'dist');
const errors = [];

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(fullPath));
    else files.push(fullPath);
  }
  return files;
}

function report(file, message) {
  errors.push(`${path.relative(rootDirectory, file)}: ${message}`);
}

function countMatches(content, expression) {
  return [...content.matchAll(expression)].length;
}

function getMeta(content, attribute, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const expression = new RegExp(`<meta\\s+${attribute}="${escapedName}"\\s+content="([^"]*)"`);
  return content.match(expression)?.[1] ?? '';
}

function reportDuplicates(records, property, label) {
  const values = records.map((record) => record[property]);
  for (const value of new Set(values)) {
    if (value && values.filter((candidate) => candidate === value).length > 1) {
      for (const record of records.filter((candidate) => candidate[property] === value)) {
        report(record.file, `duplicate ${label}: ${value}`);
      }
    }
  }
}

async function localTargetExists(reference) {
  const cleanReference = reference.split('#')[0].split('?')[0];
  if (!cleanReference || !cleanReference.startsWith('/')) return true;
  return Boolean(await localTargetFile(reference));
}

async function localTargetFile(reference, currentFile) {
  if (reference.startsWith('#')) return currentFile;
  const cleanReference = reference.split('#')[0].split('?')[0];
  if (!cleanReference.startsWith('/')) return null;
  const relativePath = decodeURIComponent(cleanReference).replace(/^\/+/, '');
  const candidates = cleanReference === '/'
    ? [path.join(outputDirectory, 'index.html')]
    : [
        path.join(outputDirectory, relativePath),
        path.join(outputDirectory, relativePath, 'index.html'),
        path.join(outputDirectory, `${relativePath}.html`),
      ];
  for (const candidate of candidates) {
    const relativeCandidate = path.relative(outputDirectory, candidate);
    if (relativeCandidate.startsWith('..') || path.isAbsolute(relativeCandidate)) return null;
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {
      // Try the next clean URL candidate.
    }
  }
  return null;
}

const files = await collectFiles(outputDirectory);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const documents = new Map(await Promise.all(htmlFiles.map(async (file) => [file, await readFile(file, 'utf8')])));
const records = htmlFiles.map((file) => {
  const html = documents.get(file);
  return {
    file,
    title: html.match(/<title>([^<]+)<\/title>/)?.[1] ?? '',
    description: getMeta(html, 'name', 'description'),
    robots: getMeta(html, 'name', 'robots'),
    canonical: html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? '',
    ids: new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])),
  };
});

for (const file of htmlFiles) {
  const html = documents.get(file);
  const record = records.find((candidate) => candidate.file === file);
  if (!/<html lang="en">/.test(html)) report(file, 'missing document language');
  if (!/<meta name="viewport"/.test(html)) report(file, 'missing viewport metadata');
  if (!record.title) report(file, 'missing title');
  if (!record.description) report(file, 'missing meta description');
  if (!record.robots) report(file, 'missing robots directive');
  if (!record.canonical.startsWith('https://www.bsocio.in')) report(file, 'missing canonical URL');
  if (!/<a class="skip-link" href="#main-content">/.test(html)) report(file, 'missing skip link');
  if (!/<main id="main-content">/.test(html)) report(file, 'missing main landmark target');
  if (countMatches(html, /<h1(?:\s|>)/g) !== 1) report(file, 'must contain exactly one h1');

  for (const property of ['og:type', 'og:site_name', 'og:title', 'og:description', 'og:url', 'og:image', 'og:image:width', 'og:image:height', 'og:image:alt']) {
    if (!getMeta(html, 'property', property)) report(file, `missing ${property} metadata`);
  }
  for (const name of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt']) {
    if (!getMeta(html, 'name', name)) report(file, `missing ${name} metadata`);
  }

  for (const script of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(script[1]);
    } catch (error) {
      report(file, `invalid JSON-LD: ${error.message}`);
    }
  }

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) report(file, `duplicate IDs: ${[...new Set(duplicates)].join(', ')}`);

  for (const image of html.matchAll(/<img\s+([^>]+)>/g)) {
    const attributes = image[1];
    if (!/\salt="[^"]*"/.test(` ${attributes}`)) report(file, 'image missing alt text');
    if (!/\swidth="\d+"/.test(` ${attributes}`) || !/\sheight="\d+"/.test(` ${attributes}`)) report(file, 'image missing explicit dimensions');
  }

  for (const anchor of html.matchAll(/<a\s+([^>]+)>/g)) {
    const attributes = ` ${anchor[1]}`;
    if (/\starget="_blank"/.test(attributes)) {
      const rel = attributes.match(/\srel="([^"]+)"/)?.[1].split(/\s+/) ?? [];
      if (!rel.includes('noopener') || !rel.includes('noreferrer')) report(file, 'target="_blank" link must use noopener noreferrer');
    }
  }

  const labelledIds = new Set([...html.matchAll(/<label\s+for="([^"]+)"/g)].map((match) => match[1]));
  for (const field of html.matchAll(/<(?:input|select|textarea)\s+([^>]+)>/g)) {
    const id = field[1].match(/\bid="([^"]+)"/)?.[1];
    if (id && !labelledIds.has(id)) report(file, `form field #${id} has no matching label`);
  }
  for (const button of html.matchAll(/<button\s+([^>]+)>/g)) {
    if (!/\stype="(?:button|submit|reset)"/.test(` ${button[1]}`)) report(file, 'button missing explicit type');
  }

  const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  for (const reference of references) {
    if (reference.startsWith('/') && !(await localTargetExists(reference))) {
      report(file, `broken local reference ${reference}`);
    }
    if ((reference.startsWith('/') || reference.startsWith('#')) && reference.includes('#')) {
      const targetFile = await localTargetFile(reference, file);
      const fragment = decodeURIComponent(reference.split('#')[1].split('?')[0]);
      const targetRecord = records.find((candidate) => candidate.file === targetFile);
      if (fragment && !targetRecord?.ids.has(fragment)) report(file, `missing fragment target ${reference}`);
    }
  }

  for (const imageUrl of [getMeta(html, 'property', 'og:image'), getMeta(html, 'name', 'twitter:image')]) {
    if (!imageUrl.startsWith('https://www.bsocio.in')) {
      report(file, `social image must use canonical domain: ${imageUrl}`);
      continue;
    }
    if (!(await localTargetFile(new URL(imageUrl).pathname, file))) report(file, `missing social image ${imageUrl}`);
  }
}

const indexableRecords = records.filter((record) => !record.robots.toLowerCase().includes('noindex'));
reportDuplicates(indexableRecords, 'title', 'title');
reportDuplicates(indexableRecords, 'description', 'description');
reportDuplicates(indexableRecords, 'canonical', 'canonical URL');

const notFoundRecord = records.find((record) => path.basename(record.file) === '404.html');
if (!notFoundRecord?.robots.toLowerCase().includes('noindex')) report(notFoundRecord?.file ?? outputDirectory, '404 page must be noindex');

const sitemapFile = path.join(outputDirectory, 'sitemap.xml');
const sitemap = await readFile(sitemapFile, 'utf8');
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
const expectedUrls = new Set(indexableRecords.map((record) => record.canonical));
for (const url of expectedUrls) if (!sitemapUrls.has(url)) report(sitemapFile, `missing indexable URL ${url}`);
for (const url of sitemapUrls) if (!expectedUrls.has(url)) report(sitemapFile, `contains unexpected URL ${url}`);

const robotsFile = path.join(outputDirectory, 'robots.txt');
const robots = await readFile(robotsFile, 'utf8');
if (!robots.includes('Sitemap: https://www.bsocio.in/sitemap.xml')) report(robotsFile, 'missing canonical sitemap declaration');

const css = await readFile(path.join(outputDirectory, 'assets', 'styles.css'), 'utf8');
if (/transition\s*:\s*all/.test(css)) report(path.join(outputDirectory, 'assets', 'styles.css'), 'uses transition: all');
if (!/@media \(prefers-reduced-motion: reduce\)/.test(css)) report(path.join(outputDirectory, 'assets', 'styles.css'), 'missing reduced-motion handling');
if (!/:focus-visible/.test(css)) report(path.join(outputDirectory, 'assets', 'styles.css'), 'missing visible focus styling');

if (errors.length) {
  console.error(`Verification failed with ${errors.length} issue${errors.length === 1 ? '' : 's'}:\n${errors.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Verified ${htmlFiles.length} HTML pages: links and fragments, metadata uniqueness, social images, sitemap coverage, structured data and accessibility baselines.`);
}
