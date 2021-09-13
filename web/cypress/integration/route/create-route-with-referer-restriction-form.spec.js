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

context('Create and delete route with referer-restriction form', () => {
  const selector = {
    empty: '.ant-empty-normal',
    name: '#name',
    description: '#desc',
    pluginCardBordered: '.ant-card-bordered',
    nodes_0_host: '#submitNodes_0_host',
    nodes_0_port: '#submitNodes_0_port',
    nodes_0_weight: '#submitNodes_0_weight',
    disabledSwitcher: '#disable',
    checkedSwitcher: '.ant-switch-checked',
    drawer: '.ant-drawer-content',
    notification: '.ant-notification-notice-message',
    notificationCloseIcon: '.ant-notification-close-icon',
    deleteAlert: '.ant-modal-body',
    whitlist: '#whitelist_0',
    alert: '.ant-form-item-explain-error [role=alert]',
  };

  const data = {
    ip1: '127.0.0.1',
    port: '80',
    weight: 1,
    deleteRouteSuccess: 'Delete Route Successfully',
    submitSuccess: 'Submit Successfully',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create route with referer-restriction form', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.get(selector.empty).should('be.visible');
    cy.contains('Create').click();
    cy.contains('Next').click().click();
    cy.get(selector.name).type('routeName');
    cy.get(selector.description).type('desc');
    cy.contains('Next').click();

    cy.get(selector.nodes_0_host).type(data.ip1);
    cy.get(selector.nodes_0_port).clear().type(data.port);
    cy.get(selector.nodes_0_weight).clear().type(data.weight);
    cy.contains('Next').click();

    // config referer-restriction plugin
    cy.contains('referer-restriction')
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

    // config referer-restriction form without whitelist
    cy.get(selector.whitlist).click();
    cy.get(selector.alert).contains('Please Enter whitelist');
    cy.get(selector.drawer).within(() => {
      cy.contains('Submit').click({
        force: true,
      });
    });
    cy.get(selector.notification).should('contain', 'Invalid plugin data');
    cy.get(selector.notificationCloseIcon).click();

    // config referer-restriction form with whitelist
    cy.get(selector.whitlist).type('127.0.0.1');
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
