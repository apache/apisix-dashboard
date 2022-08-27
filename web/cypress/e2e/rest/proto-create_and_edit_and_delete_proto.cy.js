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

context('Create and Delete Proto', () => {
  const selector = {
    id: '#id',
    description: '#desc',
    content: '.view-lines',
    draw: '.ant-drawer-content',
    notification: '.ant-notification-notice-message',
  };

  const data = {
    id: 'test_id',
    description: 'test_description',
    content: `message Person {
required string name = 1;
required int32 id = 2;
optional string email = 3;
}`,
    description2: 'test_description2',
    content2: `message Person2 {
required string name = 1;
required int32 id = 2;
optional string email = 3;
}`,
    createProtoSuccess: 'Create proto Successfully',
    configureProtoSuccess: 'Configure proto Successfully',
    deleteProtoSuccess: 'Delete proto Successfully',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create proto', () => {
    cy.visit('/');
    cy.contains('Proto').click();
    cy.contains('Create').click();
    cy.get(selector.draw)
      .should('be.visible')
      .within(() => {
        cy.get(selector.id).type(data.id);
        cy.get(selector.description).type(data.description);
        cy.get(selector.content).type(data.content);

        cy.contains('Submit').click();
      });
    cy.get(selector.notification).should('contain', data.createProtoSuccess);
    cy.get('.ant-notification-close-x').click();
  });

  it('should edit the proto', () => {
    cy.visit('/');
    cy.contains('Proto').click();
    cy.contains(data.id).siblings().contains('Configure').click();
    cy.get(selector.draw)
      .should('be.visible')
      .within(() => {
        cy.get(selector.description).clear().type(data.description2);
        cy.get(selector.content).type(data.content2);

        cy.contains('Submit').click();
      });
    cy.get(selector.notification).should('contain', data.configureProtoSuccess);
    cy.get('.ant-notification-close-x').click();
  });

  it('should delete the proto', () => {
    cy.visit('/');
    cy.contains('Proto').click();
    cy.contains(data.id).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(selector.notification).should('contain', data.deleteProtoSuccess);
    cy.get('.ant-notification-close-x').click();
  });
});
