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

function getColumnHeading(page: Page, columnName: string): Locator {
  return page.getByRole('heading', { level: 2, name: new RegExp(`^${escapeRegExp(columnName)}\\s*\\(`) });
}

function getTaskCard(column: Locator, taskName: string): Locator {
  return column.locator('div.bg-white', {
    has: column.page().getByRole('heading', { level: 3, name: taskName })
  });
}

async function expectColumnCountToMatchCards(page: Page, columnName: string) {
  const column = getColumn(page, columnName);
  const heading = getColumnHeading(page, columnName);
  const headingText = await heading.innerText();
  const expectedCount = Number(headingText.match(/\((\d+)\)/)?.[1] ?? Number.NaN);
  const actualCount = await column.locator('div.bg-white').count();

  expect(actualCount, `${columnName} rendered card count should match the heading count`).toBe(expectedCount);
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

test.describe('Edge case coverage', () => {
  test('shows a validation error for invalid login credentials', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Username').fill(credentials.username);
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText('Invalid username or password')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: /project board login/i })).toBeVisible();
  });

  test('supports the primary board flow on a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await login(page);
    await openProject(page, 'Mobile Application');

    const card = getTaskCard(getColumn(page, 'Done'), 'App icon design');
    await expect(card).toBeVisible();
    await expect(card.getByText('Design', { exact: true })).toBeVisible();
  });

  test('matches displayed card counts to rendered cards on the web application board', async ({ page }) => {
    await login(page);
    await openProject(page, 'Web Application');

    for (const columnName of ['To Do', 'In Progress', 'Review', 'Done']) {
      await expectColumnCountToMatchCards(page, columnName);
    }
  });

  test('matches displayed card counts to rendered cards on the mobile application board, including empty columns', async ({ page }) => {
    await login(page);
    await openProject(page, 'Mobile Application');

    for (const columnName of ['To Do', 'In Progress', 'Review', 'Done']) {
      await expectColumnCountToMatchCards(page, columnName);
    }

    await expect(getColumn(page, 'Review').locator('div.bg-white')).toHaveCount(0);
  });
});
