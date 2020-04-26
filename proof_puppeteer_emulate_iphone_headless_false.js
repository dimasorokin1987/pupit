const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const iPhonex = devices['iPhone X'];

(async()=>{try{
 const browser = await puppeteer.launch({
  headless:false
 });
 const page = await browser.newPage();
 await page.emulate(iPhonex);
 await page.goto('https://www.webkul.com');
 await page.screenshot({ path: 'webkul.png'});
 await browser.close();
}catch(e){
 console.log(e)
}})();