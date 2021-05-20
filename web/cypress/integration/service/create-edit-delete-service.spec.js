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

context('Create and Delete Service ', () => {
  const timeout = 5000;

  const selector = {
    name: '#name',
    description: '#desc',
    nodes_0_host: '#nodes_0_host',
    nodes_0_port: '#nodes_0_port',
    nodes_0_weight: '#nodes_0_weight',
    pluginCardBordered: '.ant-card-bordered',
    disabledSwitcher: '#disable',
    drawer: '.ant-drawer-content',
    checkedSwitcher: '.ant-switch-checked',
    monacoScroll: ".monaco-scrollable-element",
    monacoMode: "[data-cy='monaco-mode']",
    selectDropdown: '.ant-select-dropdown',
    selectJSON: '.ant-select-dropdown [label=JSON]',
    drawerFooter: '.ant-drawer-footer',
    notification: '.ant-notification-notice-message',
    nameSelector: '[title=Name]',
  };

  const data = {
    serviceName: 'test_service',
    description: 'desc_by_autotest',
    ip1: '127.0.0.1',
    basicAuthPlugin: 'basic-auth',
    createServiceSuccess: 'Create Service Successfully',
    ip2: '127.0.0.2',
    serviceName2: 'test_service2',
    description2: 'description2',
    editServiceSuccess: 'Configure Service Successfully',
    deleteServiceSuccess: 'Delete Service Successfully',
    port0: '7000',
    weight0: '1',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create service', function () {
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

    cy.contains(data.basicAuthPlugin)
      .parents(selector.pluginCardBordered)
      .within(() => {
        cy.get('button').click({ force: true });
      });

    cy.get(selector.drawer)
      .should('be.visible')
      .within(() => {
        cy.get(selector.disabledSwitcher).click();
        cy.get(selector.checkedSwitcher).should('exist');
      });

    cy.get(selector.monacoMode).click();
    cy.get(selector.selectDropdown).should('be.visible');
    cy.get(selector.selectJSON).click();
    cy.contains('button', 'Submit').click();
    cy.get(selector.drawer, { timeout }).should('not.exist');

    cy.contains(data.basicAuthPlugin)
      .parents(selector.pluginCardBordered)
      .within(() => {
        cy.get('button').click({ force: true });
      });

    cy.get(selector.drawerFooter).contains('button', 'Delete').click({ force: true });
    cy.contains('button', 'Confirm').click({ force: true });

    cy.contains(data.basicAuthPlugin)
      .parents(selector.pluginCardBordered)
      .within(() => {
        cy.get('button').click({ force: true });
      });

    cy.get(selector.drawerFooter).contains('button', 'Delete').should('not.exist');
    cy.contains('button', 'Cancel').click({ force: true });

    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(selector.notification).should('contain', data.createServiceSuccess);
  });

  it('should view the service', function () {
    cy.visit('/');
    cy.contains('Service').click();

    cy.get(selector.nameSelector).type(data.serviceName);
    cy.contains('Search').click();
    cy.contains(data.serviceName).siblings().contains('View').click();
    cy.get(selector.drawer).should('be.visible');

    cy.get(selector.monacoScroll).within(() => {
      cy.contains('upstream').should('exist');
      cy.contains(data.serviceName).should('exist');
    });
  });

  it('should edit the service', function () {
    cy.visit('/');
    cy.contains('Service').click();

    cy.get(selector.nameSelector).type(data.serviceName);
    cy.contains('Search').click();
    cy.contains(data.serviceName).siblings().contains('Configure').click();

    // Confirm whether the created data is saved.
    cy.get(selector.nodes_0_host).should('value', data.ip1);
    cy.get(selector.description).should('value', data.description);
    cy.get(selector.name).clear().type(data.serviceName2);
    cy.get(selector.description).clear().type(data.description2);
    cy.get(selector.nodes_0_host).click();
    cy.get(selector.nodes_0_host).clear().type(data.ip2);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(selector.notification).should('contain', data.editServiceSuccess);

    // test view
    cy.contains(data.serviceName2).siblings().contains('View').click();
    cy.get(selector.drawer).should('be.visible');

    cy.get(selector.monacoScroll).within(() => {
      cy.contains('upstream').should('exist');
      cy.contains(data.serviceName2).should('exist');
    });
  });

  it('should delete the service', function () {
    // Confirm whether the edited data is saved.
    cy.visit('/service/list');
    cy.get(selector.nameSelector).type(data.serviceName2);
    cy.contains('Search').click();
    cy.contains(data.serviceName2).siblings().contains('Configure').click();
    cy.get(selector.nodes_0_host).should('value', data.ip2);
    cy.get(selector.description).should('value', data.description2);

    cy.visit('/');
    cy.contains('Service').click();
    cy.contains(data.serviceName2).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(selector.notification).should('contain', data.deleteServiceSuccess);
  });
});
