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

context('Create PluginTemplate Binding To Route', () => {
  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
  });

  it('should create test pluginTemplate', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.contains('Plugin Template Config').click();
    cy.contains('Create').click();
    cy.get('#desc').type('test_plugin_template1');
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(this.domSelector.notification).should('contain', 'Create Plugin Template Successfully');

    cy.visit('routes/list');
    cy.contains('Create').click();
    cy.get('#name').type('test_route');
    cy.contains('Next').click();
    cy.get('#nodes_0_host').type('127.0.0.1');
    cy.contains('Next').click();
    cy.get('[title=Custom]').click();
    cy.contains('test_plugin_template1').click();

    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(this.data.submitSuccess);
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('should delete the pluginTemplate failure', function () {
    cy.visit('pluginTemplate/list');
    cy.get(this.domSelector.refresh).click();

    cy.get('[title=Description]').type('test_plugin_template1');
    cy.contains('button', 'Search').click();
    cy.contains('test_plugin_template1').siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should('contain', 'Request Error Code: 10000');
    cy.get('.anticon-close').should('be.visible').click();
  });

  it('should edit the route with pluginTemplate', function () {
    cy.visit('routes/list');

    cy.get(this.domSelector.nameSelector).type('test_route');
    cy.contains('Search').click();
    cy.contains('test_route').siblings().contains('Edit').click();

    cy.contains('Forbidden').click();
    cy.contains('Custom').click();
    cy.get('#redirectURI').clear().type('123');
    cy.get('#ret_code').click();
    cy.contains('301(Permanent Redirect)').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(this.data.submitSuccess);
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('should delete the pluginTemplate successfully', function () {
    cy.visit('pluginTemplate/list');

    cy.get(this.domSelector.refresh).click();
    cy.get('[title=Description]').type('test_plugin_template1');
    cy.contains('button', 'Search').click();
    cy.contains('test_plugin_template1').siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should('contain', 'Delete Plugin Template Successfully');

    cy.visit('/routes/list');
    cy.get(this.domSelector.nameSelector).type('test_route');
    cy.contains('Search').click();
    cy.contains('test_route').siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should('contain', this.data.deleteRouteSuccess);
  });
});
