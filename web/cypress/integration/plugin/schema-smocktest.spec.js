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

context('smoke test for plugin schmea', () => {
  beforeEach(() => {
    cy.login();

    cy.fixture('plugin-schema-valid-data.json').as('validData');
  });

  it('should visit plugin market', function () {
    cy.visit('/');
    cy.contains('Plugin').click();
    cy.contains('Create').click();

    const nameSelector = '[data-cy-plugin-name]';
    cy.get(nameSelector).then((cards) => {
      [...cards].forEach((card) => {
        const name = card.innerText;
        cy.contains(name)
          .parents('.ant-card-bordered')
          .within(() => {
            cy.contains('Enable').click({
              force: true,
            });

            cy.wait(500);
          });

        const switchSelector = '#disable';
        cy.get(switchSelector).click();

        const data = JSON.stringify(this.validData[name]);
        // NOTE: may don't have that plugin's data
        if (!data) {
          cy.contains('Cancel').click({
            force: true,
          });
          return;
        }

        cy.window().then(({ codemirror }) => {
          if (codemirror) {
            codemirror.setValue(data);
          }
        });

        cy.contains('Submit').click();

        const drawerSelector = '.ant-drawer-content';
        cy.get(drawerSelector).should('not.exist');
      });
    });
  });
});
