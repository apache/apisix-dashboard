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

context('Can select service_id skip upstream in route', () => {
  const data = {
    upstreamName: 'test_upstream',
    serviceName: 'test_service',
    routeName: 'test_route',
    ip: '127.0.0.1',
  }
  const domSelector = {
    name: '#name',
    nodes_0_host: '#nodes_0_host',
    upstream_id: '#upstream_id',
    input: ':input',
    customUpstream: '[title=Custom]',
    titleName: '[title=Name]',
    testService: '[title=test_service]',
    notification: '.ant-notification-notice-message',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create test upstream and service', () => {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains('Create').click();

    cy.get(domSelector.name).type(data.upstreamName);
    cy.get(domSelector.nodes_0_host).type(data.ip);
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(domSelector.notification).should('contain', 'Create Upstream Successfully');

    cy.visit('/');
    cy.contains('Service').click();
    cy.contains('Create').click();
    cy.get(domSelector.name).type(data.serviceName);
    cy.get(domSelector.customUpstream).click();
    cy.contains(data.upstreamName).click();
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(domSelector.notification).should('contain', 'Create Service Successfully');
  });

  it('should skip upstream module after service is selected when creating route', () => {
    cy.visit('/');
    cy.contains('Route').click();
    cy.contains('Create').click();

    // The None option doesn't exist when service isn't selected
    cy.get(domSelector.name).type(data.routeName);
    cy.contains('Next').click();
    cy.get(domSelector.customUpstream).click();
    cy.contains('None').should('not.exist');

    cy.contains('Previous').click();
    cy.contains('None').click();
    cy.contains(data.serviceName).click();
    cy.contains('Next').click();

    // make sure upstream data can be saved
    cy.get(domSelector.customUpstream).click();
    cy.contains(data.upstreamName).click();
    cy.get(domSelector.input).should('be.disabled');

    cy.contains(data.upstreamName).click();
    cy.contains('None').click();
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains('Goto List').click();
  });

  it('should skip Upstream module after service is selected when editing route', () => {
    cy.visit('/');
    cy.contains('Route').click();

    cy.get(domSelector.titleName).type(data.routeName);
    cy.contains('Search').click();
    cy.contains(data.routeName).siblings().contains('Edit').click();
    cy.get(domSelector.testService).click();
    cy.contains('None').click();
    cy.contains('Next').click();
    cy.get(domSelector.upstream_id).click();
    cy.contains('None').should('not.exist');
    cy.contains(data.upstreamName).click();
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains('Submit Successfully');
  });

  it('should delete upstream, service and route', () => {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains(data.upstreamName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(domSelector.notification).should('contain', 'Delete Upstream Successfully');

    cy.visit('/');
    cy.contains('Service').click();
    cy.contains(data.serviceName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(domSelector.notification).should('contain', 'Delete Service Successfully');

    cy.visit('/');
    cy.contains('Route').click();
    cy.contains(data.routeName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(domSelector.notification).should('contain', 'Delete Route Successfully');
  });
});

