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
  beforeEach(() => {
    // init login
    cy.login();
    cy.fixture('selector.json').as('domSelector');
  });

  it('should create route test1, test2, test3', function () {
    //  go to route create page
    cy.visit('/');
    cy.contains('Route').click();
    for (let i = 0; i < 3; i += 1) {
      cy.contains('Create').click();
      cy.get('#name').type(`test${i}`);
      cy.get('#desc').type(`desc${i}`);
      cy.get('#hosts_0').type('11.11.11.11');

      // config label
      cy.contains('Manage').click();

      // eslint-disable-next-line no-loop-func
      cy.get(this.domSelector.drawerBody).within(() => {
        cy.contains('Add').click();
        cy.get('#labels_0_labelKey').type(`label${i}`);
        cy.get('#labels_0_labelValue').type(`value${i}`);
        cy.contains('Confirm').click();
      });

      cy.contains('Next').click();
      cy.wait(400);
      cy.get('#nodes_0_host').type('12.12.12.12', {
        timeout: 500,
      });
      cy.contains('Next').click();
      cy.contains('Next').click();
      cy.contains('Submit').click();
      cy.contains('Submit Successfully');
      // back to route list page
      cy.contains('Goto List').click();
      cy.url().should('contains', 'routes/list');
    }
  });

  it('should search the route with name', () => {
    cy.visit('/');
    cy.contains('Route').click();
    // full match
    cy.get('[title=Name]').type('test1');
    cy.contains('Search').click();
    cy.contains('test1').siblings().should('contain', 'desc1');
    cy.contains('test0').should('not.exist');
    cy.contains('test2').should('not.exist');
    // partial match
    cy.reload();
    cy.get('[title=Name]').type('test');
    cy.contains('Search').click();
    cy.contains('test0').siblings().should('contain', 'desc0');
    cy.contains('test1').siblings().should('contain', 'desc1');
    cy.contains('test2').siblings().should('contain', 'desc2');
    // no match
    cy.reload();
    cy.get('[title=Name]').type('testx');
    cy.contains('Search').click();
    cy.contains('test0').should('not.exist');
    cy.contains('test1').should('not.exist');
    cy.contains('test2').should('not.exist');
  });

  it('should search the route with labels', function () {
    cy.visit('/');
    cy.contains('Route').click();

    // search one label
    cy.get('[title=Labels]').click();
    cy.wait(500);
    cy.get(this.domSelector.dropdown).within(() => {
      cy.contains('value0').click();
    });
    cy.contains('Search').click();

    cy.contains('test0').siblings().should('contain', 'label0:value0');
    cy.contains('test1').should('not.exist');
    cy.contains('test2').should('not.exist');
  });

  it('should delete the route', function () {
    cy.visit('/routes/list');
    for (let i = 0; i < 3; i += 1) {
      cy.contains(`test${i}`).siblings().contains('Delete').click();
      cy.contains('button', 'Confirm').click();
      cy.get(this.domSelector.notification).should('contain', 'Delete Route Successfully');
      cy.wait(300);
    }
  });
});
