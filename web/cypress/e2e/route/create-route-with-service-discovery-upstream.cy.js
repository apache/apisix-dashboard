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

context('Create Route with Service Discovery Upstream', () => {
  const selector = {
    name: '#name',
    description: '#desc',
    discovery_type: '#discovery_type',
    service_name: '#service_name',
    upstreamSelector: '[data-cy=upstream_selector]',
    nameSelector: '[title=Name]',
    selectItem: '.ant-select-item-option-content',
    drawer: '.ant-drawer-content',
    monacoScroll: '.monaco-scrollable-element',
    input: ':input',
    deleteAlert: '.ant-modal-body',
    notification: '.ant-notification-notice-message',
  };

  const data = {
    deleteRouteSuccess: 'Delete Route Successfully',
    submitSuccess: 'Submit Successfully',
    deleteUpstreamSuccess: 'Delete Upstream Successfully',
    weight: 1,
    description: 'desc_by_autotest',
    upstreamName: 'test_upstream',
    routeName: 'test_route',
    serviceName: 'test.cluster.local',
    consul: 'Consul',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create route with DNS service discovery upstream', function () {
    cy.visit('/');
    cy.get('[role=menu]')
      .should('be.visible')
      .within(() => {
        cy.contains('Route').click();
      });
    cy.contains('Create').click();

    cy.contains('Next').click().click();
    cy.get(selector.name).type(data.routeName);
    cy.contains('Next').click();

    // should enable Upstream input boxes after selecting Custom mode
    cy.get(selector.upstreamSelector).click();
    cy.contains('.ant-select-item-option-content', 'Custom').click();

    // set service discovery
    cy.get('[title="Node"]').click();
    cy.get(selector.selectItem).within(() => {
      cy.contains('Service Discovery').click();
    });

    cy.get(selector.discovery_type).click();
    cy.get(selector.selectItem).within(() => {
      cy.contains('DNS').click();
    });
    cy.get(selector.service_name).type(data.serviceName);

    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(data.submitSuccess).should('be.visible');
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');

    // check if the service discovery have been saved
    cy.get(selector.nameSelector).type(data.routeName);
    cy.contains('Search').click();

    cy.contains(data.routeName).siblings().contains('Configure').click();
    // ensure it has already changed to edit page
    cy.get(selector.name).should('value', data.routeName);
    cy.contains('Next').click({
      force: true,
    });
    cy.get(selector.service_name).should('value', data.serviceName);
  });

  it('should edit this route with Nacos Service Discovery upstream', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.get(selector.nameSelector).type(data.routeName);

    cy.contains('Search').click();
    cy.contains(data.routeName).siblings().contains('Configure').click();

    cy.get(selector.name).should('value', data.routeName);
    cy.contains('Next').click({
      force: true,
    });

    cy.contains('DNS').should('exist');

    // set another service discovery
    cy.get(selector.discovery_type).click({ force: true });
    cy.get(selector.selectItem).within(() => {
      cy.contains('Nacos').click();
    });
    cy.get(selector.service_name).clear().type(`another.${data.serviceName}`);

    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(data.submitSuccess).should('be.visible');
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');

    // check if the changes have been saved
    cy.get(selector.nameSelector).type(data.routeName);
    cy.contains('Search').click();

    cy.contains(data.routeName).siblings().contains('Configure').click();
    // ensure it has already changed to edit page
    cy.get(selector.name).should('value', data.routeName);
    cy.contains('Next').click({
      force: true,
    });
    cy.get(selector.service_name).should('value', `another.${data.serviceName}`);
  });

  it('should view the test route', function () {
    cy.visit('/');
    cy.contains('Route').click();

    cy.get(selector.nameSelector).type(data.routeName);
    cy.contains('Search').click();
    cy.contains(data.routeName).siblings().contains('More').click();
    cy.contains('View').click();
    cy.get(selector.drawer).should('be.visible');

    cy.get(selector.monacoScroll).within(() => {
      cy.contains('service_name').should('exist');
      cy.contains('discovery').should('exist');
    });
  });

  it('should edit this route with Consul Service Discovery upstream', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.get(selector.nameSelector).type(data.routeName);

    cy.contains('Search').click();
    cy.contains(data.routeName).siblings().contains('Configure').click();

    cy.get(selector.name).should('value', data.routeName);
    cy.contains('Next').click({
      force: true,
    });

    cy.contains('Nacos').should('exist');

    // set another service discovery
    cy.get(selector.discovery_type).click({ force: true });
    cy.get('[title="Consul"] > .ant-select-item-option-content').click();
    cy.get(selector.service_name).clear().type(`another.${data.serviceName}`);

    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(data.submitSuccess).should('be.visible');
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');

    // check if the changes have been saved
    cy.get(selector.nameSelector).type(data.routeName);
    cy.contains('Search').click();

    cy.contains(data.routeName).siblings().contains('More').click();
    cy.contains('View').click();
    cy.get(selector.drawer).should('be.visible');

    cy.get(selector.monacoScroll).within(() => {
      cy.contains(`another.${data.serviceName}`).should('exist');
      cy.contains('consul').should('exist');
    });
  });

  it('should delete this test route and upstream', function () {
    cy.visit('/routes/list');
    cy.get(selector.nameSelector).type(data.routeName);
    cy.contains('Search').click();
    cy.contains(data.routeName).siblings().contains('More').click();
    cy.contains('Delete').click();
    cy.get(selector.deleteAlert)
      .should('be.visible')
      .within(() => {
        cy.contains('OK').click();
      });
    cy.get(selector.notification).should('contain', data.deleteRouteSuccess);
  });
});
