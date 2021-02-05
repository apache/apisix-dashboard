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
  const data = {
    service_name1: 'service',
    service_name2: 'new service',
    desc1: 'desc',
    desc2: 'new desc',
    ip1: '12.12.12.12',
    ip2: '12.12.12.10',
    create_service_success: 'Create Service Successfully',
    edit_service_success: 'Edit Service Successfully',
    delete_service_success: 'Delete Service Successfully',
  };

  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
  });

  it('should create service', function () {
    cy.visit('/');
    cy.contains('Service').click();
    cy.contains('Create').click();

    cy.get(this.domSelector.name).type(data.service_name1);
    cy.get(this.domSelector.description).type(data.desc1);
    cy.get(this.domSelector.nodes_0_host).click();
    cy.get(this.domSelector.nodes_0_host).type(data.ip1);

    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(this.domSelector.notification).should('contain', data.create_service_success);
  });

  it('should edit the service', function () {
    cy.visit('/');
    cy.contains('Service').click();

    cy.get(this.domSelector.nameSelector).type(data.service_name1);
    cy.contains('Search').click();
    cy.contains(data.service_name1).siblings().contains('Edit').click();

    // Confirm whether the created data is saved.
    cy.get(this.domSelector.nodes_0_host).should('value', data.ip1);
    cy.get(this.domSelector.description).should('value', data.desc1)
    cy.get(this.domSelector.name).clear().type(data.service_name2);
    cy.get(this.domSelector.description).clear().type(data.desc2);
    cy.get(this.domSelector.nodes_0_host).click();
    cy.get(this.domSelector.nodes_0_host).clear().type(data.ip2);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(this.domSelector.notification).should('contain', data.edit_service_success);
  });

  it('should delete the service', function () {
    // Confirm whether the edited data is saved.
    cy.get(this.domSelector.nameSelector).type(data.service_name2);
    cy.contains('Search').click();
    cy.contains(data.service_name2).siblings().contains('Edit').click();
    cy.get(this.domSelector.nodes_0_host).should('value', data.ip2);
    cy.get(this.domSelector.description).should('value', data.desc2);

    cy.visit('/');
    cy.contains('Service').click();
    cy.contains(data.service_name2).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should('contain', data.delete_service_success);
  });
});
