---
title: Extensible Authentication
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

### How to use this Non-intrusive framework

- **target**: we can use this framework to achieve adding customized authentication method to dashboard
- **implementation**: we use middleware to check user permissions. The way to check can be decided by developer, if not, we provide a default way for developers
- **usage**:

1.we open the switch to adapt the  **default authentication method**:

```shell
feature_gate:
  demoIAMAccess:true
```

​	the default strategy where we use the `casbin` framework to achieve. Also, we can add and delete this route in **`internal/pkg/iam/demo/policy.csv`** that only can be accessed by **admin**

2.Adopt a **customized authentication method**

```shell
# at first, we should close this switch to support customized authentication method
feature_gate:
  demoIAMAcess:false
```

```go
// then, we should create struct to implement this interface
// parameters explanation. identity -> username(user or admin) resource -> url action -> method
// in the method Check, you can customize some way to authenticate these interviewers
// if interviewers aren't permitted to request this resource. you can throw an error
type Access interface {
    Check(identity, resource, action string) error
}

type MyAccess struct{}
func (m MyAccess)Check(identity, resource, action string) error {
	// customized way
}
func main(){
	// add your customized method into APISIX-DashBoard
    ok := SetAccessImplementation(MyAccess{})
	if ok {
		// add successfully
    } else {
		// there is an existing method in dashboard
}
```