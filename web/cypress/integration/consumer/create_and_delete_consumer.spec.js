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

context('Create and Delete Consumer', () => {
        const root_name = `root_${new Date().valueOf()}`;
      
        beforeEach(() => {
          // init login 
          cy.login();
        })
      
        it('create consumer with key-auth', () => {
          // go to consumer create page
          cy.visit('/consumer/create');
          cy.contains('Consumer').click();
          cy.wait(500);
          cy.contains('Create').click();

          // Basic Information
          cy.get('#username').type('autotest_'+root_name);
          cy.get('#desc').type('desc_by_autotest');
          cy.contains('Next').click();
          cy.wait(300);

          // Plugin Config
          cy.contains('.ant-card', 'key-auth').within(($form) => {
            cy.get('button').first().click();
          })
          // edit CodeMirror
          cy.get('.CodeMirror')
            .first()
            .then((editor) => {
              editor[0].CodeMirror.setValue('{"key":"test"}');
              cy.contains('button', 'Submit').click();
          });
          cy.contains('button', 'Next').click();
          cy.contains('button', 'Submit').click();
        });
      
        it('delete the consumer', () => {
          cy.visit('/consumer/list');
          cy.contains(root_name).siblings().contains('Delete').click();
          cy.contains('button', 'Confirm').click();
          cy.get('.ant-notification-notice-message').should('contain', 'Delete Consumer Successfully');
        });

        it('create consumer with wrong json', () => {
          // go to consumer create page
          cy.visit('/consumer/create');
          cy.contains('Consumer').click();
          cy.wait(500);
          cy.contains('Create').click();

          // Basic Information
          cy.get('#username').type('autotest_'+root_name);
          cy.get('#desc').type('desc_by_autotest');
          cy.contains('Next').click();
          cy.wait(300);

          // Plugin Config
          cy.contains('.ant-card', 'key-auth').within(($form) => {
            cy.get('button').first().click();
          })
          // edit CodeMirror
          cy.get('.CodeMirror')
            .first()
            .then((editor) => {
              editor[0].CodeMirror.setValue('{"key_not_exst":"test"}');
              cy.contains('button', 'Submit').click();
          });
          cy.get('.ant-notification-notice-message').should('contain', 'Invalid plugin data');
        });
      })
