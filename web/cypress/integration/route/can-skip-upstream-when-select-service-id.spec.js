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
    upstream_name: 'test_upstream',
    service_name: 'test_service',
    route_name: 'test_route',
    ip: '127.0.0.1',
    creat_upstream_success: 'Create Upstream Successfully',
    creat_service_success: 'Create Service Successfully',
    delete_service_success: 'Delete Service Successfully',
    delete_route_success: 'Delete Route Successfully',
    submit_success: 'Submit Successfully',
    delete_success: 'Delete Upstream Successfully',
  }

  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
  });

  it('should create test upstream and service', function () {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains('Create').click();

    cy.get(this.domSelector.name).type(data.upstream_name);
    cy.get(this.domSelector.nodes_0_host).type(data.ip);
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(this.domSelector.notification).should('contain', data.creat_upstream_success);
    cy.contains(data.creat_upstream_success);

    cy.visit('/');
    cy.contains('Service').click();
    cy.contains('Create').click();
    cy.get(this.domSelector.name).type(data.service_name);
    cy.get(this.domSelector.upstreamSelector).click();
    cy.contains(data.upstream_name).click();
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(this.domSelector.notification).should('contain', data.creat_service_success);
    cy.contains(data.creat_service_success);
  });

  it('should skip upstream module after service is selected when creating route', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.contains('Create').click();

    // The None option doesn't exist when service isn't selected
    cy.get(this.domSelector.name).type(data.route_name);
    cy.contains('Next').click();
    cy.get(this.domSelector.upstreamSelector).click();
    cy.contains('None').should('not.exist');

    cy.contains('Previous').click();
    cy.contains('None').click();
    cy.contains(data.service_name).click();
    cy.contains('Next').click();

    // make sure upstream data can be saved
    cy.get(this.domSelector.upstreamSelector).click();
    cy.contains(data.upstream_name).click();
    cy.get(this.domSelector.input).should('be.disabled');

    cy.contains(data.upstream_name).click();
    cy.contains('None').click();
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains('Goto List').click();
  });

  it('should skip upstream module after service is selected when editing route', function () {
    cy.visit('/');
    cy.contains('Route').click();

    cy.get(this.domSelector.nameSelector).type(data.route_name);
    cy.contains('Search').click();
    cy.contains(data.route_name).siblings().contains('Edit').click();
    cy.get(this.domSelector.serviceSelector).click();
    cy.contains('None').click();
    cy.contains('Next').click();
    cy.get(this.domSelector.upstream_id).click();
    cy.contains('None').should('not.exist');
    cy.contains(data.upstream_name).click();
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(data.submit_success);
  });

  it('should delete upstream, service and route', function () {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains(data.upstream_name).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should('contain', data.delete_success);

    cy.visit('/');
    cy.contains('Service').click();
    cy.contains(data.service_name).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should('contain', data.delete_service_success);

    cy.visit('/');
    cy.contains('Route').click();
    cy.contains(data.route_name).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should('contain', data.delete_route_success);
  });
});
