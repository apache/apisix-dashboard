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
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import type { APISIXType } from '@/types/schema/apisix';

export const uiFillStreamRouteRequiredFields = async (
  page: Page,
  data: Partial<APISIXType['StreamRoute']>
) => {
  if (data.server_addr) {
    await page
      .getByLabel('Server Address', { exact: true })
      .fill(data.server_addr);
  }

  if (data.server_port) {
    await page
      .getByLabel('Server Port', { exact: true })
      .fill(data.server_port.toString());
  }

  if (data.remote_addr) {
    await page.getByLabel('Remote Address').fill(data.remote_addr);
  }

  if (data.sni) {
    await page.getByLabel('SNI').fill(data.sni);
  }

  if (data.desc) {
    await page.getByLabel('Description').first().fill(data.desc);
  }

  if (data.labels) {
    const labelsField = page.getByPlaceholder('Input text like `key:value`,').first();
    for (const [key, value] of Object.entries(data.labels)) {
      await labelsField.fill(`${key}:${value}`);
      await labelsField.press('Enter');
    }
  }
};

export const uiCheckStreamRouteRequiredFields = async (
  page: Page,
  data: Partial<APISIXType['StreamRoute']>
) => {
  if (data.server_addr) {
    await expect(page.getByLabel('Server Address', { exact: true })).toHaveValue(
      data.server_addr
    );
  }

  if (data.server_port) {
    await expect(page.getByLabel('Server Port', { exact: true })).toHaveValue(
      data.server_port.toString()
    );
  }

  if (data.remote_addr) {
    await expect(page.getByLabel('Remote Address')).toHaveValue(
      data.remote_addr
    );
  }

  if (data.sni) {
    await expect(page.getByLabel('SNI')).toHaveValue(data.sni);
  }

  if (data.desc) {
    await expect(page.getByLabel('Description').first()).toHaveValue(data.desc);
  }

  if (data.labels) {
    // Labels are displayed as tags, check if the tags exist
    for (const [key, value] of Object.entries(data.labels)) {
      const labelTag = page.getByText(`${key}:${value}`, { exact: true });
      await expect(labelTag).toBeVisible();
    }
  }
};

export const uiFillStreamRouteAllFields = async (
  page: Page,
  upstreamSection: Locator,
  data: Partial<APISIXType['StreamRoute']>
) => {
  // Fill basic fields
  await uiFillStreamRouteRequiredFields(page, {
    server_addr: data.server_addr,
    server_port: data.server_port,
    remote_addr: data.remote_addr,
    sni: data.sni,
    desc: data.desc,
    labels: data.labels,
  });

  // Fill upstream nodes
  if (data.upstream?.nodes && data.upstream.nodes.length > 0) {
    for (let i = 0; i < data.upstream.nodes.length; i++) {
      const node = data.upstream.nodes[i];
      const nodeRow = upstreamSection
        .locator('section')
        .filter({ hasText: 'Nodes' })
        .getByRole('row')
        .nth(i + 1);

      await nodeRow.getByPlaceholder('Host').fill(node.host);
      await nodeRow.getByPlaceholder('Port').fill(node.port.toString());
      await nodeRow.getByPlaceholder('Weight').fill(node.weight.toString());

      // Click add if there are more nodes to add
      if (i < data.upstream.nodes.length - 1) {
        await upstreamSection
          .locator('section')
          .filter({ hasText: 'Nodes' })
          .getByRole('button', { name: 'Add' })
          .click();
      }
    }
  }

  // Fill upstream retries
  if (data.upstream?.retries !== undefined) {
    await upstreamSection.getByLabel('Retries').fill(data.upstream.retries.toString());
  }

  // Fill upstream timeout
  if (data.upstream?.timeout) {
    if (data.upstream.timeout.connect !== undefined) {
      await upstreamSection
        .getByLabel('Connect', { exact: true })
        .fill(data.upstream.timeout.connect.toString());
    }
    if (data.upstream.timeout.send !== undefined) {
      await upstreamSection
        .getByLabel('Send', { exact: true })
        .fill(data.upstream.timeout.send.toString());
    }
    if (data.upstream.timeout.read !== undefined) {
      await upstreamSection
        .getByLabel('Read', { exact: true })
        .fill(data.upstream.timeout.read.toString());
    }
  }

  // Fill protocol fields
  if (data.protocol?.name) {
    await page.getByLabel('Protocol Name').fill(data.protocol.name);
  }

  if (data.protocol?.superior_id) {
    await page.getByLabel('Superior ID').fill(data.protocol.superior_id);
  }
};

export const uiCheckStreamRouteAllFields = async (
  page: Page,
  upstreamSection: Locator,
  data: Partial<APISIXType['StreamRoute']>
) => {
  // Check basic fields
  await uiCheckStreamRouteRequiredFields(page, {
    server_addr: data.server_addr,
    server_port: data.server_port,
    remote_addr: data.remote_addr,
    sni: data.sni,
    desc: data.desc,
    labels: data.labels,
  });

  // Check upstream nodes
  if (data.upstream?.nodes && data.upstream.nodes.length > 0) {
    for (let i = 0; i < data.upstream.nodes.length; i++) {
      const node = data.upstream.nodes[i];
      const nodeRow = upstreamSection
        .locator('section')
        .filter({ hasText: 'Nodes' })
        .getByRole('row')
        .nth(i + 1);

      await expect(nodeRow.getByPlaceholder('Host')).toHaveValue(node.host);
      await expect(nodeRow.getByPlaceholder('Port')).toHaveValue(
        node.port.toString()
      );
      await expect(nodeRow.getByPlaceholder('Weight')).toHaveValue(
        node.weight.toString()
      );
    }
  }

  // Check upstream retries
  if (data.upstream?.retries !== undefined) {
    await expect(upstreamSection.getByLabel('Retries')).toHaveValue(
      data.upstream.retries.toString()
    );
  }

  // Check upstream timeout
  if (data.upstream?.timeout) {
    if (data.upstream.timeout.connect !== undefined) {
      await expect(
        upstreamSection.getByLabel('Connect', { exact: true })
      ).toHaveValue(data.upstream.timeout.connect.toString());
    }
    if (data.upstream.timeout.send !== undefined) {
      await expect(
        upstreamSection.getByLabel('Send', { exact: true })
      ).toHaveValue(data.upstream.timeout.send.toString());
    }
    if (data.upstream.timeout.read !== undefined) {
      await expect(
        upstreamSection.getByLabel('Read', { exact: true })
      ).toHaveValue(data.upstream.timeout.read.toString());
    }
  }

  // Check protocol fields
  if (data.protocol?.name) {
    await expect(page.getByLabel('Protocol Name')).toHaveValue(
      data.protocol.name
    );
  }

  if (data.protocol?.superior_id) {
    await expect(page.getByLabel('Superior ID')).toHaveValue(
      data.protocol.superior_id
    );
  }
};
