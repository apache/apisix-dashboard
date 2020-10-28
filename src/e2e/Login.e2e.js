/* eslint-disable import/no-extraneous-dependencies */
const puppeteer = require('puppeteer');

let browser;
beforeAll(async () => {
  browser = await puppeteer.launch({ headless: false });
});

describe('Login', () => {
  test('Login fail', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:8000');
    await page.type('#control-ref_username', 'admin');
    await page.type('#control-ref_password', 'wrong_password');
    await page.click('.ant-btn-lg');
    await page.waitForSelector('.ant-notification-notice-icon-error'); // should display error
    const element = await page.$('.ant-notification-notice-description');
    const text = await (await element.getProperty('textContent')).jsonValue();
    expect(text).toBe('username or password error');
    await page.close();
  }, 10000);

  test('Login success', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:8000');
    await page.type('#control-ref_username', 'admin');
    await page.type('#control-ref_password', 'admin');
    await page.click('.ant-btn-lg');
    await page.waitForSelector('.ant-notification-notice-icon-success');
    const element = await page.$('.ant-notification-notice-description');
    const text = await (await element.getProperty('textContent')).jsonValue();
    expect(text).toBe('Login Success');
    await page.close();
  }, 10000);

  afterAll(async () => {
    await browser.close();
  });
});
