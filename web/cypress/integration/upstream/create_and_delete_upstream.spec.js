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
        const root_name = `root_${new Date().valueOf()}`;
      
        beforeEach(() => {
          // init login 
          cy.login();
        })
      
        it('create roundrobin upstream', () => {
          //  go to upstream create page
          cy.visit('/upstream/create');
          cy.contains('Upstream').click();
          cy.contains('Create').click();
      
          // input Name And Description
          cy.get('#name').type('autotest_'+root_name);
          cy.get('#desc').type('desc_by_autotest');
      
          // input information
          cy.get('#nodes_0_host').type('127.0.0.1');
          cy.get('#nodes_0_port').clear().type('7000');
          cy.contains('Next').click();
          cy.contains('Submit').click();
          cy.get('.ant-notification-notice-message').should('contain', 'Create upstream successfully');
          cy.contains('Create upstream successfully');
          cy.wait(1000)
          cy.url().should('contains', 'upstream/list');
        });
      
        it('delete the upstream', () => {
          cy.visit('/upstream/list');
          cy.contains(root_name).siblings().contains('Delete').click();
          cy.contains('button', 'Confirm').click();
          cy.get('.ant-notification-notice-message').should('contain', 'Delete successfully');
        });

        it('create chash upstream', () => {
          // go to upstream create page
          cy.visit('/upstream/create');
          cy.contains('Upstream').click();
          cy.wait(500)
          cy.contains('Create').click();

          // input `Name And Description`
          cy.get('#name').type('autotest_'+root_name);
          cy.get('#desc').type('desc_by_autotest');
      
          // change upstream type to chash, todo: optimize the search method
          cy.get('.ant-select-selection-item').click();
          cy.wait(100)
          cy.get('.ant-select-item:nth-child(2)').click();
          cy.get('#hash_on').click();
          cy.wait(100)
          cy.get('.ant-select-item-option-active:nth-child(1) > .ant-select-item-option-content').click();
          cy.get('#key').click();
          cy.wait(100)
          cy.get('div:nth-child(8) .ant-select-item:nth-child(1) > .ant-select-item-option-content:nth-child(1)').click();

          // input chash upstream's information
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
          cy.get('.ant-notification-notice-message').should('contain', 'Create upstream successfully');
          cy.contains('Create upstream successfully');
          cy.wait(1000)
          cy.url().should('contains', 'upstream/list');
        });

        it('delete the upstream', () => {
          cy.visit('/upstream/list');
          cy.contains(root_name).siblings().contains('Delete').click();
          cy.contains('button', 'Confirm').click();
          cy.get('.ant-notification-notice-message').should('contain', 'Delete successfully');
        });
      })
