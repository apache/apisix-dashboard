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

context('e2e test for plugin page', () => {
  const sleepTime = 100;

  beforeEach(() => {
    // init login
    cy.login();
  });

  it('should enable two plugins', () => {
    //  go to route plugin list page
    cy.visit('/');
    cy.contains('Plugin').click({ timeout: sleepTime * 5 });
    cy.contains('Create').click({ timeout: sleepTime * 5 });

    // enable auth plugin
    cy.contains('.ant-card', 'key-auth').within(() => {
      cy.get('button').click({ timeout: sleepTime * 2 });
    });
    // edit CodeMirror
    cy.get('.CodeMirror')
      .first()
      .then((editor) => {
        cy.get('#disable').click();
        cy.contains('button', 'Submit').click({ timeout: sleepTime * 3 });
      });

    // enable redirect plugin
    cy.contains('.ant-card', 'redirect').within(() => {
      cy.get('button').click({ timeout: sleepTime * 2 });
    });
    // edit CodeMirror
    cy.get('.CodeMirror')
      .first()
      .then((editor) => {
        editor[0].CodeMirror.setValue(JSON.stringify({
          "uri": "/test/default.html",
          "ret_code": 301
        }));
        cy.get('#disable').click();
        cy.contains('button', 'Submit').click();
      });

    // back to plugin list page
    cy.visit('/');
    cy.contains('Plugin').click();
    cy.get('.ant-table-tbody').should('contain', 'key-auth');
    cy.get('.ant-table-tbody').should('contain', 'redirect');
  });

  it('should edit the plugin', () => {
    cy.contains('key-auth').siblings().contains('Edit').click({ timeout: sleepTime });
    cy.get('.CodeMirror')
      .first()
      .then((editor) => {
        cy.get('#disable').click();
        cy.contains('button', 'Submit').click();
      });

    // back to plugin list page
    cy.visit('/');
    cy.contains('Plugin').click();
    cy.contains('key-auth').should('not.exist');
  });

  it('should delete the plugin', () => {
    cy.visit('/');
    cy.contains('Plugin').click();
    cy.contains('redirect').siblings().contains('Delete').click({ timeout: sleepTime * 5 });
    cy.contains('button', 'Confirm').click();

    // back to plugin list page
    cy.visit('/');
    cy.contains('Plugin').click();
    cy.contains('redirect').should('not.exist');
  });
});
