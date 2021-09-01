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

context('Create Upstream With retry_timeout', () => {
  const selector = {
    name: '#name',
    nodes_0_host: '#nodes_0_host',
    nodes_0_port: '#nodes_0_port',
    nodes_0_weight: '#nodes_0_weight',
    retry_timeout: '#retry_timeout',
    input: ':input',
    notification: '.ant-notification-notice-message',
    nameSelector: '[title=Name]',
    upstreamType: '.ant-select-item-option-content',
    drawer: '.ant-drawer-content',
    monacoScroll: '.monaco-scrollable-element',
    description: '#desc',
  };
  const data = {
    upstreamName: 'test_upstream',
    description: 'desc_by_autotest',
    ip1: '127.0.0.1',
    createUpstreamSuccess: 'Create Upstream Successfully',
    deleteUpstreamSuccess: 'Delete Upstream Successfully',
    port0: '7000',
    weight0: '2',
    port1: '7001',
    weight1: '2',
    retry_timeout: '3',
  };
  beforeEach(() => {
    cy.login();
  });
  it('should create upstream with retry_timeout (roundrobin)', function () {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains('Create').click();

    cy.get(selector.name).type(data.upstreamName);
    cy.get(selector.description).type(data.description);

    cy.get(selector.nodes_0_host).type(data.ip1);
    cy.get(selector.nodes_0_port).clear().type('8000');
    cy.get(selector.nodes_0_weight).clear().type(1);
    cy.get(selector.retry_timeout).clear().type('6');
    cy.get('#custom_checks_active').click();
    cy.get('#checks_active_port').clear();
    cy.contains('Next').click();
    cy.get(selector.input).should('be.disabled');
    cy.contains('Submit').click();
    cy.get(selector.notification).should('contain', data.createUpstreamSuccess);
    cy.contains(data.createUpstreamSuccess);
    cy.url().should('contains', 'upstream/list');
  });
  it('should view the (roundrobin) upstream with retry_timeout', function () {
    cy.visit('/');
    cy.contains('Upstream').click();

    cy.get(selector.nameSelector).type(data.upstreamName);
    cy.contains('Search').click();
    cy.contains(data.upstreamName).siblings().contains('View').click();
    cy.get('.ant-drawer-content').should('be.visible');

    cy.get(selector.monacoScroll).within(() => {
      cy.contains('nodes').should('exist');
      cy.contains('roundrobin').should('exist');
      cy.contains(data.upstreamName).should('exist');
    });
  });
  it('should delete the upstream', function () {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains(data.upstreamName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(selector.notification).should('contain', data.deleteUpstreamSuccess);
  });
});
