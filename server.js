const puppeteer = require('puppeteer');
const express = require('express');
const fs = require('fs');

let browser = undefined;
let page = undefined;
let token = undefined;
let isInitiated = false;
let isOpened = false;
let isNavigated = false;
const pass = 'pass';

const wait = tm => new Promise(res => setTimeout(res, tm));
const hashCode = s => s.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0)

const readFile = filename => new Promise((resolve, reject) => {
  fs.readFile(filename, "utf8", (err, data) => {
    if (err) reject(err);
    else resolve(data);
  });
});

const app = express();
const port = process.env.PORT || 4000;

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

app.get('/init', async (req, res) => {
  try {
    const hasAuth = String(req.query.token) === String(token);
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

//http://127.0.0.1:4000/open/?w=640&h=480
app.get('/open', async (req, res) => {
  try {
    if (isInitiated && !isOpened) {
      if (process.env.NODE_ENV === 'production') {
        browser = await puppeteer.launch({
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          executablePath: '/usr/bin/google-chrome'
        });
      } else {
        browser = await puppeteer.launch();
      }

      page = await browser.newPage();
      console.log(req.query);
      const width = Number(req.query.w) || 640;
      const height = Number(req.query.h) || 480;
      await page.setViewport({ width, height });
      isOpened = true;
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('opened');
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
      await page.goto(req.query.url);
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
      await page.keyboard.type(req.query.txt, { delay: 100 });
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

console.log('server started at http://127.0.0.1:' + port)
app.listen(port);