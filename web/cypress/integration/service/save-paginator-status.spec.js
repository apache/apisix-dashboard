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

context('Save Paginator Status', () => {
  const timeout = 300;
  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
  });

  it('should create test service', function () {
    cy.visit('/');
    cy.contains('Service').click();

    for (let i = 0; i <= 10; i++) {
      cy.contains('Create').click();
      cy.get(this.domSelector.name).type(`${this.data.serviceName}&${i}`);
      cy.get(this.domSelector.nodes_0_host).click();
      cy.get(this.domSelector.nodes_0_host).type(this.data.ip1);
      cy.contains('Next').click();
      cy.contains('Next').click();
      cy.contains('Submit').click();
      cy.get(this.domSelector.notification).should('contain', this.data.createServiceSuccess);
      cy.get(this.domSelector.notificationCloseIcon).should('be.visible').click();
    }
    cy.get('.ant-table-pagination-right').should('be.visible');
  });

  it('should save paginator status', function () {
    cy.visit('/');
    cy.contains('Service').click();

    // Test page status
    cy.get('.ant-table-pagination-right').should('be.visible');
    cy.get('.ant-pagination-item-2').click();
    cy.get('.ant-pagination-item-2.ant-pagination-item-active').should('exist');
    cy.location('href').should('include', 'page=2');

    cy.reload();
    cy.get('.ant-pagination-item-2.ant-pagination-item-active').should('exist');
    cy.location('href').should('include', 'page=2');

    // Test pageSize status
    cy.get('.ant-pagination-options').click();
    cy.contains('20 / page').should('be.visible').click();
    cy.get('[title="20 / page"]').should('exist');
    cy.location('href').should('include', 'pageSize=20');

    cy.reload();
    cy.get('[title="20 / page"]').should('exist');
    cy.location('href').should('include', 'pageSize=20');
  });

  it('should delete test service', function () {
    cy.visit('/service/list?page=1&pageSize=20');
    cy.reload();
    cy.contains('Service List').should('be.visible');
    cy.get(this.domSelector.deleteButton, { timeout: 300 })
      .should('exist')
      .each(function ($el) {
        cy.wrap($el).click().click({ timeout });
        cy.contains('button', 'Confirm').click({ force: true });
        cy.get(this.domSelector.notification).should('contain', this.data.deleteServiceSuccess);
        cy.get(this.domSelector.notificationCloseIcon).click().should('not.exist');
      });
  });
});
