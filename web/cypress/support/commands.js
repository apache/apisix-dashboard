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
/* eslint-disable no-undef */
import defaultSettings from '../../config/defaultSettings';

Cypress.Commands.add('login', () => {
  const { SERVE_ENV = 'dev' } = Cypress.env();

  cy.request('POST', `${defaultSettings.serveUrlMap[SERVE_ENV]}/apisix/admin/user/login`, {
    username: 'user',
    password: 'user',
  }).then((res) => {
    expect(res.body.code).to.equal(0);
    localStorage.setItem('token', res.body.data.token);
    // set default language
    localStorage.setItem('umi_locale', 'en-US');
  });
});
