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
  const data = {
    validUris: [
      'localhost:9000/get',
      '127.0.0.1:9000/get',
      'www.baidu.com/get',
      'baidu.com/get',
      'test-host.com/get',
      'test-host.com/aBCdsf/defsdf456eweWQE',
      'localhost:9000/deps-get',
      'localhost:9000/deps.get',
      'localhost:9000/deps_get',
      'localhost:9000/get?search=1',
      'localhost:9000/get?search=v1,sd&number=-1',
      'localhost:9000/get?search=1+1',
      'localhost:9000/api/commands/submit.html#Requirements?test=apisix.com',
      'localhost:9000/js6/main.jsp?sid=pARQZYHABxkSVdeMvXAAEtfJKbWQocOA&df=mail126_mailmaster#module=mbox.ListModule%7C%7B',
    ],
    invalidUrls: [
      '000'
    ],
  };

  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
  });

  it('shoule not show the invalid url notification', function () {
    cy.visit('/');
    cy.contains(menuLocaleUS['menu.routes']).click();

    // show online debug draw
    cy.contains(routeLocaleUS['page.route.onlineDebug']).click();

    // input uri with specified special characters
    data.validUris.forEach((uri) => {
      cy.get(this.domSelector.debugUri).clear();
      cy.get(this.domSelector.debugUri).type(uri);
      cy.contains(routeLocaleUS['page.route.button.send']).click({ force: true });

      // should not show the notification about input the valid request url
      cy.contains(routeLocaleUS['page.route.input.placeholder.requestUrl']).should('not.exist');
    });
  });

  it('shoule not show the invalid url notification', function () {
    cy.visit('/');
    cy.contains(menuLocaleUS['menu.routes']).click();

    // show online debug draw
    cy.contains(routeLocaleUS['page.route.onlineDebug']).click();

    // click send without type debugUrl
    cy.contains(routeLocaleUS['page.route.button.send']).click({ force: true });
    cy.contains(routeLocaleUS['page.route.input.placeholder.requestUrl']).should('exist');
    cy.get(this.domSelector.notificationCloseIcon).click();

    // input invalid uris
    data.invalidUrls.forEach((uri) => {
      cy.get(this.domSelector.debugUri).clear();
      cy.get(this.domSelector.debugUri).type(uri);
      cy.contains(routeLocaleUS['page.route.button.send']).click({ force: true });

      // should not show the notification about input the valid request url
      cy.contains(routeLocaleUS['page.route.input.placeholder.requestUrl']).should('exist');
      cy.get(this.domSelector.notificationCloseIcon).click();
    });
  });
});
