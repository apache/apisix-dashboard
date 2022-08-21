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

context('Create Edit and Delete Route with redirect plugin', () => {
  const name = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDay()}`;
  const newName = `${new Date().getFullYear()}*${new Date().getMonth() + 1}*${new Date().getDay()}`;

  const selector = {
    empty: '.ant-empty-normal',
    name: '#name',
    redirect: '[data-cy=route-redirect]',
    customRedirectSelectOpt: '#redirectOption_list_1',
    regex: '#regex',
    customRedirectCode: '[data-cy=redirect_code]',
    customRedirectRegexLabel: "[title='Regexp']",
    regexp: '#regex_uri_0',
    template: '#regex_uri_1',
    deleteAlert: '.ant-modal-body',
    notificationCloseIcon: '.ant-notification-close-icon',
    notification: '.ant-notification-notice-message',
    webSocketSelector: '[title=WebSocket]',
    enable_websocket_button: '#enable_websocket',
  };

  const data = {
    customRedirectRegexUri: '^/iresty/(.)/(.)/(.*)',
    customRedirectTemplate: '/$1-$2-$3',
    submitSuccess: 'Submit Successfully',
    deleteRouteSuccess: 'Delete Route Successfully',
    step2Title: 'Define API Backend Server',
    step3Title: 'Plugin Config',
    setUpstreamNotice: 'If you do not bind the service, you must set the Upstream (Step 2)',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create route with custom redirect plugin', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.contains('Create').click();
    cy.contains('Next').click().click();
    cy.get(selector.name).type(name);
    cy.get(selector.redirect).click();
    cy.contains('Custom').click({ force: true });
    cy.get(selector.regex).click();

    // after choose Custom option, Custom Redirect form field should be visible
    cy.get(selector.customRedirectRegexLabel).should('be.visible');
    cy.get(selector.regexp).should('be.visible');
    cy.get(selector.template).should('be.visible');
    cy.get(selector.customRedirectCode).should('be.visible');
    cy.get(selector.webSocketSelector).should('exist');
    cy.get(selector.enable_websocket_button).should('exist');

    // step 2 and step 3 should not be visible
    cy.contains(data.step2Title).should('not.exist');
    cy.contains(data.step3Title).should('not.exist');
    // type customRedirectRegexUri and customRedirectTemplate
    cy.get(selector.regexp).type(data.customRedirectRegexUri);
    cy.get(selector.template).type(data.customRedirectTemplate);
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(data.submitSuccess);

    // back to route list page
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('should edit the route without notice', function () {
    cy.visit('/');
    cy.contains('Route').click();

    cy.get(selector.name).type(name);
    cy.contains('Search').click();
    cy.contains(name).siblings().contains('Configure').click();

    // NOTE: make sure all components rerender done
    cy.get('#status').should('have.class', 'ant-switch-checked');
    // should not shown set upstream notice
    cy.contains(data.setUpstreamNotice).should('not.exist');
    cy.get(selector.name).clear().type(newName);
    cy.get(selector.webSocketSelector).should('exist');
    cy.get(selector.enable_websocket_button).should('exist');

    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(data.submitSuccess);
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('should delete the route', function () {
    cy.visit('/routes/list');
    cy.get(selector.name).clear().type(newName);
    cy.contains('Search').click();
    cy.contains(newName).siblings().contains('More').click();
    cy.contains('Delete').click();
    cy.get(selector.deleteAlert)
      .should('be.visible')
      .within(() => {
        cy.contains('OK').click();
      });
    cy.get(selector.notification).should('contain', data.deleteRouteSuccess);
    cy.get(selector.notificationCloseIcon).click({ multiple: true });
  });
});
