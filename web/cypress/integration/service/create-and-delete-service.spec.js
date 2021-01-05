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

context('create and delete service ', () => {

  beforeEach(() => {
    // init login
    cy.login();
  });

  it('should create service', () => {

    // go to create service page
    cy.visit('/');
    cy.contains('Service').click();
    cy.contains('Create').click();

    cy.get('#name').type('service');
    cy.get('#desc').type('desc');
    cy.get('#nodes_0_host').click();
    cy.get('#nodes_0_host').type('12.12.12.12');

    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
  })

  it('should delete the service', () => {
    cy.visit('/');
    cy.contains('Service').click();

    cy.get('[title=Name]').type('service');
    cy.contains('Search').click();
    
    cy.contains('service').siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.fixture('selector.json').then(({
      notification
    }) => {
      cy.get(notification).should('contain', 'Delete Service Successfully');
    });
  });
});
