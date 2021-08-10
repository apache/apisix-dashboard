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

context('dashboard page smoke test', () => {
  const selector = {
    pageContent: '.ant-pro-page-container',
  };
  beforeEach(() => {
    cy.login();
  });

  it('should visit dashboard page', function () {
    cy.visit('/');
    cy.contains('Dashboard').click();
    cy.url().should('contains', '/dashboard');
    cy.get(selector.pageContent)
      .children()
      .should('contain', 'Dashboard')
      .and('contain', 'You have not configured Grafana')
      .and('contain', 'Configure');
  });
});
