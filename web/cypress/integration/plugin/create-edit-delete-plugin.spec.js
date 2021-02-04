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
  const data = {
    name: 'hmac-auth',
    deleteSuccess: 'Delete Plugin Successfully',
  };
  const domSelector = {
    tableCell: '.ant-table-cell',
    empty: '.ant-empty-normal',
    refresh: '.anticon-reload',
    codemirror: '.CodeMirror',
    switch: '#disable',
    deleteBtn: '.ant-btn-dangerous',
  };

  beforeEach(() => {
    cy.login();

    cy.fixture('plugin-list.json').as('cases');
    cy.fixture('selector.json').as('domSelector');
  });

  it('should create plugins', function () {
    cy.visit('/');
    cy.contains('Plugin').click();
    cy.contains('Create').click();

    // add test plugins
    cy.get('@cases').then((cases) => {
      cy.configurePlugins(cases);
    });
  });

  it('should edit the plugin', () => {
    cy.visit('/plugin/list');
    cy.get(domSelector.refresh).click();
    cy.contains(data.name).should('exist').siblings().contains('Edit').click({
      force: true,
    });
    cy.get(domSelector.codemirror)
      .first()
      .then(() => {
        cy.get(domSelector.switch).click();
        cy.contains('button', 'Submit').click();
      });
    cy.contains(data.name).should('not.exist');
  });

  it('should delete plugin list', () => {
    cy.visit('/plugin/list');

    cy.get(domSelector.deleteBtn, { timeout }).each(function ($el) {
      cy.wrap($el).click().click({ timeout });
      cy.contains('button', 'Confirm').click({ force: true });
      cy.get(this.domSelector.notification).should('contain', data.deleteSuccess);
      cy.get(this.domSelector.notificationCloseIcon).click();
    });

    // check if plugin list is empty
    cy.get(domSelector.empty).should('be.visible');
  });
});
