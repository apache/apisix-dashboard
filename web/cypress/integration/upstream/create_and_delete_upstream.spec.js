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
  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
  });

  it('should create upstream with default type (roundrobin)', function () {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains('Create').click();

    cy.get(this.domSelector.name).type(this.data.upstreamName);
    cy.get(this.domSelector.description).type(this.data.description);

    cy.get(this.domSelector.nodes_0_host).type(this.data.ip1);
    cy.get(this.domSelector.nodes_0_port).clear().type('7000');
    cy.get(this.domSelector.nodes_0_weight).clear().type(1);
    cy.contains('Next').click();
    cy.get(this.domSelector.input).should('be.disabled');
    cy.contains('Submit').click();
    cy.get(this.domSelector.notification).should('contain', this.data.createUpstreamSuccess);
    cy.contains(this.data.createUpstreamSuccess);
    cy.url().should('contains', 'upstream/list');
  });

  it('should view the (roundrobin) upstream', function () {
    cy.visit('/');
    cy.contains('Upstream').click();

    cy.get(this.domSelector.nameSelector).type(this.data.upstreamName);
    cy.contains('Search').click();
    cy.contains(this.data.upstreamName).siblings().contains('View').click();
    cy.get('.ant-drawer-content').should('be.visible');

    cy.get('.CodeMirror-scroll').within(() => {
      cy.contains('nodes').should("exist");
      cy.contains('roundrobin').should('exist');
      cy.contains(this.data.upstreamName).should('exist');
    });
  });

  it('should delete the upstream', function () {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains(this.data.upstreamName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should('contain', this.data.deleteUpstreamSuccess);
  });

  it('should create chash upstream', function () {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains('Create').click();

    cy.get(this.domSelector.name).type(this.data.upstreamName);
    cy.get(this.domSelector.description).type(this.data.description);

    // change upstream type to chash, todo: optimize the search method
    cy.get('[title="Round Robin"]').click();
    cy.get(this.domSelector.upstreamType).within(() => {
      cy.contains('CHash').click();
    });
    cy.get('#hash_on').click({ force: true });
    cy.get(this.domSelector.upstreamType).within(() => {
      cy.contains('vars').click();
    });
    cy.get('#key').click({ force: true });
    cy.get(this.domSelector.upstreamType).within(() => {
      cy.contains('remote_addr').click();
    });

    // add first upstream node
    cy.get(this.domSelector.nodes_0_host).type(this.data.ip1);
    cy.get(this.domSelector.nodes_0_port).clear().type('7000');
    cy.get(this.domSelector.nodes_0_weight).clear().type(1);

    // add second upstream node
    cy.get('.ant-btn-dashed').click();
    cy.get('#nodes_1_host').type(this.data.ip1);
    cy.get('#nodes_1_port').clear().type('7001');
    cy.get('#nodes_1_weight').clear().type('2');

    // next to finish
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(this.domSelector.notification).should('contain', this.data.createUpstreamSuccess);
    cy.url().should('contains', 'upstream/list');
  });

  it('should view the (chash) upstream', function () {
    cy.visit('/');
    cy.contains('Upstream').click();

    cy.get(this.domSelector.nameSelector).type(this.data.upstreamName);
    cy.contains('Search').click();
    cy.contains(this.data.upstreamName).siblings().contains('View').click();
    cy.get(this.domSelector.drawer).should('be.visible');

    cy.get(this.domSelector.codemirrorScroll).within(() => {
      cy.contains('nodes').should("exist");
      cy.contains('chash').should('exist');
      cy.contains(this.data.upstreamName).should('exist');
    });
  });

  it('should delete the upstream', function () {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains(this.data.upstreamName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should('contain', this.data.deleteUpstreamSuccess);
  });
});
