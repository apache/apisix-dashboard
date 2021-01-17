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
  const domSelector = {
    input: ':input',
  };
  const data = {
    upstreamName: 'test_upstream',
    routeName: 'test_route',
    desc: 'desc_by_autotes',
    initialIp: '10.89.90.237',
    testIp: '127.0.0.1',
    verificationIp: '127.0.0.2',
    deleteRouteSuccess: 'Delete Route Successfully',
    deleteUpstreamSuccess: 'Delete successfully',
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
    cy.contains('Create').click();

    cy.get('#name').type(data.upstreamName);
    cy.get('#desc').type(data.desc);
    cy.get('#nodes_0_host').type(data.initialIp);
    cy.contains('Next').click();
    cy.contains('Submit').click();

    // go to route creat page
    cy.visit('/');
    cy.contains('Route').click();
    cy.contains('Create').click();

    cy.get('#name').type(data.routeName);
    cy.contains('Next').click();

    // select existed upstream_id will be disabled
    cy.contains('Custom').click();
    cy.contains(data.upstreamName).click();
    cy.get(domSelector.input).should('be.disabled');

    // select Custom upstream_id will not be disabled
    cy.contains(data.upstreamName).click();
    cy.contains('Custom').click();
    cy.get(domSelector.input).should('not.be.disabled');

    // change domain name/IP
    cy.get('#nodes_0_host').clear().type(data.testIp);
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
    cy.get('[title=Name]').type(data.routeName);
    cy.contains('Search').click();
    cy.contains(data.routeName).siblings().contains('Edit').click();
    cy.wait(1000);
    cy.contains('Next').click();

    // check if the changes have been saved
    cy.get('#nodes_0_host').should('value', data.testIp);

    // select existed upstream_id will be disabled
    cy.get('#upstream_id').click();
    cy.contains(data.upstreamName).click();
    cy.get(domSelector.input).should('be.disabled');

    // select Custom upstream_id will not be disabled
    cy.contains('test_upstream').click();
    cy.contains('Custom').click();
    cy.get(domSelector.input).should('not.be.disabled');

    // change domain name/IP
    cy.get('#nodes_0_host').clear().type(data.verificationIp);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');

    // check if the changes have been saved
    cy.get('[title=Name]').type(data.routeName);
    cy.contains('Search').click();
    cy.contains(data.routeName).siblings().contains('Edit').click();
    cy.contains('Next').click();
    cy.get('#nodes_0_host').should('value', data.verificationIp);
  });

  it('should delete this test route and upstream', () => {
    cy.visit('/routes/list');
    cy.get('[title=Name]').type(data.routeName);
    cy.contains('Search').click();
    cy.contains(data.routeName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(data.notification).should('contain', data.deleteRouteSuccess);

    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains(data.upstreamName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(data.notification).should('contain', data.deleteUpstreamSuccess);
  });
});
