import { expect, test, type Locator, type Page } from '@playwright/test';
import scenarios from './test-cases.json';

type Scenario = {
  name: string;
  project: string;
  column: string;
  task: string;
  tags: string[];
};

const credentials = {
  username: 'admin',
  password: 'password123'
};

async function login(page: Page) {
  await page.goto('/');
  await page.getByLabel('Username').fill(credentials.username);
  await page.getByLabel('Password').fill(credentials.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Projects' })).toBeVisible();
}

async function openProject(page: Page, projectName: string) {
  await page.getByRole('button', { name: new RegExp(projectName, 'i') }).click();
  await expect(page.getByRole('heading', { level: 1, name: projectName })).toBeVisible();
}

function getColumn(page: Page, columnName: string): Locator {
  return page.getByRole('heading', { level: 2, name: new RegExp(`^${escapeRegExp(columnName)}\\s*\\(`) }).locator('..');
}

function getTaskCard(column: Locator, taskName: string): Locator {
  return column.locator('div.bg-white', {
    has: column.page().getByRole('heading', { level: 3, name: taskName })
  });
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test.describe('Project board validation', () => {
  for (const scenario of scenarios as Scenario[]) {
    test(`${scenario.name}: ${scenario.project} / ${scenario.column} / ${scenario.task}`, async ({ page }) => {
      await login(page);
      await openProject(page, scenario.project);

      const column = getColumn(page, scenario.column);
      await expect(column).toBeVisible();

      const card = getTaskCard(column, scenario.task);
      await expect(card).toBeVisible();

      for (const tag of scenario.tags) {
        await expect(card.getByText(tag, { exact: true })).toBeVisible();
      }
    });
  }
});
