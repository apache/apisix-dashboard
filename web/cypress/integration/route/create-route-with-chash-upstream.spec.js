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

context('Create and Edit Route With Custom CHash Key Upstream', () => {
  const selector = {
    name: '#name',
    menu: '[role=menu]',
    roundRobinSelect: '[title="Round Robin"]',
    varSelect: '[title="vars"]',
    defaultCHashKey: '[value="remote_addr"]',
    upstreamType: ".ant-select-item-option-content",
    hashPosition: ".ant-select-item-option-content",
    nodes_0_host: '#nodes_0_host',
    nodes_0_port: '#nodes_0_port',
    nodes_0_weight: '#nodes_0_weight',
    nameSelector: '[title=Name]',
    chash_key: '#key',
    deleteAlert: '.ant-modal-body',
    notificationCloseIcon: '.ant-notification-close-icon',
    notification: '.ant-notification-notice-message',
  };

  const data = {
    routeName: 'roteName',
    ip: '127.0.0.1',
    port: '7000',
    weight: '1',
    deleteRouteSuccess: 'Delete Route Successfully',
    submitSuccess: 'Submit Successfully',
    custom_key: 'custom_key',
    new_key: 'new_key',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create route with custom chash key Upstream', function () {
    cy.visit('/');
    cy.get(selector.menu)
      .should('be.visible')
      .within(() => {
        cy.contains('Route').click();
      });
    cy.contains('Create').click();

    cy.contains('Next').click().click();
    cy.get(selector.name).type(data.routeName);
    cy.contains('Next').click();

    cy.get(selector.roundRobinSelect).click();
    cy.get(selector.upstreamType).within(() => {
      cy.contains('CHash').click();
    });
    cy.get(selector.varSelect).click();
    cy.get(selector.hashPosition).within(() => {
      cy.contains('cookie').click();
    });
    cy.get(selector.defaultCHashKey).click();
    cy.get(selector.defaultCHashKey).clear().type(data.custom_key);
    cy.get(selector.nodes_0_host).click();
    cy.get(selector.nodes_0_host).type(data.ip);
    cy.get(selector.nodes_0_port).clear().type(data.port);
    cy.get(selector.nodes_0_weight).clear().type(data.weight);

    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(data.submitSuccess).should('be.visible');

    // back to route list page
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('should edit this route ', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.get(selector.nameSelector).type(data.routeName);

    cy.contains('Search').click();
    cy.contains(data.routeName).siblings().contains('Configure').click();
    cy.get(selector.name).should('value', data.routeName);
    cy.contains('Next').click({
      force: true,
    });
    cy.get(selector.chash_key).should('value', data.custom_key);
    cy.get(selector.chash_key).clear().type(data.new_key);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(data.submitSuccess).should('be.visible');
  });

  it('should delete the route', function () {
    cy.visit('/routes/list');
    cy.get(selector.name).clear().type(data.routeName);
    cy.contains('Search').click();
    cy.contains(data.routeName).siblings().contains('More').click();
    cy.contains('Delete').click();
    cy.get(selector.deleteAlert)
      .should('be.visible')
      .within(() => {
        cy.contains('OK').click();
      });
    cy.get(selector.notification).should('contain', data.deleteRouteSuccess);
    cy.get(selector.notificationCloseIcon).click({multiple: true});
  });
});
