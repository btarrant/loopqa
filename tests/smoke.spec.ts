import scenarios from './test-cases.json';
import { expect, test } from './fixtures';

type Scenario = {
  name: string;
  project: string;
  column: string;
  task: string;
  tags: string[];
};

const allColumns = ['To Do', 'In Progress', 'Review', 'Done'];

test.describe('Smoke coverage', () => {
  for (const scenario of scenarios as Scenario[]) {
    test(`@smoke ${scenario.name}: ${scenario.project} / ${scenario.column} / ${scenario.task}`, async ({
      boardPage,
      page,
      projectsPage
    }) => {
      await page.goto('/');
      await projectsPage.assertLoaded();
      await projectsPage.openProject(scenario.project);
      await boardPage.assertLoaded(scenario.project);
      await boardPage.expectTaskInColumn(scenario.column, scenario.task, scenario.tags);

      for (const otherColumn of allColumns.filter((columnName) => columnName !== scenario.column)) {
        await boardPage.expectTaskNotInColumn(otherColumn, scenario.task);
      }
    });
  }
});
