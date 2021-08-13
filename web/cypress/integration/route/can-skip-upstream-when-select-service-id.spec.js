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

context('Can select service_id skip upstream in route', () => {
  const selector = {
    name: '#name',
    nodes_0_host: '#nodes_0_host',
    nodes_0_port: '#nodes_0_port',
    nodes_0_weight: '#nodes_0_weight',
    notification: '.ant-notification-notice-message',
    upstreamSelector: '[data-cy=upstream_selector]',
    input: ':input',
    nameSelector: '[title=Name]',
    serviceSelector: '[title=test_service]',
    deleteAlert: '.ant-modal-body',
    notificationCloseIcon: '.ant-notification-close-icon',
    enable_websocket: '#enable_websocket',
  };

  const data = {
    createUpstreamSuccess: 'Create Upstream Successfully',
    createServiceSuccess: 'Create Service Successfully',
    upstreamName: 'test_upstream',
    serviceName: 'test_service',
    routeName: 'test_route',
    submitSuccess: 'Submit Successfully',
    deleteUpstreamSuccess: 'Delete Upstream Successfully',
    deleteServiceSuccess: 'Delete Service Successfully',
    deleteRouteSuccess: 'Delete Route Successfully',
    ip1: '127.0.0.1',
    port0: '7000',
    weight0: '1',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create test upstream and service', function () {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains('Create').click();

    cy.get(selector.name).type(data.upstreamName);
    cy.get(selector.nodes_0_host).type(data.ip1);
    cy.get(selector.nodes_0_port).clear().type(data.port0);
    cy.get(selector.nodes_0_weight).clear().type(data.weight0);
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(selector.notification).should('contain', data.createUpstreamSuccess);
    cy.contains(data.createUpstreamSuccess);

    cy.visit('/');
    cy.contains('Service').click();
    cy.contains('Create').click();
    cy.get(selector.name).type(data.serviceName);
    cy.get(selector.upstreamSelector).click();
    cy.contains(data.upstreamName).click();
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(selector.notification).should('contain', data.createServiceSuccess);
    cy.contains(data.createServiceSuccess);
  });

  it('should skip upstream module after service is selected when creating route', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.contains('Create').click();

    // The None option doesn't exist when service isn't selected
    cy.contains('Next').click().click();
    cy.get(selector.name).type(data.routeName);
    cy.contains('Next').click();
    cy.get(selector.upstreamSelector).click();
    cy.get('.ant-select-item-option-disabled > .ant-select-item-option-content').contains('None');

    cy.contains('Previous').click();
    cy.wait(500);
    cy.contains('None').click();
    cy.contains(data.serviceName).click();
    cy.get(selector.enable_websocket).click();
    cy.contains('Next').click();

    // make sure upstream data can be saved
    cy.get(selector.upstreamSelector).click();
    cy.contains(data.upstreamName).click();
    cy.get(selector.input).should('be.disabled');

    cy.contains(data.upstreamName).click();
    cy.contains('None').click({ force: true });
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains('Goto List').click();
  });

  it('should skip upstream module after service is selected when editing route', function () {
    cy.visit('/');
    cy.contains('Route').click();

    cy.get(selector.nameSelector).type(data.routeName);
    cy.contains('Search').click();
    cy.contains(data.routeName).siblings().contains('Configure').click();
    cy.get(selector.serviceSelector).click();
    cy.get(selector.enable_websocket).should('have.class', 'ant-switch-checked');
    cy.contains('None').click();
    cy.contains('Next').click();
    cy.wait(500);
    cy.get('[data-cy=upstream_selector]').click();
    cy.contains(data.upstreamName).click();
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(data.submitSuccess);
  });

  it('should delete route, service and upstream', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.contains(data.routeName).siblings().contains('More').click();
    cy.contains('Delete').click();
    cy.get(selector.deleteAlert)
      .should('be.visible')
      .within(() => {
        cy.contains('OK').click();
      });

    cy.get(selector.notification).should('contain', data.deleteRouteSuccess);
    cy.visit('/');
    cy.contains('Service').click();
    cy.contains(data.serviceName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(selector.notification).should('contain', data.deleteServiceSuccess);

    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains(data.upstreamName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(selector.notification).should('contain', data.deleteUpstreamSuccess);
    cy.get(selector.notificationCloseIcon).click();
  });
});
