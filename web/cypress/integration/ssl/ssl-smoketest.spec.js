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

context('ssl smoke test', () => {
  const domSelectors = {
    notificationDesc: '.ant-notification-notice-description',
    notificationMsg: '.ant-notification-notice-message',
  };

  beforeEach(() => {
    // init login
    cy.login();
    cy.fixture('certificate.json').as('certificate');
  });

  it('should set match certificate and key by input', function () {
    // use `function () if used `fixture` above`
    // go to ssl create page
    cy.visit('/');
    cy.contains('SSL').click();
    cy.wait(500);
    cy.contains('Create').click();

    const validCert = this.certificate.valid.cert;
    const validKey = this.certificate.valid.key;
    cy.get('#cert').type(validCert);
    cy.get('#key').type(validKey);

    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.wait(500);
    cy.url().should('contains', 'ssl/list');
  });

  it('should delete the ssl record just created', function () {
    cy.visit('/');
    cy.contains('SSL').click();
    cy.wait(500);
    const sni = this.certificate.valid.sni;
    cy.contains(sni).parents().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(domSelectors.notificationMsg).should('contain', 'Remove target SSL successfully');
  });

  it('should set unmatch certificate and key by input', function () {
    // go to ssl create page
    cy.visit('/');
    cy.contains('SSL').click();
    cy.wait(500);
    cy.contains('Create').click();

    const invalidCert = this.certificate.invalid.cert;
    const invalidKey = this.certificate.invalid.key;
    cy.get('#cert').type(invalidCert);
    cy.get('#key').type(invalidKey);

    cy.contains('Next').click();
    cy.wait(100);
    cy.get(domSelectors.notificationDesc).should('contain', "key and cert don't match");
  });
});
