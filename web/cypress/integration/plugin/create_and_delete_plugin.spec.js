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
  const timeout = 5000;
  const domSelectors = {
    tableCell: '.ant-table-cell',
    empty: '.ant-empty-normal',
    refresh: '.anticon-reload',
  };

  beforeEach(() => {
    cy.login();

    cy.fixture('plugin-list.json').as('cases');
  });

  it('should create plugins', function () {
    cy.visit('/');
    cy.contains('Plugin').click();
    cy.contains('Create').click();

    // add test plugins
    cy.configurePlugins(this.cases);
  });

  it('should delete plugin list', () => {
    cy.visit('/');
    cy.contains('Plugin').click();
    cy.get(domSelectors.refresh).click();
    cy.get(domSelectors.tableCell).then(function (rows) {
      [...rows].forEach((row) => {
        const name = row.innerText;
        const cases = this.cases[name] || [];

        cases.forEach(() => {
          cy.contains(name).siblings().contains('Delete').click({ timeout });
          cy.contains('button', 'Confirm').click();
        });
      });
    });

    // check if plugin list is empty
    cy.get(domSelectors.empty);
  });
});
