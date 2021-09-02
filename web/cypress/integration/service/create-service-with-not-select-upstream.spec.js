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

context('Edit Service with not select Upstream', () => {
  const selector = {
    name: '#name',
    description: '#desc',
    nodes_0_host: '#submitNodes_0_host',
    nodes_0_port: '#submitNodes_0_port',
    nodes_0_weight: '#submitNodes_0_weight',
    input: ':input',
    notification: '.ant-notification-notice-message',
    nameSearch: '[title=Name]',
    notificationCloseIcon: '.ant-notification-close-icon',
  };

  const data = {
    serviceName: 'test_service',
    createServiceSuccess: 'Create Service Successfully',
    deleteServiceSuccess: 'Delete Service Successfully',
    editServiceSuccess: 'Configure Service Successfully',
    port: '80',
    weight: 1,
    description: 'desc_by_autotest',
    ip1: '127.0.0.1',
    ip2: '127.0.0.2',
    port0: '7000',
    weight0: '1',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create a test service', function () {
    cy.visit('/');
    cy.contains('Service').click();
    cy.contains('Create').click();
    cy.get(selector.name).type(data.serviceName);
    cy.get(selector.description).type(data.description);
    cy.get(selector.nodes_0_host).click();
    cy.get(selector.nodes_0_host).type(data.ip1);
    cy.get(selector.nodes_0_port).clear().type(data.port0);
    cy.get(selector.nodes_0_weight).clear().type(data.weight0);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.get(selector.input).should('be.disabled');
    cy.contains('Submit').click();
    cy.get(selector.notification).should('contain', data.createServiceSuccess);
  });

  it('should edit the service', function () {
    cy.visit('/service/list');

    cy.get(selector.nameSearch).type(data.serviceName);
    cy.contains('Search').click();
    cy.contains(data.serviceName).siblings().contains('Configure').click();
    cy.wait(500);
    cy.get(selector.nodes_0_host).should('not.be.disabled').clear().type(data.ip2);
    cy.get(selector.nodes_0_port).type(data.port);
    cy.get(selector.nodes_0_weight).type(data.weight);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.get(selector.input).should('be.disabled');
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
    cy.get(selector.notificationCloseIcon).click();
  });
});
