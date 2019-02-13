const puppeteer = require('puppeteer');
const openBrowser = async (data) => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  try {
    await page.setViewport({width: 500, height: 500});
    await page.goto('https://test.careerfrog.com.cn/landing/job_fair_2018_v2');
  } catch (error) {
    
  }
  
};

(async () => {
  for (let i = 0;i< 10; i++) {
    openBrowser()
  }
})();
