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
package service

import (
	"strings"
	"testing"

	"github.com/apisix/manager-api/errno"
	uuid "github.com/satori/go.uuid"
	"github.com/stretchr/testify/assert"
)

var (
	u1 = uuid.NewV4()
	u2 = uuid.NewV4()
)

func TestSslParseCert(t *testing.T) {
	ssl, err := ParseCert("", "")

	assert := assert.New(t)
	assert.Nil(ssl)
	assert.Equal("invalid certificate", err.Error())

	//KeyPair fail

	cert := `-----BEGIN CERTIFICATE-----
MIIEWjCCAsKgAwIBAgIRAMLLNCKEvgEQL22Hpox6E1kwDQYJKoZIhvcNAQELBQAw
fzEeMBwGA1UEChMVbWtjZXJ0IGRldmVsb3BtZW50IENBMSowKAYDVQQLDCFqdW54
dWNoZW5AanVueHVkZUFpciAoanVueHUgY2hlbikxMTAvBgNVBAMMKG1rY2VydCBq
dW54dWNoZW5AanVueHVkZUFpciAoanVueHUgY2hlbikwHhcNMTkwNjAxMDAwMDAw
WhcNMzAwNjA5MTA0MjA1WjBVMScwJQYDVQQKEx5ta2NlcnQgZGV2ZWxvcG1lbnQg
Y2VydGlmaWNhdGUxKjAoBgNVBAsMIWp1bnh1Y2hlbkBqdW54dWRlQWlyIChqdW54
dSBjaGVuKTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAL2lg+vzHkRI
Cs8PHv6UVxXFbrL6wlsdurOICkW5daKUJyzUZQZl11CK9SWOk8vAc7j3pQ7Mz15r
hfQB558WHzI/XXbZ1NrZrTpLaL0fWW5n4hIE8EbYf3Hy/xM8gRUXsWMEexq2WC/R
PfTCQIZ85vUSANS72E5rHdba3Y5IMr8bn/NUg1sm2LxZQmZV6tBOpYnibyj7bXxw
8kxr4w+B/5jDBPmwL59bdoatEs1FjdHzz+fbW1K4NdHZZEotYqkQhCS09JnwGswd
Ariy+Is44kt/gtw7nVWmuV/eQaxPEHVE4Bwvdmv11IsPsj6hif23gXjXLIHx66CY
/S4I/P0allkCAwEAAaN7MHkwDgYDVR0PAQH/BAQDAgWgMBMGA1UdJQQMMAoGCCsG
AQUFBwMBMAwGA1UdEwEB/wQCMAAwHwYDVR0jBBgwFoAUVPhGyY/h6etoAqzb298k
JGJzx1wwIwYDVR0RBBwwGoIJdGVzdDMuY29tgg13d3cudGVzdDMuY29tMA0GCSqG
SIb3DQEBCwUAA4IBgQCgb5wOMzkD1/tgrjwE7Cj1NvX7/p/JIQVVtvtnnypyXGNn
VL+q4oB9WzvOvMcTCiKKHqg9jCiu/KFFHy7nRzj7KPhU/o9M7qLNwLJjfUOtPYUm
rS62kEXlj5L5+UJjiGABGfLllxMwwTkAFbdSUSB1awzoafPn5+g+qABXgkF/EN2I
+IJcJCqg3IO30n4MMhqNx3IbqIohD3p5GzjQqnuQSrC/HJEsUuIlMCHPJ1GVbbrd
RnSySMcbv2jThP53JVIe+0HHvcujb2pDQ4RcCSaN3OXaZDYVqoSR04+amotGwiWO
DY/4LTWFJkfoWnv1kg2/AllMpsXB+1u+O+x6qWzBw2hXP5AM+8KIoJ2/Mb13TsN9
qhrGep+SfhjARH068ZjaS2zQC2Uvc+SrEGXfITPIkstRELxIV9Lmjl9lwpAOJrte
4TDjYhBS20j6mt3dUyEBnPfkpcOeLYZNS1sK66MRfzJ9MowdTcWyvMzFHjSjfWPY
+4scQdmkFkCulnzylak=
-----END CERTIFICATE-----`
	key := `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC25tQs8GRxdWUR
c4kjhmJmrxQgCcoN4VTHyBbdbnZFPgxCULAr/2e54ooatMWh9DEdrgpi3EfQXqDV
okzKrSfJVZqmS1qOcgaSkgz5/puKcF31bXUgSVw1qGEjXbpQcyzZp95pPaErXCq3
7bKST5d0TO8asNebON+jZZkpa5NA+qFOOWdx0Y6UWG0G/RzhYyRRU9B6+SBwOLa8
c9+07vxjjAOXfr5Terp0lS9xNOVcjnHA48XPq2y8cJstbVjQI8Ls1HlzJoeJz+lt
FFxd8nMQ30NoJYoVXewUEjuTibQdEpUY8m5zuNqYKOax4McpoTouKl2BWIuWr10Y
Wrtw9XWlAgMBAAECggEAdoDsbAl9Kr3jNAFlk2zYiKtbIL72+TNL2P1dQy701jwz
eSwKWRdsP1X2IQOLITm0MQS4mgEbTnhhQMmdc5vpMVuTjbc4/x4GACU83yUF5haT
6hZ3Uun1IpbsCRwLQWC+aG+JfSp/KDbZPr51erKy8JmAOgzmRR3+WEHVkK6wg+JF
qDha7Gnq2xgzmutGLBUb9BFgL7bbNyf3V4d+HbgYPjQossfpLnTIrsmKce36r5U8
pF6Uf69EUs34N9w98E6mEGY12nY4jOKZMeRPR1FIGGK7Y3+7fkd2+pYF00s7uSUq
/j8DdxxykqvZkE1lBZJBwxk9Ty4PBq2lNKdq6pXtAQKBgQDu12vVuenRCJEsK2FY
puYlfoDiQpIYzK9Bme+eDsPcVyOQ9q+Tf4QASZN81InQsanQ2ovcbmSpB52/ZvjU
rVX7RnIEcZ6jB1VUcCU/QOEg0kqTkCo3SfyeawF8iPyuLSbb5ZBufFMq6nOyOWco
hg4EqQIg3rcKw3lW8NT6DqqRxQKBgQDECpuhfEMYUslfDlSbS8V/vSXjD2xzRFt3
SL87xQXwZOLRPYiLdRGb/WP2L/PGE8K1XUMz/geeFeAdrzRxJ1JtCn/K0UyMxSnw
TJEm6CFfsOJXOq4yC5gosNYw3xBc9NKtsGLrAlWOBLPdeO1wdrM6BYfs6AP3X49r
67Y7AujyYQKBgQCMSV//c2nQ6/VJOlm9VprL3xgYzf0+L8uo/p/t+MI2Q8CSPzM1
sap4+L52jeg8+n3CPPv1h6n8Vorjh7oUQZPFOcVyssH5BC+snwphstwJCTvgnMcP
HpgQ/M0sttGkBMVUV+yT2NaI2JkIUAs1lDfbqOGlKOvemJ5G4MJX9hFd+QKBgQDC
oe2F1EMg4QCAWU/yprW8buQwnF2FyzYsJZOHGcMdumveZYMtQdtrzZTzFQSngXLs
cV2JPwn9D6bkkdA1D18sVyItEMM5d359zubFg+2ufYUaKW5MzWoR7A+bkbtDLuYD
/30V6clbKJwSpD7IS3EBiAA9WtSlQsC32tuflvIDwQKBgAqJAqrempkVGA2rvTX5
7uWCAiqUKX859kmIuQV9RTQ7qfQRWhckuAjeTdTq6tWKFkzaVaRCXb+tRi7eqVsz
R/us0LXwHez2LacSVudO7g/LMY3yDxVL2iFLVA/x1FBqjAgjWAEfnc7PmZSK2B3g
fpf+iWh15t6I4nuyEmMFmtVr
-----END PRIVATE KEY-----`
	ssl1, err := ParseCert(cert, key)

	assert.Nil(ssl1)
	assert.Equal("key and cert don't match", err.Error())

	// ip

	cert = `-----BEGIN CERTIFICATE-----
MIIERjCCAq6gAwIBAgIRALI5vYiIHdtNd4ocLsZ9i/IwDQYJKoZIhvcNAQELBQAw
fzEeMBwGA1UEChMVbWtjZXJ0IGRldmVsb3BtZW50IENBMSowKAYDVQQLDCFqdW54
dWNoZW5AanVueHVkZUFpciAoanVueHUgY2hlbikxMTAvBgNVBAMMKG1rY2VydCBq
dW54dWNoZW5AanVueHVkZUFpciAoanVueHUgY2hlbikwHhcNMTkwNjAxMDAwMDAw
WhcNMzAwNjAzMDEyODQ5WjBVMScwJQYDVQQKEx5ta2NlcnQgZGV2ZWxvcG1lbnQg
Y2VydGlmaWNhdGUxKjAoBgNVBAsMIWp1bnh1Y2hlbkBqdW54dWRlQWlyIChqdW54
dSBjaGVuKTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALbm1CzwZHF1
ZRFziSOGYmavFCAJyg3hVMfIFt1udkU+DEJQsCv/Z7niihq0xaH0MR2uCmLcR9Be
oNWiTMqtJ8lVmqZLWo5yBpKSDPn+m4pwXfVtdSBJXDWoYSNdulBzLNmn3mk9oStc
KrftspJPl3RM7xqw15s436NlmSlrk0D6oU45Z3HRjpRYbQb9HOFjJFFT0Hr5IHA4
trxz37Tu/GOMA5d+vlN6unSVL3E05VyOccDjxc+rbLxwmy1tWNAjwuzUeXMmh4nP
6W0UXF3ycxDfQ2glihVd7BQSO5OJtB0SlRjybnO42pgo5rHgxymhOi4qXYFYi5av
XRhau3D1daUCAwEAAaNnMGUwDgYDVR0PAQH/BAQDAgWgMBMGA1UdJQQMMAoGCCsG
AQUFBwMBMAwGA1UdEwEB/wQCMAAwHwYDVR0jBBgwFoAUVPhGyY/h6etoAqzb298k
JGJzx1wwDwYDVR0RBAgwBocEfwAAATANBgkqhkiG9w0BAQsFAAOCAYEAowBgpVs+
pZ4PeT2mVx79thwh02AzinmNbMQMboHK9RaRSZHxLHiVjY7LR1qn5zjLcUcZHel7
96bka6vlufYzWHSjtKwAchDVVPVK6tzpfHnpLzNLShx0LjIl0EvjrHv5mHIx8R1T
WKQGxwdTzIxGMgrziuTNc1LvS+yoJElWe07PeRSdSPKUNKQQWqaukzqw3JZaLQkm
8MaqrzQwNEsCbeojz/ME3e+SzpSsqXgW0x5Og4TyEnIen/q7OzmRzrkHR40Hu+j4
aW287l3ywIU0pGl/sY2bmyOYCgpZ5w2utfdd7167Doy4vHFKJD3GuN3i+W1f7PyF
gdUFUQTr6HO4sfQXeZoitzl2Dvr360sb9BBDLAoFiV6J5bAV4algVz45kSpJ7VIm
pfS8+BUcZHWbn35M9mx2dyoNvIajcET545D60wcttqw4TRh4ljsE69GCU1swiwxH
hXSkf958injuwYuxv0b1k9qGm6znJc+tRcn35H6x0ff/HwuBIj3TsEXo
-----END CERTIFICATE-----`
	key = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC25tQs8GRxdWUR
c4kjhmJmrxQgCcoN4VTHyBbdbnZFPgxCULAr/2e54ooatMWh9DEdrgpi3EfQXqDV
okzKrSfJVZqmS1qOcgaSkgz5/puKcF31bXUgSVw1qGEjXbpQcyzZp95pPaErXCq3
7bKST5d0TO8asNebON+jZZkpa5NA+qFOOWdx0Y6UWG0G/RzhYyRRU9B6+SBwOLa8
c9+07vxjjAOXfr5Terp0lS9xNOVcjnHA48XPq2y8cJstbVjQI8Ls1HlzJoeJz+lt
FFxd8nMQ30NoJYoVXewUEjuTibQdEpUY8m5zuNqYKOax4McpoTouKl2BWIuWr10Y
Wrtw9XWlAgMBAAECggEAdoDsbAl9Kr3jNAFlk2zYiKtbIL72+TNL2P1dQy701jwz
eSwKWRdsP1X2IQOLITm0MQS4mgEbTnhhQMmdc5vpMVuTjbc4/x4GACU83yUF5haT
6hZ3Uun1IpbsCRwLQWC+aG+JfSp/KDbZPr51erKy8JmAOgzmRR3+WEHVkK6wg+JF
qDha7Gnq2xgzmutGLBUb9BFgL7bbNyf3V4d+HbgYPjQossfpLnTIrsmKce36r5U8
pF6Uf69EUs34N9w98E6mEGY12nY4jOKZMeRPR1FIGGK7Y3+7fkd2+pYF00s7uSUq
/j8DdxxykqvZkE1lBZJBwxk9Ty4PBq2lNKdq6pXtAQKBgQDu12vVuenRCJEsK2FY
puYlfoDiQpIYzK9Bme+eDsPcVyOQ9q+Tf4QASZN81InQsanQ2ovcbmSpB52/ZvjU
rVX7RnIEcZ6jB1VUcCU/QOEg0kqTkCo3SfyeawF8iPyuLSbb5ZBufFMq6nOyOWco
hg4EqQIg3rcKw3lW8NT6DqqRxQKBgQDECpuhfEMYUslfDlSbS8V/vSXjD2xzRFt3
SL87xQXwZOLRPYiLdRGb/WP2L/PGE8K1XUMz/geeFeAdrzRxJ1JtCn/K0UyMxSnw
TJEm6CFfsOJXOq4yC5gosNYw3xBc9NKtsGLrAlWOBLPdeO1wdrM6BYfs6AP3X49r
67Y7AujyYQKBgQCMSV//c2nQ6/VJOlm9VprL3xgYzf0+L8uo/p/t+MI2Q8CSPzM1
sap4+L52jeg8+n3CPPv1h6n8Vorjh7oUQZPFOcVyssH5BC+snwphstwJCTvgnMcP
HpgQ/M0sttGkBMVUV+yT2NaI2JkIUAs1lDfbqOGlKOvemJ5G4MJX9hFd+QKBgQDC
oe2F1EMg4QCAWU/yprW8buQwnF2FyzYsJZOHGcMdumveZYMtQdtrzZTzFQSngXLs
cV2JPwn9D6bkkdA1D18sVyItEMM5d359zubFg+2ufYUaKW5MzWoR7A+bkbtDLuYD
/30V6clbKJwSpD7IS3EBiAA9WtSlQsC32tuflvIDwQKBgAqJAqrempkVGA2rvTX5
7uWCAiqUKX859kmIuQV9RTQ7qfQRWhckuAjeTdTq6tWKFkzaVaRCXb+tRi7eqVsz
R/us0LXwHez2LacSVudO7g/LMY3yDxVL2iFLVA/x1FBqjAgjWAEfnc7PmZSK2B3g
fpf+iWh15t6I4nuyEmMFmtVr
-----END PRIVATE KEY-----`
	ssl2, err := ParseCert(cert, key)

	assert.Nil(err)
	assert.Equal("[\"127.0.0.1\"]", ssl2.Snis)

	// v1 multi domain
	cert = `-----BEGIN CERTIFICATE-----
MIICcTCCAdoCCQDQoPEll/bQizANBgkqhkiG9w0BAQsFADB9MQswCQYDVQQGEwJD
TjEOMAwGA1UECAwFbXlrZXkxDjAMBgNVBAcMBW15a2V5MQ4wDAYDVQQKDAVteWtl
eTEOMAwGA1UECwwFbXlrZXkxDjAMBgNVBAMMBWEuY29tMQ4wDAYDVQQDDAViLmNv
bTEOMAwGA1UEAwwFYy5jb20wHhcNMjAwNjE3MDk1MDA0WhcNMzAwNjE1MDk1MDA0
WjB9MQswCQYDVQQGEwJDTjEOMAwGA1UECAwFbXlrZXkxDjAMBgNVBAcMBW15a2V5
MQ4wDAYDVQQKDAVteWtleTEOMAwGA1UECwwFbXlrZXkxDjAMBgNVBAMMBWEuY29t
MQ4wDAYDVQQDDAViLmNvbTEOMAwGA1UEAwwFYy5jb20wgZ8wDQYJKoZIhvcNAQEB
BQADgY0AMIGJAoGBANHMrKlfFzJbyYuD0YveK2mOOXR9zXi+vC5lW6RaoyKjx5AL
yIXQWXURGVnxw1+xbmxWN1MXZyAP7eJYFPa0PIJvW0kbyHkJt/TrCyBLVOqpTqvE
kDAIde9Fx83556sXD43Oq93lyBraXmR+fXuoLxJQQLhALW1tOg1X3VrxKYXNAgMB
AAEwDQYJKoZIhvcNAQELBQADgYEAwJ7qV0Tj6JXR035ySVSBG1KBF19DVmMYRKdO
SAU1j437q+ktTcEWSA0CkH6rg53tP4V1h0tzdhCxisivYynngjtEcZfsrwdIrsSg
cmOBZ+KTRyZ2fLgH4F8Naz5hBrwmR8ZIG46feVOV/swJzz4BNaXGj1oATWkLMA3c
Sf0G+aI=
-----END CERTIFICATE-----`
	key = `-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQDRzKypXxcyW8mLg9GL3itpjjl0fc14vrwuZVukWqMio8eQC8iF
0Fl1ERlZ8cNfsW5sVjdTF2cgD+3iWBT2tDyCb1tJG8h5Cbf06wsgS1TqqU6rxJAw
CHXvRcfN+eerFw+Nzqvd5cga2l5kfn17qC8SUEC4QC1tbToNV91a8SmFzQIDAQAB
AoGBAJIL/y4wqf8+ckES1G6fjG0AuvJjGQQzEuDhYjg5eFMG3EdkTIUKkxuxeYpp
iG43H/1+zyiipAFn1Vu5oW5T7cJEgC1YA39dERT605S5BrNWWHoZsgH+qmLoq7X+
jXMlmCagwlgwhUWMU2M1/LUbAl42384dK9u3EwcCgS//sFuBAkEA6mK52/Z03PB3
0sS14eN7xFl96yc/NcneJ7Vy5APT0KGLo0j2S8gpOVW9EYrrzDzWgQ8FLIeed2Zw
Z4ATksgRXQJBAOUlh5VJkyMdMiDEeJgK9QKtJkuiLZFAzZiWAUqjvSG2j8tWX/iN
veI1sXCPyQSKoWPN74+23KWL+nW+mUzkzzECQFf+UIB/+keoD5QVPaNcX+7LGjba
OSTccIa/3C42MaM1wtK+ZZj1wGRCCAU5/mRiwrUZCnw5PgjdcH2q265TZhECQASY
JgnGOd8AXNrvVYOm5JazJgtqKwO4iua+SzRV6Bre8C8hgjcXkHESpoYdO+iNZwL7
RAxbnDzte44UzjoOdGECQGtkrBffiyMaQv6LM/6Fa5TXHb1kPtLGIjFSygR3eTYI
gHG78R5ac0dzhbyKaOo6cbj7CJVkbBh4BNW94tBZE/I=
-----END RSA PRIVATE KEY-----`

	ssl3, err := ParseCert(cert, key)

	assert.Nil(err)
	assert.Equal("[\"a.com\",\"b.com\",\"c.com\"]", ssl3.Snis)
}

func TestSslCurd(t *testing.T) {
	//test3.com
	param := []byte(`{
		"cert": "-----BEGIN CERTIFICATE-----\nMIIEWjCCAsKgAwIBAgIRAMLLNCKEvgEQL22Hpox6E1kwDQYJKoZIhvcNAQELBQAw\nfzEeMBwGA1UEChMVbWtjZXJ0IGRldmVsb3BtZW50IENBMSowKAYDVQQLDCFqdW54\ndWNoZW5AanVueHVkZUFpciAoanVueHUgY2hlbikxMTAvBgNVBAMMKG1rY2VydCBq\ndW54dWNoZW5AanVueHVkZUFpciAoanVueHUgY2hlbikwHhcNMTkwNjAxMDAwMDAw\nWhcNMzAwNjA5MTA0MjA1WjBVMScwJQYDVQQKEx5ta2NlcnQgZGV2ZWxvcG1lbnQg\nY2VydGlmaWNhdGUxKjAoBgNVBAsMIWp1bnh1Y2hlbkBqdW54dWRlQWlyIChqdW54\ndSBjaGVuKTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAL2lg+vzHkRI\nCs8PHv6UVxXFbrL6wlsdurOICkW5daKUJyzUZQZl11CK9SWOk8vAc7j3pQ7Mz15r\nhfQB558WHzI/XXbZ1NrZrTpLaL0fWW5n4hIE8EbYf3Hy/xM8gRUXsWMEexq2WC/R\nPfTCQIZ85vUSANS72E5rHdba3Y5IMr8bn/NUg1sm2LxZQmZV6tBOpYnibyj7bXxw\n8kxr4w+B/5jDBPmwL59bdoatEs1FjdHzz+fbW1K4NdHZZEotYqkQhCS09JnwGswd\nAriy+Is44kt/gtw7nVWmuV/eQaxPEHVE4Bwvdmv11IsPsj6hif23gXjXLIHx66CY\n/S4I/P0allkCAwEAAaN7MHkwDgYDVR0PAQH/BAQDAgWgMBMGA1UdJQQMMAoGCCsG\nAQUFBwMBMAwGA1UdEwEB/wQCMAAwHwYDVR0jBBgwFoAUVPhGyY/h6etoAqzb298k\nJGJzx1wwIwYDVR0RBBwwGoIJdGVzdDMuY29tgg13d3cudGVzdDMuY29tMA0GCSqG\nSIb3DQEBCwUAA4IBgQCgb5wOMzkD1/tgrjwE7Cj1NvX7/p/JIQVVtvtnnypyXGNn\nVL+q4oB9WzvOvMcTCiKKHqg9jCiu/KFFHy7nRzj7KPhU/o9M7qLNwLJjfUOtPYUm\nrS62kEXlj5L5+UJjiGABGfLllxMwwTkAFbdSUSB1awzoafPn5+g+qABXgkF/EN2I\n+IJcJCqg3IO30n4MMhqNx3IbqIohD3p5GzjQqnuQSrC/HJEsUuIlMCHPJ1GVbbrd\nRnSySMcbv2jThP53JVIe+0HHvcujb2pDQ4RcCSaN3OXaZDYVqoSR04+amotGwiWO\nDY/4LTWFJkfoWnv1kg2/AllMpsXB+1u+O+x6qWzBw2hXP5AM+8KIoJ2/Mb13TsN9\nqhrGep+SfhjARH068ZjaS2zQC2Uvc+SrEGXfITPIkstRELxIV9Lmjl9lwpAOJrte\n4TDjYhBS20j6mt3dUyEBnPfkpcOeLYZNS1sK66MRfzJ9MowdTcWyvMzFHjSjfWPY\n+4scQdmkFkCulnzylak=\n-----END CERTIFICATE-----",
		"key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC9pYPr8x5ESArP\nDx7+lFcVxW6y+sJbHbqziApFuXWilCcs1GUGZddQivUljpPLwHO496UOzM9ea4X0\nAeefFh8yP1122dTa2a06S2i9H1luZ+ISBPBG2H9x8v8TPIEVF7FjBHsatlgv0T30\nwkCGfOb1EgDUu9hOax3W2t2OSDK/G5/zVINbJti8WUJmVerQTqWJ4m8o+218cPJM\na+MPgf+YwwT5sC+fW3aGrRLNRY3R88/n21tSuDXR2WRKLWKpEIQktPSZ8BrMHQK4\nsviLOOJLf4LcO51Vprlf3kGsTxB1ROAcL3Zr9dSLD7I+oYn9t4F41yyB8eugmP0u\nCPz9GpZZAgMBAAECggEAZ2+8SVgb/QASLSdBL3d3HB/IJgSRNyM67qrXd3oVCCyo\nRVI/G8M2Me7okKh4QhxgwdUIiM76l7Qrpo/XZjSppT1cW/Opngg17GKu6OANZiNw\n8YUSDIIO2PbBWxuYCAoZLTmHb2VfKg2FLlc43GGJksdT/rPJ4dOYvdQ4HV+Rlhuo\ntLJznoTStoX+DXLaNU7+jK1ZjbjOKPWcTJt42a0Rvu34ghtbqhkHt9VAvqysgysq\n2GO6Idvu3CE3rgDyde4SBiZL5twtLX3/56daIOG/Gt9NtfvftIilgrPoMfY8WsJH\njY5AaJKaq88a+A2M3ICOAehquhaGqest9kXP5qWzZQKBgQDIrvROSvKxYw9nAksR\nQtvA8fDp6JYxViDqAK5O3kCs0eamCNGycqEOO8yBakWY3YlVxVZVUd/0kymhePEw\nwiJbIZppOaS7xDtdrPvk3QwIVCDYYfZ7SyY1n1FPynpWAYTqIm1YuhWDqXOcQZcy\nxaK86LOtAIAIXomefJYEvkya4wKBgQDx68EKTqxdETiUGUJVxgTLg96Y5zMGLgGO\n6lkqpbUQFfN4yZSHv97P9gugv9fKustGxCEvA9StC2Dq7AtpjOqfYabqiM7ywqzf\nmKazBcIch/qPijVHZO6bLRBUXZWhV7/qZzxN7luenr+U4XwtxBXApGdUmkQYwPnk\nc52J156ikwKBgGOmtLu37cF13i0Zb2s31uV9flK4YvRGv3tTMTsKk/T9GdoyoOZK\nk3z85rUQr1SUFWEY56DgUiQhe1eqNaIvlF3KVuGPdSSj8ZK3ljF0LkhodhLcukdI\n7sVLwlWrxom0oWqeA8w+QvapCzZ5P3o/t2q05puuluURBKdFWD0svd9fAoGANjnk\nAU11MT9E8V1gEx3ZwUyDvr5EH6R8UO6Sog6WsU5aTr7QfkUxymeaX6Pg2N5Z5jjc\nP0+agldEmCPkwvoFNUiMQ5H64UtluJDc/M/TnNWWAkq2epRTL5FAUcjQW2Px7rbJ\nO6ar/rgStWp9jTygq5euWbZigTHwUZbgvx8HveUCgYBsNapwmK2w66ve6rhCHR4W\naNSZyHq/hz84hwhUwSMFv0qU54oJchZWGPnBBIHWlV3J/yYTxQ3p9UWRlH3u2kpQ\nhEcGHWmVjKCc1IL/Qczw4U4koMNSOY+uqJmomOGkDpA2yWuOIDhFXebLSdcJNr0u\n2DYf16scbug3YbbqdD2WGg==\n-----END PRIVATE KEY-----"
	}`)

	err := SslCreate(param, u1.String())

	assert := assert.New(t)
	assert.Nil(err)

	//get item
	ssl, err := SslItem(u1.String())
	assert.Nil(err)
	assert.Equal(uint64(1), ssl.Status)
	assert.Equal(2, len(ssl.Snis))
	for _, dm := range ssl.Snis {
		assert.Equal(true, strings.Contains(dm, "test3.com"))
	}

	//test3.com duplicate
	param = []byte(`{
		"cert": "-----BEGIN CERTIFICATE-----\nMIIEWjCCAsKgAwIBAgIRAMLLNCKEvgEQL22Hpox6E1kwDQYJKoZIhvcNAQELBQAw\nfzEeMBwGA1UEChMVbWtjZXJ0IGRldmVsb3BtZW50IENBMSowKAYDVQQLDCFqdW54\ndWNoZW5AanVueHVkZUFpciAoanVueHUgY2hlbikxMTAvBgNVBAMMKG1rY2VydCBq\ndW54dWNoZW5AanVueHVkZUFpciAoanVueHUgY2hlbikwHhcNMTkwNjAxMDAwMDAw\nWhcNMzAwNjA5MTA0MjA1WjBVMScwJQYDVQQKEx5ta2NlcnQgZGV2ZWxvcG1lbnQg\nY2VydGlmaWNhdGUxKjAoBgNVBAsMIWp1bnh1Y2hlbkBqdW54dWRlQWlyIChqdW54\ndSBjaGVuKTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAL2lg+vzHkRI\nCs8PHv6UVxXFbrL6wlsdurOICkW5daKUJyzUZQZl11CK9SWOk8vAc7j3pQ7Mz15r\nhfQB558WHzI/XXbZ1NrZrTpLaL0fWW5n4hIE8EbYf3Hy/xM8gRUXsWMEexq2WC/R\nPfTCQIZ85vUSANS72E5rHdba3Y5IMr8bn/NUg1sm2LxZQmZV6tBOpYnibyj7bXxw\n8kxr4w+B/5jDBPmwL59bdoatEs1FjdHzz+fbW1K4NdHZZEotYqkQhCS09JnwGswd\nAriy+Is44kt/gtw7nVWmuV/eQaxPEHVE4Bwvdmv11IsPsj6hif23gXjXLIHx66CY\n/S4I/P0allkCAwEAAaN7MHkwDgYDVR0PAQH/BAQDAgWgMBMGA1UdJQQMMAoGCCsG\nAQUFBwMBMAwGA1UdEwEB/wQCMAAwHwYDVR0jBBgwFoAUVPhGyY/h6etoAqzb298k\nJGJzx1wwIwYDVR0RBBwwGoIJdGVzdDMuY29tgg13d3cudGVzdDMuY29tMA0GCSqG\nSIb3DQEBCwUAA4IBgQCgb5wOMzkD1/tgrjwE7Cj1NvX7/p/JIQVVtvtnnypyXGNn\nVL+q4oB9WzvOvMcTCiKKHqg9jCiu/KFFHy7nRzj7KPhU/o9M7qLNwLJjfUOtPYUm\nrS62kEXlj5L5+UJjiGABGfLllxMwwTkAFbdSUSB1awzoafPn5+g+qABXgkF/EN2I\n+IJcJCqg3IO30n4MMhqNx3IbqIohD3p5GzjQqnuQSrC/HJEsUuIlMCHPJ1GVbbrd\nRnSySMcbv2jThP53JVIe+0HHvcujb2pDQ4RcCSaN3OXaZDYVqoSR04+amotGwiWO\nDY/4LTWFJkfoWnv1kg2/AllMpsXB+1u+O+x6qWzBw2hXP5AM+8KIoJ2/Mb13TsN9\nqhrGep+SfhjARH068ZjaS2zQC2Uvc+SrEGXfITPIkstRELxIV9Lmjl9lwpAOJrte\n4TDjYhBS20j6mt3dUyEBnPfkpcOeLYZNS1sK66MRfzJ9MowdTcWyvMzFHjSjfWPY\n+4scQdmkFkCulnzylak=\n-----END CERTIFICATE-----",
		"key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC9pYPr8x5ESArP\nDx7+lFcVxW6y+sJbHbqziApFuXWilCcs1GUGZddQivUljpPLwHO496UOzM9ea4X0\nAeefFh8yP1122dTa2a06S2i9H1luZ+ISBPBG2H9x8v8TPIEVF7FjBHsatlgv0T30\nwkCGfOb1EgDUu9hOax3W2t2OSDK/G5/zVINbJti8WUJmVerQTqWJ4m8o+218cPJM\na+MPgf+YwwT5sC+fW3aGrRLNRY3R88/n21tSuDXR2WRKLWKpEIQktPSZ8BrMHQK4\nsviLOOJLf4LcO51Vprlf3kGsTxB1ROAcL3Zr9dSLD7I+oYn9t4F41yyB8eugmP0u\nCPz9GpZZAgMBAAECggEAZ2+8SVgb/QASLSdBL3d3HB/IJgSRNyM67qrXd3oVCCyo\nRVI/G8M2Me7okKh4QhxgwdUIiM76l7Qrpo/XZjSppT1cW/Opngg17GKu6OANZiNw\n8YUSDIIO2PbBWxuYCAoZLTmHb2VfKg2FLlc43GGJksdT/rPJ4dOYvdQ4HV+Rlhuo\ntLJznoTStoX+DXLaNU7+jK1ZjbjOKPWcTJt42a0Rvu34ghtbqhkHt9VAvqysgysq\n2GO6Idvu3CE3rgDyde4SBiZL5twtLX3/56daIOG/Gt9NtfvftIilgrPoMfY8WsJH\njY5AaJKaq88a+A2M3ICOAehquhaGqest9kXP5qWzZQKBgQDIrvROSvKxYw9nAksR\nQtvA8fDp6JYxViDqAK5O3kCs0eamCNGycqEOO8yBakWY3YlVxVZVUd/0kymhePEw\nwiJbIZppOaS7xDtdrPvk3QwIVCDYYfZ7SyY1n1FPynpWAYTqIm1YuhWDqXOcQZcy\nxaK86LOtAIAIXomefJYEvkya4wKBgQDx68EKTqxdETiUGUJVxgTLg96Y5zMGLgGO\n6lkqpbUQFfN4yZSHv97P9gugv9fKustGxCEvA9StC2Dq7AtpjOqfYabqiM7ywqzf\nmKazBcIch/qPijVHZO6bLRBUXZWhV7/qZzxN7luenr+U4XwtxBXApGdUmkQYwPnk\nc52J156ikwKBgGOmtLu37cF13i0Zb2s31uV9flK4YvRGv3tTMTsKk/T9GdoyoOZK\nk3z85rUQr1SUFWEY56DgUiQhe1eqNaIvlF3KVuGPdSSj8ZK3ljF0LkhodhLcukdI\n7sVLwlWrxom0oWqeA8w+QvapCzZ5P3o/t2q05puuluURBKdFWD0svd9fAoGANjnk\nAU11MT9E8V1gEx3ZwUyDvr5EH6R8UO6Sog6WsU5aTr7QfkUxymeaX6Pg2N5Z5jjc\nP0+agldEmCPkwvoFNUiMQ5H64UtluJDc/M/TnNWWAkq2epRTL5FAUcjQW2Px7rbJ\nO6ar/rgStWp9jTygq5euWbZigTHwUZbgvx8HveUCgYBsNapwmK2w66ve6rhCHR4W\naNSZyHq/hz84hwhUwSMFv0qU54oJchZWGPnBBIHWlV3J/yYTxQ3p9UWRlH3u2kpQ\nhEcGHWmVjKCc1IL/Qczw4U4koMNSOY+uqJmomOGkDpA2yWuOIDhFXebLSdcJNr0u\n2DYf16scbug3YbbqdD2WGg==\n-----END PRIVATE KEY-----"
	}`)

	err = SslCreate(param, u2.String())
	assert.NotNil(err)
	assert.Equal(errno.DuplicateSslCert.Code, err.(*errno.ManagerError).Code)

	//a.com b.com fail
	param = []byte(`{
		"cert": "-----BEGIN CERTIFICATE-----\nMIICcTCCAdoCCQDQoPEll/bQizANBgkqhkiG9w0BAQsFADB9MQswCQYDVQQGEwJD\nTjEOMAwGA1UECAwFbXlrZXkxDjAMBgNVBAcMBW15a2V5MQ4wDAYDVQQKDAVteWtl\neTEOMAwGA1UECwwFbXlrZXkxDjAMBgNVBAMMBWEuY29tMQ4wDAYDVQQDDAViLmNv\nbTEOMAwGA1UEAwwFYy5jb20wHhcNMjAwNjE3MDk1MDA0WhcNMzAwNjE1MDk1MDA0\nWjB9MQswCQYDVQQGEwJDTjEOMAwGA1UECAwFbXlrZXkxDjAMBgNVBAcMBW15a2V5\nMQ4wDAYDVQQKDAVteWtleTEOMAwGA1UECwwFbXlrZXkxDjAMBgNVBAMMBWEuY29t\nMQ4wDAYDVQQDDAViLmNvbTEOMAwGA1UEAwwFYy5jb20wgZ8wDQYJKoZIhvcNAQEB\nBQADgY0AMIGJAoGBANHMrKlfFzJbyYuD0YveK2mOOXR9zXi+vC5lW6RaoyKjx5AL\nyIXQWXURGVnxw1+xbmxWN1MXZyAP7eJYFPa0PIJvW0kbyHkJt/TrCyBLVOqpTqvE\nkDAIde9Fx83556sXD43Oq93lyBraXmR+fXuoLxJQQLhALW1tOg1X3VrxKYXNAgMB\nAAEwDQYJKoZIhvcNAQELBQADgYEAwJ7qV0Tj6JXR035ySVSBG1KBF19DVmMYRKdO\nSAU1j437q+ktTcEWSA0CkH6rg53tP4V1h0tzdhCxisivYynngjtEcZfsrwdIrsSg\ncmOBZ+KTRyZ2fLgH4F8Naz5hBrwmR8ZIG46feVOV/swJzz4BNaXGj1oATWkLMA3c\nSf0G+aI=\n-----END CERTIFICATE-----",
		"key": "-----BEGIN RSA PRIVATE KEY-----\nMIICXAIBAAKBgQDRzKypXxcyW8mLg9GL3itpjjl0fc14vrwuZVukWqMio8eQC8iF\n0Fl1ERlZ8cNfsW5sVjdTF2cgD+3iWBT2tDyCb1tJG8h5Cbf06wsgS1TqqU6rxJAw\nCHXvRcfN+eerFw+Nzqvd5cga2l5kfn17qC8SUEC4QC1tbToNV91a8SmFzQIDAQAB\nAoGBAJIL/y4wqf8+ckES1G6fjG0AuvJjGQQzEuDhYjg5eFMG3EdkTIUKkxuxeYpp\niG43H/1+zyiipAFn1Vu5oW5T7cJEgC1YA39dERT605S5BrNWWHoZsgH+qmLoq7X+\njXMlmCagwlgwhUWMU2M1/LUbAl42384dK9u3EwcCgS//sFuBAkEA6mK52/Z03PB3\n0sS14eN7xFl96yc/NcneJ7Vy5APT0KGLo0j2S8gpOVW9EYrrzDzWgQ8FLIeed2Zw\nZ4ATksgRXQJBAOUlh5VJkyMdMiDEeJgK9QKtJkuiLZFAzZiWAUqjvSG2j8tWX/iN\nveI1sXCPyQSKoWPN74+23KWL+nW+mUzkzzECQFf+UIB/+keoD5QVPaNcX+7LGjba\nOSTccIa/3C42MaM1wtK+ZZj1wGRCCAU5/mRiwrUZCnw5PgjdcH2q265TZhECQASY\nJgnGOd8AXNrvVYOm5JazJgtqKwO4iua+SzRV6Bre8C8hgjcXkHESpoYdO+iNZwL7\nRAxbnDzte44UzjoOdGECQGtkrBffiyMaQv6LM/6Fa5TXHb1kPtLGIjFSygR3eTYI\ngHG78R5ac0dzhbyKaOo6cbj7CJVkbBh4BNW94tBZE/I=\n-----END RSA PRIVATE KEY-----"
	}`)

	err = SslCreate(param, u1.String())
	assert.NotNil(err)
	assert.Equal(errno.DBWriteError.Code, err.(*errno.ManagerError).Code)

	//a.com b.com  ok
	param = []byte(`{
		"cert": "-----BEGIN CERTIFICATE-----\nMIICcTCCAdoCCQDQoPEll/bQizANBgkqhkiG9w0BAQsFADB9MQswCQYDVQQGEwJD\nTjEOMAwGA1UECAwFbXlrZXkxDjAMBgNVBAcMBW15a2V5MQ4wDAYDVQQKDAVteWtl\neTEOMAwGA1UECwwFbXlrZXkxDjAMBgNVBAMMBWEuY29tMQ4wDAYDVQQDDAViLmNv\nbTEOMAwGA1UEAwwFYy5jb20wHhcNMjAwNjE3MDk1MDA0WhcNMzAwNjE1MDk1MDA0\nWjB9MQswCQYDVQQGEwJDTjEOMAwGA1UECAwFbXlrZXkxDjAMBgNVBAcMBW15a2V5\nMQ4wDAYDVQQKDAVteWtleTEOMAwGA1UECwwFbXlrZXkxDjAMBgNVBAMMBWEuY29t\nMQ4wDAYDVQQDDAViLmNvbTEOMAwGA1UEAwwFYy5jb20wgZ8wDQYJKoZIhvcNAQEB\nBQADgY0AMIGJAoGBANHMrKlfFzJbyYuD0YveK2mOOXR9zXi+vC5lW6RaoyKjx5AL\nyIXQWXURGVnxw1+xbmxWN1MXZyAP7eJYFPa0PIJvW0kbyHkJt/TrCyBLVOqpTqvE\nkDAIde9Fx83556sXD43Oq93lyBraXmR+fXuoLxJQQLhALW1tOg1X3VrxKYXNAgMB\nAAEwDQYJKoZIhvcNAQELBQADgYEAwJ7qV0Tj6JXR035ySVSBG1KBF19DVmMYRKdO\nSAU1j437q+ktTcEWSA0CkH6rg53tP4V1h0tzdhCxisivYynngjtEcZfsrwdIrsSg\ncmOBZ+KTRyZ2fLgH4F8Naz5hBrwmR8ZIG46feVOV/swJzz4BNaXGj1oATWkLMA3c\nSf0G+aI=\n-----END CERTIFICATE-----",
		"key": "-----BEGIN RSA PRIVATE KEY-----\nMIICXAIBAAKBgQDRzKypXxcyW8mLg9GL3itpjjl0fc14vrwuZVukWqMio8eQC8iF\n0Fl1ERlZ8cNfsW5sVjdTF2cgD+3iWBT2tDyCb1tJG8h5Cbf06wsgS1TqqU6rxJAw\nCHXvRcfN+eerFw+Nzqvd5cga2l5kfn17qC8SUEC4QC1tbToNV91a8SmFzQIDAQAB\nAoGBAJIL/y4wqf8+ckES1G6fjG0AuvJjGQQzEuDhYjg5eFMG3EdkTIUKkxuxeYpp\niG43H/1+zyiipAFn1Vu5oW5T7cJEgC1YA39dERT605S5BrNWWHoZsgH+qmLoq7X+\njXMlmCagwlgwhUWMU2M1/LUbAl42384dK9u3EwcCgS//sFuBAkEA6mK52/Z03PB3\n0sS14eN7xFl96yc/NcneJ7Vy5APT0KGLo0j2S8gpOVW9EYrrzDzWgQ8FLIeed2Zw\nZ4ATksgRXQJBAOUlh5VJkyMdMiDEeJgK9QKtJkuiLZFAzZiWAUqjvSG2j8tWX/iN\nveI1sXCPyQSKoWPN74+23KWL+nW+mUzkzzECQFf+UIB/+keoD5QVPaNcX+7LGjba\nOSTccIa/3C42MaM1wtK+ZZj1wGRCCAU5/mRiwrUZCnw5PgjdcH2q265TZhECQASY\nJgnGOd8AXNrvVYOm5JazJgtqKwO4iua+SzRV6Bre8C8hgjcXkHESpoYdO+iNZwL7\nRAxbnDzte44UzjoOdGECQGtkrBffiyMaQv6LM/6Fa5TXHb1kPtLGIjFSygR3eTYI\ngHG78R5ac0dzhbyKaOo6cbj7CJVkbBh4BNW94tBZE/I=\n-----END RSA PRIVATE KEY-----"
	}`)

	err = SslCreate(param, u2.String())
	assert.Nil(err)

	//list
	count, list, err := SslList(2, 1, -1, 0, 0, "", "asc")
	assert.Equal(true, count >= 2)
	assert.Equal(1, len(list))

	// check sni ssl exist
	param = []byte(`[
		"test3.com",
		"www.test3.com",
		"a.com"
	]`)

	err = CheckSniExists(param)
	assert.Nil(err)

	// check sni ssl exist
	param = []byte(`[
		"test3.com",
		"a.test3.com",
		"b.com"
	]`)
	err = CheckSniExists(param)
	assert.NotNil(err)

	// patch
	param = []byte(`{
		"status": 0
	}`)
	err = SslPatch(param, u1.String())
	assert.Nil(err)

	ssl, err = SslItem(u1.String())
	assert.Equal(uint64(0), ssl.Status)

	// check sni ssl exist  --- disable test3
	param = []byte(`[
		"test3.com",
		"www.test3.com",
		"a.com"
	]`)

	err = CheckSniExists(param)
	assert.NotNil(err)

	param = []byte(`[
		"a.com"
	]`)
	err = CheckSniExists(param)
	assert.Nil(err)

	//update
	param = []byte(`{
		"cert": "-----BEGIN CERTIFICATE-----\nMIIEWzCCAsOgAwIBAgIQDYoN+el2w074sSGlyKVZFTANBgkqhkiG9w0BAQsFADB/\nMR4wHAYDVQQKExVta2NlcnQgZGV2ZWxvcG1lbnQgQ0ExKjAoBgNVBAsMIWp1bnh1\nY2hlbkBqdW54dWRlQWlyIChqdW54dSBjaGVuKTExMC8GA1UEAwwobWtjZXJ0IGp1\nbnh1Y2hlbkBqdW54dWRlQWlyIChqdW54dSBjaGVuKTAeFw0xOTA2MDEwMDAwMDBa\nFw0zMDA3MDQwNjA0MzNaMFUxJzAlBgNVBAoTHm1rY2VydCBkZXZlbG9wbWVudCBj\nZXJ0aWZpY2F0ZTEqMCgGA1UECwwhanVueHVjaGVuQGp1bnh1ZGVBaXIgKGp1bnh1\nIGNoZW4pMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy21LYFmQYpXm\nMlUjybwbJ338mwKmxY+wTEJLBhw7tBcau9aFjjyO4aRph4rpdMQgCn4lwTME2lbF\ndRhHzU5+Sy9JsI1k+9/J8sZSaTIj9paOX2PYnEOoFjIx9wpJRpeLNBjy3ICS3HC4\nSzTbDVAk9LZILLv/81vt1KpQ1HoPpE+OZ1wX+CL0/6RnNmdaqgrmttPv0sul9yIe\nKz19Hr26px7g6UnoK0o8rSwCqVmjoVTJ+eY2zmmzShqFPTLFgvNZmMeL3dPmg6nG\ndjjsbkXS50thyTDb/h+YIvEsZfrDVgbV2g6P/KiyfKCyevMQxd1J5/UI4HltI3MX\ngrpoaiDiVwIDAQABo30wezAOBgNVHQ8BAf8EBAMCBaAwEwYDVR0lBAwwCgYIKwYB\nBQUHAwEwDAYDVR0TAQH/BAIwADAfBgNVHSMEGDAWgBRU+EbJj+Hp62gCrNvb3yQk\nYnPHXDAlBgNVHREEHjAcggtleGFtcGxlLmNvbYINKi5leGFtcGxlLmNvbTANBgkq\nhkiG9w0BAQsFAAOCAYEAuKgNfkAA6uKoAgtQhE4+MPnRmWnHrYaUcqxVYXJZfFyi\nScPaolku+0MsSr1dD2JrbqKMwa54C293e2jkz1EETYKT4bhETS7ttzO1WubLHOyT\nRWb26DVZQH+tPrvUYE4kYSdT3uGi3JNJse2Lpw014nkcwgxOI1Sn8hnfeE7rZU5B\nv79EoqjSwvFDf8aOJTh6mBoe134s3PqrmEjx0VrTlZCkSy9J9REQKkdWmTwW68C2\nrdhV9+/E+xS10WlmxsbGhPgcEhMP0EfGLZm0dh7XUIt06Y3V1iCVFu6/7wQbmO6a\nrvOf2wmoUuZCfZDsLFBc1RIM5AvPktbZJrrhDunum+Sh3Pg8ntDhGSFJM8lCyvo3\n1bQ2rTc0fQJd95ztesaCUdyGi07coLtr1kXPpcv9DLTthXoDltSWB2jTDOPRS902\nzlBfhOmp1H7Xh9OQzEGxJLrtUOntdOM1Ws/GOvopaHdNic7xsodKqlxlnafXTJKA\n7/0x3XEWbPHxrfqvBoax\n-----END CERTIFICATE-----",
		"key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDLbUtgWZBileYy\nVSPJvBsnffybAqbFj7BMQksGHDu0Fxq71oWOPI7hpGmHiul0xCAKfiXBMwTaVsV1\nGEfNTn5LL0mwjWT738nyxlJpMiP2lo5fY9icQ6gWMjH3CklGl4s0GPLcgJLccLhL\nNNsNUCT0tkgsu//zW+3UqlDUeg+kT45nXBf4IvT/pGc2Z1qqCua20+/Sy6X3Ih4r\nPX0evbqnHuDpSegrSjytLAKpWaOhVMn55jbOabNKGoU9MsWC81mYx4vd0+aDqcZ2\nOOxuRdLnS2HJMNv+H5gi8Sxl+sNWBtXaDo/8qLJ8oLJ68xDF3Unn9QjgeW0jcxeC\numhqIOJXAgMBAAECggEARdPea9RSm4SY3+4ZusW3DHdSnmLqnCYWfhbDafWHCOpl\nYtTgQ1LGOO4Wy1ADkvE/jlp+2zKIF+pxHSCYhQDMmUJCKThf0ZWf3JX28+UiMyK6\n/ENptzoCGJxiSkpdnL2oKtnlg4se3kxS9n3OM2OvS9DGNZTS5tZHbRiJZmX/uIZ4\n5JsETflo/emPmH3NJNMmUr+uLtowqn3KT0tCm2nPZUgtSepztTK5ugumk+Apyhc8\n3bno20b+97IzzUmn584C3fIv776rOgyMQPi2CrdtCh1jsgqsO87DyJTWf/BdbqPU\nKFD9buv21vgyCVBUPUHL/RLRkG5iwx5713bExmLjAQKBgQD+UrYu135kqZzgjkQ6\nviC1xUcJgi9mVI1AI7YXUEqx3/IDCr+oum95zDMJW2I5TbWJNdXQ1JmWqX1p06G7\nLDel/lYe/GUjNu76U7eSPL2H29MqymeT+y5GB63U5BqgfVKj39gTlrLoMwz7KF/x\nXtH5z/ZTo82NII12zUX36bbIiwKBgQDMxKv/94T8OWoO067lQ07vVCruhmjojJFa\na8oyv73tS3V8bzP4b1MgUinDaksyfpSdBbd4Tnr3ImvQxEUOJVK0Mg43sTK8GXpF\nPn0VsY+rhynDv0KQZ4GHvE2Mb/QxycJdiaF7TowevNe12Ujc+NGr35CRJhgspgYM\nnNhCppA65QKBgQCztvEEYsTvDyhLSl0OgaINsK1FG9iw4Bi8dT/Mc7GExnJ3EdZj\nvfLeR5zdBNWBFtescP15x3INFBIKgUEtSc69Ht/un348hyoSfKwgy4lHAuDSwRq2\naG3HkM+Wu+XQ+R43rQs8tGYSTVjj9iDuKIoKlJlFe1/aVWGBzQafbGj8hwKBgDLO\nlbLEMo32nPci1OFzyvEdHC3k0cDpp+McnaXr528qavM+EFITJTf+yvf+trvHpo4z\nbet+5YnOU5wQJuY0oomtZdOxttnvJGRr9dNdJD22Ism7+gMke4I3WbJ/0MJNwlk9\nHgEfYyr5RjiLukWBw1x280Lghd0GMLgObqZS97R1AoGAZnB0oCBKrgR1i76jUoXu\nsiSrId5KvcbtuE0H8JMN3rl+77HEYAyJXGRU45e1kyX1HvErGz2Q3mvpFFJxNRf7\nZRwIJh/rEQ/G7svCu6k+5UGt88dbxgtR8C0WfMnmQH0ZW8XLgD6J+R7A7N2vtrd1\nzlzZL/qYUmm8QEK8UN9LbiM=\n-----END PRIVATE KEY-----"
	}`)

	err = SslUpdate(param, u1.String())
	assert.Nil(err)

	ssl, _ = SslItem(u1.String())
	assert.Equal(2, len(ssl.Snis))

	// check sni ssl exist
	param = []byte(`[
		"example.com",
		"www.example.com",
		"a.example.com",
		"a.com",
		"b.com"
	]`)

	err = CheckSniExists(param)
	assert.NotNil(err)
	assert.Equal(errno.SslForSniNotExists.Code, err.(*errno.ManagerError).Code)

	param = []byte(`{
		"status": 1
	}`)
	err = SslPatch(param, u1.String())
	assert.Nil(err)

	// check sni ssl exist
	param = []byte(`[
		"example.com",
		"www.example.com",
		"a.example.com",
		"a.com",
		"b.com"
	]`)

	err = CheckSniExists(param)
	assert.Nil(err)

	//delete
	err = SslDelete(u1.String())
	assert.Nil(err)

	_, err = SslItem(u1.String())
	assert.Equal(errno.DBReadError.Code, err.(*errno.ManagerError).Code)

	err = SslDelete(u2.String())
	assert.Nil(err)
}
