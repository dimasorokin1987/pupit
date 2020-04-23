let puppeteer = require('puppeteer');
let page = null;

(async()=>{
  let browser = await puppeteer.launch();
  let page1 = await browser.newPage();
  let page2 = await browser.newPage();
  let page3 = await browser.newPage();
  const width = 640;
  const height = 480;
  await page1.setViewport({ width, height });

  let pages = await browser.pages();
  console.log(pages.length);
  page = pages[1];

  await browser.close();
})();

