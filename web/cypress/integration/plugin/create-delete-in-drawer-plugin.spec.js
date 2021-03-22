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

context('Delete Plugin List with the Drawer', () => {
  const timeout = 5000;

  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
  });

  it('should visit plugin market and create plugin', function () {
    cy.visit('/');
    cy.contains('Plugin').click();
    cy.contains('Create').click();

    cy.contains(this.data.basicAuthPlugin).parents(this.domSelector.pluginCardBordered).within(() => {
      cy.get('button').click({ force: true });
    });

    cy.get(this.domSelector.drawer).should('be.visible').within(() => {
      cy.get(this.domSelector.disabledSwitcher).click();
      cy.get(this.domSelector.checkedSwitcher).should('exist');
    });

    cy.contains('button', 'Submit').click();
    cy.get(this.domSelector.drawer, { timeout }).should('not.exist');
  });

  it('should delete the plugin with the drawer', function () {
    cy.visit('/plugin/list');
    cy.get(this.domSelector.refresh).click();
    cy.contains('button', 'Edit').click();
    cy.get(this.domSelector.drawerFooter).contains('button', 'Delete').click({ force: true });
    cy.contains('button', 'Confirm').click({ force: true });
    cy.get(this.domSelector.empty).should('be.visible');
  });
});
