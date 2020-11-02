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
  setupLogin
} = require('./service')

let browser;
const domSelectors = {
  userProfile: '.ant-space-horizontal div:nth-child(2)',
  dropdownMenuItem: '.ant-dropdown-menu-item',
  buttonLogin: ".ant-btn-lg",
  logoutButton: '.ant-dropdown > ul > li:nth-child(3)',
};

describe('Logout', () => {

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      slowMo: 100
    });
  });

  test('Logout', async () => {
    const page = await browser.newPage();
    await setupLogin(page);
    await page.click(domSelectors.userProfile);
    await page.waitForSelector(domSelectors.dropdownMenuItem);
    await page.waitForSelector(domSelectors.logoutButton);
    await page.click(domSelectors.logoutButton);
    await page.waitForSelector(domSelectors.buttonLogin);
    await page.close();
  }, 50000);

  afterAll(async () => {
    await browser.close();
  });
});
