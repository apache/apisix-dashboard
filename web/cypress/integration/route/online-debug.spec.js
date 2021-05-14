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
    invalidPaths: ['/*','get'],
    postFileUrl: `${defaultSettings.serveUrlMap[SERVE_ENV].split('//')[1]}/apisix/admin/import/routes`,
    routeOptUrl: `${defaultSettings.serveUrlMap[SERVE_ENV].split('//')[1]}/apisix/admin/routes`,
    uploadFile: '../../../api/test/testdata/import/default.json',
    headerAuthorizationKey: 'Authorization',
    routeName: 'hello',
    queryKey0: 'name',
  };

  const domSelector = {
    debugDraw: '[data-cy=debug-draw]',
    deubugMethod: '[data-cy=debug-method]',
    debugProtocol: '[data-cy=debug-protocol]',
    debugPath:'[data-cy=debug-path]',
    debugFormDataKey0: '#dynamic_form_data_item_params_0_key',
    debugFormDataType0: '[data-cy=debug-formdata-type-0]',
    debugFormDataValue0: '#dynamic_form_data_item_params_0_value',
    debugFormDataFileButton0: '[data-cy=debug-upload-btn-0]',
    codeMirrorResp: '#codeMirror-response',
    headerDataKey0: '#headerForm_params_0_key',
    headerDataValue0: '#headerForm_params_0_value',
    queryDataKey0: '#queryForm_params_0_key',
    queryDataValue0: '#queryForm_params_0_value',
    queryTab: '#rc-tabs-0-tab-query',
    authTab: '#rc-tabs-0-tab-auth',
    headerTab: '#rc-tabs-0-tab-header',
    bodyTab: '#rc-tabs-0-tab-body',
    jwtAuth: '[data-cy=jwt-auth]',
    jwtTokenInput: '#authForm_Authorization',
  };

  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
    cy.fixture('route-json-data.json').as('routeData');
    cy.intercept('/apisix/admin/debug-request-forwarding').as('DebugAPI');
  });

  it('should show the invalid path notification', function () {
    cy.visit('/');
    cy.contains(menuLocaleUS['menu.routes']).click();

    // show online debug draw
    cy.get(this.domSelector.refresh).click();
    cy.contains('Advanced').click();
    cy.contains(routeLocaleUS['page.route.onlineDebug']).click();
    cy.get(domSelector.debugDraw).should('be.visible');

    // click send without type debugUrl
    cy.contains(routeLocaleUS['page.route.button.send']).click({ force: true });
    cy.contains(routeLocaleUS['page.route.debug.path.rules.required.description']).should('exist');
    cy.get(this.domSelector.notificationCloseIcon).click({ multiple: true });

    // input invalid uris
    data.invalidPaths.forEach((path) => {
      cy.get(domSelector.debugPath).clear();
      cy.get(domSelector.debugPath).type(path);
      cy.contains(routeLocaleUS['page.route.button.send']).click({ force: true });

      // should not show the notification about input the valid request url
      cy.contains(routeLocaleUS['page.route.debug.path.rules.required.description']).should('exist');
      cy.get(this.domSelector.notificationCloseIcon).click({ multiple: true });
    });
  });

  it('should not show body params tab when choose GET and HEAD method', function () {
    cy.visit('/');
    cy.contains(menuLocaleUS['menu.routes']).click();

    // show online debug draw
    cy.get(this.domSelector.refresh).click();
    cy.contains('Advanced').click();
    cy.contains(routeLocaleUS['page.route.onlineDebug']).click();
    cy.get(domSelector.debugDraw).should('be.visible');
    cy.get(domSelector.deubugMethod).contains('GET');
    cy.get(domSelector.bodyTab).should('not.exist');

    cy.get(domSelector.deubugMethod).click();
    cy.get('[title=HEAD]').click();
    cy.get(domSelector.bodyTab).should('not.exist');

    cy.get(domSelector.deubugMethod).click();
    cy.get('[title=POST]').click();
    cy.get(domSelector.bodyTab).should('be.visible');
  });

  it('should autocomplete header', function () {
    cy.visit('/');
    cy.contains(menuLocaleUS['menu.routes']).click();
    const currentToken = localStorage.getItem('token');

    // show online debug draw
    cy.get(this.domSelector.refresh).click();
    cy.contains('Advanced').click();
    cy.contains(routeLocaleUS['page.route.onlineDebug']).click();
    cy.get(domSelector.debugDraw).should('be.visible');
    cy.get(domSelector.headerTab).should('be.visible').click();

    // show autocomplete
    cy.get(domSelector.headerDataKey0).click({ force: true });
    cy.get('.ant-select-item-option-content').contains('Accept').click();
    cy.get('.anticon-minus-circle').click()

    // autocomplete should ingore case
    cy.get(domSelector.headerDataKey0).type('auth').click({ force: true });
    cy.get('.ant-select-item-option-content').contains('Authorization').click();
    cy.get(domSelector.headerDataValue0).type(currentToken);
  });
});
