const puppeteer = require('puppeteer');
const express = require('express');

let browser = undefined;
let page = undefined;
let isOpened = false;

const wait = tm=>new Promise(res=>setTimeout(res,tm));

const app = express();
const port = process.env.PORT || 4000;


//http://127.0.0.1:4000/open/?w=640&h=480
app.get('/open', async (req, res) => {try{
    browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: '/usr/bin/google-chrome'
    });
    page = await browser.newPage();
    const width = req.query.w || 640;
    const height = req.query.h || 480;
    await page.setViewport({width,height});
    isOpened = true;
    res.writeHead(200,{'Content-Type':'text/plain'});
    res.end('opened');
}catch(e){res.end(e.toString())}});

//http://127.0.0.1:4000/goto/?url=http://127.0.0.1:5000
app.get('/goto', async (req, res) => {try{
    await page.goto(req.query.url);
    isOpened = true;
    res.writeHead(200,{'Content-Type':'text/plain'});
    res.end('navigated');
}catch(e){res.end(e.toString())}});

app.get('/screenshot', async (req, res) => {try{
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
}catch(e){res.end(e.toString())}});

app.get('/click', async (req, res) => {try{
    if(isOpened){
        let x=req.query.x;
        let y=req.query.y;
        await page.mouse.click(x, y, {delay: 500});
        res.writeHead(200,{'Content-Type':'text/plain'});
        res.end('clicked');
    }else{
        res.end();
    }
}catch(e){res.end(e.toString())}});

app.get('/enterText', async (req, res) => {try{
    if(isOpened){
        await page.keyboard.type(req.query.txt, {delay: 100});
        res.writeHead(200,{'Content-Type':'text/plain'});
        res.end('text entered');
    }else{
        res.end();
    }
}catch(e){res.end(e.toString())}});

app.get('/pressKey', async (req, res) => {try{
    if(isOpened){
        await page.keyboard.press(req.query.key, {delay: 200});
        res.writeHead(200,{'Content-Type':'text/plain'});
        res.end('text entered');
    }else{
        res.end();
    }
}catch(e){res.end(e.toString())}});

app.get('/setBackgroundColor', async (req, res) => {try{
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
}catch(e){res.end(e.toString())}});


app.get('/close', async (req, res) => {try{
    if(isOpened){
        await browser.close();
        isOpened = false;
        res.writeHead(200,{'Content-Type': 'text/plain'});
        res.end('closed');
    }else{
        res.end();
    }
}catch(e){res.end(e.toString())}});

console.log('server started at http://127.0.0.1:'+port)
app.listen(port);