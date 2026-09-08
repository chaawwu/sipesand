import { SEO_PILLAR_PAGES } from '../src/data/seoData.js';
import { ALL_BLOG_ARTICLES } from '../src/data/blogData.js';

const HOST = 'sipesand.web.id';
const KEY = 'sipesand2026indexnowkeye82900ff';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const urlList = [
  `https://${HOST}/`,
  ...Object.keys(SEO_PILLAR_PAGES).map(slug => `https://${HOST}/${slug}`),
  `https://${HOST}/blog`,
  ...ALL_BLOG_ARTICLES.map(art => `https://${HOST}/blog/${art.slug}`),
  `https://${HOST}/faq`,
  `https://${HOST}/refund-policy`,
  `https://${HOST}/terms-and-conditions`,
  `https://${HOST}/kontak`
];

async function submitIndexNow() {
  console.log(`Mengirim ${urlList.length} URL ke API IndexNow untuk host ${HOST}...`);
  console.log(`Key Location: ${KEY_LOCATION}`);

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urlList
  };

  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\nMelakukan request ke: ${endpoint}...`);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      console.log(`Response Status: ${response.status} ${response.statusText}`);
      const text = await response.text();
      if (text) {
        console.log(`Response Body: ${text}`);
      }

      if (response.status === 200 || response.status === 202) {
        console.log(`✓ Berhasil terkirim ke ${endpoint}! Mesin pencari telah menerima notifikasi perayapan instan.`);
      } else {
        console.log(`Catatan respon: ${response.status}`);
      }
    } catch (err) {
      console.error(`Error saat mengirim ke ${endpoint}:`, err.message);
    }
  }
}

submitIndexNow();
