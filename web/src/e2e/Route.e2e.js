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
  inputRoutename: '#name',
  inputRoutepath: '#uris_0',
  inputNodehost: '#nodes_0_host',
  inputNodeport: '#nodes_0_port',
  inputNodeweight: '#nodes_0_weight',
  routeList: '.ant-layout-sider-children ul li:nth-child(2)',
  buttonCreateroute: '.ant-pro-table-toolbar-option button',
  buttonNext: '.ant-row-end .ant-col:nth-child(2)',
  successIco: '.ant-result-success .anticon-check-circle',
  buttonReturnRoutelist: '.ant-result-extra .ant-btn-primary'
};

describe('Route test', () => {

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      slowMo: 100
    });
  });

  test('create route', async () => {
    const page = await browser.newPage();
    await setupLogin(page);
    // access route list page
    await page.waitForSelector(domSelectors.routeList)
    await page.click(domSelectors.routeList)
    await page.content();
    // create route
    await page.waitForSelector(domSelectors.buttonCreateroute)
    await page.click(domSelectors.buttonCreateroute)
    await page.content();
    // input the route detail
    await page.waitForSelector(domSelectors.inputRoutename);
    await page.type(domSelectors.inputRoutename, "test_route_by_ui_autotest");
    await page.focus(domSelectors.inputRoutepath);
    await page.keyboard.press( 'Backspace' );
    await page.keyboard.press( 'Backspace' );
    await page.type(domSelectors.inputRoutepath, "/testpath_by_ui_autotest");
    await page.click(domSelectors.buttonNext);
    // input the upstream detail and finish steps
    await page.waitForSelector(domSelectors.inputNodehost);
    await page.type(domSelectors.inputNodehost, "127.0.0.1");
    await page.type(domSelectors.inputNodeport, "1980");
    await page.type(domSelectors.inputNodeweight, "2");
    await page.click(domSelectors.buttonNext);
    await page.click(domSelectors.buttonNext);
    await page.click(domSelectors.buttonNext);
    // verify route if create success
    await page.waitForSelector(domSelectors.successIco);
    await page.waitForSelector(domSelectors.buttonReturnRoutelist);
    await page.click(domSelectors.buttonReturnRoutelist)
    await page.content();
    await page.waitForSelector(domSelectors.buttonCreateroute)
    // todo: delete the route just created

    await page.close();
  }, 160000);

  afterAll(async () => {
    await browser.close();
  });
});
