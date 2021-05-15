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

context('Create and delete route with cors form', () => {
  const selector = {
    allow_credential: "#allow_credential",
    allow_origins_by_regex0: "#allow_origins_by_regex_0",
    allow_origins_by_regex1: "#allow_origins_by_regex_1",
    addButton: "[data-cy=add-allow_origins_by_regex]",
  }

  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
  });

  it('should create route with cors form', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.get(this.domSelector.empty).should('be.visible');
    cy.contains('Create').click();
    cy.contains('Next').click().click();
    cy.get(this.domSelector.name).type('routeName');
    cy.get(this.domSelector.description).type('desc');
    cy.contains('Next').click();

    cy.get(this.domSelector.nodes_0_host).type('127.0.0.1');
    cy.get(this.domSelector.nodes_0_port).clear().type(this.data.port);
    cy.get(this.domSelector.nodes_0_weight).clear().type(this.data.weight);
    cy.contains('Next').click();

    // config cors plugin
    cy.contains('cors').parents(this.domSelector.pluginCardBordered).within(() => {
      cy.get('button').click({
        force: true
      });
    });

    cy.get(this.domSelector.drawer).should('be.visible').within(() => {
      cy.get(this.domSelector.disabledSwitcher).click();
      cy.get(this.domSelector.checkedSwitcher).should('exist');
    });

    // config cors form
    cy.get(selector.allow_credential).click();
    cy.get(selector.allow_origins_by_regex0).type('.*.test.com');
    // add allow_origins_by_regex, assert new input and minus icons exist
    cy.get(selector.addButton).click();
    cy.get(selector.allow_origins_by_regex1).should('exist');
    cy.get(selector.allow_origins_by_regex0).next().should('have.class', 'anticon-minus-circle');
    cy.get(selector.allow_origins_by_regex1).type('foo.com').next().should('have.class', 'anticon-minus-circle');

    cy.get(this.domSelector.drawer).within(() => {
      cy.contains('Submit').click({
        force: true,
      });
    });
    cy.get(this.domSelector.drawer).should('not.exist');

    cy.contains('button', 'Next').click();
    cy.contains('button', 'Submit').click();
    cy.contains(this.data.submitSuccess);

    // back to route list page
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('should edit route with cors form no allow_origins_by_regex configured', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.get(this.domSelector.name).clear().type('routeName');
    cy.contains('Search').click();
    cy.contains('routeName').siblings().contains('Configure').click();
    cy.get(this.domSelector.name).should('have.value','routeName');
    cy.contains('Next').click();
    cy.contains('Next').click();

    // config cors plugin
    cy.contains('cors').parents(this.domSelector.pluginCardBordered).within(() => {
      cy.get('button').click({
        force: true
      });
    });

    cy.get(this.domSelector.drawer).should('be.visible').within(() => {
      cy.get(this.domSelector.disabledSwitcher).click();
      cy.get(this.domSelector.checkedSwitcher).should('exist');
    });

    // edit allow_origins_by_regex ''
    cy.get(selector.allow_origins_by_regex0).clear();
    cy.get(selector.allow_origins_by_regex1).next().click();
    cy.get(this.domSelector.drawer).within(() => {
      cy.contains('Submit').click({
        force: true,
      });
    });
    cy.get(this.domSelector.drawer).should('not.exist');

    cy.contains('button', 'Next').click();
    cy.contains('button', 'Submit').click();
    cy.contains(this.data.submitSuccess);

    // back to route list page
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('should delete the route', function () {
    cy.visit('/routes/list');
    const {
      domSelector,
      data
    } = this;

    cy.get(domSelector.name).clear().type('routeName');
    cy.contains('Search').click();
    cy.contains('routeName').siblings().contains('More').click();
    cy.contains('Delete').click();
    cy.get(domSelector.deleteAlert).should('be.visible').within(() => {
      cy.contains('OK').click();
    });
    cy.get(domSelector.notification).should('contain', data.deleteRouteSuccess);
    cy.get(domSelector.notificationCloseIcon).click({ multiple: true});
  });
});
