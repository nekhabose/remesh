import { expect, test } from '@playwright/test';

test('creates a conversation and opens its detail page', async ({ page }) => {
  const title = `Playwright conversation ${Date.now()}`;

  await page.goto('/');
  await page.getByLabel('Title').fill(title);
  await page.getByRole('button', { name: 'Create Conversation' }).click();

  await expect(page.getByRole('link', { name: title })).toBeVisible();
  await page.getByRole('link', { name: title }).click();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
});

test('shows client-side validation before creating a conversation', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Title').fill('');
  await page.getByLabel('Start date').fill('');
  await page.getByRole('button', { name: 'Create Conversation' }).click();

  await expect(page.getByText('Title is required.')).toBeVisible();
  await expect(page.getByText('Enter a valid local date and time.')).toBeVisible();
});
