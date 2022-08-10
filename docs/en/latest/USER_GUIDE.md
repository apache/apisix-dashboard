---
title: User Guide
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

The following are parts of the modules' snapshot.

## Dashboard

We support the monitor page by referencing it in [iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe). Before accessing [Grafana](https://grafana.com/), please Enable [`allow_embedding=true`](https://grafana.com/docs/grafana/latest/administration/configuration/#allow_embedding), which defaults to `false`. This causes the browser to fail to render Grafana pages properly due to security policies.

Solving this problem requires you to configure some csp rules. Please check the default configuration options for details. You can refer to this [link](https://github.com/apache/apisix-dashboard/blob/master/api/conf/conf.yaml) for the recommand rule.

![Dashboard-en](https://user-images.githubusercontent.com/40708551/112922395-0eed0380-912a-11eb-8c92-4c67d2bae4a8.png)

## Route

The Route module aims to control routes by UI instead of calling APIs.

### List

![route-list](https://user-images.githubusercontent.com/40708551/112922389-0c8aa980-912a-11eb-8c45-b13192b3775d.png)

### Create

![route-create-step1-en](https://user-images.githubusercontent.com/40708551/112922912-ef0a0f80-912a-11eb-9d33-63d7215f7cfd.png)

![route-create-step2-en](https://user-images.githubusercontent.com/40708551/112923105-44462100-912b-11eb-8e1f-6548a6c28c35.png)

![route-create-step3-en](https://user-images.githubusercontent.com/40708551/112923140-545e0080-912b-11eb-9aef-d26b2c564efe.png)

![route-create-step4-en](https://user-images.githubusercontent.com/40708551/112923257-971fd880-912b-11eb-820c-1f2ca381304a.png)

![route-create-done-list-en](https://user-images.githubusercontent.com/40708551/112923280-a0a94080-912b-11eb-8b83-3960778ecf8a.png)

## Setting

![setting](https://user-images.githubusercontent.com/40708551/112923561-22996980-912c-11eb-926f-45177500eb65.png)
