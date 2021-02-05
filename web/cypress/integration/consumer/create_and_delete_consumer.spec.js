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
  const name = `consumerName${new Date().valueOf()}`;

  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
  });

  it('creates consumer with key-auth', function () {
    // go to consumer create page
    cy.visit('/');
    cy.contains('Consumer').click();
    cy.contains('Create').click();

    // basic information
    cy.get('#username').type(name);
    cy.get('#desc').type('desc_by_autotest');
    cy.contains('Next').click();

    // plugin config
    cy.contains(this.domSelector.pluginCard, 'key-auth').within(() => {
      cy.get('button').first().click();
    });

    cy.get('#disable').click();
    // edit codemirror
    cy.get('.CodeMirror')
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
    cy.get(this.domSelector.notification).should('contain', 'Create Consumer Successfully');
  });

  it('delete the consumer', function () {
    cy.visit('/');
    cy.contains('Consumer').click();
    cy.contains(name).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should('contain', 'Delete Consumer Successfully');
  });

  it('creates consumer with wrong json', function () {
    // go to consumer create page
    cy.visit('/');
    cy.contains('Consumer').click();
    cy.contains('Create').click();
    // basic information
    cy.get('#username').type(name);
    cy.get('#desc').type('desc_by_autotest');
    cy.contains('Next').click();

    // plugin config
    cy.contains(this.domSelector.pluginCard, 'key-auth').within(() => {
      cy.get('button').first().click();
    });
    // edit codeMirror
    cy.get('.CodeMirror')
      .first()
      .then((editor) => {
        editor[0].CodeMirror.setValue(
          JSON.stringify({
            key_not_exst: 'test',
          }),
        );
        cy.contains('button', 'Submit').click();
      });
    cy.get(this.domSelector.notification).should('contain', 'Invalid plugin data');
  });
});
