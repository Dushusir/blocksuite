import { test } from '@playwright/test';
import {
  enterPlaygroundRoom,
  focusRichText,
  blurRichText,
  selectAllByKeyboard,
} from './utils/actions';
import { assertSelection, assertSelectedBlockCount } from './utils/asserts';

test('rich-text hotkey scope', async ({ page }) => {
  await enterPlaygroundRoom(page);
  await focusRichText(page);
  await page.keyboard.type('hello');
  await selectAllByKeyboard(page); // first select all
  await assertSelection(page, 0, 0, 5);

  await blurRichText(page);
  await selectAllByKeyboard(page); // second select all
  await assertSelectedBlockCount(page, 1);
});