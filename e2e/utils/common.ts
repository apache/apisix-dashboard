/**
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
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { parse } from 'yaml';

type APISIXConf = {
  deployment: { admin: { admin_key: { key: string }[] } };
};
export const getAPISIXConf = async () => {
  const currentDir = new URL('.', import.meta.url).pathname;
  const confPath = path.join(currentDir, '../server/apisix_conf.yml');
  const file = await readFile(confPath, 'utf-8');
  const res = parse(file) as APISIXConf;
  return { adminKey: res.deployment.admin.admin_key[0].key };
};
