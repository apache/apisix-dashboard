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

import { consumersPom } from '@e2e/pom/consumers';
import { credentialsPom } from '@e2e/pom/credentials';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

import { deleteAllConsumers, putConsumerReq } from '@/apis/consumers';
import { putCredentialReq } from '@/apis/credentials';
import { API_CONSUMERS } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';

const testConsumerUsername = randomId('test-consumer');
const anotherConsumerUsername = randomId('another-consumer');

const credentials: (APISIXType['CredentialPut'] & { username: string })[] = [
  {
    username: testConsumerUsername,
    id: randomId('cred-1'),
    desc: 'Test credential 1',
    plugins: {
      'key-auth': {
        key: randomId('key-1'),
      },
    },
  },
  {
    username: testConsumerUsername,
    id: randomId('cred-2'),
    desc: 'Test credential 2',
    plugins: {
      'key-auth': {
        key: randomId('key-2'),
      },
    },
  },
  {
    username: testConsumerUsername,
    id: randomId('cred-3'),
    desc: 'Test credential 3',
    plugins: {
      'basic-auth': {
        username: 'testuser',
        password: 'testpass',
      },
    },
  },
];

// Credential that belongs to another consumer
const anotherConsumerCredential: APISIXType['CredentialPut'] & {
  username: string;
} = {
  username: anotherConsumerUsername,
  id: randomId('another-cred'),
  desc: 'Another consumer credential',
  plugins: {
    'key-auth': {
      key: randomId('another-key'),
    },
  },
};

// Configure tests to run serially to avoid race conditions
test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  // Clean up any existing consumers first
  await deleteAllConsumers(e2eReq);

  // Create test consumer first
  await putConsumerReq(e2eReq, {
    username: testConsumerUsername,
    desc: 'Test consumer for credential testing',
  });

  // Create another consumer
  await putConsumerReq(e2eReq, {
    username: anotherConsumerUsername,
    desc: 'Another test consumer for credential isolation testing',
  });

  // Wait a bit to ensure consumers are created
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Create credentials for test consumer - now that consumer exists
  for (const credential of credentials) {
    await putCredentialReq(e2eReq, credential);
  }

  // Create credential for another consumer - now that consumer exists
  await putCredentialReq(e2eReq, anotherConsumerCredential);
});

test.afterAll(async () => {
  await deleteAllConsumers(e2eReq);
});

test('should navigate to consumer credentials page', async ({ page }) => {
  await test.step('navigate to consumer detail page', async () => {
    await consumersPom.toIndex(page);
    await consumersPom.isIndexPage(page);

    await page
      .getByRole('row', { name: testConsumerUsername })
      .getByRole('button', { name: 'View' })
      .click();
    await consumersPom.isDetailPage(page);
  });

  await test.step('navigate to credentials tab', async () => {
    // Directly navigate to credentials page instead of clicking tab
    await credentialsPom.toCredentialsIndex(page, testConsumerUsername);
    await credentialsPom.isCredentialsIndexPage(page, testConsumerUsername);
  });

  await test.step('verify credentials page components', async () => {
    await expect(credentialsPom.getAddCredentialBtn(page)).toBeVisible();

    // list table exists
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    await expect(table.getByText('ID', { exact: true })).toBeVisible();
    await expect(table.getByText('Actions', { exact: true })).toBeVisible();
  });
});

test('should only show credentials for current consumer', async ({ page }) => {
  await test.step('should only show credentials for current consumer', async () => {
    await credentialsPom.toCredentialsIndex(page, testConsumerUsername);
    await credentialsPom.isCredentialsIndexPage(page, testConsumerUsername);

    // Credentials from another consumer should not be visible
    await expect(
      page.getByRole('cell', { name: anotherConsumerCredential.id })
    ).toBeHidden();

    // Only credentials belonging to current consumer should be visible
    for (const credential of credentials) {
      await expect(
        page.getByRole('cell', { name: credential.id })
      ).toBeVisible();
    }
  });

  await test.step('verify credential isolation', async () => {
    // Navigate to another consumer's credentials
    await credentialsPom.toCredentialsIndex(page, anotherConsumerUsername);
    await credentialsPom.isCredentialsIndexPage(page, anotherConsumerUsername);

    // Should only see the other consumer's credential
    await expect(
      page.getByRole('cell', { name: anotherConsumerCredential.id })
    ).toBeVisible();

    // Should not see test consumer's credentials
    for (const credential of credentials) {
      await expect(
        page.getByRole('cell', { name: credential.id })
      ).toBeHidden();
    }
  });
});

test('should display credentials list under consumer', async ({ page }) => {
  await test.step('navigate to consumer credentials page', async () => {
    // Directly navigate to credentials page
    await credentialsPom.toCredentialsIndex(page, testConsumerUsername);
    await credentialsPom.isCredentialsIndexPage(page, testConsumerUsername);
  });

  await test.step('should display all credentials for consumer', async () => {
    // Verify all created credentials are displayed
    for (const credential of credentials) {
      await expect(
        page.getByRole('cell', { name: credential.id })
      ).toBeVisible();
      await expect(
        page.getByRole('cell', { name: credential.desc || '' })
      ).toBeVisible();
    }
  });

  await test.step('should have correct table headers', async () => {
    await expect(page.getByRole('columnheader', { name: 'ID' })).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Description' })
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Actions' })
    ).toBeVisible();
  });

  await test.step('should show correct credential count', async () => {
    // Check that all 3 credentials are displayed in the table
    const tableRows = page.locator('tbody tr');
    await expect(tableRows).toHaveCount(credentials.length);
  });
});

test('should be able to navigate to credential detail', async ({ page }) => {
  await test.step('navigate to credentials list', async () => {
    await credentialsPom.toCredentialsIndex(page, testConsumerUsername);
    await credentialsPom.isCredentialsIndexPage(page, testConsumerUsername);
  });

  await test.step('click on credential view button', async () => {
    // Click on the first credential's View button
    await page
      .getByRole('row', { name: credentials[0].id })
      .getByRole('button', { name: 'View' })
      .click();

    await credentialsPom.isCredentialDetailPage(page);
  });

  await test.step('verify credential detail page', async () => {
    // Verify we're on the correct credential detail page
    const idField = page.getByLabel('ID', { exact: true }).first();
    await expect(idField).toHaveValue(credentials[0].id);

    const descField = page.getByLabel('Description', { exact: true });
    await expect(descField).toHaveValue(credentials[0].desc || '');
  });
});

test('should have Add Credential button', async ({ page }) => {
  await test.step('navigate to credentials list', async () => {
    await credentialsPom.toCredentialsIndex(page, testConsumerUsername);
    await credentialsPom.isCredentialsIndexPage(page, testConsumerUsername);
  });

  await test.step('verify Add Credential button exists and works', async () => {
    const addCredentialBtn = credentialsPom.getAddCredentialBtn(page);
    await expect(addCredentialBtn).toBeVisible();

    await addCredentialBtn.click();
    await credentialsPom.isCredentialAddPage(page, testConsumerUsername);
  });

  await test.step('verify add page has required fields', async () => {
    // Verify ID field exists
    const idField = page.getByLabel('ID', { exact: true }).first();
    await expect(idField).toBeVisible();

    // Verify Description field exists
    const descField = page.getByLabel('Description', { exact: true });
    await expect(descField).toBeVisible();
  });
});

test('should be able to delete credential', async ({ page }) => {
  // Create a temporary credential for deletion test
  const tempCredential: APISIXType['CredentialPut'] & { username: string } = {
    username: testConsumerUsername,
    id: randomId('temp-cred'),
    desc: 'Temporary credential for deletion',
    plugins: {
      'key-auth': {
        key: randomId('temp-key'),
      },
    },
  };

  await test.step('create temporary credential', async () => {
    await putCredentialReq(e2eReq, tempCredential);
  });

  await test.step('navigate to credentials list', async () => {
    await credentialsPom.toCredentialsIndex(page, testConsumerUsername);
    await credentialsPom.isCredentialsIndexPage(page, testConsumerUsername);
  });

  await test.step('verify temporary credential exists', async () => {
    await expect(
      page.getByRole('cell', { name: tempCredential.id })
    ).toBeVisible();
  });

  await test.step('delete the credential', async () => {
    // Click delete button on the temporary credential
    await page
      .getByRole('row', { name: tempCredential.id })
      .getByRole('button', { name: 'Delete' })
      .click();

    // Confirm deletion in modal
    const deleteDialog = page.getByRole('dialog', { name: 'Delete Credential' });
    await expect(deleteDialog).toBeVisible();
    await deleteDialog.getByRole('button', { name: 'Delete' }).click();

    // Wait for success notification
    await expect(page.getByRole('alert')).toBeVisible();
  });

  await test.step('verify credential is deleted', async () => {
    // Reload the page to ensure the credential is gone
    await page.reload();
    await credentialsPom.isCredentialsIndexPage(page, testConsumerUsername);

    // Verify the credential no longer appears
    await expect(
      page.getByRole('cell', { name: tempCredential.id })
    ).toBeHidden();
  });
});

test('should be able to edit credential', async ({ page }) => {
  const credentialToEdit = credentials[0];
  const updatedDesc = randomId('updated-desc');

  await test.step('navigate to credential detail', async () => {
    await credentialsPom.toCredentialDetail(
      page,
      testConsumerUsername,
      credentialToEdit.id
    );
    await credentialsPom.isCredentialDetailPage(page);
  });

  await test.step('enable edit mode', async () => {
    const editBtn = page.getByRole('button', { name: 'Edit' });
    await expect(editBtn).toBeVisible();
    await editBtn.click();
  });

  await test.step('update credential description', async () => {
    const descField = page.getByLabel('Description', { exact: true });
    await expect(descField).toBeEnabled();
    await descField.clear();
    await descField.fill(updatedDesc);
  });

  await test.step('save changes', async () => {
    const saveBtn = page.getByRole('button', { name: 'Save' });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Wait for success notification
    await expect(page.getByRole('alert')).toBeVisible();
  });

  await test.step('verify changes are saved', async () => {
    // Reload the page to ensure changes persisted
    await page.reload();
    await credentialsPom.isCredentialDetailPage(page);

    const descField = page.getByLabel('Description', { exact: true });
    await expect(descField).toHaveValue(updatedDesc);
  });

  await test.step('restore original description', async () => {
    // Edit again to restore original value
    const editBtn = page.getByRole('button', { name: 'Edit' });
    await editBtn.click();

    const descField = page.getByLabel('Description', { exact: true });
    await descField.clear();
    await descField.fill(credentialToEdit.desc || '');

    const saveBtn = page.getByRole('button', { name: 'Save' });
    await saveBtn.click();

    await expect(page.getByRole('alert')).toBeVisible();
  });
});

test('should handle empty credentials list', async ({ page }) => {
  const emptyConsumerUsername = randomId('empty-consumer');

  await test.step('create consumer without credentials', async () => {
    await putConsumerReq(e2eReq, {
      username: emptyConsumerUsername,
      desc: 'Consumer without credentials',
    });
  });

  await test.step('navigate to empty credentials list', async () => {
    await credentialsPom.toCredentialsIndex(page, emptyConsumerUsername);
    await credentialsPom.isCredentialsIndexPage(page, emptyConsumerUsername);
  });

  await test.step('verify empty state', async () => {
    // Table should exist but be empty or show empty message
    const table = page.getByRole('table');
    await expect(table).toBeVisible();

    // Check that no actual credential data rows exist (excluding empty state row)
    const credentialCells = page.getByRole('cell').filter({ hasText: /cred-/ });
    await expect(credentialCells).toHaveCount(0);
  });

  await test.step('cleanup empty consumer', async () => {
    await e2eReq.delete(`${API_CONSUMERS}/${emptyConsumerUsername}`);
  });
});
