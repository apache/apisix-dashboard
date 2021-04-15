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

context('Create and delete route with api-breaker form', () => {
  const selector = {
    break_response_code: '#break_response_code',
    alert: '.ant-form-item-explain-error [role=alert]'
  }

  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
  });

  it('should create route with api-breaker form', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.get(this.domSelector.empty).should('be.visible');
    cy.contains('Create').click();
    cy.contains('Next').click().click();
    cy.get(this.domSelector.name).type('routeName');
    cy.get(this.domSelector.description).type('desc');
    cy.contains('Next').click();

    cy.get(this.domSelector.nodes_0_host).type('127.0.0.1');
    cy.contains('Next').click();

    // config api-breaker plugin
    cy.contains('api-breaker').parents(this.domSelector.pluginCardBordered).within(() => {
      cy.get('button').click({
        force: true
      });
    });

    cy.get(this.domSelector.drawer).should('be.visible').within(() => {
      cy.get(this.domSelector.disabledSwitcher).click();
      cy.get(this.domSelector.checkedSwitcher).should('exist');
    });

    // config api-breaker form without break_response_code
    cy.get(selector.break_response_code).click();
    cy.get(selector.alert).contains('Please Enter break_response_code');
    cy.get(this.domSelector.drawer).within(() => {
      cy.contains('Submit').click({
        force: true,
      });
    });
    cy.get(this.domSelector.notification).should('contain', 'Invalid plugin data');
    cy.get(this.domSelector.notificationCloseIcon).click();

    // config api-breaker form with break_response_code
    cy.get(selector.break_response_code).type('200');
    cy.get(selector.alert).should('not.exist');
    cy.get(this.domSelector.disabledSwitcher).click();
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
    cy.get(domSelector.notificationCloseIcon).click();
  });
});
