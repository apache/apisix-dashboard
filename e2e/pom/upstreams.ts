import { expect, type Locator, type Page } from '@playwright/test';
import { uiGoto } from '@utils/ui';

export class UpstreamsPOM {
  readonly upstreamNavBtn: Locator;
  readonly addUpstreamBtn: Locator;
  constructor(private page: Page) {
    this.upstreamNavBtn = this.page.getByRole('link', { name: 'Upstreams' });
    this.addUpstreamBtn = this.page.getByRole('button', {
      name: 'Add Upstream',
    });
  }

  async goto() {
    await uiGoto(this.page, '/upstreams');
  }

  async isListPage() {
    await expect(this.page).toHaveURL((url) =>
      url.pathname.endsWith('/upstreams')
    );
    const title = this.page.getByRole('heading', { name: 'Upstreams' });
    await expect(title).toBeVisible();
  }

  async isAddPage() {
    await expect(this.page).toHaveURL((url) =>
      url.pathname.endsWith('/upstreams/add')
    );
    const title = this.page.getByRole('heading', { name: 'Add Upstream' });
    await expect(title).toBeVisible();
  }

  async createUpstream(name: string) {
    await this.page.getByRole('button', { name: 'Create Upstream' }).click();
    await this.page.getByLabel('Name').fill(name);
    await this.page.getByRole('button', { name: 'Create' }).click();
  }

  async deleteUpstream(name: string) {
    await this.page
      .getByRole('row', { name })
      .getByRole('button', { name: 'Delete' })
      .click();
    await this.page.getByRole('button', { name: 'Delete' }).click();
  }
}
