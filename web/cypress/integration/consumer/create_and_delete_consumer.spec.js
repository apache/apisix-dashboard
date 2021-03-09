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

context('Create and Delete Consumer', () => {
  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
  });

  it('creates consumer with key-auth', function () {
    cy.visit('/');
    cy.contains('Consumer').click();
    cy.contains('Create').click();

    // basic information
    cy.get(this.domSelector.username).type(this.data.consumerName);
    cy.get(this.domSelector.description).type(this.data.description);
    cy.contains('Next').click();

    // plugin config
    cy.contains(this.domSelector.pluginCard, 'key-auth').within(() => {
      cy.get('button').click({
        force: true
      });
    });

    cy.get(this.domSelector.disabledSwitcher).click();
    // edit codemirror
    cy.get(this.domSelector.codeMirror)
      .first()
      .then((editor) => {
        editor[0].CodeMirror.setValue(
          JSON.stringify({
            key: 'test',
          }),
        );
        cy.contains('button', 'Submit').click();
      });
    cy.contains('button', 'Next').click();
    cy.contains('button', 'Submit').click();
    cy.get(this.domSelector.notification).should('contain', this.data.createConsumerSuccess);
  });

  it('should view the consumer', function () {
    cy.visit('/');
    cy.contains('Consumer').click();

    cy.get(this.domSelector.nameSelector).type(this.data.consumerName);
    cy.contains('Search').click();
    cy.contains(this.data.consumerName).siblings().contains('View').click();
    cy.get(this.domSelector.drawer).should('be.visible');

    cy.get(this.domSelector.codemirrorScroll).within(() => {
      cy.contains('plugins').should("exist");
      cy.contains(this.data.consumerName).should('exist');
    });
  });

  it('delete the consumer', function () {
    cy.visit('/');
    cy.contains('Consumer').click();
    cy.contains(this.data.consumerName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should('contain', this.data.deleteConsumerSuccess);
  });

  it('creates consumer with wrong json', function () {
    // go to consumer create page
    cy.visit('/');
    cy.contains('Consumer').click();
    cy.contains('Create').click();
    // basic information
    cy.get(this.domSelector.username).type(this.data.consumerName);
    cy.get(this.domSelector.description).type(this.data.description);
    cy.contains('Next').click();

    // plugin config
    cy.contains(this.domSelector.pluginCard, 'key-auth').within(() => {
      cy.get('button').click({
        force: true
      });
    });
    // edit codeMirror
    cy.get(this.domSelector.codeMirror)
      .first()
      .then((editor) => {
        editor[0].CodeMirror.setValue(
          JSON.stringify({
            key_not_exst: 'test',
          }),
        );
        cy.contains('button', 'Submit').click();
      });
    cy.get(this.domSelector.notification).should('contain', this.data.pluginErrorAlert);
  });
});
