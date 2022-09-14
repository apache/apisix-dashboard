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

context('Create and delete route with plugin orchestration', () => {
  const selector = {
    empty: '.ant-empty-normal',
    name: '#name',
    description: '#desc',
    nodes_0_host: '#submitNodes_0_host',
    nodes_0_port: '#submitNodes_0_port',
    nodes_0_weight: '#submitNodes_0_weight',
    groupButton: '.ant-radio-group',
    canvas: '.x6-graph-svg',
    startNode:
      '#stencil > div > div.x6-widget-stencil-content > div:nth-child(1) > div > div > svg > g > g.x6-graph-svg-stage > g:nth-child(1) > g > circle',
    notification: '.ant-notification-notice-message',
    notificationClose: '.anticon-close',
    nodeInput: '.x6-widget-stencil input[type="search"]',
    hiddenGroup: '.x6-widget-stencil-group.unmatched',
    canvasNode: '#container > svg > g > g.x6-graph-svg-stage > g:nth-child(2) > rect',
    canvasContainer: '#container',
    drawer: '.ant-drawer-content',
    deleteAlert: '.ant-modal-body',
    monacoScroll: '.monaco-scrollable-element',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create route with plugin orchestration', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.get(selector.empty).should('be.visible');
    cy.contains('Create').click();
    cy.contains('Next').click().click();
    cy.get(selector.name).type('routeName');
    cy.get(selector.description).type('desc');
    cy.contains('Next').click();

    cy.get(selector.nodes_0_host).type('127.0.0.1');
    cy.get(selector.nodes_0_port).clear().type('80');
    cy.get(selector.nodes_0_weight).clear().type('1');
    cy.contains('Next').click();

    cy.get(selector.groupButton).contains('Orchestration').click();
    cy.get(selector.canvas).should('be.visible');

    // Plugin Orchestration
    cy.get(selector.startNode).move({ x: 400, y: 0, force: true, position: 'center' });
    cy.contains('Next').click();
    cy.get(selector.notification).should('contain', 'Root node not found');
    cy.get(selector.notificationClose).click().should('not.be.visible');

    cy.get(selector.nodeInput).type('key-auth');
    cy.get(selector.hiddenGroup).should('not.be.visible');
    cy.contains('key-auth').move({ x: 300, y: 0, force: true, position: 'center' });
    cy.contains('Next').click();
    cy.get(selector.notification).should('contain', 'Root node not found');
    cy.get(selector.notificationClose).click().should('not.be.visible');

    // Linking nodes
    cy.get(selector.canvasNode)
      .click()
      .then(() => {
        const node1 = cy
          .get('#container > svg > g > g.x6-graph-svg-stage > g:nth-child(1) > g > circle')
          .eq(0);
        node1
          .trigger('mousedown')
          .trigger('mousemove', { x: 0, y: 150, force: true })
          .trigger('mouseup', { force: true });
      });

    cy.contains('Next').click();
    cy.get(selector.notification).should('contain', 'Found node without configuration');
    cy.get(selector.notificationClose).click().should('not.be.visible');

    // Configuration plugins and submit
    cy.get(selector.canvasContainer)
      .click()
      .within(() => {
        cy.contains('key-auth').dblclick();
      });
    cy.contains('Submit').click();
    cy.get(selector.drawer).should('not.exist');
    cy.contains('Next').click();
    cy.contains('Submit').click();

    cy.contains('Submit Successfully');
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('should view and delete the route', function () {
    cy.visit('/routes/list');
    cy.contains('routeName').siblings().contains('More').click();
    cy.contains('View').click();
    cy.get(selector.monacoScroll).within(() => {
      cy.contains('script').should('exist');
    });
    cy.contains('Cancel').click();

    // Delete the route
    cy.contains('routeName').siblings().contains('More').click();
    cy.contains('Delete').click();
    cy.get(selector.deleteAlert)
      .should('be.visible')
      .within(() => {
        cy.contains('OK').click();
      });
    cy.get(selector.notification).should('contain', 'Delete Route Successfully');
  });
});
