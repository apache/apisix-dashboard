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
  const domSelector = {
    name: '#name',
    desc: '#desc',
    nodes_0_host: '#nodes_0_host',
    notification: '.ant-notification-notice-message',
    search_name: '[title=Name]',
    upstream_selector: '[title=Custom]',
    test_upstream: '[title=test_upstream]',
    input: ':input',
  };
  const data = {
    service_name: 'service',
    test_upstream: 'test_upstream',
    desc: 'desc',
    ip: '127.0.0.1',
    ip2: '127.0.0.2',
    create_service_success: 'Create Service Successfully',
    create_upstream_success: 'Create Upstream Successfully',
    edit_service_success: 'Edit Service Successfully',
    delete_service_success: 'Delete Service Successfully',
    delete_upstream_success: 'Delete Upstream Successfully',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create a test upstream', () => {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains('Create').click();

    cy.get(domSelector.name).type(data.test_upstream);
    cy.get(domSelector.nodes_0_host).type(data.ip);
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(domSelector.notification).should('contain', data.create_upstream_success);
    cy.url().should('contains', 'upstream/list');
  });

  it('should create a test service', () => {
    cy.visit('/');
    cy.contains('Service').click();
    cy.contains('Create').click();
    cy.get(domSelector.name).type(data.service_name);
    cy.get(domSelector.desc).type(data.desc);
    cy.get(domSelector.upstream_selector).click();
    cy.contains(data.test_upstream).click();
    cy.get(domSelector.input).should('be.disabled');

    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(domSelector.notification).should('contain', data.create_service_success);
  });

  it('should edit the service', () => {
    cy.visit('/');
    cy.contains('Service').click();

    cy.get(domSelector.search_name).type(data.service_name);
    cy.contains('Search').click();
    cy.contains(data.service_name).siblings().contains('Edit').click();

    cy.get(domSelector.nodes_0_host).click({ force: true }).should('value', data.ip);
    cy.get(domSelector.input).should('be.disabled');

    cy.get(domSelector.test_upstream).click();
    cy.contains('Custom').click();
    cy.get(domSelector.nodes_0_host).should('not.be.disabled').clear().type(data.ip2);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(domSelector.notification).should('contain', data.edit_service_success);
  });

  it('should delete this service and upstream', () => {
    cy.visit('/service/list');
    cy.get(domSelector.search_name).type(data.service_name);
    cy.contains('Search').click();
    cy.contains(data.service_name).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(domSelector.notification).should('contain', data.delete_service_success);

    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains(data.test_upstream).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(domSelector.notification).should('contain', data.delete_upstream_success);
  });
});
