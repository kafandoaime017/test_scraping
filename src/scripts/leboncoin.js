const puppeteer = require('puppeteer-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
require('dotenv').config();

puppeteer.use(stealth());

(async () => {
  const browser = await puppeteer.launch({ headless: process.env.HEADLESS === 'false' });
  const page = await browser.newPage();

  await page.goto(process.env.LEBONCOIN_URL);

  await page.waitForSelector('input[name="q"]');
  
  //JE LANCE la RECHECHE ICI
  await page.type('input[name="q"]', process.env.SEARCH_TERM);
  await page.click('button[type="submit"]');

  await page.waitForSelector('.listing');

  //SELCTIONNER LES ELEMENTS
  const annonces = await page.evaluate(() => {
    let listings = [];
    const elements = document.querySelectorAll('.item');
    elements.forEach((el) => {
      let title = el.querySelector('.title') ? el.querySelector('.title').textContent.trim() : '';
      let link = el.querySelector('a') ? el.querySelector('a').href : '';
      listings.push({ title, link });
    });
    return listings.slice(0, 10); 
  });

  console.log('Annonces trouvées :', annonces);

  await browser.close();
})();
