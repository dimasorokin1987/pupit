const puppeteer = require('puppeteer');
const express = require('express');

let browser = undefined;
let page = undefined;
let isOpened = false;

const wait = tm=>new Promise(res=>setTimeout(res,tm));

const app = express();
const port = process.env.PORT || 4000;


//http://127.0.0.1:4000/open/?url=http://127.0.0.1:5000
app.get('/open', async (req, res) => {try{
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto(req.query.url);
    isOpened = true;
    res.writeHead(200,{'Content-Type':'text/plain'});
    res.end('opened');
}catch(e){res.end(e.toString())}});

app.get('/screenshot', async (req, res) => {
    if(isOpened){
        const screenshotBuffer = await page.screenshot();
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': screenshotBuffer.length
        });
        res.end(screenshotBuffer);
    }else{
        res.end();
    }
});

app.get('/setBackgroundColor', async (req, res) => {
    if(isOpened){
        //res.end(req.query.color);
        const color = req.query.color||'#000';
        
        await page.evaluate(color => {
            document.body.style.background = color;
        }, color);

        res.writeHead(200,{'Content-Type': 'text/plain'});
        res.end('processed');
    }else{
        res.end();
    }
});


app.get('/close', async (req, res) => {
    if(isOpened){
        await browser.close();
        isOpened = false;
        res.writeHead(200,{'Content-Type': 'text/plain'});
        res.end('closed');
    }else{
        res.end();
    }
});

console.log('server started at http://127.0.0.1:'+port)
app.listen(port);