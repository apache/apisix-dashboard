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

context('Create and Search Route', () => {
  const timeout = 500;
  const data = {
    test: 'test',
    test0: 'test0',
    test1: 'test1',
    test2: 'test2',
    testx: 'testx',
    desc0: 'desc0',
    desc1: 'desc1',
    desc2: 'desc2',
    value0: 'value0',
    label0_value0: 'label0:value0',
  };

  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
  });

  it('should create route test1, test2, test3', function () {
    cy.visit('/');
    cy.contains('Route').click();
    for (let i = 0; i < 3; i += 1) {
      cy.contains('Create').click();
      cy.get(this.domSelector.name).type(`test${i}`);
      cy.get(this.domSelector.description).type(`desc${i}`);
      cy.get(this.domSelector.hosts_0).type(this.data.host1);

      // config label
      cy.contains('Manage').click();

      // eslint-disable-next-line no-loop-func
      cy.get(this.domSelector.drawerBody).within(() => {
        cy.contains('Add').click();
        cy.get(this.domSelector.labels_0_labelKey).type(`label${i}`);
        cy.get(this.domSelector.labels_0_labelValue).type(`value${i}`);
        cy.contains('Confirm').click();
      });

      cy.contains('Next').click();
      cy.get(this.domSelector.nodes_0_host).type(this.data.host2, {
        timeout,
      });
      cy.contains('Next').click();
      cy.contains('Next').click();
      cy.contains('Submit').click();
      cy.contains(this.data.submitSuccess);
      cy.contains('Goto List').click();
      cy.url().should('contains', 'routes/list');
    }
  });

  it('should search the route with name', function () {
    cy.visit('/');
    cy.contains('Route').click();
    // full match
    cy.get(this.domSelector.nameSearch).type(data.test1);
    cy.contains('Search').click();
    cy.contains(data.test1).siblings().should('contain', data.desc1);
    cy.contains(data.test0).should('not.exist');
    cy.contains(data.test2).should('not.exist');
    // partial match
    cy.reload();
    cy.get(this.domSelector.nameSearch).type(data.test);
    cy.contains('Search').click();
    cy.contains(data.test0).siblings().should('contain', data.desc0);
    cy.contains(data.test1).siblings().should('contain', data.desc1);
    cy.contains(data.test2).siblings().should('contain', data.desc2);
    // no match
    cy.reload();
    cy.get(this.domSelector.nameSearch).type(data.testx);
    cy.contains('Search').click();
    cy.contains(data.test0).should('not.exist');
    cy.contains(data.test1).should('not.exist');
    cy.contains(data.test2).should('not.exist');
  });

  it('should search the route with labels', function () {
    cy.visit('/routes/list');
    // search one label
    cy.contains(data.test0).should('exist');
    cy.get(this.domSelector.labelSelect_0).click({ timeout });
    cy.get(this.domSelector.dropdown).should('be.visible').within(() => {
      cy.contains(data.value0).click();
    });
    cy.contains('Search').click();
    cy.contains(data.test0).siblings().should('contain', data.label0_value0);
    cy.contains(data.test1).should('not.exist');
    cy.contains(data.test2).should('not.exist');
  });

  it('should delete the route', function () {
    cy.visit('/routes/list');
    for (let i = 0; i < 3; i += 1) {
      cy.contains(`test${i}`).siblings().contains('Delete').click({ timeout });
      cy.contains('button', 'Confirm').should('be.visible').click({ timeout });
      cy.get(this.domSelector.notification).should('contain', this.data.deleteRouteSuccess);
    }
  });
});
