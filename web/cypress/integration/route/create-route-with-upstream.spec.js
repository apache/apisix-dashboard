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

context('Create Route with Upstream', () => {
  const name = {
    upstream: 'test_upstream',
    route: 'test_route',
  };
  const domSelectors = {
    notification: '.ant-notification-notice-message',
  };

  beforeEach(() => {
    // init login
    cy.login();
  });

  it('should create route with upstream', () => {
    // create a test upstream
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.wait(1000);
    cy.contains('Create').click();

    cy.get('#name').type(name.upstream);
    cy.get('#desc').type('desc_by_autotest');
    cy.get('#nodes_0_host').type('10.89.90.237');
    cy.contains('Next').click();
    cy.contains('Submit').click();

    // go to route creat page
    cy.visit('/');
    cy.contains('Route').click();
    cy.wait(1000);
    cy.contains('Create').click();

    // input name and description
    cy.get('#name').type(name.route);
    cy.contains('Next').click();

    // select existed upstream_id will be disabled
    cy.get('[title=Custom]').click();
    cy.contains(name.upstream).click();
    cy.get(':input').should('be.disabled');
    cy.wait(1000);

    // select Custom upstream_id will not be disabled
    cy.get('[title=test_upstream]').click();
    cy.contains('Custom').click();
    cy.get(':input').should('not.be.disabled');

    // change domain name/IP
    cy.get('#nodes_0_host').clear().type('127.0.0.1');
    cy.wait(1000);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('should edit this route with upstream', () => {
    cy.visit('/');
    cy.contains('Route').click();

    // edit existed router
    cy.get('[title=Name]').type(name.route);
    cy.contains('Search').click();
    cy.wait(1000);
    cy.contains(name.route).siblings().contains('Edit').click();
    cy.wait(1000);
    cy.contains('Next').click();

    // check if the changes have been saved
    cy.get('#nodes_0_host').should('value', '127.0.0.1');

    // select existed upstream_id will be disabled
    cy.get('#upstream_id').click();
    cy.contains(name.upstream).click();
    cy.get(':input').should('be.disabled');
    cy.wait(1000);

    // select Custom upstream_id will not be disabled
    cy.get('[title=test_upstream]').click();
    cy.contains('Custom').click();
    cy.get(':input').should('not.be.disabled');

    // change domain name/IP
    cy.get('#nodes_0_host').clear().type('127.0.0.2');
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');

    // check if the changes have been saved
    cy.get('[title=Name]').type(name.route);
    cy.contains('Search').click();
    cy.wait(1000);
    cy.contains(name.route).siblings().contains('Edit').click();
    cy.wait(1000);
    cy.contains('Next').click();
    cy.get('#nodes_0_host').should('value', '127.0.0.2');
  });

  it('should delete ths test route and upstream', () => {
    cy.visit('/routes/list');
    cy.get('[title=Name]').type(name.route);
    cy.contains('Search').click();
    cy.contains(name.route).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get('.ant-notification-notice-message').should('contain', 'Delete Route Successfully');

    cy.visit('/');
    cy.contains('Upstream').click();
    cy.wait(1000);
    cy.contains(name.upstream).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(domSelectors.notification).should('contain', 'Delete successfully');
  });
});
