//npm install puppeteer-page-proxy user-agents --save
//node --experimental-modules server.mjs
import fs from 'fs';
import express from 'express';
import puppeteer from 'puppeteer';
import useProxy from 'puppeteer-page-proxy';
import UserAgent from 'user-agents';
import devices from 'puppeteer/DeviceDescriptors.js';
import os from 'os';

const port = process.env.PORT || 4000;
const pass = 'pass';

let browser = undefined;
let tabIndex = 0;
let page = undefined;
let token = undefined;
let strUserAgent = undefined;
let device = undefined;
let strProxy = undefined;
let objViewport = {
  width: 1024,
  height: 768
};

let isInitiated = false;
let isOpened = false;
let isNavigated = false;

const wait = tm => new Promise(res => setTimeout(res, tm));
const hashCode = s => s.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0)
const dt = () => {
  let iDate = Date.now();
  let date = new Date(iDate);
  let strDate = date.toISOString();
  return strDate;
};
const readFile = filename => new Promise((resolve, reject) => {
  fs.readFile(filename, "utf8", (err, data) => {
    if (err) reject(err);
    else resolve(data);
  });
});

const app = express();

const applyPageParams = async(page)=>{
  if(strUserAgent){
    await page.setUserAgent(strUserAgent);
  }
  if(device){
    await page.emulate(device);
  }
  if(strProxy){
    await useProxy(page, strProxy);
  }
  await page.setViewport(objViewport);
  const preloadFile = fs.readFileSync('./preload.js', 'utf8');
  await page.evaluateOnNewDocument(preloadFile);
};


app.use((req, res, next)=>{
  console.log(`${dt()}: query: ${req.originalUrl}`);
  next();
});

app.get('/', async (req, res) => {
  try {
    const file = await readFile('index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(file);
  } catch (e) { res.end(e.toString()) }
});

app.get('/getToken', async (req, res) => {
  try {
    if (isInitiated) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('token:' + token);
    } else {
      res.end();
    }
  } catch (e) { res.end(e.toString()) }
});

app.get('/checkToken', async (req, res) => {
  try {
    const hasAuth = String(req.query.token) === String(token);
    if (isInitiated) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('status:' + hasAuth);
    } else {
      res.end();
    }
  } catch (e) { res.end(e.toString()) }
});

app.get('/getTabsCount', async (req, res) => {
  try {
    if (isOpened) {
      let pages = await browser.pages();
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('tabs count:' + pages.length);
    } else {
      res.end();
    }
  } catch (e) { res.end(e.toString()) }
});

app.get('/init', async (req, res) => {
  try {
    //const hasAuth = String(req.query.token) === String(token);
    if (!isInitiated) {
      isInitiated = true;
      let randStr = Math.random().toString().slice(2);
      token = hashCode(pass + randStr);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(randStr);
    } else {
      res.end();
    }
  } catch (e) { res.end(e.toString()) }
});


app.get('/genUserAgent', async (req, res) => {
  try {
    const hasAuth = String(req.query.token) === String(token);
    if (hasAuth && isInitiated && !isOpened) {
      const userAgent = new UserAgent();
      strUserAgent = userAgent.toString();
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(strUserAgent);
    } else {
      res.end();
    }
  } catch (e) { res.end(e.toString()) }
});

app.get('/setViewportSize', async (req, res) => {
  try {
    const hasAuth = String(req.query.token) === String(token);
    if (hasAuth && isInitiated && !isOpened) {
      objViewport = {
        width: Number(req.query.w),
        height: Number(req.query.h)
      };
      console.log(objViewport);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(JSON.stringify(objViewport));
    } else {
      res.end();
    }
  } catch (e) { res.end(e.toString()) }
});


app.get('/emulateDevice', async (req, res) => {
  try {
    const hasAuth = String(req.query.token) === String(token);
    if (hasAuth && isInitiated && !isOpened) {
      let strDevice = req.query.device.replace('_',' ');
      device = devices[strDevice];
      console.log(strDevice,device);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(strDevice);
    } else {
      res.end();
    }
  } catch (e) { res.end(e.toString()) }
});

app.get('/setProxy', async (req, res) => {
  try {
    const hasAuth = String(req.query.token) === String(token);
    if (hasAuth && isInitiated && !isOpened) {
      strProxy = decodeURIComponent(req.query.proxy);
      console.log(strProxy);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(strProxy);
    } else {
      res.end();
    }
  } catch (e) { res.end(e.toString()) }
});

//http://127.0.0.1:4000/open/?w=640&h=480
app.get('/open', async (req, res) => {
  try {
    const hasAuth = String(req.query.token) === String(token);
    if (hasAuth && isInitiated && !isOpened) {
      if (process.env.NODE_ENV === 'production') {
        browser = await puppeteer.launch({
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            //'--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
          ],
          executablePath: '/usr/bin/google-chrome'
        });
      } else {
        browser = await puppeteer.launch({
          args: [
            //'--disable-gpu',
            //'--disable-dev-shm-usage',
            //'--disable-setuid-sandbox',
            //'--no-first-run',
            //'--no-sandbox',
            //'--no-zygote',
            //'--single-process',
            //--ignore-certificate-errors',
            //'--enable-features=NetworkService'
            //'--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
          ],
          //ignoreHTTPSErrors: true,
          headless: false, //slowMo: 200
        });
      }
      let pages = await browser.pages();
      page = pages[0];
      await applyPageParams(page);
      isOpened = true;

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('opened');
    } else {
      res.end();
    }
  } catch (e) { res.end(e.toString()) }
});

app.get('/createTab', async (req, res) => {
  try {
    const hasAuth = String(req.query.token) === String(token);
    if (hasAuth && isOpened) {
      page = await browser.newPage();
      await applyPageParams(page);

      let pages = await browser.pages();
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('tab created: ' + pages.length);
    } else {
      res.end();
    }
  } catch (e) { res.end(e.toString()) }
});

app.get('/nextTab', async (req, res) => {
  try {
    const hasAuth = String(req.query.token) === String(token);
    if (hasAuth && isOpened) {
      let pages = await browser.pages();
      tabIndex = Math.min(tabIndex+1, pages.length-1);
      page = pages[tabIndex];
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(String(tabIndex));
    } else {
      res.end();
    }
  } catch (e) { res.end(e.toString()) }
});

app.get('/prevTab', async (req, res) => {
  try {
    const hasAuth = String(req.query.token) === String(token);
    if (hasAuth && isOpened) {
      let pages = await browser.pages();
      tabIndex = Math.max(0, tabIndex-1);
      page = pages[tabIndex];
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(String(tabIndex));
    } else {
      res.end();
    }
  } catch (e) { res.end(e.toString()) }
});

//http://127.0.0.1:4000/goto/?url=http://127.0.0.1:5000
app.get('/goto', async (req, res) => {
  try {
    const hasAuth = String(req.query.token) === String(token);
    if (hasAuth && isOpened) {
      let url = decodeURIComponent(req.query.url);
      await page.goto(url);
      isNavigated = true;
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('navigated');
    } else {
      res.end();
    }
  } catch (e) { res.end(e.toString()) }
});

app.get('/screenshot', async (req, res) => {
  try {
    const hasAuth = String(req.query.token) === String(token);
    if (hasAuth && isNavigated) {
      let strRect = req.query.rect;
      console.log(strRect);
      let screenshotBuffer;
      if(strRect){
        let arrRect = strRect.split(',').map(Number);
        let objRect = {
          x: arrRect[0],
          y: arrRect[1],
          width: arrRect[2],
          height: arrRect[3]
        };
        console.log(objRect);
        screenshotBuffer = await page.screenshot({
          type: 'png',
          clip: objRect
        });
      }else{
        screenshotBuffer = await page.screenshot();
      }
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': screenshotBuffer.length
      });
      res.end(screenshotBuffer);
    } else {
      res.end();
    }
  } catch (e) { res.end(e.toString()) }
});

app.get('/click', async (req, res) => {
  try {
    const hasAuth = String(req.query.token) === String(token);
    if (hasAuth && isNavigated) {
      let x = Number(req.query.x);
      let y = Number(req.query.y);
      await page.mouse.click(x, y, { delay: 500 });
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('clicked:'+x+'x'+y);
    } else {
      res.end();
    }
  } catch (e) { res.end(e.toString()) }
});

app.get('/enterText', async (req, res) => {
  try {
    const hasAuth = String(req.query.token) === String(token);
    if (hasAuth && isNavigated) {
      const txt = decodeURIComponent(req.query.txt);
      await page.keyboard.type(txt, { delay: 100 });
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('text entered:'+req.query.txt);
    } else {
      res.end();
    }
  } catch (e) { res.end(e.toString()) }
});

app.get('/pressKey', async (req, res) => {
  try {
    const hasAuth = String(req.query.token) === String(token);
    if (hasAuth && isNavigated) {
      await page.keyboard.press(req.query.key, { delay: 200 });
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('key pressed:'+req.query.key);
    } else {
      res.end();
    }
  } catch (e) { res.end(e.toString()) }
});

app.get('/exec', async (req, res) => {
  try {
    const hasAuth = String(req.query.token) === String(token);
    if (hasAuth && isNavigated) {
      const js = decodeURIComponent(req.query.js);
      let result = '';
      if(js){
        result = await page.evaluate(js => {
          let res;
          try{
            res=eval(js);
          }catch(e){
            res='error:'+e.toString();
          }
          return res;
        }, js);
      }
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(result);
    } else {
      res.end();
    }
  } catch (e) { res.end(e.toString()) }
});

app.get('/setBackgroundColor', async (req, res) => {
  try {
    const hasAuth = String(req.query.token) === String(token);
    if (hasAuth && isNavigated) {
      //res.end(req.query.color);
      const color = req.query.color || '#000';

      await page.evaluate(color => {
        document.body.style.background = color;
      }, color);

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('processed');
    } else {
      res.end();
    }
  } catch (e) { res.end(e.toString()) }
});


app.get('/close', async (req, res) => {
  try {
    const hasAuth = String(req.query.token) === String(token);
    if (hasAuth && isOpened) {
      await browser.close();
      isInitiated = false;
      isOpened = false;
      isNavigated = false;
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('closed');
    } else {
      res.end();
    }
  } catch (e) { res.end(e.toString()) }
});

let networkInterfaces = os.networkInterfaces();
let ips = Object
.values(networkInterfaces)
.flat()
.filter(it=>it.family==='IPv4')
.map(it=>it.address);
let urls = ips.map(ip => `http://${ip}:${port}/`).join(', ');

console.log('server started at ' + urls);
app.listen(port);