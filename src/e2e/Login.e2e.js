/* eslint-disable import/no-extraneous-dependencies */
const puppeteer = require('puppeteer');

describe('Login', () => {
  it('should login with failure', async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('http://localhost:8000');
    await page.type('#control-ref_username', 'admin');
    await page.type('#control-ref_password', 'wrong_password');
    await page.click('.ant-btn-lg');
    await page.waitForSelector('.ant-notification-notice-icon-error'); // should display error
    await page.close();
    browser.close();
  });

  it('should login with succcess', async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('http://localhost:8000');
    await page.type('#control-ref_username', 'admin');
    await page.type('#control-ref_password', 'admin');
    await page.click('.ant-btn-lg');
    await page.waitForSelector('.ant-notification-notice-icon-success');
    await page.close();
    browser.close();
  });
});
