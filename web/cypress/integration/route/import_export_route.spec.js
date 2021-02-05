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
import actionBarUS from '../../../src/components/ActionBar/locales/en-US';
import componentLocaleUS from '../../../src/locales/en-US/component';
import menuLocaleUS from '../../../src/locales/en-US/menu';
import routeLocaleUS from '../../../src/pages/Route/locales/en-US';
import yaml from 'js-yaml';

context('import and export routes', () => {
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
  };

  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('export-route-dataset.json').as('exportFile');
  });
  it('should create route1 and route2', function () {
    cy.visit('/');
    // create two routes
    for (let i = 0; i < 2; i += 1) {
      cy.contains(menuLocaleUS['menu.routes']).click();
      cy.contains(componentLocaleUS['component.global.create']).click();
      // input name, click Next
      cy.get(this.domSelector.name).type(data[`route_name_${i}`]);
      //FIXME: only GET in methods
      cy.get('#methods').click();
      for (let i = 0; i < 7; i += 1) {
        cy.get('#methods').type('{backspace}');
      }
      cy.get('#methods').type('GET');
      cy.get('#methods').type('{enter}');

      cy.contains(actionBarUS['component.actionbar.button.nextStep']).click();
      // input nodes_0_host, click Next
      cy.get(this.domSelector.nodes_0_host).type(data[`upstream_node0_host_${i}`]);
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
    // after click enabled export button, popup confirm should appeare
    cy.contains(routeLocaleUS['page.route.exportRoutesTips']).should('exist');
    // click Confirm button in the popup to download Json file(debault option)
    cy.contains(componentLocaleUS['component.global.confirm']).click();

    // export 2 routes with type yaml
    cy.contains(data['route_name_1']).prev().click();
    cy.contains(routeLocaleUS['page.route.button.exportOpenApi']).click();
    cy.contains(routeLocaleUS['page.route.exportRoutesTips']).should('exist');
    // click Confirm button in the popup to download Yaml file
    cy.get(this.domSelector.fileTypeRadio).check('1');
    cy.contains(componentLocaleUS['component.global.confirm']).click();

    cy.task('findFile', data.jsonMask).then((jsonFile) => {
      cy.log(`found file ${jsonFile}`);
      cy.log('**confirm downloaded json file**');
      cy.readFile(jsonFile).then((fileContent) => {
        expect(JSON.stringify(fileContent)).to.equal(JSON.stringify(this.exportFile.jsonFile));
      });
    });
    cy.task('findFile', data.yamlMask).then((yamlFile) => {
      cy.log(`found file ${yamlFile}`);
      cy.log('**confirm downloaded yaml file**');
      cy.readFile(yamlFile).then((fileContent) => {
        expect(JSON.stringify(yaml.load(fileContent), null, null)).to.equal(
          JSON.stringify(this.exportFile.yamlFile),
        );
      });
    });
  });

  it('should delete the route', function () {
    cy.visit('/routes/list');
    for (let i = 0; i < 2; i += 1) {
      cy.contains(data[`route_name_${i}`])
        .siblings()
        .contains(componentLocaleUS['component.global.delete'])
        .click();
      cy.contains('button', componentLocaleUS['component.global.confirm']).click();
      cy.get(this.domSelector.notification).should(
        'contain',
        `${componentLocaleUS['component.global.delete']} ${menuLocaleUS['menu.routes']} ${componentLocaleUS['component.status.success']}`,
      );
    }
  });

  it('should import route(s) from be test files', function () {
    cy.visit('/');
    cy.contains('Route').click();

    data.uploadRouteFiles.forEach((file) => {
      // click import button
      cy.contains(routeLocaleUS['page.route.button.importOpenApi']).click();
      // select file
      cy.get(this.domSelector.fileSelector).attachFile(file);
      // click submit
      cy.contains(componentLocaleUS['component.global.confirm']).click();
      // show upload notification
      if (file === 'import-error.txt') {
        // show error msg
        cy.get(this.domSelector.notificationDesc).should('contain', data.importErrorMsg);
        // close modal
        cy.contains(componentLocaleUS['component.global.cancel']).click();
      } else {
        cy.get(this.domSelector.notification).should(
          'contain',
          `${routeLocaleUS['page.route.button.importOpenApi']} ${componentLocaleUS['component.status.success']}`,
        );
        cy.get(this.domSelector.notificationCloseIcon).click();
        // delete route just imported
        cy.contains(componentLocaleUS['component.global.delete']).click();
        cy.contains(componentLocaleUS['component.global.confirm']).click();
        // show delete successfully notification
        cy.get(this.domSelector.notification).should(
          'contain',
          `${componentLocaleUS['component.global.delete']} ${menuLocaleUS['menu.routes']} ${componentLocaleUS['component.status.success']}`,
        );
        cy.get(this.domSelector.notificationCloseIcon).click();
      }
    });
  });
});
