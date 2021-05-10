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

    it('should create upstream with no nodes', function () {
      cy.visit('/');
      cy.contains('Upstream').click();
      cy.contains('Create').click();

      cy.get(this.domSelector.name).type(this.data.upstreamName);
      cy.get(this.domSelector.description).type(this.data.description);

      // delete all nodes
      cy.get(this.domSelector.upstreamNodeMinus0).click();

      cy.contains('Next').click();
      cy.contains('Submit').click();
      cy.get(this.domSelector.notification).should('contain', this.data.createUpstreamSuccess);
      cy.url().should('contains', 'upstream/list');
    });

    it('should configure the upstream with no nodes', function () {
      cy.visit('/');
      cy.contains('Upstream').click();

      cy.get(this.domSelector.nameSelector).type(this.data.upstreamName);
      cy.contains('Search').click();
      cy.contains(this.data.upstreamName).siblings().contains('Configure').click();

      cy.get(this.domSelector.upstreamNodeMinus0).should('not.exist');
      cy.contains('Next').click();
      cy.contains('Submit').click({
        force: true,
      });

      cy.get(this.domSelector.notification).should('contain', this.data.configureUpstreamSuccess);
      cy.url().should('contains', 'upstream/list');

    });

    it('should delete the upstream', function () {
      cy.visit('/');
      cy.contains('Upstream').click();
      cy.contains(this.data.upstreamName).siblings().contains('Delete').click();
      cy.contains('button', 'Confirm').click();
      cy.get(this.domSelector.notification).should('contain', this.data.deleteUpstreamSuccess);
    });
  });
