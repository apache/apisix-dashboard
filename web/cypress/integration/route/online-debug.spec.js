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
import menuLocaleUS from '../../../src/locales/en-US/menu';
import routeLocaleUS from '../../../src/pages/Route/locales/en-US';
import defaultSettings from '../../../config/defaultSettings';

context('Online debug', () => {
  const urisWithSpecialChars = [
    '/get',
    '/deps-get',
    '/deps.get',
    '/deps_get',
    '/get?search=1',
    '/get?search=%U%E',
    '/get?search=v1&number=-1',
    '/get?search=1+1',
  ];
  const domSelector = {
    uriInput: '#debugUri',
  };
  const { SERVE_ENV = 'dev' } = Cypress.env();

  beforeEach(() => {
    // init login
    cy.login();
  });

  it('shoule not show notification when debug a non existent route with specified special characters', () => {
    // go to route list page
    cy.visit('/');
    cy.contains(menuLocaleUS['menu.routes']).click();

    // show online debug draw
    cy.contains(routeLocaleUS['page.route.onlineDebug']).click();

    // input uri with specified special characters
    urisWithSpecialChars.forEach((uri) => {
      cy.get(domSelector.uriInput).clear();
      cy.get(domSelector.uriInput).type(`${defaultSettings.serveUrlMap[SERVE_ENV].split('//').pop()}${uri}`);
      cy.contains(routeLocaleUS['page.route.button.send']).click();
      // should not show the notification
      cy.contains(routeLocaleUS['page.route.input.placeholder.requestUrl']).should('not.exist');
    });
  });
});
