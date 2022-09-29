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

context('Edit Service with Upstream', () => {
  const selector = {
    empty: '.ant-empty-normal',
    name: '#name',
    description: '#desc',
    nodes_0_host: '#submitNodes_0_host',
    nodes_0_port: '#submitNodes_0_port',
    nodes_0_weight: '#submitNodes_0_weight',
    notification: '.ant-notification-notice-message',
    upstreamSelector: '[data-cy=upstream_selector]',
    input: ':input',
    nameSearch: '[title=Name]',
  };

  const data = {
    upstreamName: 'test_upstream',
    description: 'desc_by_autotest',
    ip1: '127.0.0.1',
    createUpstreamSuccess: 'Create Upstream Successfully',
    serviceName: 'test_service',
    createServiceSuccess: 'Create Service Successfully',
    ip2: '127.0.0.2',
    port: '80',
    weight: 1,
    editServiceSuccess: 'Configure Service Successfully',
    deleteServiceSuccess: 'Delete Service Successfully',
    deleteUpstreamSuccess: 'Delete Upstream Successfully',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create a test upstream', function () {
    cy.visit('/upstream/list');
    cy.get(selector.empty).should('be.visible');
    cy.contains('Create').click();
    cy.get(selector.name).type(data.upstreamName);
    cy.get(selector.nodes_0_host).type(data.ip1);
    cy.get(selector.nodes_0_port).clear().type('7000');
    cy.get(selector.nodes_0_weight).clear().type(1);
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(selector.notification).should('contain', data.createUpstreamSuccess);
    cy.url().should('contains', 'upstream/list');
  });

  it('should create a test service', function () {
    cy.visit('/');
    cy.get('.ant-empty').should('be.visible');
    cy.contains('Service').click();
    cy.get(selector.empty).should('be.visible');
    cy.contains('Create').click();
    cy.get(selector.name).type(data.serviceName);
    cy.get(selector.description).type(data.description);
    cy.get(selector.upstreamSelector).click();
    cy.contains(data.upstreamName).click();
    cy.get(selector.input).should('be.disabled');

    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(selector.notification).should('contain', data.createServiceSuccess);
  });

  it('should edit the service', function () {
    cy.visit('/service/list');

    cy.get(selector.nameSearch).type(data.serviceName);
    cy.contains('Search').click();
    cy.contains(data.serviceName).siblings().contains('Configure').click();

    cy.contains(data.upstreamName).click();
    cy.wait(500);
    cy.contains('.ant-select-item-option-content','Custom').click();
    cy.get(selector.nodes_0_host)
      .click({
        force: true,
      })
      .should('value', data.ip1);
    cy.get(selector.input).should('be.disabled');

    cy.wait(500);
    cy.get(selector.upstreamSelector).click();
    cy.get(selector.nodes_0_host).should('not.be.disabled').clear().type(data.ip2);
    cy.get(selector.nodes_0_port).type(data.port);
    cy.get(selector.nodes_0_weight).type(data.weight);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(selector.notification).should('contain', data.editServiceSuccess);
  });

  it('should delete this service and upstream', function () {
    cy.visit('/service/list');
    cy.get(selector.nameSearch).type(data.serviceName);
    cy.contains('Search').click();
    cy.contains(data.serviceName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(selector.notification).should('contain', data.deleteServiceSuccess);

    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains(data.upstreamName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(selector.notification).should('contain', data.deleteUpstreamSuccess);
  });
});
