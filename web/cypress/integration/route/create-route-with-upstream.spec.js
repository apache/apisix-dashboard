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

context('Create Route with Upstream', () => {
  const domSelector = {
    input: ':input',
    notification: '.ant-notification-notice-message',
    node_0_host: '#nodes_0_host',
    name: '#name',
    description: '#desc',
    search_name: '[title=Name]',
    upstream_selector: '[data-cy=upstream_selector]',
  };

  const data = {
    upstream_name: 'test_upstream',
    route_name: 'test_route',
    description: 'desc_by_autotes',
    host: '10.89.90.237',
    ip1: '127.0.0.1',
    ip2: '127.0.0.2',
    delete_route_success: 'Delete Route Successfully',
    delete_upstream_success: 'Delete Upstream Successfully',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create an upstream', () => {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains('Create').click();

    cy.get(domSelector.name).type(data.upstream_name);
    cy.get(domSelector.description).type(data.description);
    cy.get(domSelector.node_0_host).type(data.host);
    cy.contains('Next').click();
    cy.contains('Submit').click();
  });

  it('should enter the Route creator', () => {
    cy.visit('/');
    cy.contains('Route').click();
    cy.contains('Create').click();

    cy.get(domSelector.name).type(data.route_name);
    cy.contains('Next').click();
  });

  it('should disable Upstream input boxes after selecting an existing upstream', () => {
    cy.get(domSelector.upstream_selector).click();
    cy.contains(data.upstream_name).click();
    cy.get(domSelector.input).should('be.disabled');
  });

  it('should enable Upstream input boxes after selecting Custom mode', () => {
    cy.get(domSelector.upstream_selector).click();
    cy.contains('Custom').click();
    cy.get(domSelector.input).should('not.be.disabled');
  });

  it('should submit custom Upstream properties successfully', () => {
    cy.get(domSelector.node_0_host).clear().type(data.ip1);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('should edit this route with upstream', () => {
    cy.visit('/');
    cy.contains('Route').click();

    cy.reload();
    cy.get(domSelector.search_name).type(data.route_name);
    cy.contains('Search').click();
    cy.contains(data.route_name).siblings().contains('Edit').click();

    cy.get(domSelector.name).should('value', data.route_name);
    cy.contains('Next').click({ force: true });

    // check if the changes have been saved
    cy.get(domSelector.node_0_host).should('value', data.ip1);

    cy.get(domSelector.upstream_selector).click();
    cy.contains(data.upstream_name).click();
    cy.get(domSelector.input).should('be.disabled');

    cy.contains(data.upstream_name).click();
    cy.contains('Custom').click();
    cy.get(domSelector.input).should('not.be.disabled');

    cy.get(domSelector.node_0_host).clear().type(data.ip2);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');

    // check if the changes have been saved
    cy.get(domSelector.search_name).type(data.route_name);
    cy.contains('Search').click();
    cy.contains(data.route_name).siblings().contains('Edit').click();
    cy.contains('Next').click();
    cy.get(domSelector.node_0_host).should('value', data.ip2);
  });

  it('should delete this test route and upstream', () => {
    cy.visit('/routes/list');
    cy.get(domSelector.search_name).type(data.route_name);
    cy.contains('Search').click();
    cy.contains(data.route_name).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(domSelector.notification).should('contain', data.delete_route_success);

    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains(data.upstream_name).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(domSelector.notification).should('contain', data.delete_upstream_success);
  });
});
