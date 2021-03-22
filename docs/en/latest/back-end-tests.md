---
title: Backend Tests
---

<!--
#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
-->

This document provides the details of setting up the environment for running the tests locally with the guide for the writing unit & E2E tests for the backend.

## Table of Contents

- [Running E2E Tests Locally](#running-e2e-tests-locally)
  - [Start with source code](#start-with-source-code)
  - [Start with docker-compose](#start-with-docker-compose)
  - [Start tests](#start-tests)
- [Writing Unit & E2E (End to End) Tests](#writing-unit-&-e2e-(end-to-end)-tests)
  - [Writing Unit Tests](#writing-unit-tests)
  - [Writing E2E Tests](#writing-e2e-tests)

## Running E2E Tests Locally

## Start with source code

1. To run back end E2E test, please start the `manager-api`, `apisix`, `etcd` and `upstream-node` at first.

2. To start the `manager-api` project locally, please refer to [develop](./develop.md) web section.

3. To start the etcd locally, please refer to [etcd start](https://apisix.apache.org/docs/apisix/install-dependencies/) web section.

4. To start the `apisix` project locally, please refer to [apisix start](https://github.com/apache/apisix#get-started) web section.

5. To start the `upstream-node` locally, please install docker in the local environment and execute the command.

   ```sh
    docker run -d --name upstream -v /(Your apisix-dashboard folder path)/api/test/docker/upstream.conf:/etc/nginx/conf.d/default.conf:ro -p 80:80 -p 1980:1980 -p 1981:1981 -p 1982:1982 -p 1983:1983 -p 1984:1984 johz/upstream:v2.0
   ```

6. After all the services are started, you can start the back-end E2E test.

7. The `upstream-node` IP is temporarily changed to the local IP address. After the test, it should be changed to GitHub upstream node IP. If the test case does not involve the upstream node, it does not need to be modified.

   ```sh
    # Local E2E test create route example
    {
        "uris": ["/test-test"],
        "name": "route_all",
        "desc": "test",
        "methods": ["GET"],
        "hosts": ["test.com"],
        "status": 1,
        "upstream": {
            "nodes": {
                # upstream node IP is required for local test
                "(local ip):1981": 1
            },
            "type": "roundrobin"
         }
    }

     # GitHub E2E test create route example
    {
        "uris": ["/test-test"],
        "name": "route_all",
        "desc": "test",
        "methods": ["GET"],
        "hosts": ["test.com"],
        "status": 1,
        "upstream": {
            "nodes": {
                "172.16.238.20:1981": 1
            },
            "type": "roundrobin"
         }
    }
   ```

[Back to TOC](#table-of-contents)

## Start with docker-compose

1. [install docker-compose](https://docs.docker.com/compose/install/)

   **NOTE:** In order to run docker compose locally, please change the values of `listen.host` and `etcd.endpoints` within `./api/conf/conf.yaml` as follows:

   ```sh
   listen:
      host: 0.0.0.0
      port: 9000
   etcd:
      endpoints:
        - 172.16.238.10:2379
        - 172.16.238.11:2379
        - 172.16.238.12:2379
   ```

2. Use `docker-compose` to run services such as `manager-api`, `apisix`, `etcd` and `upstream-node`, run the command.

   ```sh
   cd /(Your apisix-dashboard folder path)/api/test/docker
   # Download the apisix dockerfile
   curl -o Dockerfile-apisix https://raw.githubusercontent.com/apache/apisix-docker/master/alpine/Dockerfile
   docker-compose up -d
   ```

3. When you use `docker-compose` to run the local E2E test and need to update the main code, you need to execute the command to close the cluster.

   ```sh
   cd /(Your apisix-dashboard folder path)/api/test/docker
   # -v: Remove links to mount volumes and volumes
   docker-compose  down -v
   # If you don't want to remove the link between mount volume and volume, you can use
   docker-compose stop [serviceName]
   ```

4. Then you need to delete the image of the `manage-api`, rebuild the image of the `manage-api`, and start the cluster after the image is successfully built.
   (Only if you have altered/added any core functionalities in `manager-api`, for simply adding/deleting a test case/file, rebuilding is not required).

** For ease of access and to avoid the repetitive hassle for setting up the required configurations, we have provided a `setup.sh` script
which is inside `api/test/docker` directory. You can directly run, delete and build services along with update and revert `conf.yaml` through the script.
For more details, run

   ```sh
   ./setup.sh help
   ```

(If you are setting up the environment for the first time, please go with the described manual steps. It'll help you to get the idea of what's going on in the background).

[Back to TOC](#table-of-contents)

## Start tests

1. After all the services are started, you can start the back-end E2E test.

   **NOTE:** Sometimes we need to delete the etcd store info. Otherwise, it will make the test failed.

   - Enter the E2E folder and execute the command to test all E2E test files.

     ```sh
      cd /(Your apisix-dashboard folder path)/api/test/e2e
      go test -v
     ```

   - You can also do E2E test on a single file.

       ```sh
        cd /(Your apisix-dashboard folder path)/api/test/e2e
        go test -v E2E-test-file.go base.go
       ```

2. Currently, a lot of tests has been migrated to E2ENEW folder using the ginkgo testing framework for its ability to provide
high expressiveness which makes reading and writing tests a pleasure.

   - Enter the E2ENEW folder and execute the command to run all the E2ENEW test suites recursively.

     ```sh
      cd /(Your apisix-dashboard folder path)/api/test/e2enew
      ginkgo -r
     ```

   - You can also run a single E2ENEW test suite using ginkgo.

     ```sh
      cd /(Your apisix-dashboard folder path)/api/test/e2enew/(path of the specific test suite)
      ginkgo -r
     ```

[Back to TOC](#table-of-contents)

## Writing Unit & E2E (End to End) Tests

## Writing Unit Tests

Currently, all the unit tests for `manager-api` have been written using Go's built-in testing package. There is nothing new about it. You can directly add tests in the existing `<module>_test.go` file or create a new one. There is one thing that needs to be addressed that is, since `manager-api` largely depends on handling data from etcd, in some cases, you need to write some feature that depends on storing & retrieval of information on and out of etcd. In such a scenario, you should write your unit tests using `store.MockInterface` instead of directly depending upon etcd.

The `MockInterface` embeds `mock.Mock` object from [mock](https://pkg.go.dev/github.com/stretchr/testify/mock) package by testify. If helps in simulating function calls of an object with desired inputs as arguments and outputs as return values. Currently, all the unit tests in `route`, `service`, `ssl` and `upstream` handlers uses mock interface. For e.g.

```go
mStore := &store.MockInterface{}
mStore.On("<exact methodname of the real method>", mock.Anything)
      .Run(func(args mock.Arguments) {
           //arguments assertions or anything
           //gets executed before returning
       })
      .Return("<same return signature of the original method>")
```

You may tinker with the mentioned tests to get an idea of how it works or go through the [docs](https://pkg.go.dev/github.com/stretchr/testify/mock#pkg-index).

[Back to TOC](#table-of-contents)

## Writing E2E Tests

Currently, the backend of apisix-dashboard have two types of e2e tests. One is plain e2e, the other is e2enew, where in the first one, tests are written using Go's built-in, native testing package, for the later, the tests are grouped into test suites and are evaluated using [ginkgo](https://onsi.github.io/ginkgo/) - a testing framework which helps in writing more expressive tests such that reading and writing tests give a pleasant experience.

**Actively, we are migrating all of our e2e tests to e2enew module. So we are no more accepting tests inside e2e module, and any new tests must be added into the e2enew module by using ginkgo following the BDD style testing. If you have any query regarding it, please discuss your concerns with the community, we would be happy to address those.

For value assertion, we are using the [assert](https://pkg.go.dev/github.com/stretchr/testify@v1.7.0/assert) package by testify. It provides lots of easy to use functions for assertion where the first argument is `*testing.T` object which can  be obtained from `ginkgo.GinkgoT()`.

If you are creating any test which requires making HTTP calls to any of the following node which involves `manager-api` or `apisix`, after setting up the environment (please refer [Running E2E Tests Locally](#running-e2e-tests-locally) for the details), you can use the `HttpTestCase` struct which provides a nice interface to make the calls along with performing necessary checks on the response. Here's a brief description of the most used fields of the struct,

```go
type HttpTestCase struct {
    Desc          string                // Description about the test case.
    Object        *httpexpect.Expect    // returns a httpexpect object i.e. on which host the request is going to be made.
    Method        string                // HTTP request methods ( GET, POST, PATCH, PUT, DELETE, OPTIONS).
    Path          string                // the route path of that host
    Query         string                // Query params
    Body          string                // The request Body. Commonly used in POST, PUT, PATCH.
    Headers       map[string]string     // Request headers. Include authorization header for secure routes.
    ExpectStatus  int                   // Expected HTTP status code from the response
    ExpectCode    int                   // Code generated by the host. Generally 0 for http.StatusOK.
    ExpectMessage string                // The response message provided in the response by the host.
    ExpectBody    interface{}           // The expected message body as a response.
    Sleep         time.Duration //ms    // Cooldown period before making next request.
}
```

Now to run a test use the `RunTestCase(tc HttpTestCase)` method which is provided into the base package inside the `e2enew` module.

**NOTE:** E2ENEW also provides standalone methods for making HTTP request for GET, POST, PUT, DELETE methods along with making a POST request with `multipart/form` data. The method signatures are stated below

- `HttpGet(url string, headers map[string]string) ([]byte, int, error)`
- `HttpPost(url string, headers map[string]string, reqBody string) ([]byte, int, error)`
- `HttpPut(url string, headers map[string]string, reqBody string) ([]byte, int, error)`
- `HttpDelete(url string, headers map[string]string) ([]byte, int, error)`

Now coming back to writing e2enew tests,

*If you are new to ginkgo it's always recommended going through the official [docs](https://onsi.github.io/ginkgo/) first.

- To create a new tests' suite, create the new directory under `e2enew` module. Then for the initial bootstrapping use,

   ```sh
      mkdir <dirname> #inside e2enew
      cd <dirname>
      ginkgo bootstrap # Generates <dirname>_suite_test.go
      #to add tests in separate files
      ginkgo generate <testgroup> #Generates <testgroup>_test.go
   ```

- This can be done manually, however, grouping similar tests in specific test files is always recommended. Please try to separate tests in separate test files.

- We use different ginkgo containers for writing tests which includes `Describe`, `It`, `AfterSuite`, `BeforeEach` etc. [ [ref](https://onsi.github.io/ginkgo/#structuring-your-specs) ]. For eg, adding a few logically similar tests inside an existing test suite may looks like

   ```go
   var _ = ginkgo.Describe("<description about the tests>", func() {
            ginkgo.It("<test 1>", func() {
               //Testing logic & assertions
            })
            ginkgo.It("<test 2>", func() {
               //Testing logic & assertions
            })
         })
   ```

   here the `Describe` container is grouping similar tests through multiple `It` blocks by making extensive use of closures to give the syntax a high expressiveness.

- Though depending upon the scenario, it is always recommended to use ginkgo's table-driven tests for running the independent `HttpTestCase` using `table.DescribeTable` and `table.Entry` [ [ref](https://pkg.go.dev/github.com/onsi/ginkgo/extensions/table) ]. For eg,

   ```go
   var _ = ginkgo.Describe("<description about the tests>", func() {
            table.DescribeTable("<logical group 1>",
               func(tc base.HttpTestCase) {
                  base.RunTestCase(tc)
               },
               table.Entry("<test 1>", base.HttpTestCase{
                  //Fill the fields
               }),
               table.Entry("<test 2>", base.HttpTestCase{
                  //Fill the fields
               }),
            })

            table.DescribeTable("<logical group 2>", func () {
               ...
            })

         })
   ```

- FYI, internally ginkgo reduces each table entries to `It` block and run all the `It` blocks concurrently/parallel. Ginkgo auto recovers from panics inside `It` blocks only, so always put your assertions inside `It` containers.

[Back to TOC](#table-of-contents)
