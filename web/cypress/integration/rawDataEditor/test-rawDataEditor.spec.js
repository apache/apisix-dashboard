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

context('Test RawDataEditor', () => {
  const timeout = 1000;

  const selector = {
    notificationClose: '.anticon-close',
    tableBody: '.ant-table-tbody',
    drawer: '.ant-drawer-content',
    notification: '.ant-notification-notice-message',
  };

  const data = {
    deleteRouteSuccess: 'Delete Route Successfully',
    deleteServiceSuccess: 'Delete Service Successfully',
    deletePluginSuccess: 'Delete Plugin Successfully',
    deleteUpstreamSuccess: 'Delete Upstream Successfully',
    deleteConsumerSuccess: 'Delete Consumer Successfully',
  };

  beforeEach(() => {
    cy.login();
    cy.fixture('rawDataEditor-dataset.json').as('dataset');
  });

  it('should create and update with rawDataEditor', function () {
    const menuList = ['Route', 'Service', 'Upstream', 'Consumer'];
    const dataset = this.dataset;
    menuList.forEach(function (item) {
      cy.visit('/');
      cy.contains(item).click();
      cy.get('.anticon-reload').click();
      if (item === 'Route') {
        cy.contains('Advanced').should('be.visible').click({ force: true });
        cy.contains('Raw Data Editor').should('be.visible').click();
      } else {
        cy.contains('Raw Data Editor').should('be.visible').click();
      }

      const dataSetItem = dataset[item];

      cy.window().then(({ codemirror }) => {
        if (codemirror) {
          codemirror.setValue(JSON.stringify(dataSetItem));
        }
        cy.get(selector.drawer).should('exist');
        cy.get(selector.drawer, { timeout }).within(() => {
          cy.contains('Submit').click({
            force: true,
          });
          cy.get(selector.drawer).should('not.exist');
        });
      });

      cy.reload();
      if (item === 'Route') {
        // update with editor
        cy.contains(item === 'Consumer' ? dataSetItem.username : dataSetItem.name)
          .siblings()
          .contains('More')
          .click();

        cy.contains('View').should('be.visible').click({ force: true });
      } else {
        // update with editor
        cy.contains(item === 'Consumer' ? dataSetItem.username : dataSetItem.name)
          .siblings()
          .contains('View')
          .click();
      }

      cy.window().then(({ codemirror }) => {
        if (codemirror) {
          if (item === 'Consumer') {
            codemirror.setValue(JSON.stringify({ ...dataSetItem, desc: 'newDesc' }));
          } else {
            codemirror.setValue(JSON.stringify({ ...dataSetItem, name: 'newName' }));
          }
        }
        cy.get(selector.drawer).should('exist');
        cy.get(selector.drawer, { timeout }).within(() => {
          cy.contains('Submit').click({
            force: true,
          });
          cy.get(selector.drawer).should('not.exist');
        });
      });

      if (item === 'Route') {
        cy.reload();
        cy.get(selector.tableBody).should('contain', item === 'Consumer' ? 'newDesc' : 'newName');

        cy.contains(item === 'Consumer' ? 'newDesc' : 'newName')
          .siblings()
          .contains('More')
          .click();

        cy.contains('Delete').should('be.visible').click();
        cy.get('.ant-modal-content')
          .should('be.visible')
          .within(() => {
            cy.contains('OK').click();
          });
      } else {
        cy.reload();
        cy.get(selector.tableBody).should('contain', item === 'Consumer' ? 'newDesc' : 'newName');

        cy.contains(item === 'Consumer' ? 'newDesc' : 'newName')
          .siblings()
          .contains('Delete')
          .click();
        cy.contains('button', 'Confirm').click();
      }

      cy.get(selector.notification).should('contain', data[`delete${item}Success`]);
      cy.get(selector.notificationClose).should('be.visible').click({
        force: true,
        multiple: true,
      });
    });
  });
});
