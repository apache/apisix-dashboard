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
    notifi: '.ant-notification-notice-description'
  };

  beforeEach(() => {
    // init login 
    cy.login();
  })

  it('set match certificate and key by input', () => {
    // go to ssl create page
    cy.visit('/');
    cy.contains('SSL').click();
    cy.contains('Create').click();

    cy.get('#cert').type(`-----BEGIN CERTIFICATE-----
MIIENzCCAx+gAwIBAgICEAAwDQYJKoZIhvcNAQELBQAwaTELMAkGA1UEBhMCQ04x
EjAQBgNVBAgMCUd1YW5nZG9uZzESMBAGA1UEBwwJR3Vhbmd6aG91MRQwEgYDVQQK
DAtGaXNoZHJvd25lZDEcMBoGA1UEAwwTRmlzaGRyb3duZWQgUk9PVCBDQTAeFw0y
MDExMDYwOTQ3NDhaFw0yMjExMDYwOTQ3NDhaMH8xCzAJBgNVBAYTAkNOMRIwEAYD
VQQIDAlHdWFuZ2RvbmcxEjAQBgNVBAcMCUd1YW5nemhvdTEUMBIGA1UECgwLRmlz
aGRyb3duZWQxFzAVBgNVBAsMDnd3dy50ZXN0aGouY29tMRkwFwYDVQQDDBAqLnd3
dy50ZXN0aGouY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzt2V
U3JAtNkiUhC/FKA0D3z9gRHaNR2+JYqnMHbetXJXF0ohWMKzjmzauaMYXUDPfQ8y
c7leR6Gj9Ow5A0sUwlSdH1P0viM1gnQj0kLxeb59vQaWSNuPm73C26R6en/Jgu8I
09c+gsBkhNykcnLevR5YPw2mOOKgLllmpCJsjqMkUUF1SLI503ZK2hVH6FdSntBS
YDbQVJVQ8j3M71eKr/D8Z5wN4Px41Y2bTke+xXm/2x5YRkZdtLCx/rbXPnYLruhG
/C7aLqlA/ykQV0AWQgu1tc5gnAcT3mb/3y7GlybC8poMNPcEWic05hBJhpxlDNll
wmUpcLEI3orAfbZnBwIDAQABo4HSMIHPMAkGA1UdEwQCMAAwMwYJYIZIAYb4QgEN
BCYWJE9wZW5TU0wgR2VuZXJhdGVkIFNlcnZlciBDZXJ0aWZpY2F0ZTAdBgNVHQ4E
FgQUfETT6xM8b68g7gTGDoTMChRckhcwHwYDVR0jBBgwFoAUB160Cmr3uK3bPRJr
QLm4zR+M4fEwCwYDVR0PBAQDAgWgMBMGA1UdJQQMMAoGCCsGAQUFBwMBMCsGA1Ud
EQQkMCKCECoud3d3LnRlc3Roai5jb22CDnd3dy50ZXN0aGouY29tMA0GCSqGSIb3
DQEBCwUAA4IBAQBKhcUTzhgEwtbVfn1cmlH3sFpzs2Bp7LZNDbhvZHJHQv70lJzA
Ik3b8WyYu6WvAAQS90P2HVh5m8jeVLfZod+AF96F+b9tOn+VkuEQ7g4gIbn/NhWp
/A8WFG7c6UvE3qQDBqN8UXRO3ZUlrweZwkCWQ6ioHzf+mw69xv7z1R/xo6Jcls7f
7o/W5xXhGgFuJCutjAMf+5PkZsqo1XgpZbcD3as3vTZ2ynbZuWrtqquIKHoulL6z
7aaDKz3NSgdSrGLwTRny8iDW6aGdDsWQGlOZV0Z6r9neFKimE0alUUyIn0j4raoD
X+/an0a+Qq1jWejwU9R59Xdv0/fZWXzKmkeC
-----END CERTIFICATE-----`);
    cy.get('#key').type(`-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEAzt2VU3JAtNkiUhC/FKA0D3z9gRHaNR2+JYqnMHbetXJXF0oh
WMKzjmzauaMYXUDPfQ8yc7leR6Gj9Ow5A0sUwlSdH1P0viM1gnQj0kLxeb59vQaW
SNuPm73C26R6en/Jgu8I09c+gsBkhNykcnLevR5YPw2mOOKgLllmpCJsjqMkUUF1
SLI503ZK2hVH6FdSntBSYDbQVJVQ8j3M71eKr/D8Z5wN4Px41Y2bTke+xXm/2x5Y
RkZdtLCx/rbXPnYLruhG/C7aLqlA/ykQV0AWQgu1tc5gnAcT3mb/3y7GlybC8poM
NPcEWic05hBJhpxlDNllwmUpcLEI3orAfbZnBwIDAQABAoIBAQCGvLCMP3iB0oOW
LC4pAwelpuV+8d/MhOjajurCmEoKqMSs+K2roHVPKPt1uhMeeh4q+IEF+xC7Wz7t
QgcIbBjDUlVcmFRqm4g4xeinBM8/WqGPQwETx15MNFb8tK7Jpv3beFGpmSKwCxvt
pcC+gq8tQtx7hSplFsb6KWS/N2S5qcEpQc2p4TrWBEJnmQXwXNhVytJltj+N3M+P
R1XdzO2SsNE7v6XU9L6Yp4HfT8yJ9WvGa8A+hME+4gbKJxEx/hCzDc/7Wdci2Po4
dZTKtyWQOpUHQyjh8Cs7Rc8MJWPIH0X5yg8rQggVa3Ouu+FWy6WhHEiEWfs1SUJY
UV0bWm3hAoGBAOlc8qdX882wDfeaS140/ghUDN65rh502ee7MXRCW7doooDPfZ+S
p5qP1IW68JKKOW1hED/bR52AjlOKzSpo1htIWOODlfCEe/Ym0S8jA8F4CKQCko9C
pJOuebJdy9cY8BX4nip8u4FQp3GWUSTjHOmDl7UIJf6o1tdJRayE6hp5AoGBAOLu
oOz79yPykjIY2IZpyx1L7phWtM2g80j/QZJHX3rbXXn4t8KKSfS0ryApbjQHhNlF
zC5nAcZb6Z/n8vZ8mwRji+FDWsEF5g/uYORhfdT0bISPnuRanSi8+hAkONjWlUzb
kMO2njUECEdJXkAmb82ZMqnTrBenWzKLkWcjTC1/AoGAHAxc6forRoyjkSANcPxD
kDKx/U8p+2UmD7EzJ3sWVPwRlBPcUIKq/GvPKmempKZScrAY6OPtPqQF90qWkENb
gJn4fRgCvI7f610NBXJa8DUCLNxWSzvCVjHBVMvrRSYtLSbds9OcIdXU2lUr2Zgm
kHaNlGevUWVvtR6MbkjnblkCgYEA1bf5FNdDbLZxmv6tRQFzifbOEOhvxMzU8qV7
AqF3OYRI56smnO+SMQTNfZOnNxbxtZI3dmgKUt6TCsbumdbGQ37g6Nh/KxQ8FDrj
Q5LRZ/J+FOYRtWvlYM2BEByc8RI+b7DFCJz/KFzQ0xo0ymOonc+u2CQCihBSIisx
WBn1D08CgYEAybW4F0uPy0jMg7fJCXzNOnwurKyAH7Uej7ZCAOJ/I1RRdGo6A0bZ
neuo3I758vX7jT6itMw/D35J5cm2DAAVgYhaECLg1qWTLaoJDcEQys5VmL6gBh8w
gaY1BQkhja1FqA7OcEylRUUWFgO3bWvHchOagVZUyipnYaq5KSwNhvA=
-----END RSA PRIVATE KEY-----`);

    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.wait(300);
    cy.url().should('contains', 'ssl/list');
  });

  it('teardown', () => {
    cy.visit('/ssl/list');
    cy.get('.ant-table-tbody').within(() => {
      cy.contains('2022-11-06 17:47:48').siblings().contains('Delete').click();
    });
    cy.contains('button', 'Confirm').click();
    cy.get('.ant-notification-notice-message').should('contain', 'Remove target SSL successfully');
  });

  it('set unmatch certificate and key by input', () => {
    // go to ssl create page
    cy.visit('/');
    cy.contains('SSL').click();
    cy.contains('Create').click();

    cy.get('#cert').type(`-----BEGIN CERTIFICATE-----
MIIENzCCAx+gAwIBAgICEAAwDQYJKoZIhvcNAQELBQAwaTELMAkGA1UEBhMCQ04x
EjAQBgNVBAgMCUd1YW5nZG9uZzESMBAGA1UEBwwJR3Vhbmd6aG91MRQwEgYDVQQK
-----END CERTIFICATE-----`);
    cy.get('#key').type(`-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEAzt2VU3JAtNkiUhC/FKA0D3z9gRHaNR2+JYqnMHbetXJXF0oh
WMKzjmzauaMYXUDPfQ8yc7leR6Gj9Ow5A0sUwlSdH1P0viM1gnQj0kLxeb59vQaW
-----END RSA PRIVATE KEY-----`);

    cy.contains('Next').click();
    cy.wait(100);
    cy.get(domSelectors.notifi).should('contain', "key and cert don't match");
  });
})
