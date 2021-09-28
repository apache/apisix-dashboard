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

describe('Plugin Schema Test', () => {
  const timeout = 5000;
  const cases = require('../../fixtures/plugin-dataset.json');
  const pluginList = [];
  const casesList = [];

  // prepare plugin cases
  let keys = Object.keys(cases);
  let values = Object.values(cases);
  pluginList.push(...keys);
  casesList.push(...values);

  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
  });

  it('should visit plugin market', function () {
    cy.visit('/');
    cy.contains('Plugin').click();
    cy.contains('Enable').click();
  });

  pluginList.forEach((plugin, pluginIndex) => {
    const cases = casesList[pluginIndex];

    if (cases.length <= 0) {
      it(`${plugin} plugin no cases`);
      return;
    }

    cases.forEach((c, caseIndex) => {
      it(`${plugin} plugin #${caseIndex + 1} case`, function () {
        cy.configurePlugin({ name: plugin, cases: c });
      });
    });
  });
});
