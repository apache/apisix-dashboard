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

context('Create and Delete Upstream', () => {
  const name = `upstreamName${new Date().valueOf()}`;
  const domSelectors = {
    notification: '.ant-notification-notice-message',
    selectItem: '.ant-select-item-option-content',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create upstream with default type (roundrobin)', () => {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains('Create').click();

    cy.get('#name').type(name);
    cy.get('#desc').type('desc_by_autotest');

    cy.get('#nodes_0_host').type('127.0.0.1');
    cy.get('#nodes_0_port').clear().type('7000');
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(domSelectors.notification).should('contain', 'Create Upstream Successfully');
    cy.contains('Create Upstream Successfully');
    cy.url().should('contains', 'upstream/list');
  });

  it('should delete the upstream', () => {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains(name).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(domSelectors.notification).should('contain', 'Delete Upstream Successfully');
  });

  it('should create chash upstream', () => {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains('Create').click();

    cy.get('#name').type(name);
    cy.get('#desc').type('desc_by_autotest');

    // change upstream type to chash, todo: optimize the search method
    cy.get('[title=roundrobin]').click();
    cy.get(domSelectors.selectItem).within(() => {
      cy.contains('chash').click();
    });
    cy.get('#hash_on').click();
    cy.get(domSelectors.selectItem).within(() => {
      cy.contains('vars').click();
    });
    cy.get('#key').click();
    cy.get(domSelectors.selectItem).within(() => {
      cy.contains('remote_addr').click();
    });

    // add first upstream node
    cy.get('#nodes_0_host').type('127.0.0.1');
    cy.get('#nodes_0_port').clear().type('7000');

    // add second upstream node
    cy.get('.ant-btn-dashed').click();
    cy.get('#nodes_1_host').type('127.0.0.1');
    cy.get('#nodes_1_port').clear().type('7001');
    cy.get('#nodes_1_weight').clear().type('2');

    // next to finish
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(domSelectors.notification).should('contain', 'Create Upstream Successfully');
    cy.url().should('contains', 'upstream/list');
  });

  it('should delete the upstream', () => {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains(name).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(domSelectors.notification).should('contain', 'Delete Upstream Successfully');
  });
});
