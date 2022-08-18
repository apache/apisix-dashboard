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

context('Create and Batch Deletion Routes', () => {
  const timeout = 5000;

  const selector = {
    name: '#name',
    description: '#desc',
    hosts_0: '#hosts_0',
    uris_0: '#uris_0',
    labels_0_labelKey: '#labels_0_labelKey',
    labels_0_labelValue: '#labels_0_labelValue',
    nodes_0_host: '#submitNodes_0_host',
    nodes_0_port: '#submitNodes_0_port',
    nodes_0_weight: '#submitNodes_0_weight',
    nameSearchInput: '#name',
    pathSearchInput: '#uri',
    drawerBody: '.ant-drawer-wrapper-body',
    notification: '.ant-notification-notice-message',
    notificationClose: '.anticon-close',
  };

  const data = {
    host1: '11.11.11.11',
    host2: '12.12.12.12',
    port: '80',
    weight: 1,
    submitSuccess: 'Submit Successfully',
    deleteRouteSuccess: 'Delete Route Successfully',
    value0: 'value0',
    label0_value0: 'label0:value0',
  };

  before(() => {
    cy.clearLocalStorageSnapshot();
    cy.login();
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
    cy.visit('/');
  });

  it('should successfully create 3 routes', function () {
    cy.get('#root > div > section > aside > div ul', { timeout }).contains('Route').click();

    for (let i = 0; i < 3; i += 1) {
      cy.wait(timeout);
      cy.get('.ant-pro-table-list-toolbar-right').contains('Create').click();
      cy.get('.ant-row').contains('Next').click().click();
      cy.get(selector.name).type(`test${i}`);
      cy.get(selector.description).type(`desc${i}`);
      cy.get(selector.hosts_0).type(data.host1);
      cy.get(selector.uris_0).clear().type(`/get${i}`);

      // config label
      cy.contains('Manage').click();

      cy.get(selector.drawerBody).within(($drawer) => {
        cy.wrap($drawer)
          .contains('button', 'Add')
          .should('not.be.disabled')
          .click()
          .then(() => {
            cy.get(selector.labels_0_labelKey).type(`label${i}`);
            cy.get(selector.labels_0_labelValue).type(`value${i}`);
            cy.contains('Confirm').click();
          });
      });

      cy.contains('button', 'Next').should('not.be.disabled').click();
      cy.get(selector.nodes_0_host).type(data.host2, {
        timeout,
      });
      cy.get(selector.nodes_0_port).type(data.port);
      cy.get(selector.nodes_0_weight).type(data.weight);
      cy.get('.ant-row').contains('Next').click();
      cy.get('.ant-row').contains('Next').click();
      cy.get('.ant-row').contains('Submit').click();
      cy.contains(data.submitSuccess);
      cy.contains('Goto List').click();
      cy.url().should('contains', 'routes/list');
    }
  });

  it('should delete the route', function () {
    cy.visit('/routes/list');
    cy.wrap([0, 2]).each(($n) => {
      cy.contains(`test${$n}`).get('[type="checkbox"]').check();
    });
    cy.contains('BatchDeletion Routes').should('be.visible').click({ timeout });
    cy.get(selector.notification).should('contain', data.deleteRouteSuccess);
    cy.get(selector.notificationClose).should('be.visible').click({
      force: true,
      multiple: true,
    });
  });

  it('should batch delete the name of the route', function () {
    cy.contains('Route').click();
    const cases = [
      [1, 0, 2], //full match
      [0, 1, 2], // partial match
      [0, 1, 2], //none match
    ];
    const prefix = 'test';
    cy.wrap([0, 2, 'x']).each(($n, i) => {
      cy.get(selector.nameSearchInput).clear().type(`${prefix}${$n}`);
      cy.contains('Search').click();
      cy.wrap(cases[i]).each(($n) => {
        cy.contains(`${prefix}${$n}`).should('not.exist');
      });
    });
  });

  it('should batch delete the path of the route', function () {
    cy.contains('Route').click();
    const cases = [
      [1, 0, 2], //full match
      [0, 1, 2], // partial match
      [0, 1, 2], //none match
    ];
    const prefix = '/get';
    cy.wrap([0, 2, 'x']).each(($n, i) => {
      cy.get(selector.nameSearchInput).clear().type(`${prefix}${$n}`);
      cy.contains('Search').click();
      cy.wrap(cases[i]).each(($n) => {
        cy.contains(`${prefix}${$n}`).should('not.exist');
      });
    });
  });
});
