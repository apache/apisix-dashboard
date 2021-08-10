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

context('Create Route Both use uri and uris', () => {
  const selector = {
    empty: '.ant-empty-normal',
    name: '#name',
    description: '#desc',
    hosts_0: '#hosts_0',
    hosts_1: '#hosts_1',
    uris_0: '#uris_0',
    uris_1: '#uris_1',
    remote_addrs_0: '#remote_addrs_0',
    remote_addrs_1: '#remote_addrs_1',
    nodes_0_host: '#nodes_0_host',
    nodes_0_port: '#nodes_0_port',
    nodes_0_weight: '#nodes_0_weight',
    nameSelector: '[title=Name]',
    drawer: '.ant-drawer-content',
    monacoScroll: '.monaco-scrollable-element',
    addHost: '[data-cy=addHost]',
    addUri: '[data-cy=addUri]',
    addRemoteAddr: '[data-cy=addRemoteAddr]',
    deleteAlert: '.ant-modal-body',
    notificationCloseIcon: '.ant-notification-close-icon',
    notification: '.ant-notification-notice-message',
  };

  const data = {
    name: 'test_route',
    description: 'desc_by_autotest',
    host: '12.12.12.12',
    port: '80',
    weight: 1,
    host_0: '0.0.0.0',
    uri_0: '/test',
    remote_addr_0: '192.168.1.0',
    host_1: '1.1.1.1',
    uri_1: '/test1',
    remote_addr_1: '192.168.1.1',
    submitSuccess: 'Submit Successfully',
    deleteRouteSuccess: 'Delete Route Successfully',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create route with uri/host/remote_addr', () => {
    cy.visit('/');
    cy.contains('Route').click();
    cy.get(selector.empty).should('be.visible');
    cy.contains('Create').click();
    cy.contains('Next').click().click();
    cy.get(selector.name).type(data.name);
    cy.get(selector.description).type(data.description);

    cy.get(selector.hosts_0).type(data.host_0);
    cy.get(selector.uris_0).clear().type(data.uri_0);
    cy.get(selector.remote_addrs_0).type(data.remote_addr_0);

    cy.contains('Next').click();
    cy.get(selector.nodes_0_host).type(data.host);
    cy.get(selector.nodes_0_port).type(data.port);
    cy.get(selector.nodes_0_weight).type(data.weight);
    cy.contains('Next').click();

    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(data.submitSuccess);

    // back to route list page
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('Raw Data should have uri/host/remote_addr', () => {
    cy.visit('/');
    cy.contains('Route').click();

    cy.get(selector.nameSelector).type(data.name);
    cy.contains('Search').click();
    cy.contains(data.name).siblings().contains('More').click();
    cy.contains('View').click();
    cy.get(selector.drawer).should('be.visible');

    cy.get(selector.monacoScroll).within(() => {
      cy.contains('uri').should('exist');
      cy.contains('host').should('exist');
      cy.contains('remote_addr').should('exist');
    });
  });

  it('should create route with uris/hosts/remote_addrs', () => {
    cy.visit('/');
    cy.contains('Route').click();

    cy.get(selector.nameSelector).type(data.name);
    cy.contains('Search').click();
    cy.contains(data.name).siblings().contains('Configure').click();

    cy.get('#status').should('have.class', 'ant-switch-checked');

    cy.get(selector.hosts_0).should('have.value', data.host_0);
    cy.get(selector.uris_0).should('have.value', data.uri_0);
    cy.get(selector.remote_addrs_0).should('have.value', data.remote_addr_0);

    cy.get(selector.addHost).click();
    cy.get(selector.hosts_1).type(data.host_1);
    cy.get(selector.addUri).click();
    cy.get(selector.uris_1).clear().type(data.uri_1);
    cy.get(selector.addRemoteAddr).click();
    cy.get(selector.remote_addrs_1).type(data.remote_addr_1);

    cy.contains('Next').click();
    cy.get(selector.nodes_0_host).type(data.host);
    cy.get(selector.nodes_0_port).type(data.port);
    cy.get(selector.nodes_0_weight).type(data.weight);
    cy.contains('Next').click();

    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(data.submitSuccess);

    // back to route list page
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('Raw Data should have uris/hosts/remote_addrs', () => {
    cy.visit('/');
    cy.contains('Route').click();

    cy.get(selector.nameSelector).type(data.name);
    cy.contains('Search').click();
    cy.contains(data.name).siblings().contains('More').click();
    cy.contains('View').click();
    cy.get(selector.drawer).should('be.visible');

    cy.get(selector.monacoScroll).within(() => {
      cy.contains('uris').should('exist');
      cy.contains('hosts').should('exist');
      cy.contains('remote_addrs').should('exist');
    });
  });

  it('confirm the configure view render normally', () => {
    cy.visit('/');
    cy.contains('Route').click();

    cy.get(selector.nameSelector).type(data.name);
    cy.contains('Search').click();
    cy.contains(data.name).siblings().contains('Configure').click();

    cy.get('#status').should('have.class', 'ant-switch-checked');
    cy.get(selector.hosts_0).should('have.value', data.host_0);
    cy.get(selector.hosts_1).should('have.value', data.host_1);
    cy.get(selector.uris_0).should('have.value', data.uri_0);
    cy.get(selector.uris_1).should('have.value', data.uri_1);
    cy.get(selector.remote_addrs_0).should('have.value', data.remote_addr_0);
    cy.get(selector.remote_addrs_1).should('have.value', data.remote_addr_1);
  });

  it('should delete the route', function () {
    cy.visit('/routes/list');
    cy.get(selector.name).clear().type(data.name);
    cy.contains('Search').click();
    cy.contains(data.name).siblings().contains('More').click();
    cy.contains('Delete').click();
    cy.get(selector.deleteAlert)
      .should('be.visible')
      .within(() => {
        cy.contains('OK').click();
      });
    cy.get(selector.notification).should('contain', data.deleteRouteSuccess);
    cy.get(selector.notificationCloseIcon).click();
  });
});
