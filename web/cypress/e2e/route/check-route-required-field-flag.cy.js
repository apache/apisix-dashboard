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

context('Check Route Required Field Flag', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should exist required flag for Route name', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.contains('Create').click();
    cy.get('label[title="Name"]').then(($els) => {
      // get Window reference from element
      const win = $els[0].ownerDocument.defaultView;
      // use getComputedStyle to read the pseudo selector
      const before = win.getComputedStyle($els[0], 'before');
      // read the value of the `content` CSS property
      const contentValue = before.getPropertyValue('content');
      // the returned value will have double quotes around it, but this is correct
      expect(contentValue).to.eq('"*"');
    });
  });

  it('should exist required flag for Route path', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.contains('Create').click();
    cy.get('label[title="Path"]').then(($els) => {
      const win = $els[0].ownerDocument.defaultView;
      const before = win.getComputedStyle($els[0], 'before');
      const contentValue = before.getPropertyValue('content');
      expect(contentValue).to.eq('"*"');
    });
  });
});
