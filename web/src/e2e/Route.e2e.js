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
  input_routename: '#name',
  input_routepath: '#uris_0',
  input_node_host: '#nodes_0_host',
  input_node_port: '#nodes_0_port',
  input_node_weight: '#nodes_0_weight',
  route_list: '.ant-layout-sider-children ul li:nth-child(2)',
  button_createroute: '.ant-pro-table-toolbar-option button',
  button_next: '.ant-row-end .ant-col:nth-child(2)',
  success_ico: '.ant-result-success .anticon-check-circle',
  button_return_routelist: '.ant-result-extra .ant-btn-primary'
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
    await page.waitForSelector(domSelectors.route_list)
    await page.click(domSelectors.route_list)
    await page.content();
    // create route
    await page.waitForSelector(domSelectors.button_createroute)
    await page.click(domSelectors.button_createroute)
    await page.content();

    await page.waitForSelector(domSelectors.input_routename);
    await page.type(domSelectors.input_routename, "test_route_by_ui_autotest");
    await page.focus(domSelectors.input_routepath);
    await page.keyboard.press( 'Backspace' );
    await page.keyboard.press( 'Backspace' );
    await page.type(domSelectors.input_routepath, "/testpath_by_ui_autotest");
    await page.click(domSelectors.button_next);

    await page.waitForSelector(domSelectors.input_node_host);
    await page.type(domSelectors.input_node_host, "127.0.0.1");
    await page.type(domSelectors.input_node_port, "1980");
    await page.type(domSelectors.input_node_weight, "2");
    await page.click(domSelectors.button_next);
    await page.click(domSelectors.button_next);
    await page.click(domSelectors.button_next);
    // verify route if create success
    await page.waitForSelector(domSelectors.success_ico);
    await page.waitForSelector(domSelectors.button_return_routelist);
    // todo: delete the route just created

    await page.close();
  }, 70000);

  afterAll(async () => {
    await browser.close();
  });
});
