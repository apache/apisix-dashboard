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
import cloneDeep from 'lodash/cloneDeep'

/**
 * Because we have some `custom` field in Upstream Form, like custom.tls/custom.checks.active etc,
 * we need to transform data that doesn't have `custom` field to data contains `custom` field
*/
export const transformUpstreamDataFromRequest = (originData: UpstreamComponent.ResponseData) => {
  const data = cloneDeep(originData)
  data.custom = {}

  if (data.checks) {
    data.custom.checks = {}

    if (data.checks.active) {
      data.custom.checks.active = true
    }

    if (data.checks.passive) {
      data.custom.checks.passive = true
    }
  }

  if (data.tls) {
    data.custom.tls = "enable"
  }

  return data
}
