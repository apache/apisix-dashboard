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

context('Create Route without Upstream', () => {
  const selector = {
    name: '#name',
    nodes_0_host: '#nodes_0_host',
    nodes_0_port: '#nodes_0_port',
    nodes_0_weight: '#nodes_0_weight',
    input: ':input',
    nameSelector: '[title=Name]',
    deleteAlert: '.ant-modal-body',
    notification: '.ant-notification-notice-message',
  };

  const data = {
    routeName: 'test_route',
    submitSuccess: 'Submit Successfully',
    ip1: '127.0.0.1',
    ip2: '127.0.0.2',
    port: '80',
    weight: 1,
    deleteRouteSuccess: 'Delete Route Successfully',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create route wittout upstream ', function () {
    cy.visit('/');
    cy.get('[role=menu]')
      .should('be.visible')
      .within(() => {
        cy.contains('Route').click();
      });
    cy.contains('Create').click();

    cy.contains('Next').click().click();
    cy.get(selector.name).type(data.routeName);
    cy.contains('Next').click();

    cy.get(selector.nodes_0_host).clear().type(data.ip1);
    cy.get(selector.nodes_0_port).type(data.port);
    cy.get(selector.nodes_0_weight).type(data.weight);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.get(selector.input).should('be.disabled');
    cy.contains('Submit').click();
    cy.contains(data.submitSuccess).should('be.visible');
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

    // check if the changes have been saved
    cy.get(selector.nodes_0_host).should('value', data.ip1);
    cy.get(selector.nodes_0_host).clear().type(data.ip2);
    cy.get(selector.nodes_0_port).type(data.port);
    cy.get(selector.nodes_0_weight).type(data.weight);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.get(selector.input).should('be.disabled');
    cy.contains('Submit').click();
    cy.contains(data.submitSuccess).should('be.visible');
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');

    // check if the changes have been saved
    cy.get(selector.nameSelector).type(data.routeName);
    cy.contains('Search').click();

    cy.contains(data.routeName).siblings().contains('Configure').click();
    // ensure it has already changed to edit page
    cy.get(selector.name).should('value', data.routeName);
    cy.contains('Next').click({
      force: true,
    });
    cy.get(selector.nodes_0_host).should('value', data.ip2);
  });

  it('should delete this test route', function () {
    cy.visit('/routes/list');
    cy.get(selector.nameSelector).type(data.routeName);
    cy.contains('Search').click();
    cy.contains(data.routeName).siblings().contains('More').click();
    cy.contains('Delete').click();
    cy.get(selector.deleteAlert)
      .should('be.visible')
      .within(() => {
        cy.contains('OK').click();
      });
    cy.get(selector.notification).should('contain', data.deleteRouteSuccess);
  });
});
