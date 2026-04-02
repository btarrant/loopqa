import { test as base, expect } from '@playwright/test';
import { BoardPage } from '../playwright/pages/BoardPage';
import { LoginPage } from '../playwright/pages/LoginPage';
import { ProjectsPage } from '../playwright/pages/ProjectsPage';

type TestFixtures = {
  loginPage: LoginPage;
  projectsPage: ProjectsPage;
  boardPage: BoardPage;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  projectsPage: async ({ page }, use) => {
    await use(new ProjectsPage(page));
  },
  boardPage: async ({ page }, use, testInfo) => {
    const boardPage = new BoardPage(page);
    await use(boardPage);

    if (testInfo.status !== testInfo.expectedStatus) {
      await testInfo.attach('board-state.json', {
        body: await boardPage.snapshotBoardState(),
        contentType: 'application/json'
      });
    }
  }
});

export { expect };
