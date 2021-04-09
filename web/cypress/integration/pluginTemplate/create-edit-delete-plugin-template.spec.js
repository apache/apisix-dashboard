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

context('Create Configure and Delete PluginTemplate', () => {
  const timeout = 5000;
  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
  });

  it('should create pluginTemplate', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.get(this.domSelector.empty).should('be.visible');
    cy.contains('Plugin Template Config').should('be.visible').click();
    cy.get(this.domSelector.empty).should('be.visible');
    cy.contains('Create').click();

    cy.get(this.domSelector.description).type(this.data.pluginTemplateName);
    cy.contains('Next').click();
    cy.contains('Enable').click({
      force: true
    });
    cy.focused(this.domSelector.drawer).should('exist');

    cy.get(this.domSelector.codeMirrorMode).click();
    cy.get(this.domSelector.selectDropdown).should('be.visible');
    cy.get(this.domSelector.selectJSON).click();
    cy.get(this.domSelector.disabledSwitcher).click({
      force: true,
    });

    cy.contains('Submit').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(this.domSelector.notification).should('contain', this.data.createPluginTemplateSuccess);
  });

  it('should edit the pluginTemplate', function () {
    cy.visit('plugin-template/list');
    cy.get(this.domSelector.refresh).click();
    cy.get(this.domSelector.descriptionSelector).type(this.data.pluginTemplateName);
    cy.contains('button', 'Search').click();
    cy.contains(this.data.pluginTemplateName).siblings().contains('Configure').click();

    cy.get(this.domSelector.description).clear().type(this.data.pluginTemplateName2);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();

    cy.get(this.domSelector.notification).should('contain', this.data.editPluginTemplateSuccess);
  });

  it('should delete pluginTemplate', function () {
    cy.visit('plugin-template/list');
    cy.get(this.domSelector.refresh).click();
    cy.get(this.domSelector.descriptionSelector).type(this.data.pluginTemplateName);
    cy.contains('button', 'Search').click();
    cy.get(this.domSelector.empty).should('exist');

    cy.contains('button', 'Reset').click();
    cy.get(this.domSelector.descriptionSelector).type(this.data.pluginTemplateName2);
    cy.contains('button', 'Search').click();
    cy.contains(this.data.pluginTemplateName2).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should('contain', this.data.deletePluginTemplateSuccess);
  });
});
