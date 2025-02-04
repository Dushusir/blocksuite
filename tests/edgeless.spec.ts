/* eslint-disable @typescript-eslint/no-restricted-imports */

import { assertExists } from '@blocksuite/global/utils';
import { expect } from '@playwright/test';

import {
  activeFrameInEdgeless,
  decreaseZoomLevel,
  getEdgelessBlockChild,
  getEdgelessHoverRect,
  getEdgelessSelectedRect,
  getFrameSize,
  increaseZoomLevel,
  pickColorAtPoints,
  selectBrushColor,
  selectBrushSize,
  selectFrameInEdgeless,
  setMouseMode,
  switchEditorMode,
} from './utils/actions/edgeless.js';
import {
  addBasicBrushElement,
  addBasicRectShapeElement,
  clickBlockById,
  dragBetweenCoords,
  enterPlaygroundRoom,
  focusRichText,
  initEmptyEdgelessState,
  locatorPanButton,
  pressEnter,
  redoByClick,
  resizeElementByTopLeftHandle,
  type,
  undoByClick,
  waitForVirgoStateUpdated,
  waitNextFrame,
} from './utils/actions/index.js';
import {
  assertAlmostEqual,
  assertEdgelessHoverRect,
  assertEdgelessNonHoverRect,
  assertEdgelessSelectedRect,
  assertFrameXYWH,
  assertNativeSelectionRangeCount,
  assertRichTexts,
  assertSameColor,
  assertSelection,
} from './utils/asserts.js';
import { test } from './utils/playwright.js';

const CENTER_X = 450;
const CENTER_Y = 300;

test('switch to edgeless mode', async ({ page }) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);
  await focusRichText(page);
  await type(page, 'hello');
  await assertRichTexts(page, ['hello']);
  await assertSelection(page, 0, 5, 0);

  await switchEditorMode(page);
  const locator = page.locator('.affine-edgeless-page-block-container');
  await expect(locator).toHaveCount(1);
  await assertRichTexts(page, ['hello']);
  await waitNextFrame(page);

  // FIXME: got very flaky result on cursor keeping
  // await assertNativeSelectionRangeCount(page, 1);
});

test('can zoom viewport', async ({ page }) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);

  await switchEditorMode(page);
  await assertFrameXYWH(page, [0, 0, 720, 72]);
  await page.mouse.move(CENTER_X, CENTER_Y);

  const original = [90, 264, 720, 72];
  await assertEdgelessHoverRect(page, original);

  await decreaseZoomLevel(page);
  await decreaseZoomLevel(page);
  await page.mouse.move(CENTER_X, CENTER_Y);

  const box = await getEdgelessHoverRect(page);
  const zoomed = [box.x, box.y, original[2] * 0.8, original[3] * 0.8];
  await assertEdgelessHoverRect(page, zoomed);

  await increaseZoomLevel(page);
  await increaseZoomLevel(page);
  await page.mouse.move(CENTER_X, CENTER_Y);
  await assertEdgelessHoverRect(page, original);
});

test('cursor for active and inactive state', async ({ page }) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);
  await focusRichText(page);
  await type(page, 'hello');
  await pressEnter(page);
  await pressEnter(page);
  await assertRichTexts(page, ['hello', '', '']);

  // inactive
  await switchEditorMode(page);
  await undoByClick(page);
  await waitNextFrame(page);

  await redoByClick(page);
  await waitNextFrame(page);

  // active
  await page.mouse.dblclick(CENTER_X, CENTER_Y);
  await waitNextFrame(page);
  await assertNativeSelectionRangeCount(page, 1);

  await undoByClick(page);
  await waitNextFrame(page);
  await assertNativeSelectionRangeCount(page, 1);
});

test('can drag selected non-active frame', async ({ page }) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);
  await focusRichText(page);
  await type(page, 'hello');
  await assertRichTexts(page, ['hello']);

  await switchEditorMode(page);
  await assertFrameXYWH(page, [0, 0, 720, 72]);

  // selected, non-active
  await page.mouse.click(CENTER_X, CENTER_Y);
  await dragBetweenCoords(
    page,
    { x: CENTER_X, y: CENTER_Y },
    { x: CENTER_X, y: CENTER_Y + 100 }
  );
  await assertFrameXYWH(page, [0, 100, 720, 72]);
});

test('resize block in edgeless mode', async ({ page }) => {
  await enterPlaygroundRoom(page);
  const ids = await initEmptyEdgelessState(page);
  await activeFrameInEdgeless(page, ids.frameId);
  await waitForVirgoStateUpdated(page);
  await type(page, 'hello');
  await assertRichTexts(page, ['hello']);

  await switchEditorMode(page);
  await page.mouse.move(100, 100); // FIXME: no update until mousemove

  expect(ids.frameId).toBe('2'); // 0 for page, 1 for surface
  await selectFrameInEdgeless(page, ids.frameId);

  const oldXywh = await getFrameSize(page, ids);
  const leftHandle = page.locator('[aria-label="handle-left"]');
  const box = await leftHandle.boundingBox();
  if (box === null) throw new Error();

  await dragBetweenCoords(
    page,
    { x: box.x + 5, y: box.y + 5 },
    { x: box.x + 105, y: box.y + 5 }
  );
  const xywh = await getFrameSize(page, ids);
  const [oldX, oldY, oldW, oldH] = JSON.parse(oldXywh);
  const [x, y, w, h] = JSON.parse(xywh);
  expect(x).toBe(oldX + 100);
  assertAlmostEqual(y, oldY, 1);
  expect(w).toBe(oldW - 100);
  assertAlmostEqual(h, oldH, 1);

  await switchEditorMode(page);
  await switchEditorMode(page);
  const newXywh = await getFrameSize(page, ids);
  expect(newXywh).toBe(xywh);
});

test('add shape element', async ({ page }) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);
  await switchEditorMode(page);

  const start = { x: 100, y: 100 };
  const end = { x: 200, y: 200 };
  await addBasicRectShapeElement(page, start, end);

  await page.mouse.move(start.x + 5, start.y + 5);
  await assertEdgelessHoverRect(page, [100, 100, 100, 100]);
});

test('change editor mode when brush color palette opening', async ({
  page,
}) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);
  await switchEditorMode(page);
  await setMouseMode(page, 'brush');

  const brushMenu = page.locator('edgeless-brush-menu');
  await expect(brushMenu).toBeVisible();

  await switchEditorMode(page);
  await expect(brushMenu).toBeHidden();
});

test('add brush element', async ({ page }) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);
  await switchEditorMode(page);

  const start = { x: 100, y: 100 };
  const end = { x: 200, y: 200 };
  await addBasicBrushElement(page, start, end);

  await page.mouse.move(start.x + 5, start.y + 5);
  await assertEdgelessHoverRect(page, [100, 100, 104, 104]);
});

test('resize brush element', async ({ page }) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);
  await switchEditorMode(page);

  const start = { x: 100, y: 100 };
  const end = { x: 200, y: 200 };
  await addBasicBrushElement(page, start, end);

  await page.mouse.move(start.x + 5, start.y + 5);
  await assertEdgelessHoverRect(page, [100, 100, 104, 104]);

  await page.mouse.click(start.x + 5, start.y + 5);
  const delta = { x: 20, y: 40 };
  await resizeElementByTopLeftHandle(page, delta, 10);

  await page.mouse.move(start.x + 25, start.y + 45);
  await assertEdgelessHoverRect(page, [120, 140, 84, 64]);
});

test('add brush element with color', async ({ page }) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);
  await switchEditorMode(page);

  await setMouseMode(page, 'brush');
  await selectBrushColor(page, '#B638FF');

  const start = { x: 100, y: 100 };
  const end = { x: 200, y: 200 };
  await dragBetweenCoords(page, start, end, { steps: 100 });

  const [color] = await pickColorAtPoints(page, [[110, 110]]);
  assertSameColor(color, '#B638FF');
});

test('add brush element with different size', async ({ page }) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);
  await switchEditorMode(page);

  await setMouseMode(page, 'brush');
  await selectBrushSize(page, 16);
  await selectBrushColor(page, '#B638FF');

  const start = { x: 100, y: 100 };
  const end = { x: 200, y: 100 };
  await dragBetweenCoords(page, start, end, { steps: 100 });

  const [topEdge, bottomEdge, nearTopEdge, nearBottomEdge] =
    await pickColorAtPoints(page, [
      // Select two points on the top and bottom border of the line,
      // their color should be the same as the specified color
      [110, 100],
      [110, 115],
      // Select two points close to the upper and lower boundaries of the line,
      // their color should be different from the specified color
      [110, 99],
      [110, 116],
    ]);
  assertSameColor(topEdge, '#B638FF');
  assertSameColor(bottomEdge, '#B638FF');
  assertSameColor(nearTopEdge, '#000000');
  assertSameColor(nearBottomEdge, '#000000');
});

test('add Text', async ({ page }) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);

  await switchEditorMode(page);
  await setMouseMode(page, 'text');

  await page.mouse.click(30, 40);
  await waitForVirgoStateUpdated(page);

  await type(page, 'hello');
  await assertRichTexts(page, ['', 'hello']);

  await page.mouse.move(30, 40);
  await assertEdgelessHoverRect(page, [0, 0, 448, 72]);
});

test('add empty Text', async ({ page }) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);

  await switchEditorMode(page);
  await setMouseMode(page, 'text');

  // add text at 30,40
  await page.mouse.click(30, 40);
  await waitForVirgoStateUpdated(page);
  await pressEnter(page);

  // assert add text success
  await page.mouse.move(30, 40);
  await assertEdgelessHoverRect(page, [0, 0, 448, 104]);

  // click out of text
  await page.mouse.click(0, 200);

  // assert empty text is removed
  await page.mouse.move(30, 40);
  await assertEdgelessNonHoverRect(page);
});

test('always keep at least 1 frame block', async ({ page }) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);

  await switchEditorMode(page);
  await setMouseMode(page, 'default');

  // clicking in default mode will try to remove empty frame block
  await page.mouse.click(0, 0);

  const frames = await page.locator('affine-frame').all();
  expect(frames.length).toEqual(1);
});

test.skip('delete shape block by keyboard', async ({ page }) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);

  await switchEditorMode(page);
  await setMouseMode(page, 'shape');
  await dragBetweenCoords(page, { x: 100, y: 100 }, { x: 200, y: 200 });

  await setMouseMode(page, 'default');
  const startPoint = await page.evaluate(() => {
    // @ts-expect-error
    const hitbox = window.std.getShapeBlockHitBox('3');
    if (!hitbox) {
      throw new Error('hitbox is null');
    }
    const rect = hitbox.getBoundingClientRect();
    if (rect == null) {
      throw new Error('rect is null');
    }
    return {
      x: rect.x,
      y: rect.y,
    };
  });
  await page.mouse.click(startPoint.x + 2, startPoint.y + 2);
  await waitNextFrame(page);
  await page.keyboard.press('Backspace');
  const exist = await page.evaluate(() => {
    return document.querySelector('[data-block-id="3"]') != null;
  });
  expect(exist).toBe(false);
});

test('edgeless toolbar menu shows up and close normally', async ({ page }) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);
  await switchEditorMode(page);

  const toolbarLocator = page.locator('edgeless-toolbar');
  await expect(toolbarLocator).toBeVisible();

  const shapeTool = page.locator('.icon-container[data-test-id="shape"]');
  const shapeToolBox = await shapeTool.boundingBox();

  assertExists(shapeToolBox);

  await page.mouse.click(shapeToolBox.x + 10, shapeToolBox.y + 10);

  const shapeMenu = page.locator('edgeless-shape-menu');
  await expect(shapeMenu).toBeVisible();

  await page.mouse.click(shapeToolBox.x + 10, shapeToolBox.y + 10);
  await expect(shapeMenu).toBeHidden();
});

test('edgeless arrow up/down', async ({ page }) => {
  await enterPlaygroundRoom(page);
  const ids = await initEmptyEdgelessState(page);

  await activeFrameInEdgeless(page, ids.frameId);
  await waitForVirgoStateUpdated(page);

  await type(page, 'hello');
  await pressEnter(page);
  await type(page, 'world');
  await pressEnter(page);
  await type(page, 'foo');

  await switchEditorMode(page);

  await activeFrameInEdgeless(page, ids.frameId);
  await waitForVirgoStateUpdated(page);
  // 0 for page, 1 for surface, 2 for frame, 3 for paragraph
  expect(ids.paragraphId).toBe('3');
  await clickBlockById(page, ids.paragraphId);

  await page.keyboard.press('ArrowDown');
  await assertSelection(page, 1, 4, 0);

  await page.keyboard.press('ArrowUp');
  await assertSelection(page, 0, 4, 0);

  await page.keyboard.press('ArrowUp');
  await assertSelection(page, 0, 4, 0);
});

test('selection box of shape element sync on fast dragging', async ({
  page,
}) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);
  await switchEditorMode(page);

  await setMouseMode(page, 'shape');
  await dragBetweenCoords(page, { x: 100, y: 100 }, { x: 200, y: 200 });
  await setMouseMode(page, 'default');
  await dragBetweenCoords(
    page,
    { x: 150, y: 150 },
    { x: 700, y: 500 },
    { click: true }
  );

  await assertEdgelessHoverRect(page, [650, 450, 100, 100]);
});

test('hovering on shape should not have effect on underlying block', async ({
  page,
}) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);
  await focusRichText(page);

  await type(page, 'hello');
  await assertRichTexts(page, ['hello']);

  await switchEditorMode(page);

  const block = page.locator('.affine-edgeless-block-child');
  const blockBox = await block.boundingBox();
  if (blockBox === null) throw new Error('Unexpected box value: box is null');

  const { x, y } = blockBox;

  await setMouseMode(page, 'shape');
  await dragBetweenCoords(page, { x, y }, { x: x + 100, y: y + 100 });
  await setMouseMode(page, 'default');

  await page.mouse.move(x + 50, y + 50);
  await assertEdgelessHoverRect(page, [x, y, 100, 100]);
});

test('pan tool basic', async ({ page }) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);
  await switchEditorMode(page);

  const start = { x: 100, y: 100 };
  const end = { x: 200, y: 200 };
  await addBasicRectShapeElement(page, start, end);

  await setMouseMode(page, 'pan');
  await dragBetweenCoords(
    page,
    {
      x: start.x + 5,
      y: start.y + 5,
    },
    {
      x: start.x + 25,
      y: start.y + 25,
    }
  );
  await setMouseMode(page, 'default');

  await page.mouse.move(start.x + 25, start.y + 25);
  await assertEdgelessHoverRect(page, [120, 120, 100, 100]);
});

test('pan tool shortcut', async ({ page }) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);
  await switchEditorMode(page);

  const start = { x: 100, y: 100 };
  const end = { x: 200, y: 200 };
  await addBasicRectShapeElement(page, start, end);

  await page.mouse.move(start.x + 5, start.y + 5);
  await assertEdgelessHoverRect(page, [100, 100, 100, 100]);

  await page.keyboard.down('Space');
  const panButton = locatorPanButton(page);
  expect(await panButton.getAttribute('active')).toEqual('');

  await dragBetweenCoords(
    page,
    {
      x: start.x + 5,
      y: start.y + 5,
    },
    {
      x: start.x + 25,
      y: start.y + 25,
    }
  );

  await page.keyboard.up('Space');

  expect(await panButton.getAttribute('active')).toBeNull();

  await page.mouse.move(start.x + 25, start.y + 25);
  await assertEdgelessHoverRect(page, [120, 120, 100, 100]);
});

test('pan tool shortcut when user is editing', async ({ page }) => {
  await enterPlaygroundRoom(page);
  const ids = await initEmptyEdgelessState(page);
  await switchEditorMode(page);
  await setMouseMode(page, 'default');

  await activeFrameInEdgeless(page, ids.frameId);
  await waitForVirgoStateUpdated(page);

  await type(page, 'hello');
  await assertRichTexts(page, ['hello']);

  await page.keyboard.down('Space');
  const panButton = locatorPanButton(page);
  expect(await panButton.getAttribute('active')).toBeNull();
});

test('should cancel select when the selected point is outside the current selected element', async ({
  page,
}) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);
  await switchEditorMode(page);

  const firstStart = { x: 100, y: 100 };
  const firstEnd = { x: 200, y: 200 };
  await addBasicRectShapeElement(page, firstStart, firstEnd);

  const secondStart = { x: 300, y: 300 };
  const secondEnd = { x: 400, y: 400 };
  await addBasicRectShapeElement(page, secondStart, secondEnd);

  // select the first rect
  await page.mouse.click(150, 150);

  await dragBetweenCoords(page, { x: 350, y: 350 }, { x: 350, y: 450 });

  await page.mouse.move(150, 150);
  await assertEdgelessHoverRect(page, [100, 100, 100, 100]);
});

test('shape element should not move when the selected state is inactive', async ({
  page,
}) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);
  await switchEditorMode(page);

  await setMouseMode(page, 'shape');
  await dragBetweenCoords(page, { x: 100, y: 100 }, { x: 200, y: 200 });
  await setMouseMode(page, 'default');
  await dragBetweenCoords(
    page,
    { x: 50, y: 50 },
    { x: 150, y: 150 },
    { steps: 2 }
  );

  await assertEdgelessHoverRect(page, [100, 100, 100, 100]);
});

test.skip('shape element should have the correct selected shape when clicking on the `Select` toolbar', async ({
  page,
}) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);
  await pressEnter(page);
  for (let i = 0; i < 15; i++) {
    await page.keyboard.insertText(`Line ${i + 1}`);
    await pressEnter(page);
  }
  await switchEditorMode(page);

  await setMouseMode(page, 'pan');
  await dragBetweenCoords(page, { x: 100, y: 100 }, { x: 150, y: 150 });
  await setMouseMode(page, 'default');

  const blockBox = await getEdgelessBlockChild(page);
  const selectedBox = await getEdgelessSelectedRect(page);

  expect(blockBox.x).toBeCloseTo(selectedBox.x, 0);
  expect(blockBox.y).toBeCloseTo(selectedBox.y, 0);
  expect(blockBox.width).toBeCloseTo(selectedBox.width, 0);
  expect(blockBox.height).toBeCloseTo(selectedBox.height, 0);
});

test('select multiple shapes and resize', async ({ page }) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);

  await switchEditorMode(page);

  await addBasicBrushElement(page, { x: 100, y: 100 }, { x: 200, y: 200 });
  await page.mouse.move(110, 110);
  await assertEdgelessHoverRect(page, [100, 100, 104, 104]);

  await addBasicRectShapeElement(page, { x: 210, y: 110 }, { x: 310, y: 210 });
  await page.mouse.move(220, 120);
  await assertEdgelessHoverRect(page, [210, 110, 100, 100]);

  await dragBetweenCoords(page, { x: 120, y: 90 }, { x: 220, y: 130 });
  await assertEdgelessSelectedRect(page, [100, 100, 210, 110]);

  await resizeElementByTopLeftHandle(page, { x: 50, y: 50 });
  await assertEdgelessSelectedRect(page, [150, 150, 160, 60]);

  await page.mouse.move(160, 160);
  await assertEdgelessHoverRect(page, [150, 150, 79, 57]);

  await page.mouse.move(260, 160);
  await assertEdgelessHoverRect(page, [234, 155, 76, 55]);
});

test('select multiple shapes and translate', async ({ page }) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);

  await switchEditorMode(page);

  await addBasicBrushElement(page, { x: 100, y: 100 }, { x: 200, y: 200 });
  await page.mouse.move(110, 110);
  await assertEdgelessHoverRect(page, [100, 100, 104, 104]);

  await addBasicRectShapeElement(page, { x: 210, y: 110 }, { x: 310, y: 210 });
  await page.mouse.move(220, 120);
  await assertEdgelessHoverRect(page, [210, 110, 100, 100]);

  await dragBetweenCoords(page, { x: 120, y: 90 }, { x: 220, y: 130 });
  await assertEdgelessSelectedRect(page, [100, 100, 210, 110]);

  await dragBetweenCoords(page, { x: 120, y: 120 }, { x: 150, y: 150 });
  await assertEdgelessSelectedRect(page, [130, 130, 210, 110]);

  await page.mouse.move(160, 160);
  await assertEdgelessHoverRect(page, [130, 130, 104, 104]);

  await page.mouse.move(260, 160);
  await assertEdgelessHoverRect(page, [240, 140, 100, 100]);
});

test('dragging un-selected frame', async ({ page }) => {
  await enterPlaygroundRoom(page);
  await initEmptyEdgelessState(page);
  await focusRichText(page);
  await type(page, 'hello');
  await assertRichTexts(page, ['hello']);

  await switchEditorMode(page);

  const frameBox = await page
    .locator('.affine-edgeless-block-child')
    .boundingBox();
  if (!frameBox) {
    throw new Error('Missing edgeless affine-frame');
  }
  await page.mouse.move(frameBox.x + 5, frameBox.y + 5);
  await assertEdgelessHoverRect(page, [
    frameBox.x,
    frameBox.y,
    frameBox.width,
    frameBox.height,
  ]);

  await dragBetweenCoords(
    page,
    { x: frameBox.x + 5, y: frameBox.y + 5 },
    { x: frameBox.x + 25, y: frameBox.y + 25 }
  );

  await page.mouse.move(frameBox.x + 25, frameBox.y + 25);
  await assertEdgelessHoverRect(page, [
    frameBox.x + 20,
    frameBox.y + 20,
    frameBox.width,
    frameBox.height,
  ]);
});
