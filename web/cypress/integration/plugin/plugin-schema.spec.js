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
/* eslint-disable */

context('Enable and Delete Plugin List', () => {
  const timeout = 5000;

  beforeEach(function () {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
    cy.fixture('plugin-dataset.json').as('cases');
  });

  it('should visit plugin market', function () {
    cy.visit('/');
    cy.contains('Plugin').click();
    cy.contains('Enable').click();
  });

  for (let i = 0; i < 99; i++) {
    it(`should ${i}`, function () {
      cy.log(this.cases);
      cy.wait(5000);
    });
  }

  /*it('should visit plugin market', function () {
    cy.visit('/');
    cy.contains('Plugin').click();
    cy.contains('Enable').click();





    cy.get('@cases').then((cases) => {
      // cases structure
      // { pluginName: [{task, task, task}] }
      const pluginList = Object.keys(cases);
      const casesList = Object.values(cases);

      for (let i = 0; i < pluginList.length; i++) {
        const pluginName = pluginList[i];
        const pluginCases = casesList[i];

        if (pluginCases <= 0) continue;

        for (let j = 0; j < pluginCases; j++) {
          it(`should test ${pluginName} plugin #${j} case`, function () {
            cy.configurePlugin(plugins[i], pluginCases[i])
          });
        }

      }
    });
  });*/
});
