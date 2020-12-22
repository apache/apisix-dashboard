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
        })

        it('create route test1, test2, test3', () => {
                //  go to route create page
                cy.visit('/');
                cy.contains('Route').click();
                for (var i = 0; i < 3; i++) {
                        cy.contains('Create').click();
                        cy.get('#name').type('test' + i);
                        cy.get('#desc').type('desc' + i);
                        cy.get('#hosts_0').type('11.11.11.11');
                        cy.contains('Next').click();
                        cy.wait(400);
                        cy.get('#nodes_0_host').type('12.12.12.12', {
                                timeout: 500
                        });
                        cy.contains('Next').click();
                        cy.contains('Next').click();
                        cy.contains('Submit').click();
                        cy.contains('SubmitSuccessfully');
                        // back to route list page
                        cy.contains('Return Route List').click();
                        cy.url().should('contains', 'routes/list');
                }

        });

        it('search the route', () => {
                cy.visit('/');
                cy.contains('Route').click();
                // full match
                cy.get('[title=Name]').type('test1');
                cy.contains('查 询').click();
                cy.contains('test1').siblings().should('contain', 'desc1')
                cy.contains('test0').should('not.exist');
                cy.contains('test2').should('not.exist');
                // partial match
                cy.reload()
                cy.get('[title=Name]').type('test');
                cy.contains('查 询').click();
                cy.contains('test0').siblings().should('contain', 'desc0')
                cy.contains('test1').siblings().should('contain', 'desc1')
                cy.contains('test2').siblings().should('contain', 'desc2')
                // no match
                cy.reload()
                cy.get('[title=Name]').type('testx');
                cy.contains('查 询').click();
                cy.contains('test0').should('not.exist');
                cy.contains('test1').should('not.exist');
                cy.contains('test2').should('not.exist');

        });

        it('delete the route', () => {
                cy.visit('/routes/list');
                for (var i = 0; i < 3; i++) {
                        cy.contains('test' + i).siblings().contains('Delete').click();
                        cy.contains('button', 'Confirm').click();
                        cy.get('.ant-notification-notice-message').should('contain', 'Delete Route Successfully');
                        cy.wait(300);
                }
        })
})
