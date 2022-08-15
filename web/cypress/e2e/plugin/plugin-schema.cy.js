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
/* eslint-disable */

describe('Plugin Schema Test', () => {
  const timeout = 5000;
  const cases = require('../../fixtures/plugin-dataset.json');
  const pluginList = Object.keys(cases);
  const casesList = Object.values(cases);

  before(() => {
    cy.clearLocalStorageSnapshot();
    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
    cy.login();
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  it('should visit plugin market', function () {
    cy.visit('/');
    cy.get('#root > div > section > aside > div > div:nth-child(1) > ul')
      .contains('Plugin')
      .click();
    cy.get('#ant-design-pro-table > div > div > div.ant-pro-table-list-toolbar')
      .contains('Enable')
      .click();
    cy.url().should('include', '/plugin/market');
  });

  describe('Test plugin cases', () => {
    let globalPluginNames;
    before(function () {
      cy.fixture('selector.json').as('domSelector');
      cy.fixture('data.json').as('data');

      cy.login();
      cy.visit('/plugin/market');
      cy.saveLocalStorage();

      cy.get('main.ant-layout-content', { timeout })
        .find('div.ant-card-head span', { timeout })
        .then((cards) => Array.from(cards).map((card) => card.innerText))
        .then((pluginNames) => {
          globalPluginNames = pluginNames;
        });
    });

    beforeEach(() => {
      cy.restoreLocalStorage();
    });

    pluginList
      .slice(0, 4)
      .map((name, i) => ({ name, cases: casesList[i].filter((v) => v.type !== 'consumer') }))
      .filter(({ cases }) => cases !== undefined || cases.length <= 0)
      .forEach(({ name, cases }, i) => {
        it(`${name} plugin #${i + 1} case`, function () {
          if (globalPluginNames.includes(name)) {
            cy.configurePlugin({ name, cases });
          } else {
            cy.log('non global plugin, skipping');
          }
        });
      });

    it('should edit the plugin', function () {
      cy.visit('/plugin/list');

      cy.get(this.domSelector.refresh).click();
      cy.contains('Configure').click();
      cy.get(this.domSelector.monacoScroll).should('exist');
      cy.get(this.domSelector.disabledSwitcher).click();
      cy.contains('button', 'Submit').click();
    });

    it('should delete plugin list', function () {
      cy.visit('/plugin/list');
      cy.get(this.domSelector.refresh).click();
      cy.get(this.domSelector.paginationOptions).click();
      cy.contains('50 / page').should('be.visible').click();
      cy.get(this.domSelector.fiftyPerPage).should('exist');
      cy.location('href').should('include', 'pageSize=50');

      cy.get(this.domSelector.deleteButton, { timeout })
        .should('exist')
        .each(function ($el) {
          cy.wrap($el).click().click({ timeout });
          cy.contains('button', 'Confirm').click({ force: true });
          cy.get(this.domSelector.notification).should('contain', this.data.deletePluginSuccess);
          cy.get(this.domSelector.notificationCloseIcon).click().should('not.exist');
        });

      // check if plugin list is empty
      cy.get(this.domSelector.empty).should('be.visible');
    });
  });
});
