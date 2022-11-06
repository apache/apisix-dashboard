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
    varSelect: '[title="vars"]',
    defaultCHashKey: '[value="remote_addr"]',
    nodes_0_host: '#submitNodes_0_host',
    nodes_0_port: '#submitNodes_0_port',
    nodes_0_weight: '#submitNodes_0_weight',
    upstreamType: '.ant-select-item-option-content',
    hashPosition: '.ant-select-item-option-content',
    chash_key: '#key',
    notification: '.ant-notification-notice-message',
    nameSearch: '[title=Name]',
    notificationCloseIcon: '.ant-notification-close-icon',
  };

  const data = {
    serviceName: 'chash-service',
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
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create a service with custom CHash key Upstream', function () {
    cy.visit('/');
    cy.contains('Service').click();
    cy.contains('Create').click();
    cy.get(selector.name).type(data.serviceName);
    cy.get(selector.description).type(data.description);
    cy.get(selector.roundRobinSelect).click();
    cy.get(selector.upstreamType).within(() => {
      cy.contains('CHash').click();
    });
    cy.get(selector.varSelect).click();
    cy.get(selector.hashPosition).within(() => {
      cy.contains('cookie').click();
    });
    cy.get(selector.defaultCHashKey).click();
    cy.get(selector.defaultCHashKey).clear().type('custom_key');
    cy.get(selector.nodes_0_host).click();
    cy.get(selector.nodes_0_host).type(data.ip1);
    cy.get(selector.nodes_0_port).clear().type(data.port0);
    cy.get(selector.nodes_0_weight).clear().type(data.weight0);
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
    cy.get(selector.chash_key).should('value', data.custom_key);
    cy.get(selector.chash_key).clear().type(data.new_key);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(selector.notification).should('contain', data.editServiceSuccess);
  });

  it('should delete this service', function () {
    cy.visit('/service/list');
    cy.get(selector.nameSearch).type(data.serviceName);
    cy.contains('Search').click();
    cy.contains(data.serviceName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(selector.notification).should('contain', data.deleteServiceSuccess);
    cy.get(selector.notificationCloseIcon).click();
  });
});
