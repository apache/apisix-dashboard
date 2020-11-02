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

export const BASE_URL = `http://localhost:${process.env.PORT || 8000}`;

const loginSuccessData = {
  username: 'admin',
  password: 'admin',
};

const domSelectors = {
  inputUsername: '#control-ref_username',
  inputPassword: '#control-ref_password',
  buttonLogin: '.ant-btn-lg',
  loginSuccessIcon: '.ant-notification-notice-icon-success',
};

export const setupLogin = async (page) => {
  await page.goto(BASE_URL);
  await page.type(domSelectors.inputUsername, loginSuccessData.username);
  await page.type(domSelectors.inputPassword, loginSuccessData.password);
  await page.click(domSelectors.buttonLogin);
  await page.waitForSelector(domSelectors.loginSuccessIcon);
  await page.waitForNavigation();
}
