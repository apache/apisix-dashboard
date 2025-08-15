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
import { exec } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import { streamRoutesPom } from '@e2e/pom/stream_routes';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';
import { produce, type WritableDraft } from 'immer';
import { parse, stringify } from 'yaml';

const execAsync = promisify(exec);

type APISIXConf = {
  apisix: {
    proxy_mode: string;
  };
};

const getE2EServerDir = () => {
  const currentDir = new URL('.', import.meta.url).pathname;
  return path.join(currentDir, '../server');
};

const updateAPISIXConf = async (
  func: (v: WritableDraft<APISIXConf>) => void
) => {
  const confPath = path.join(getE2EServerDir(), 'apisix_conf.yml');
  const fileContent = await readFile(confPath, 'utf-8');
  const config = parse(fileContent) as APISIXConf;

  const updatedContent = stringify(produce(config, func));
  await writeFile(confPath, updatedContent, 'utf-8');
};

const restartDockerServices = async () => {
  await execAsync('docker compose restart apisix', { cwd: getE2EServerDir() });
  const url = 'http://127.0.0.1:6174/ui/';
  const maxRetries = 20;
  const interval = 1000;
  for (let i = 0; i < maxRetries; i++) {
    const res = await fetch(url);
    if (res.ok) return;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error('APISIX is not ready');
};

test.beforeAll(async () => {
  await updateAPISIXConf((d) => {
    d.apisix.proxy_mode = 'http';
  });
  await restartDockerServices();
});

test.afterAll(async () => {
  await updateAPISIXConf((d) => {
    d.apisix.proxy_mode = 'http&stream';
  });
  await restartDockerServices();
});

test('show disabled error', async ({ page }) => {
  await streamRoutesPom.toIndex(page);

  await expect(page.locator('main > span')).toContainText(
    'stream mode is disabled, can not add stream routes'
  );

  // Verify the error message is still shown after refresh
  await page.reload();
  await expect(page.locator('main > span')).toContainText(
    'stream mode is disabled, can not add stream routes'
  );
});
