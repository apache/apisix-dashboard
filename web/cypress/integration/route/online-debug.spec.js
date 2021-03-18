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
  const { SERVE_ENV = 'dev' } = Cypress.env();
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
    postUrl: `${defaultSettings.serveUrlMap[SERVE_ENV].split('//')[1]}/apisix/admin/import/routes`,
    uploadFile: '../../../api/test/testdata/import/default.json',
    headerAuthorizationKey: 'Authorization',
    routeName: 'hello',
  };

  const domSelector = {
    debugDraw: '[data-cy=debug-draw]',
    deubugMethod: '[data-cy=debug-method]',
    debugProtocol: '[data-cy=debug-protocol]',
    debugFormDataKey0: '#dynamic_form_data_item_params_0_key',
    debugFormDataType0: '[data-cy=debug-formdata-type-0]',
    debugFormDataValue0: '#dynamic_form_data_item_params_0_value',
    debugFormDataFileButton0: '[data-cy=debug-upload-btn-0]',
    codeMirrorCode: '.CodeMirror-code',
    headerDataKey0: '#headerForm_params_0_key',
    headerDataValue0: '#headerForm_params_0_value',
  }

  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
    cy.intercept('/apisix/admin/debug-request-forwarding').as('DebugAPI');
  });

  it('should not show the invalid url notification', function () {
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

  it('should show the invalid url notification', function () {
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

  it('should debug POST request with file successfully', function() {
    cy.visit('/');
    cy.contains(menuLocaleUS['menu.routes']).click();
    const currentToken = localStorage.getItem('token');

    // show online debug draw
    cy.contains(routeLocaleUS['page.route.onlineDebug']).click();
    cy.get(domSelector.debugDraw).should('be.visible');

    // change request method POST
    cy.get(domSelector.deubugMethod).click();
    cy.contains('POST').click();

    // change request protocol http
    cy.get(domSelector.debugProtocol).click();
    cy.contains('http://').click();
    // set debug uri
    cy.get(this.domSelector.debugUri).type(data.postUrl);
    // set request body
    cy.contains('Body Params').should('be.visible').click();

    cy.contains('form-data').should('be.visible').click();
    cy.get(domSelector.debugFormDataKey0).type('file');

    // check change type
    cy.get(domSelector.debugFormDataType0).click();
    cy.contains('Text').click();
    // assert: text input dom should be visible
    cy.get(domSelector.debugFormDataValue0).should('be.visible');
    cy.get(domSelector.debugFormDataType0).click();
    cy.contains('File').click();
    // assert: upload file button should be visible
    cy.get(domSelector.debugFormDataFileButton0).should('be.visible');
    // attach file
    cy.get(domSelector.debugFormDataValue0).attachFile(data.uploadFile);

    // set header Authorization
    cy.contains('Header Params').should('be.visible').click();
    cy.get(domSelector.headerDataKey0).type(data.headerAuthorizationKey);
    cy.get(domSelector.headerDataValue0).type(currentToken);

    cy.contains(routeLocaleUS['page.route.button.send']).click();

    cy.wait('@DebugAPI');
    // assert: send request return
    cy.get(domSelector.codeMirrorCode).within(() => {
      cy.contains('data').should('be.visible');
      cy.contains('routes').should('be.visible');
    });

    // close debug drawer
    cy.get(this.domSelector.drawerClose).click();

    // refresh table and delete the route just created
    cy.get(this.domSelector.refresh).click();
    cy.contains(data.routeName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should('contain', this.data.deleteRouteSuccess);
  })
});
