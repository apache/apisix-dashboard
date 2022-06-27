---
title: Data Loader
keywords:
- APISIX
- APISIX Dashboard
- Data Loader
- OpenAPI
description: This document contains information about the Apache APISIX Dashboard data loader framework.
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

## What is Data Loader

The data loader is an abstraction of the data import and export functionality under different specification definitions.

Based on it, developers can easily implement the ability to export APISIX data entities to generate different data files, and parse the data files and convert them into APISIX data entities for import into APISIX.

## Definition

```go
type Loader interface {
    // Import accepts data and converts it into entity data sets
    Import(input interface{}) (*DataSets, error)

    // Export accepts entity data sets and converts it into a specific format
    Export(data DataSets) (interface{}, error)
}
```

Implement the above functions to complete the data conversion between Raw data format and DataSets data set, APISIX Dashboard will use DataSets data format as the intermediate format for importing and exporting according to it.

Developers can look at the code in [api/internal/handler/data_loader/loader/loader.go](https://github.com/apache/apisix-dashboard/blob/master/api/internal/handler/data_loader/loader/loader.go) for the definition of the DataSets structure and the Data Loader interface.

## Supported data loader

- [OpenAPI 3](data_loader/openapi3.md): Currently only data import is supported

## How to support other data loader

Extending the data loader is simple and requires some development in the backend and frontend.

### Implement data loader conversion logic (back-end)

Create a structure that implements the above interface, which contains two parts.

- Import function: complete the parsing and conversion from raw format `[]byte` uploaded by the user to DataSets structure [api/internal/handler/data_loader/loader/openapi3/import.go](https://github.com/apache/apisix-dashboard/blob/master/api/internal/handler/data_loader/loader/openapi3/import.go)
- Export function: complete the generation of raw format for DataSets structure data inputted from APISIX Dashboard

Adds a new item to the data loader list of the import and export handler.

### Add front UI support for new data loader (front-end)

Adds the previously created data loader to the frontend selector. Refer to [this](https://github.com/apache/apisix-dashboard/blob/master/web/src/pages/Route/components/DataLoader/Import.tsx#L167-L172) for more details.

:::note
When you implement a data loader that requires partial input of custom parameters, you can create a form for it to enter data. Refer to [this](https://github.com/apache/apisix-dashboard/blob/master/web/src/pages/Route/components/DataLoader/loader/OpenAPI3.tsx) for more details.
:::
