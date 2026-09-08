import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEO_PILLAR_PAGES } from '../src/data/seoData.js';
import { ALL_BLOG_ARTICLES } from '../src/data/blogData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://sipesand.web.id';
const currentDate = new Date().toISOString().split('T')[0];

const urls = [];

// 1. Homepage
urls.push({
  loc: `${BASE_URL}/`,
  lastmod: currentDate,
  changefreq: 'daily',
  priority: '1.0'
});

// 2. 10 Pillar Pages
Object.keys(SEO_PILLAR_PAGES).forEach(slug => {
  urls.push({
    loc: `${BASE_URL}/${slug}`,
    lastmod: currentDate,
    changefreq: 'weekly',
    priority: '0.9'
  });
});

// 3. Blog Directory
urls.push({
  loc: `${BASE_URL}/blog`,
  lastmod: currentDate,
  changefreq: 'daily',
  priority: '0.8'
});

// 4. 100 Blog Articles
ALL_BLOG_ARTICLES.forEach(post => {
  urls.push({
    loc: `${BASE_URL}/blog/${post.slug}`,
    lastmod: post.date || currentDate,
    changefreq: 'monthly',
    priority: '0.7'
  });
});

// 5. Legal / Information Pages
const legalPages = ['faq', 'refund-policy', 'terms-and-conditions', 'kontak'];
legalPages.forEach(page => {
  urls.push({
    loc: `${BASE_URL}/${page}`,
    lastmod: currentDate,
    changefreq: 'monthly',
    priority: '0.5'
  });
});

// Build XML string
const xmlLines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
  '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
  '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">'
];

urls.forEach(u => {
  xmlLines.push('  <url>');
  xmlLines.push(`    <loc>${u.loc}</loc>`);
  xmlLines.push(`    <lastmod>${u.lastmod}</lastmod>`);
  xmlLines.push(`    <changefreq>${u.changefreq}</changefreq>`);
  xmlLines.push(`    <priority>${u.priority}</priority>`);
  xmlLines.push('  </url>');
});

xmlLines.push('</urlset>');

const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
fs.writeFileSync(outputPath, xmlLines.join('\n'), 'utf8');
console.log(`Generated sitemap with ${urls.length} URLs at ${outputPath}`);
