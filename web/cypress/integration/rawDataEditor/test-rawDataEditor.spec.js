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

  beforeEach(() => {
    cy.login();

    cy.fixture('rawDataEditor-dataset.json').as('dataset');
    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
  });

  it('should create and update with rawDataEditor', function () {
    const menuList = ['Route', 'Service', 'Upstream', 'Consumer'];
    const publicData = this.data;
    const dateset = this.dataset;
    const domSelector = this.domSelector;
    menuList.forEach(function (item) {
      cy.visit('/');
      cy.contains(item).click();
      cy.contains('Create with Editor').click();
      const data = dateset[item];

      // create with editor
      cy.window().then(({ codemirror }) => {
        if (codemirror) {
          codemirror.setValue(JSON.stringify(data));
        }
        cy.get(domSelector.drawer).should('exist');
        cy.get(domSelector.drawer, { timeout }).within(() => {
          cy.contains('Submit').click({
            force: true,
          });
          cy.get(domSelector.drawer).should('not.exist');
        });
      });

      cy.reload();
      // update with editor
      cy.contains(item === 'Consumer' ? data.username : data.name)
        .siblings()
        .contains('View')
        .click();

      cy.window().then(({ codemirror }) => {
        if (codemirror) {
          if (item === 'Consumer') {
            codemirror.setValue(JSON.stringify({ ...data, desc: 'newDesc' }));
          } else {
            codemirror.setValue(JSON.stringify({ ...data, name: 'newName' }));
          }
        }
        cy.get(domSelector.drawer).should('exist');
        cy.get(domSelector.drawer, { timeout }).within(() => {
          cy.contains('Submit').click({
            force: true,
          });
          cy.get(domSelector.drawer).should('not.exist');
        });
      });

      cy.reload();
      cy.get(domSelector.tableBody).should('contain', item === 'Consumer' ? 'newDesc' : 'newName');

      // delete resource
      cy.contains(item === 'Consumer' ? 'newDesc' : 'newName')
        .siblings()
        .contains('Delete')
        .click();
      cy.contains('button', 'Confirm').click();

      cy.get(domSelector.notification).should('contain', publicData[`delete${item}Success`]);
      cy.get(domSelector.notificationClose).should('be.visible').click({
        force: true,
        multiple: true,
      });
    });
  });
});
