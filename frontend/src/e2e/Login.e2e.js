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

const {
  setupLogin,
  BASE_URL
} = require('./service')

let browser;
const domSelectors = {
  inputUsername: '#control-ref_username',
  inputPassword: '#control-ref_password',
  buttonLogin: '.ant-btn-lg',
  loginFailedIcon: '.ant-notification-notice-icon-error',
};
const loginFailedData = {
  username: 'admin',
  password: '123456',
};

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: true,
    slowMo: 100
  });
});

describe('Login', () => {
  test('Login failed with wrong password', async () => {
    const page = await browser.newPage();
    await page.goto(BASE_URL);
    await page.type(domSelectors.inputUsername, loginFailedData.username);
    await page.type(domSelectors.inputPassword, loginFailedData.password);
    await page.click(domSelectors.buttonLogin);
    await page.waitForSelector(domSelectors.loginFailedIcon);
    await page.close();
  }, 10000);

  test('Login failed with empty username password', async () => {
    const page = await browser.newPage();
    await page.goto(BASE_URL);
    await page.type(domSelectors.inputUsername, '');
    await page.type(domSelectors.inputPassword, '');
    await page.click(domSelectors.buttonLogin);
    await page.waitForSelector('.ant-form-item-explain');
    await page.close();
  }, 10000);

  test('Login success', async () => {
    const page = await browser.newPage();
    await setupLogin(page);
    await page.close();
  }, 10000);

  afterAll(async () => {
    await browser.close();
  });
});
