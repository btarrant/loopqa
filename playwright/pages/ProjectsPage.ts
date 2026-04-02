import { expect, type Locator, type Page } from '@playwright/test';

export class ProjectsPage {
  readonly page: Page;
  readonly pageHeading: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeading = page.getByRole('heading', { level: 1, name: 'Projects' });
    this.logoutButton = page.getByRole('button', { name: /logout/i });
  }

  async assertLoaded() {
    await expect(this.pageHeading).toBeVisible();
    await expect(this.logoutButton).toBeVisible();
  }

  async openProject(projectName: string) {
    await this.page.getByRole('button', { name: new RegExp(projectName, 'i') }).click();
    await expect(this.page.getByRole('heading', { level: 1, name: projectName })).toBeVisible();
  }

  async logout() {
    await this.logoutButton.click();
  }
}
