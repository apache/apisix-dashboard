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

context('smoke test for plugin schema', () => {
  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('selector');
    cy.fixture('plugin-dataset.json').as('cases');
  });

  it('should visit plugin market', function () {
    cy.visit('/');
    cy.contains('Plugin').click();
    cy.contains('Create').click();

    const nameSelector = '[data-cy-plugin-name]';
    cy.get(nameSelector).then(function (cards) {
      [...cards].forEach((card) => {
        const name = card.innerText;
        const cases = this.cases[name] || [];
        cases.forEach(({ shouldValid, data, type = '' }) => {
          /**
           * NOTE: This test is mainly for GlobalPlugin, which is using non-consumer-type schema.
           */
          if (type === 'consumer') {
            return true;
          }

          cy.contains(name)
            .parents('.ant-card-bordered')
            .within(() => {
              cy.contains('Enable').click({
                force: true,
              });
            });

          // NOTE: wait for the Drawer to appear on the DOM
          cy.wait(800);
          const switchSelector = '#disable';
          cy.get(switchSelector).click();

          cy.window().then(({ codemirror }) => {
            if (codemirror) {
              codemirror.setValue(JSON.stringify(data));
            }
          });

          cy.contains('Submit').click();

          // NOTE: wait for the HTTP call
          cy.wait(500);
          if (shouldValid) {
            const drawerSelector = '.ant-drawer-content';
            cy.get(drawerSelector).should('not.exist');
          } else {
            cy.get(this.selector.notification).should('contain', 'Invalid plugin data');

            cy.get('.anticon-close').click({
              multiple: true,
            });
            cy.contains('Cancel').click({
              force: true,
            });
          }
        });
      });
    });
  });
});
