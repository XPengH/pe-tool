const puppeteer = require('puppeteer');
const userInfo = require('../config/question-down-user-info');
const userAgent = require('../config/userAgent');
const questionInfo = require('../config/questionInfo');
const getIp = require('./getIp')

const openPage = async (data) => {
  const browser = await puppeteer.launch({headless: true, args: [ `--proxy-server=${data.ipPort}` ]});
  const emailPage = await browser.newPage();
  const newUserAgent = userAgent[parseInt(Math.random() * 21)].toString();
  try {
    
    await emailPage.setUserAgent(newUserAgent);
    await emailPage.setViewport({width: 1024, height: 750});
    await emailPage.goto('https://mail.163.com/');
    await emailPage.waitFor(10000);
    await emailPage.keyboard.type(data.email, {delay: 100});
    await emailPage.waitFor(6000);
    // 按tab
    await emailPage.keyboard.press('Tab');
    await emailPage.keyboard.type(data.emailPassword, {delay: 100});
    await emailPage.waitFor(8000);
   
    await emailPage.mouse.click(687, 386);
    await emailPage.waitFor(8000);
     // 在这判断一下可能会有提示显示修改密码
    await emailPage.mouse.click(833, 399);
    // await emailPage.screenshot({path: 'email/loginin' + data.email + '.png'});
    await emailPage.waitFor(8000);
    await emailPage.mouse.click(64, 147);
    await emailPage.waitFor(8000);
    const innerText = await emailPage.evaluate(() => {
      const innerText = document.getElementsByClassName('tv0')[0].innerText;
      return innerText;
    });
    browser.close();
    return innerText.split('知乎你更改帐号信息的验证码是:')[1].slice(0, 6)
  } catch (error) {
    browser.close();
  }
}

const getItemIndex = async (page) => {
  const number = questionInfo.number;
  const index = await page.evaluate(number => {
    console.log(number);
    let list = document.getElementsByClassName('List-item');
    for (let i = 0; i < list.length; i++) {
      if (list[i].innerHTML.indexOf(number) !== -1) {
        return i;
      }
    }
    return -1
  }, number);
  return index;
}

// 页面滚动并判断当前页面是否存在目标问题回答
const pageScroll = async (page, data, browser) => {
  // 控制滚动
  try {
    const index = await getItemIndex(page)
    if (index !== -1) {
      // 在这执行点击操作
      console.log(`回答在第${index}项`)
      // await page.click('.VoteButton--down');
      await page.evaluate((index) => {
        document.getElementsByClassName('VoteButton--down')[index].click();
      }, index).catch((error)=>{
        console.log(error)
      });
      await page.waitFor(8000);
      // 判断有没有验证框，有的话准备调用验证
      const text = await page.$eval('.VerificationDialogModalHeader-title', e => e.innerText).catch(( error)=>{
        console.log('无验证码', '操作成功');
      });
      if (text !== undefined) {
        // 在这做获取验证码操作
        console.log(text)
        await page.mouse.click(459, 954);
        await page.waitFor(6000);
        await page.mouse.click(483, 999);
        await page.waitFor(8000);
        await page.click('.VerificationDialogModal-smsInputButton');
        await page.waitFor(6000);
        // 在这调用邮箱的获取验证码方法
        const code = await openPage(data);
        console.log(code);
        await page.type('input[placeholder=输入6位邮箱验证码]', code, {delay: 100});
        await page.waitFor(6000);
        await page.mouse.click(495, 1146);
        await page.waitFor(6000);
        
        await page.evaluate((index) => {
          document.getElementsByClassName('VoteButton--down')[index].click();
        }, index).catch((error)=>{
          console.log(error)
        });
        console.log('操作成功');
        await page.waitFor(3000);
        browser.close();
      } else {
        browser.close();
      }
    } else {
      await page.evaluate(() => {
        document.scrollingElement.scrollTop = document.getElementsByClassName('QuestionPage')[0].clientHeight
      });
      await page.waitFor(Math.random() * 3000);
      await pageScroll (page, data, browser);
    }
  } catch (error) {
    browser.close();
  }
}
// 知乎点赞
const openBrowser = async (data) => {
  const browser = await puppeteer.launch({headless: true, args: [ `--proxy-server=${data.ipPort}` ]});
  const page = await browser.newPage();
  const newUserAgent = userAgent[parseInt(Math.random() * 21)].toString();
  try {
    await page.setUserAgent(newUserAgent);
    await page.setViewport({width: 1024, height: 2000});
    await page.setRequestInterception(true);
    await page.on('request', request => {
      if (request.resourceType() === 'image')
        request.abort();
      else
        request.continue();
    });
    await page.goto(questionInfo.url);
    await page.waitFor(10000);
    // 点击出现登陆框
    await page.click('.AppHeader-login');
    await page.waitFor(8000); 
    // 输入用户名密码
    await page.type('input[name=username]', data.userName, {delay: 100});
    await page.type('input[name=password]', data.passWord, {delay: 100});
    await page.click('.SignFlow-submitButton');
    await page.waitFor(5000); 
    
    // 模拟点赞
    await pageScroll(page, data, browser);
  } catch (error) {
    console.log(error);
    if (error.toString().indexOf('ERR_TUNNEL_CONNECTION_FAILED') === -1 && error.toString().indexOf('Timeout') === -1) {
      browser.close();
    } else {
      console.log(`\n-------- ${data.userName}结束 ---------\n`)
      console.log(`${data.userName}重新获取ip`);
      await page.waitFor(5000); 
      await getInfo(data);
    }
  }
  
};
const getInfo = async (userInfo) => {
  try {
    console.log(`-------- ${userInfo.userName}开始 ---------\n`)
    let finalInfo = userInfo;
    await getIp().then((data)=> {
      finalInfo.ipPort = data;
      console.log(`ip-port:${finalInfo.ipPort}`)
    });
    await openBrowser(finalInfo);
    console.log(`\n-------- ${userInfo.userName}结束 ---------\n`)
  } catch (error) {
    console.log('getIp出错')
    console.log(`\n-------- ${userInfo.userName}结束 ---------\n`)
  }
}
(async () => {
  for (let i = 0;i< userInfo.length; i++) {
    await getInfo(userInfo[i])
  }
})();
