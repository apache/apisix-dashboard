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

context('settings page smoke test', () => {
  const data = {
    invalidURL: 'httx://www.test.com',
    validURL: 'http://localhost:8000/routes/list',
    fetchURL: 'fetchURL',
    fetch: '@fetchURL',
  }

  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
  });

  it('should visit settings page', function () {
    cy.visit('/');
    cy.get(this.domSelector.avatar).invoke('show').click('center');
    cy.contains('Settings').click();
    cy.url().should('contains', '/settings');
    cy.get(this.domSelector.pageContainer)
      .children()
      .should('contain', 'Setting')
      .and('contain', this.data.grafanaAddress)
      .and('contain', this.data.grafanaExplanation1);
  });

  it('should set a invalid url', function () {
    cy.visit('/');
    cy.get(this.domSelector.avatar).invoke('show').click('center');
    cy.contains('Settings').click();
    cy.url().should('contains', '/settings');
    cy.get(this.domSelector.grafanaURL).clear().type(data.invalidURL);
    cy.get(this.domSelector.explain).should('contain', this.data.grafanaExplanation2);
  });

  it('should set a accessible URL', function () {
    cy.visit('/');
    cy.get(this.domSelector.avatar).invoke('show').click('center');
    cy.contains('Settings').click();
    cy.url().should('contains', '/settings');
    cy.get(this.domSelector.grafanaURL).clear().type(data.validURL);
    cy.contains('Submit').click();

    cy.get(this.domSelector.notificationMessage).should('contain', this.data.updateSuccessfully);
    cy.intercept(data.validURL).as(data.fetchURL);
    cy.wait(data.fetch);
    cy.get(this.domSelector.pageContainer).children().should('contain', 'Metrics');
  });
});
