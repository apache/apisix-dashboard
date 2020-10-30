/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable import/no-extraneous-dependencies */
const puppeteer = require('puppeteer');

let browser;
const BASE_URL = `http://localhost:${process.env.PORT || 8000}`;
const domSelectors = {
  inputUserName: '#control-ref_username',
  inputPassWord: '#control-ref_password',
  buttonLogin: '.ant-btn-lg',
  notificationNotice: '.ant-notification-notice',
  notificationLogin: '.ant-notification-notice-description',
};
const loginFailedDatas = {
  userName: 'admin',
  passWord: '123456',
};
const loginSuccessDatas = {
  userName: 'admin',
  passWord: 'admin',
};

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: true,
  });
});

describe('Login', () => {
  test('Login failed with wrong password', async () => {
    const page = await browser.newPage();
    await page.goto(BASE_URL);
    await page.type(domSelectors.inputUserName, loginFailedDatas.userName);
    await page.type(domSelectors.inputPassWord, loginFailedDatas.passWord);
    await page.click(domSelectors.buttonLogin);
    await page.waitForSelector(domSelectors.notificationNotice);
    const element = await page.$(domSelectors.notificationLogin);
    const text = await (await element.getProperty('textContent')).jsonValue();
    expect(text).toBe('username or password error');
    await page.close();
  }, 10000);

  test('Login success', async () => {
    const page = await browser.newPage();
    await page.goto(BASE_URL);
    await page.type(domSelectors.inputUserName, loginSuccessDatas.userName);
    await page.type(domSelectors.inputPassWord, loginSuccessDatas.passWord);
    await page.click(domSelectors.buttonLogin);
    await page.waitForSelector(domSelectors.notificationNotice);
    const element = await page.$(domSelectors.notificationLogin);
    const text = await (await element.getProperty('textContent')).jsonValue();
    expect(text).toBe('Login Success');
    await page.close();
  }, 10000);

  afterAll(async () => {
    await browser.close();
  });
});
