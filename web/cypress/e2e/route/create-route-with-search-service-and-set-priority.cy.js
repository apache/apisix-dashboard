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

context('Create Route with search service name', () => {
  const selector = {
    name: '#name',
    description: '#desc',
    priority: '#priority',
    nodes_0_host: '#submitNodes_0_host',
    nodes_0_port: '#submitNodes_0_port',
    nodes_0_weight: '#submitNodes_0_weight',
    drawer: '.ant-drawer-content',
    monacoScroll: '.monaco-scrollable-element',
    notification: '.ant-notification-notice-message',
    result: '.ant-result',
    nameSelector: '[title=Name]',
    serviceSelector: '[title="None"]',
    upstreamSelector: '#upstream_id',
    deleteAlert: '.ant-modal-body',
  };

  const data = {
    serviceName: 'service_test1',
    description: 'desc_by_autotest',
    ip: '127.0.0.1',
    port: 8000,
    weight: 1,
    serviceName2: 'service_test2',
    ip2: '127.0.0.1',
    port2: 8000,
    weight2: 1,
    priority: 1,
    createServiceSuccess: 'Create Service Successfully',
    deleteServiceSuccess: 'Delete Service Successfully',
    createRouteSuccess: 'Submit Successfully',
    deleteRouteSuccess: 'Delete Route Successfully',
    routeName: 'route_test1',
    searchServiceName: 'service_test2',
    upstreamName: 'None (Only available when binding the service)',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create two services', function () {
    cy.visit('/');
    cy.contains('Service').click();
    cy.contains('Create').click();

    cy.get(selector.name).type(data.serviceName);
    cy.get(selector.description).type(data.description);
    cy.get(selector.nodes_0_host).click();
    cy.get(selector.nodes_0_host).type(data.ip);
    cy.get(selector.nodes_0_port).clear().type(data.port);
    cy.get(selector.nodes_0_weight).clear().type(data.weight);

    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(selector.notification).should('contain', data.createServiceSuccess);

    cy.visit('/');
    cy.contains('Service').click();
    cy.contains('Create').click();

    cy.get(selector.name).type(data.serviceName2);
    cy.get(selector.description).type(data.description);
    cy.get(selector.nodes_0_host).click();
    cy.get(selector.nodes_0_host).type(data.ip2);
    cy.get(selector.nodes_0_port).clear().type(data.port2);
    cy.get(selector.nodes_0_weight).clear().type(data.weight2);

    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(selector.notification).should('contain', data.createServiceSuccess);
  });

  it('should create route with search service and set priority', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.contains('Create').click();
    cy.contains('Next').click().click();

    // set name
    cy.get(selector.name).type(data.routeName);
    cy.get(selector.serviceSelector).type(`${data.serviceName2}\n`);
    // set priority
    cy.get(selector.priority).type(data.priority);
    cy.contains('Next').click();
    // select upstream with None
    cy.get('.ant-select-selector')
      .find(selector.upstreamSelector)
      .type(`${data.upstreamName}\n`, { force: true });

    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(selector.result).should('contain', data.createRouteSuccess);
  });

  it('should check the priority and service was seted', function () {
    let serviceUuid = '';
    cy.visit('/');
    cy.contains('Service').click();
    cy.get(selector.name).type(`${data.serviceName2}\n`);
    cy.contains(data.serviceName2)
      .siblings()
      .first()
      .then((a) => {
        serviceUuid = a.text();
      });
    cy.visit('/');
    cy.contains('Route').click();
    cy.get(selector.name).type(`${data.routeName}\n`);
    cy.contains(data.routeName).siblings().contains('More').click();
    cy.contains('View').click();
    cy.get(selector.drawer).should('be.visible');
    cy.get(selector.monacoScroll).within(() => {
      cy.contains('priority').should('exist');
      cy.contains(`${serviceUuid}`).should('exist');
    });
  });

  it('should delete the route and services', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.get(selector.name).type(`${data.routeName}\n`);
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

    cy.contains(data.serviceName2).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(selector.notification).should('contain', data.deleteServiceSuccess);
  });
});
