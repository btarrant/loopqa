import { test as setup } from '@playwright/test';
import { LoginPage } from '../playwright/pages/LoginPage';
import { ProjectsPage } from '../playwright/pages/ProjectsPage';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const projectsPage = new ProjectsPage(page);

  await loginPage.goto();
  await loginPage.login('admin', 'password123');
  await projectsPage.assertLoaded();

  await page.context().storageState({ path: authFile });
});
