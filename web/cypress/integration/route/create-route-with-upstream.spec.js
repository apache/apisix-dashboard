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

context('Create Route with Upstream', () => {
  const selector = {
    name: '#name',
    description: '#desc',
    nodes_0_host: '#nodes_0_host',
    nodes_0_port: '#nodes_0_port',
    nodes_0_weight: '#nodes_0_weight',
    upstreamSelector: '[data-cy=upstream_selector]',
    nameSelector: '[title=Name]',
    input: ':input',
    deleteAlert: '.ant-modal-body',
    notification: '.ant-notification-notice-message',
  };

  const data = {
    deleteRouteSuccess: 'Delete Route Successfully',
    submitSuccess: 'Submit Successfully',
    deleteUpstreamSuccess: 'Delete Upstream Successfully',
    host1: '11.11.11.11',
    port: '80',
    weight: 1,
    description: 'desc_by_autotest',
    upstreamName: 'test_upstream',
    routeName: 'test_route',
    ip1: '127.0.0.1',
    ip2: '127.0.0.2',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create an upstream', function () {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains('Create').click();

    cy.get(selector.name).type(data.upstreamName);
    cy.get(selector.description).type(data.description);
    cy.get(selector.nodes_0_host).type(data.host1);
    cy.get(selector.nodes_0_port).type(data.port);
    cy.get(selector.nodes_0_weight).type(data.weight);
    cy.contains('Next').click();
    cy.contains('Submit').click();
  });

  it('should create route with upstream just created', function () {
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
    // should disable Upstream input boxes after selecting an existing upstream
    cy.get(selector.upstreamSelector).click();
    cy.contains(data.upstreamName).click();
    cy.get(selector.input).should('be.disabled');
    // should enable Upstream input boxes after selecting Custom mode
    cy.get(selector.upstreamSelector).click();
    cy.contains('.ant-select-item-option-content', 'Custom').click();

    cy.get(selector.nodes_0_host).clear().type(data.ip1);
    cy.get(selector.nodes_0_port).type(data.port);
    cy.get(selector.nodes_0_weight).type(data.weight);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(data.submitSuccess).should('be.visible');
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('should edit this route with upstream', function () {
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

    cy.get(selector.upstreamSelector).click();
    cy.contains(data.upstreamName).click();
    cy.get(selector.input).should('be.disabled');

    cy.contains(data.upstreamName).click();
    cy.contains('.ant-select-item-option-content', 'Custom').click();
    cy.get(selector.input).should('not.be.disabled');

    cy.get(selector.nodes_0_host).clear().type(data.ip2);
    cy.get(selector.nodes_0_port).type(data.port);
    cy.get(selector.nodes_0_weight).type(data.weight);
    cy.contains('Next').click();
    cy.contains('Next').click();
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

  it('should delete this test route and upstream', function () {
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

    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains(data.upstreamName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(selector.notification).should('contain', data.deleteUpstreamSuccess);
  });
});
