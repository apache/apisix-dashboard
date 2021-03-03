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
import { Request, Response } from 'express';

export default {
  'GET /apisix/admin/plugin_configs': (req: Request, res: Response) => {
    res.json({
      code: 0,
      data: {
        rows: [{ id: "1", desc: 'pluginCongfig' }],
        total_size: 1
      },
      message: ""
    })
  },
  'GET /apisix/admin/labels/plugin_config': (req: Request, res: Response) => {
    res.json({ "code": 0, "message": "", "data": { "rows": [{ "API_VERSION": "1.0" }, { "aaa": "aaa" }, { "ddd": "ddd" }], "total_size": 3 }, "request_id": "6a1658dd-b7dc-40af-af67-aed7e6b21461" })
  },
};
