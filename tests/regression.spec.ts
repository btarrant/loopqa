import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';

const loggedOutState = { cookies: [], origins: [] };

async function runAccessibilityAudit(page: Parameters<typeof AxeBuilder>[0]['page']) {
  return new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
}

test.describe('Regression coverage', () => {
  test('@regression matches displayed card counts to rendered cards on the web application board', async ({
    boardPage,
    page,
    projectsPage
  }) => {
    await page.goto('/');
    await projectsPage.assertLoaded();
    await projectsPage.openProject('Web Application');

    for (const columnName of ['To Do', 'In Progress', 'Review', 'Done']) {
      await boardPage.expectColumnCountToMatchCards(columnName);
    }
  });

  test('@regression matches displayed card counts to rendered cards on the mobile application board, including empty columns', async ({
    boardPage,
    page,
    projectsPage
  }) => {
    await page.goto('/');
    await projectsPage.assertLoaded();
    await projectsPage.openProject('Mobile Application');

    for (const columnName of ['To Do', 'In Progress', 'Review', 'Done']) {
      await boardPage.expectColumnCountToMatchCards(columnName);
    }

    await expect(boardPage.getColumn('Review').locator('div.bg-white')).toHaveCount(0);
  });

  test('@regression preserves the authenticated session across a reload', async ({ page, projectsPage }) => {
    await page.goto('/');
    await projectsPage.assertLoaded();
    await page.reload({ waitUntil: 'networkidle' });
    await projectsPage.assertLoaded();
  });

  test('@regression returns the user to login after logout and keeps the session cleared on reload', async ({
    loginPage,
    page,
    projectsPage
  }) => {
    await page.goto('/');
    await projectsPage.assertLoaded();
    await projectsPage.logout();
    await loginPage.assertLoaded();
    await page.reload({ waitUntil: 'networkidle' });
    await loginPage.assertLoaded();
  });

  test('@regression has no critical accessibility violations on the web application board', async ({
    page,
    projectsPage
  }, testInfo) => {
    await page.goto('/');
    await projectsPage.assertLoaded();
    await projectsPage.openProject('Web Application');

    const accessibilityScan = await runAccessibilityAudit(page);
    const criticalViolations = accessibilityScan.violations.filter((violation) => violation.impact === 'critical');
    const seriousViolations = accessibilityScan.violations.filter((violation) => violation.impact === 'serious');

    if (seriousViolations.length > 0) {
      await testInfo.attach('board-a11y-serious-violations.json', {
        body: JSON.stringify(seriousViolations, null, 2),
        contentType: 'application/json'
      });
    }

    expect(criticalViolations, 'Board page should have no critical accessibility violations').toEqual([]);
  });
});

test.describe('Logged out regression coverage', () => {
  test.use({ storageState: loggedOutState });

  test('@regression shows a validation error for invalid login credentials', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('admin', 'wrong-password');
    await loginPage.assertInvalidCredentials();
    await loginPage.assertLoaded();
  });

  test('@regression has no critical accessibility violations on the login page', async ({ page }, testInfo) => {
    await page.goto('/');

    const accessibilityScan = await runAccessibilityAudit(page);
    const criticalViolations = accessibilityScan.violations.filter((violation) => violation.impact === 'critical');
    const seriousViolations = accessibilityScan.violations.filter((violation) => violation.impact === 'serious');

    if (seriousViolations.length > 0) {
      await testInfo.attach('login-a11y-serious-violations.json', {
        body: JSON.stringify(seriousViolations, null, 2),
        contentType: 'application/json'
      });
    }

    expect(criticalViolations, 'Login page should have no critical accessibility violations').toEqual([]);
  });
});

test.describe('Mobile regression coverage', () => {
  test.use({ storageState: loggedOutState, viewport: { width: 390, height: 844 } });

  test('@regression supports the primary board flow on a mobile viewport', async ({
    boardPage,
    loginPage,
    projectsPage
  }) => {
    await loginPage.goto();
    await loginPage.login('admin', 'password123');
    await projectsPage.assertLoaded();
    await projectsPage.openProject('Mobile Application');
    await boardPage.expectTaskInColumn('Done', 'App icon design', ['Design']);
  });
});
