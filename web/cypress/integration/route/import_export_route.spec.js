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
/* eslint-disable @typescript-eslint/no-invalid-this */
/* eslint-disable @typescript-eslint/no-loop-func */

import actionBarUS from '../../../src/components/ActionBar/locales/en-US';
import componentLocaleUS from '../../../src/locales/en-US/component';
import menuLocaleUS from '../../../src/locales/en-US/menu';
import routeLocaleUS from '../../../src/pages/Route/locales/en-US';
import yaml from 'js-yaml';

context('import and export routes', () => {
  const selector = {
    name: '#name',
    description: '#desc',
    nodes_0_host: '#submitNodes_0_host',
    nodes_0_port: '#submitNodes_0_port',
    nodes_0_weight: '#submitNodes_0_weight',
    fileTypeRadio: '[type=radio]',
    deleteAlert: '.ant-modal-body',
    refresh: '.anticon-reload',
    notification: '.ant-notification-notice-message',
    notificationCloseIcon: '.ant-notification-close-icon',
    fileSelector: '[type=file]',
    notificationDesc: '.ant-notification-notice-description',
  };
  const data = {
    route_name_0: 'route_name_0',
    route_name_1: 'route_name_1',
    upstream_node0_host_0: '1.1.1.1',
    upstream_node0_host_1: '2.2.2.2',
    importErrorMsg: 'required file type is .yaml, .yml or .json but got: .txt',
    uploadRouteFiles: [
      '../../../api/test/testdata/import/default.json',
      '../../../api/test/testdata/import/default.yaml',
      'import-error.txt',
    ],
    // Note: export file's name will be end of a timestamp
    jsonMask: 'cypress/downloads/*.json',
    yamlMask: 'cypress/downloads/*.yaml',
    port: '80',
    weight: 1,
    deleteRouteSuccess: 'Delete Route Successfully',
  };

  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
    cy.fixture('export-route-dataset.json').as('exportFile');
  });

  it('should create route1 and route2', function () {
    cy.visit('/');
    // create two routes
    for (let i = 0; i < 2; i += 1) {
      cy.contains(menuLocaleUS['menu.routes']).click();
      cy.contains(componentLocaleUS['component.global.create']).click();
      // input name, click Next
      cy.contains('Next').click().click();
      cy.get(selector.name).type(data[`route_name_${i}`]);
      // FIXME: only GET in methods
      cy.get('#methods').click();
      for (let j = 0; j < 7; j += 1) {
        cy.get('#methods').type('{backspace}');
      }
      cy.get('#methods').type('GET');
      cy.get('#methods').type('{enter}');

      cy.contains(actionBarUS['component.actionbar.button.nextStep']).click();
      // input nodes_0_host, click Next
      cy.get(selector.nodes_0_host).type(data[`upstream_node0_host_${i}`]);
      cy.get(selector.nodes_0_port).type(data.port);
      cy.get(selector.nodes_0_weight).clear().type(data.weight);
      cy.contains(actionBarUS['component.actionbar.button.nextStep']).click();
      // do not config plugins, click Next
      cy.contains(actionBarUS['component.actionbar.button.nextStep']).click();
      // click submit to create route
      cy.contains(componentLocaleUS['component.global.submit']).click();
      // submit successfully
      cy.contains(
        `${componentLocaleUS['component.global.submit']} ${componentLocaleUS['component.status.success']}`,
      ).should('exist');
    }
  });
  it('should export route: route_name_0, route_name_1', function () {
    cy.visit('/');
    cy.contains('Route').click();

    // export button should be disabled without any route items selected
    cy.contains(routeLocaleUS['page.route.button.exportOpenApi']).should('be.disabled');
    // popup confirm should not exit when click disabled export button
    cy.contains(routeLocaleUS['page.route.exportRoutesTips']).should('not.exist');

    // export one route with type json
    cy.contains(data['route_name_0']).prev().click();
    // after select route item(s), export button should not be disabled
    cy.contains(routeLocaleUS['page.route.button.exportOpenApi']).should('not.disabled');
    // click Export OpenAPI Button
    cy.contains(routeLocaleUS['page.route.button.exportOpenApi']).click();
    // after click enabled export button, popup confirm should appear
    cy.contains(routeLocaleUS['page.route.exportRoutesTips']).should('exist');
    // click Confirm button in the popup to download Json file(default option)
    cy.contains(componentLocaleUS['component.global.confirm']).click();

    // export 2 routes with type yaml
    cy.contains(data['route_name_1']).prev().click();
    cy.contains(routeLocaleUS['page.route.button.exportOpenApi']).click();
    cy.contains(routeLocaleUS['page.route.exportRoutesTips']).should('exist');
    // click Confirm button in the popup to download Yaml file
    cy.get(selector.fileTypeRadio).check('1');
    cy.contains(componentLocaleUS['component.global.confirm']).click();

    cy.task('findFile', data.jsonMask).then((jsonFile) => {
      cy.log(`found file ${jsonFile}`);
      cy.log('**confirm downloaded json file**');
      cy.readFile(jsonFile).then((fileContent) => {
        const json = fileContent;
        delete json['paths']['/{params}']['post']['x-apisix-id'];
        expect(JSON.stringify(json)).to.equal(JSON.stringify(this.exportFile.jsonFile));
      });
    });
    cy.task('findFile', data.yamlMask).then((yamlFile) => {
      cy.log(`found file ${yamlFile}`);
      cy.log('**confirm downloaded yaml file**');
      cy.readFile(yamlFile).then((fileContent) => {
        const json = yaml.load(fileContent);
        delete json['paths']['/{params}']['post']['x-apisix-id'];
        delete json['paths']['/{params}-APISIX-REPEAT-URI-2']['post']['x-apisix-id'];
        expect(JSON.stringify(json, null, null)).to.equal(JSON.stringify(this.exportFile.yamlFile));
      });
    });
  });

  it('should delete the route', function () {
    cy.visit('/routes/list');
    cy.get(selector.refresh).click();

    for (let i = 0; i < 2; i += 1) {
      cy.contains(data[`route_name_${i}`]).siblings().contains('More').click();
      cy.contains('Delete').click();
      cy.get(selector.deleteAlert)
        .should('be.visible')
        .within(() => {
          cy.contains('OK').click();
        });
      cy.get(selector.notification).should('contain', data.deleteRouteSuccess);
      cy.get(selector.notificationCloseIcon).click().should('not.exist');
      cy.reload();
    }
  });

  it('should import route(s) from be test files', function () {
    cy.visit('/');
    cy.contains('Route').click();

    data.uploadRouteFiles.forEach((file) => {
      // click import button
      cy.get(selector.refresh).click();
      cy.contains('Advanced').click();
      cy.contains(routeLocaleUS['page.route.button.importOpenApi']).should('be.visible').click();
      // select file
      cy.get(selector.fileSelector).attachFile(file);
      // click submit
      cy.contains(componentLocaleUS['component.global.confirm']).click();

      // show upload notification
      if (file === 'import-error.txt') {
        // show error msg
        cy.get(selector.notificationDesc).should('contain', data.importErrorMsg);
        // close modal
        cy.contains(componentLocaleUS['component.global.cancel']).click();
        cy.get(selector.notificationCloseIcon).click();
      } else if (file !== 'import-error.txt') {
        cy.get(selector.notification).should('contain', 'Success');
        cy.get(selector.notificationCloseIcon).click().should('not.exist');
        // delete route just imported
        cy.reload();
        cy.contains('More').click();
        cy.contains('Delete').should('be.visible').click();
        cy.get(selector.deleteAlert)
          .should('be.visible')
          .within(() => {
            cy.contains('OK').click();
          });
        // show delete successfully notification
        cy.get(selector.notification).should('contain', data.deleteRouteSuccess);
        cy.get(selector.notificationCloseIcon).click();
      }
    });
  });
});
