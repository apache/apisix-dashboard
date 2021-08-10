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

context('Create and delete route with api-breaker form', () => {
  const selector = {
    empty: '.ant-empty-normal',
    name: '#name',
    description: '#desc',
    pluginCardBordered: '.ant-card-bordered',
    disabledSwitcher: '#disable',
    checkedSwitcher: '.ant-switch-checked',
    drawer: '.ant-drawer-content',
    nodes_0_host: '#nodes_0_host',
    nodes_0_port: '#nodes_0_port',
    nodes_0_weight: '#nodes_0_weight',
    break_response_code: '#break_response_code',
    alert: '.ant-form-item-explain-error [role=alert]',
    deleteAlert: '.ant-modal-body',
    notificationCloseIcon: '.ant-notification-close-icon',
    notification: '.ant-notification-notice-message',
  };

  const data = {
    deleteRouteSuccess: 'Delete Route Successfully',
    submitSuccess: 'Submit Successfully',
    port: '80',
    weight: 1,
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create route with api-breaker form', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.get(selector.empty).should('be.visible');
    cy.contains('Create').click();
    cy.contains('Next').click().click();
    cy.get(selector.name).type('routeName');
    cy.get(selector.description).type('desc');
    cy.contains('Next').click();

    cy.get(selector.nodes_0_host).type('127.0.0.1');
    cy.get(selector.nodes_0_port).clear().type(data.port);
    cy.get(selector.nodes_0_weight).clear().type(data.weight);
    cy.contains('Next').click();

    // config api-breaker plugin
    cy.contains('api-breaker')
      .parents(selector.pluginCardBordered)
      .within(() => {
        cy.get('button').click({
          force: true,
        });
      });

    cy.get(selector.drawer)
      .should('be.visible')
      .within(() => {
        cy.get(selector.disabledSwitcher).click();
        cy.get(selector.checkedSwitcher).should('exist');
      });

    // config api-breaker form without break_response_code
    cy.get(selector.break_response_code).click();
    cy.get(selector.alert).contains('Please Enter break_response_code');
    cy.get(selector.drawer).within(() => {
      cy.contains('Submit').click({
        force: true,
      });
    });
    cy.get(selector.notification).should('contain', 'Invalid plugin data');
    cy.get(selector.notificationCloseIcon).click();

    // config api-breaker form with break_response_code
    cy.get(selector.break_response_code).type('200');
    cy.get(selector.alert).should('not.exist');
    cy.get(selector.disabledSwitcher).click();
    cy.get(selector.drawer).within(() => {
      cy.contains('Submit').click({
        force: true,
      });
    });
    cy.get(selector.drawer).should('not.exist');

    cy.contains('button', 'Next').click();
    cy.contains('button', 'Submit').click();
    cy.contains(data.submitSuccess);

    // back to route list page
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('should delete the route', function () {
    cy.visit('/routes/list');

    cy.get(selector.name).clear().type('routeName');
    cy.contains('Search').click();
    cy.contains('routeName').siblings().contains('More').click();
    cy.contains('Delete').click();
    cy.get(selector.deleteAlert)
      .should('be.visible')
      .within(() => {
        cy.contains('OK').click();
      });
    cy.get(selector.notification).should('contain', data.deleteRouteSuccess);
    cy.get(selector.notificationCloseIcon).click();
  });
});
