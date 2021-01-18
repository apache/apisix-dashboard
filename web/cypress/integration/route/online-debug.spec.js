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

context('Online debug', () => {
  const ServerHost = '139.217.190.60';
  const urisWithSpecialChars = [
    '/get',
    '/deps-get',
    '/deps.get',
    '/get?search=1',
    '/get?search=%U%E',
    '/get?search=v1&number=-1',
    '/get?search=1+1',
  ];
  beforeEach(() => {
    // init login
    cy.login();
    cy.fixture('selector.json').as('domSelector');
  });

  it('shoule not show notification when debug a non existent route with specified special characters', () => {
    //  go to route create page
    cy.visit('/');
    cy.contains('Route').click();

    cy.contains('Online Debug').click();

    urisWithSpecialChars.forEach((uri) => {
      cy.get('#debugUri').type(`${ServerHost}/${uri}`);
      cy.contains('Send').click();

      cy.contains('please input the valid request URL').should('not.exist');
    });
  });
});
