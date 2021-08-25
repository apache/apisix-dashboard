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

context('Create and Delete Upstream', () => {
  const selector = {
    name: '#name',
    upstream_type: '#upstream_type',
    discovery_type: '#discovery_type',
    service_name: '#service_name',
    discovery_type_group_name: '#discovery_args_group_name',
    discovery_type_namespace_id: '#discovery_args_namespace_id',
    nodes_0_host: '#nodes_0_host',
    nodes_0_port: '#nodes_0_port',
    nodes_0_weight: '#nodes_0_weight',
    input: ':input',
    notification: '.ant-notification-notice-message',
    nameSelector: '[title=Name]',
    type: '#type',
    selectItem: '.ant-select-item-option-content',
    drawer: '.ant-drawer-content',
    monacoScroll: '.monaco-scrollable-element',
    description: '#desc',
  };

  const data = {
    upstreamName: 'test_upstream',
    serviceName: 'test.cluster.local',
    groupName: 'test_group',
    namespaceId: 'test_ns1',
    description: 'desc_by_autotest',
    ip1: '127.0.0.1',
    createUpstreamSuccess: 'Create Upstream Successfully',
    configureUpstreamSuccess: 'Configure Upstream Successfully',
    deleteUpstreamSuccess: 'Delete Upstream Successfully',
    port0: '7000',
    weight0: '2',
    port1: '7001',
    weight1: '2',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create upstream with default type (roundrobin)', function () {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains('Create').click();

    cy.get(selector.name).type(data.upstreamName);
    cy.get(selector.description).type(data.description);

    cy.get(selector.nodes_0_host).type(data.ip1);
    cy.get(selector.nodes_0_port).clear().type('7000');
    cy.get(selector.nodes_0_weight).clear().type(1);
    cy.get('#custom_checks_active').click();
    cy.get('#checks_active_port').clear();
    cy.contains('Next').click();
    cy.get(selector.input).should('be.disabled');
    cy.contains('Submit').click();
    cy.get(selector.notification).should('contain', data.createUpstreamSuccess);
    cy.contains(data.createUpstreamSuccess);
    cy.url().should('contains', 'upstream/list');
  });

  it('should view the (roundrobin) upstream', function () {
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

  it('should create chash upstream', function () {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains('Create').click();

    cy.get(selector.name).type(data.upstreamName);
    cy.get(selector.description).type(data.description);

    // change upstream type to chash, todo: optimize the search method
    cy.get('[title="Round Robin"]').click();
    cy.get(selector.selectItem).within(() => {
      cy.contains('CHash').click();
    });
    cy.get('#hash_on').click({ force: true });
    cy.get(selector.selectItem).within(() => {
      cy.contains('vars').click();
    });
    cy.get('#key').click({ force: true });
    cy.get(selector.selectItem).within(() => {
      cy.contains('remote_addr').click();
    });

    // add first upstream node
    cy.get(selector.nodes_0_host).type(data.ip1);
    cy.get(selector.nodes_0_port).clear().type(data.port0);
    cy.get(selector.nodes_0_weight).clear().type(data.weight0);

    // add second upstream node
    cy.get('.ant-btn-dashed').click();
    cy.get('#nodes_1_host').type(data.ip1);
    cy.get('#nodes_1_port').clear().type(data.port1);
    cy.get('#nodes_1_weight').clear().type(data.weight1);

    // next to finish
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(selector.notification).should('contain', data.createUpstreamSuccess);
    cy.url().should('contains', 'upstream/list');
  });

  it('should view the (chash) upstream', function () {
    cy.visit('/');
    cy.contains('Upstream').click();

    cy.get(selector.nameSelector).type(data.upstreamName);
    cy.contains('Search').click();
    cy.contains(data.upstreamName).siblings().contains('View').click();
    cy.get(selector.drawer).should('be.visible');

    cy.get(selector.monacoScroll).within(() => {
      cy.contains('nodes').should('exist');
      cy.contains('chash').should('exist');
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

  it('should create upstream with DNS service discover (roundrobin)', function () {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains('Create').click();

    cy.get(selector.name).type(data.upstreamName);
    cy.get(selector.description).type(data.description);

    cy.get('[title="Node"]').click();
    cy.get(selector.selectItem).within(() => {
      cy.contains('Service Discovery').click();
    });

    cy.get(selector.discovery_type).click();
    cy.get(selector.selectItem).within(() => {
      cy.contains('DNS').click();
    });
    cy.get(selector.service_name).type(data.serviceName);
    cy.get(selector.discovery_type_group_name).should('not.exist');
    cy.get(selector.discovery_type_namespace_id).should('not.exist');

    cy.get('#custom_checks_active').click();
    cy.get('#checks_active_port').clear();
    cy.contains('Next').click();
    cy.get(selector.input).should('be.disabled');
    cy.contains('Submit').click();
    cy.get(selector.notification).should('contain', data.createUpstreamSuccess);
    cy.url().should('contains', 'upstream/list');
  });

  it('should edit upstream to Nacos service discovery', function () {
    cy.visit('/');
    cy.contains('Upstream').click();

    cy.get(selector.nameSelector).type(data.upstreamName);
    cy.contains('Search').click();
    cy.contains(data.upstreamName).siblings().contains('Configure').click();

    cy.wait(1000);

    // set another service discovery
    cy.get(selector.discovery_type).click({ force: true });
    cy.get(selector.selectItem).within(() => {
      cy.contains('Nacos').click();
    });
    cy.get(selector.service_name).clear().type(`another.${data.serviceName}`);
    cy.get(selector.discovery_type_group_name).type(data.groupName);
    cy.get(selector.discovery_type_namespace_id).type(data.namespaceId);

    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(selector.notification).should('contain', data.configureUpstreamSuccess);
    cy.url().should('contains', 'upstream/list');

    // check if the changes have been saved
    cy.get(selector.nameSelector).type(data.upstreamName);
    cy.contains('Search').click();

    cy.contains(data.upstreamName).siblings().contains('Configure').click();
    // ensure it has already changed to edit page
    cy.get(selector.name).should('value', data.upstreamName);
    cy.contains('Next').click({
      force: true,
    });
    cy.get(selector.service_name).should('value', `another.${data.serviceName}`);
    cy.get(selector.discovery_type_group_name).should('value', data.groupName);
    cy.get(selector.discovery_type_namespace_id).should('value', data.namespaceId);
  });

  it('should delete the upstream', function () {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains(data.upstreamName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(selector.notification).should('contain', data.deleteUpstreamSuccess);
  });
});
