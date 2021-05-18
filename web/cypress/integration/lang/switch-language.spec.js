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

context('Switch language', () => {
  const timeout = 1000;

  const selector = {
    languageSwitcher: '.ant-space-align-center',
  }

  beforeEach(() => {
    cy.login();
  });

  it('should switch language', function () {
    cy.visit('/');

    cy.get(selector.languageSwitcher).click('right');
    cy.contains('简体中文').click({
      force: true,
      timeout,
    });
    cy.contains('服务').click();

    cy.get(selector.languageSwitcher).click('right');
    cy.contains('English').click({
      force: true,
      timeout,
    });
    cy.contains('Create').should('exist');
  });
});
