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
beforeAll(async () => {
  browser = await puppeteer.launch({ headless: false });
});

describe('Login', () => {
  test('Login failed', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:8000');
    await page.type('#control-ref_username', 'admin');
    await page.type('#control-ref_password', 'wrong_password');
    await page.click('.ant-btn-lg');
    await page.waitForSelector('.ant-notification-notice-icon-error');
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
