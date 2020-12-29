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

context('Create and Delete Route', () => {
  const name = `routeName${new Date().valueOf()}`;
  const newName = `newName${new Date().valueOf()}`;
  const sleepTime = 100;

  beforeEach(() => {
    // init login
    cy.login();
  });

  it('should create route', () => {
    //  go to route create page
    cy.visit('/');
    cy.contains('Route').click();
    cy.contains('Create').click();

    // input name and description
    cy.get('#name').type(name);
    cy.get('#desc').type('desc');

    // input request basic define
    cy.get('#hosts_0').type('11.11.11.11');
    cy.get('[data-cy=addHost]').click();
    cy.get('#hosts_1').type('12.12.12.12');
    cy.get('#remote_addrs_0').type('12.12.12.12');
    cy.get('[data-cy=addRemoteAddr]').click();
    cy.get('#remote_addrs_1').type('10.10.10.10');
    cy.contains('Advanced Routing Matching Conditions')
      .parent()
      .siblings()
      .contains('Create')
      .click();

    // create advanced routing matching conditions
    cy.get('#position').click();
    cy.contains('Cookie').click();
    cy.get('.ant-modal').within(() => {
      cy.get('#name').type('modalName');
    });
    cy.get('#operator').click();
    cy.contains('Equal').click();
    cy.get('#value').type('value');
    cy.contains('Confirm').click();

    // go to step2
    cy.contains('Next').click();
    cy.wait(sleepTime * 3);
    cy.get('#nodes_0_host').type('12.12.12.12');

    // go to step3
    cy.contains('Next').click();

    // config prometheus plugin
    cy.contains('.ant-card', 'prometheus').within(() => {
      cy.get('button').first().click();
    });
    cy.contains('button', 'Cancel').click();

    // go to step4
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains('Submit Successfully');

    // back to route list page
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('should edit the route', () => {
    cy.visit('/');
    cy.contains('Route').click();

    cy.get('[title=Name]').type(name);
    cy.contains('Search').click();
    cy.wait(1000);
    cy.contains(name).siblings().contains('Edit').click();

    cy.get('#name').clear().type(newName);
    cy.get('#desc').clear().type('new desc');
    cy.contains('Next').click();
    cy.wait(1000);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains('Submit Successfully');
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
    cy.contains(newName).siblings().should('contain', 'new desc');
  });

  it('should delete the route', () => {
    cy.visit('/routes/list');
    cy.get('[title=Name]').type(newName);
    cy.contains('Search').click();
    cy.contains(newName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get('.ant-notification-notice-message').should('contain', 'Delete Route Successfully');
  });
});
