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

context('Create and Edit Service with Custom CHash Key Upstream', () => {
  const selector = {
    name: '#name',
    description: '#desc',
    roundRobinSelect: '[title="Round Robin"]',
    upstreamTypeSelect: '[title="Node"]',
    discovery_type: '#discovery_type',
    service_name: '#service_name',
    upstreamType: '.ant-select-item-option-content',
    hashPosition: '.ant-select-item-option-content',
    discoveryTypeSelect: '.ant-select-item-option-content',
    chash_key: '#key',
    notification: '.ant-notification-notice-message',
    nameSearch: '[title=Name]',
    notificationCloseIcon: '.ant-notification-close-icon',
    drawer: '.ant-drawer-content',
    monacoScroll: '.monaco-scrollable-element',
  };

  const data = {
    createServiceSuccess: 'Create Service Successfully',
    deleteServiceSuccess: 'Delete Service Successfully',
    editServiceSuccess: 'Configure Service Successfully',
    port: '80',
    weight: 1,
    description: 'desc_by_autotest',
    ip1: '127.0.0.1',
    port0: '7000',
    weight0: '1',
    custom_key: 'custom_key',
    new_key: 'new_key',
    serviceName: 'test.cluster.local',
    anotherServiceName: `another.test.cluster.local`,
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create a service with service discovery Upstream', function () {
    cy.visit('/');
    cy.contains('Service').click();
    cy.contains('Create').click();
    cy.get(selector.name).type(data.serviceName);
    cy.get(selector.description).type(data.description);
    cy.get(selector.upstreamTypeSelect).click();
    cy.get(selector.upstreamType).within(() => {
      cy.contains('Service Discovery').click();
    });
    cy.get(selector.discovery_type).click();
    cy.get(selector.discoveryTypeSelect).within(() => {
      cy.contains('DNS').click();
    });
    cy.get(selector.service_name).type(data.serviceName);
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

    cy.wait(1000);

    cy.get(selector.name).clear().type(data.anotherServiceName);

    // set another service discovery
    cy.get(selector.discovery_type).click({ force: true });
    cy.get(selector.discoveryTypeSelect).within(() => {
      cy.contains('Nacos').click();
    });
    cy.get(selector.service_name).clear().type(data.anotherServiceName);

    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(selector.notification).should('contain', data.editServiceSuccess);
  });

  it('should view the test service', function () {
    cy.visit('/service/list');

    cy.get(selector.nameSearch).type(data.anotherServiceName);
    cy.contains('Search').click();
    cy.contains(data.anotherServiceName).siblings().contains('View').click();
    cy.get(selector.drawer).should('be.visible');

    cy.get(selector.monacoScroll).within(() => {
      cy.contains('service_name').should('exist');
      cy.contains('discovery').should('exist');
    });
  });

  it('should delete this service', function () {
    cy.visit('/service/list');
    cy.get(selector.nameSearch).type(data.anotherServiceName);
    cy.contains('Search').click();
    cy.contains(data.anotherServiceName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(selector.notification).should('contain', data.deleteServiceSuccess);
    cy.get(selector.notificationCloseIcon).click();
  });
});
