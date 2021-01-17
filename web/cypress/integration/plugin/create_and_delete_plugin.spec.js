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

context('Create and Delete Plugin List', () => {
  const timeout = 50000;
  const domSelectors = {
    name: '[data-cy-plugin-name]',
    parents: '.ant-card-bordered',
    drawer: '.ant-drawer-content',
    switch: '#disable',
    tableCell: '.ant-table-cell',
    empty: '.ant-empty-normal',
  };

  beforeEach(() => {
    cy.login();

    cy.fixture('pluginList.json').as('cases');
  });

  it('should create plugin', () => {
    cy.visit('/');
    cy.contains('Plugin').click();
    cy.contains('Create').click();

    cy.get(domSelectors.name).then(function (cards) {
      [...cards].forEach((card) => {
        const name = card.innerText;
        const cases = this.cases[name] || [];

        cases.forEach(({ data }) => {
          cy.contains(name).parents(domSelectors.parents).within(() => {
            cy.contains('Enable').click({
              force: true,
            });
          });

          cy.get(domSelectors.drawer).within(() => {
            cy.get(domSelectors.switch).click({
              force: true,
              timeout,
            });
          });

          cy.window().then(({ codemirror }) => {
            if (codemirror) {
              codemirror.setValue(JSON.stringify(data));
            }
          });

          cy.get(domSelectors.drawer).within(() => {
            cy.contains('Submit').click({
              force: true,
              timeout,
            });
          });
        });
      });
    });
  });

  it('should deletd plugin list', () => {
    cy.visit('/');
    cy.contains('Plugin').click();

    cy.wait(500);
    cy.get(domSelectors.tableCell).then(function (rows) {
      [...rows].forEach((row) => {
        const name = row.innerText;
        const cases = this.cases[name] || [];

        cases.forEach(() => {
          cy.contains(name).siblings().contains('Delete').click();
          cy.contains('button', 'Confirm').click();
        });
      });
    });

    // check if plugin list is empty
    cy.get(domSelectors.empty);
  });
});
