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

  beforeEach(() => {
    // init login 
    cy.login();
  })

  it('create route', () => {
    //  go to route create page
    cy.visit('/');
    cy.contains('Route').click();
    cy.contains('Create').click();

    // input Name And Description
    cy.get('#name').type(name);
    cy.get('#desc').type('desc');

    // input Request Basic Define
    cy.get('#hosts_0').type('11.11.11.11');
    cy.get('[data-cy=addHost]').click();
    cy.get('#hosts_1').type('12.12.12.12');
    cy.get('#remote_addrs_0').type('12.12.12.12');
    cy.get('[data-cy=addRemoteAddr]').click();
    cy.get('#remote_addrs_1').type('10.10.10.10');
    cy.contains('Advanced Routing Matching Conditions').parent().siblings().contains('Create').click();

    // create Advanced Routing Matching Conditions 
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
    cy.get('#nodes_0_host').type('12.12.12.12')

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
    cy.contains('SubmitSuccessfully');

    // back to route list page
    cy.contains('Return Route List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('delete the route', () => {
    cy.visit('/routes/list');
    cy.get('[title=Name]').type(name);
    cy.contains('查 询').click();
    cy.contains(name).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get('.ant-notification-notice-message').should('contain', 'Delete Route Successfully');
  })
})
