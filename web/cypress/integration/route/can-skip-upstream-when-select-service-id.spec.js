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
  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
  });

  it('should create test upstream and service', function () {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains('Create').click();

    cy.get(this.domSelector.name).type(this.data.upstreamName);
    cy.get(this.domSelector.nodes_0_host).type(this.data.ip1);
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(this.domSelector.notification).should('contain', this.data.createUpstreamSuccess);
    cy.contains(this.data.createUpstreamSuccess);

    cy.visit('/');
    cy.contains('Service').click();
    cy.contains('Create').click();
    cy.get(this.domSelector.name).type(this.data.serviceName);
    cy.get(this.domSelector.upstreamSelector).click();
    cy.contains(this.data.upstreamName).click();
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(this.domSelector.notification).should('contain', this.data.createServiceSuccess);
    cy.contains(this.data.createServiceSuccess);
  });

  it('should skip upstream module after service is selected when creating route', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.contains('Create').click();

    // The None option doesn't exist when service isn't selected
    cy.get(this.domSelector.name).type(this.data.routeName);
    cy.contains('Next').click();
    cy.get(this.domSelector.upstreamSelector).click();
    cy.contains('None').should('not.exist');

    cy.contains('Previous').click();
    cy.contains('None').click();
    cy.contains(this.data.serviceName).click();
    cy.contains('Next').click();

    // make sure upstream data can be saved
    cy.get(this.domSelector.upstreamSelector).click();
    cy.contains(this.data.upstreamName).click();
    cy.get(this.domSelector.input).should('be.disabled');

    cy.contains(this.data.upstreamName).click();
    cy.contains('None').click();
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains('Goto List').click();
  });

  it('should skip upstream module after service is selected when editing route', function () {
    cy.visit('/');
    cy.contains('Route').click();

    cy.get(this.domSelector.nameSelector).type(this.data.routeName);
    cy.contains('Search').click();
    cy.contains(this.data.routeName).siblings().contains('Edit').click();
    cy.get(this.domSelector.serviceSelector).click();
    cy.contains('None').click();
    cy.contains('Next').click();
    cy.get(this.domSelector.upstream_id).click();
    cy.contains('None').should('not.exist');
    cy.contains(this.data.upstreamName).click();
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(this.data.submitSuccess);
  });

  it('should delete upstream, service and route', function () {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains(this.data.upstreamName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should('contain', this.data.deleteUpstreamSuccess);

    cy.visit('/');
    cy.contains('Service').click();
    cy.contains(this.data.serviceName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should('contain', this.data.deleteServiceSuccess);

    cy.visit('/');
    cy.contains('Route').click();
    cy.contains(this.data.routeName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should('contain', this.data.deleteRouteSuccess);
  });
});
