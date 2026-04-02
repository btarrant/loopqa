import { expect, type Locator, type Page } from '@playwright/test';

export class BoardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async assertLoaded(projectName: string) {
    await expect(this.page.getByRole('heading', { level: 1, name: projectName })).toBeVisible();
  }

  getColumnHeading(columnName: string): Locator {
    return this.page.getByRole('heading', {
      level: 2,
      name: new RegExp(`^${escapeRegExp(columnName)}\\s*\\(`)
    });
  }

  getColumn(columnName: string): Locator {
    return this.getColumnHeading(columnName).locator('..');
  }

  getTaskCard(columnName: string, taskName: string): Locator {
    const column = this.getColumn(columnName);

    return column.locator('div.bg-white', {
      has: this.page.getByRole('heading', { level: 3, name: taskName })
    });
  }

  async expectTaskInColumn(columnName: string, taskName: string, tags: string[]) {
    const card = this.getTaskCard(columnName, taskName);
    await expect(card, `${taskName} should appear in the ${columnName} column`).toBeVisible();

    for (const tag of tags) {
      await expect(card.getByText(tag, { exact: true }), `${taskName} should show the ${tag} tag`).toBeVisible();
    }
  }

  async expectTaskNotInColumn(columnName: string, taskName: string) {
    await expect(
      this.getTaskCard(columnName, taskName),
      `${taskName} should not appear in the ${columnName} column`
    ).toHaveCount(0);
  }

  async expectColumnCountToMatchCards(columnName: string) {
    const headingText = await this.getColumnHeading(columnName).innerText();
    const expectedCount = Number(headingText.match(/\((\d+)\)/)?.[1] ?? Number.NaN);
    const actualCount = await this.getColumn(columnName).locator('div.bg-white').count();

    expect(actualCount, `${columnName} rendered card count should match the heading count`).toBe(expectedCount);
  }

  async snapshotBoardState() {
    const headings = await this.page
      .getByRole('heading', { level: 2 })
      .evaluateAll((elements) => elements.map((element) => element.textContent?.trim() ?? ''));
    const cards = await this.page
      .locator('h3')
      .evaluateAll((elements) => elements.map((element) => element.textContent?.trim() ?? ''));

    return JSON.stringify({ headings, cards }, null, 2);
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
