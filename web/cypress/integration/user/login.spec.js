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

context('Login Test', () => {
  const selector = {
    errorExplain: '.ant-form-item-explain',
    usernameInput: '#control-ref_username',
    passwordInput: '#control-ref_password',
    notification: '.ant-notification-notice-message',
  };

  beforeEach(() => {
    // set default language
    localStorage.setItem('umi_locale', 'en-US');
  });

  it('login failed with empty username and password', function () {
    cy.visit('/user/Login');
    cy.contains('Login').click();
    cy.get(selector.errorExplain).should('contain', 'Please input username');
    cy.get(selector.errorExplain).should('contain', 'Please input password');
  });

  it('login with invalid credentials', function () {
    cy.visit('/user/Login');
    cy.get(selector.usernameInput).type('user');
    cy.get(selector.passwordInput).type('invalidPassword');
    cy.contains('Login').click();
    cy.get(selector.notification).should('contain', 'Request Error Code: 10000');
  });

  it('login success', function () {
    cy.visit('/user/Login');
    cy.get(selector.usernameInput).type('user');
    cy.get(selector.passwordInput).type('user');
    cy.contains('Login').click();
    cy.get(selector.notification).should('contain', 'Successfully');
  });

  it('should press Enter to login successfully', function () {
    cy.visit('/user/Login');
    cy.get(selector.usernameInput).type('user');
    cy.get(selector.passwordInput).type('user{enter}');
    cy.get(selector.notification).should('contain', 'Successfully');
  });
});
