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
    uris: [
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
      'localhost:9000/js6/main.jsp?sid=pARQZYHABxkSVdeMvXAAEtfJKbWQocOA&df=mail126_mailmaster#module=mbox.ListModule%7C%7B"filter"'
    ]
  };
  const domSelector = {
    uriInput: '#debugUri',
  };

  beforeEach(() => {
    // init login
    cy.login();
  });

  it('shoule not show the invalid url notification', () => {
    // go to route list page
    cy.visit('/');
    cy.contains(menuLocaleUS['menu.routes']).click();

    // show online debug draw
    cy.contains(routeLocaleUS['page.route.onlineDebug']).click();

    // input uri with specified special characters
    data.uris.forEach((uri) => {
      cy.get(domSelector.uriInput).clear();
      cy.get(domSelector.uriInput).type(uri);
      cy.contains(routeLocaleUS['page.route.button.send']).click();

      // should not show the notification about input the valid request url
      cy.contains(routeLocaleUS['page.route.input.placeholder.requestUrl']).should('not.exist');
    });
  });
});
