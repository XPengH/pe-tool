// 单个刷赞逻辑
export const openBrowser = async (data) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const newUserAgent = userAgent[parseInt(Math.random() * 22)].toString();
  await page.setUserAgent(newUserAgent);
  await page.setViewport({width: 1024, height: 2000});
  await page.goto('https://www.zhihu.com/question/29925879');
  await page.waitFor(Math.random() * 3000);
  // 点击出现登陆框
  await page.click('.AppHeader-login').catch((error)=>{
    page.screenshot({path: 'img/error-show-login' + data.userName + '.png'});
    page.waitFor(Math.random() * 3000);
    browser.close()
  });
  await page.waitFor(Math.random() * 4000); 
  // 输入用户名密码
  await page.type('input[name=username]', data.userName, {delay: 1000}).catch(()=>{
    page.screenshot({path: 'img/error-input-username' + data.userName + '.png'});
    page.waitFor(Math.random() * 3000);
    browser.close()
  });
  await page.type('input[name=password]', data.passWord, {delay: 1000}).catch(()=>{
    page.screenshot({path: 'img/error-input-password' + data.userName + '.png'});
    page.waitFor(Math.random() * 3000);
    browser.close()
  });
  await page.click('.SignFlow-submitButton').catch(()=>{
    page.screenshot({path: 'img/error-login' + data.userName + '.png'});
    page.waitFor(Math.random() * 3000);
    browser.close()
  });
  await page.waitFor(Math.random() * 5000); 
  // 模拟点赞
  // 点击查看全部回答
  await page.click('.QuestionMainAction').catch((error)=>{
    // 直接滚动
    // 注入js移动到页面底部，然后查回答id是否匹配 data-zop 里的itemId，如果匹配不到就继续滚动到底部
    // 点击赞或者踩后，可能会弹出验证框 VerificationDialogModalHeader ，点击Zi--Select弹出选择邮箱验证， Select-option第二项点击，
    // 点击VerificationDialogModal-smsInputButton发送验证码
    // 登陆邮箱
    // 点击到最新的邮件位置
    // 点进去，获取邮箱验证码，，然后将验证码返回
    // 输入验证码
    // 点击验证，Button VerificationDialogModal-button
    // 然后点击赞或者踩
    // 判断赞或者踩的按钮状态，如果已经赞过或者踩过，就不要点击，如果没有就点击
  });
  await page.screenshot({path: 'img/' + data.userName + '.png'});
 
  await browser.close();
};