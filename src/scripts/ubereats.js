const puppeteer = require('puppeteer');
const fs = require('fs');
const saveToCsv = require('../utils/saveTocsv');
require('dotenv').config();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const sanitizeFileName = (str) => {

  return str.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
};

const escapeApostrophes = (str) => {
  return str.replace(/'/g, "\\'"); 
};


//MAIN

(async () => {
  const browser = await puppeteer.launch({ headless: process.env.HEADLESS === 'false' });
  const page = await browser.newPage();

  await page.goto(process.env.UBEREATS_URL);

  const searchInput = await page.$('input[role="combobox"]');
  await searchInput.type(process.env.UBER_EATS_LOCATION);
  await delay(1500);

  await page.waitForSelector('li[data-testid="location-result"]', { visible: true });
  const suggestions = await page.$$('div.kb');

  if (suggestions.length > 0) {
    await suggestions[0].click();
    await page.waitForSelector('span[data-testid="label-wrapper-query"]');
    await (await page.$('span[data-testid="label-wrapper-query"]')).click();

    await page.waitForSelector('input[data-testid="search-input"]');
    await (await page.$('input[data-testid="search-input"]')).type(process.env.UBER_EATS_SEARCH_TERM);
    await (await page.$('input[data-testid="search-input"]')).press('Enter');

    await page.waitForSelector('div.bo.bp.c4.f0.bh.bw.bu.kf', { visible: true });
    const restaurantElements = await page.$$('div.bo.bp.c4.f0.bh.bw.bu.kf');

    const restaurantData = [];

    for (let element of restaurantElements) {
      const name = await element.evaluate(el => el.innerText.trim());

      restaurantData.push({
        "Nom du Restaurant": name
      });
    }
    
    if (restaurantData.length > 0) {
      console.log('Restaurants trouvs :', restaurantData);
      
      const fileName = `restaurants_${sanitizeFileName(process.env.UBER_EATS_LOCATION)}_${sanitizeFileName(process.env.UBER_EATS_SEARCH_TERM)}.csv`;

      saveToCsv(restaurantData, fileName);
    } else {
      console.log('Aucun restaurant trouvé.');
    }
  } else {
    console.log('Aucune suggestion trouvée.');
  }
  await browser.close();
})();
