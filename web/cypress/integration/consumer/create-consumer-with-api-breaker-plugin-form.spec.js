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

context('Create and delete consumer with api-breaker plugin form', () => {
  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
  });

  const selector = {
    break_response_code: "#break_response_code"
  }

  const data = {
    break_response_code: 200,
  }

  it('creates consumer with api-breaker form', function () {
    cy.visit('/');
    cy.contains('Consumer').click();
    cy.get(this.domSelector.empty).should('be.visible');
    cy.contains('Create').click();
    // basic information
    cy.get(this.domSelector.username).type(this.data.consumerName);
    cy.get(this.domSelector.description).type(this.data.description);
    cy.contains('Next').click();

    // config auth plugin
    cy.contains(this.domSelector.pluginCard, 'key-auth').within(() => {
      cy.contains('Enable').click({
        force: true,
      });
    });
    cy.focused(this.domSelector.drawer).should('exist');
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

    cy.contains(this.domSelector.pluginCard, 'api-breaker').within(() => {
      cy.contains('Enable').click({
        force: true,
      });
    });

    cy.focused(this.domSelector.drawer).should('exist');

    // config api-breaker form
    cy.get(this.domSelector.drawer).within(() => {
      cy.contains('Submit').click({
        force: true,
      });
    });
    cy.get(this.domSelector.notification).should('contain', 'Invalid plugin data');

    cy.get(selector.break_response_code).type(data.break_response_code);
    cy.get(this.domSelector.disabledSwitcher).click();
    cy.get(this.domSelector.drawer).within(() => {
      cy.contains('Submit').click({
        force: true,
      });
    });
    cy.get(this.domSelector.drawer).should('not.exist');

    cy.contains('button', 'Next').click();
    cy.contains('button', 'Submit').click();
    cy.get(this.domSelector.notification).should('contain', this.data.createConsumerSuccess);
  });

  it('delete the consumer', function () {
    cy.visit('/consumer/list');
    cy.contains(this.data.consumerName).should('be.visible').siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should('contain', this.data.deleteConsumerSuccess);
  });
});
