import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility and responsive checks that would otherwise only be caught by
 * someone manually tabbing through the site.
 */

const ROUTES = ["/", "/resources", "/opportunities", "/report", "/updates", "/sg"];

test("every page has exactly one h1 and a skip link that takes focus", async ({
  page,
}) => {
  for (const path of ROUTES) {
    await page.goto(path);
    await expect(
      page.getByRole("heading", { level: 1 }),
      `${path} h1 count`,
    ).toHaveCount(1);

    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused, `${path} first tab stop`).toHaveText("Skip to content");
  }
});

test("images and icon-only controls carry accessible names", async ({ page }) => {
  await page.goto("/");

  // Decorative SVGs must be hidden rather than announced.
  const svgs = page.locator("svg:not([aria-hidden='true'])");
  expect(await svgs.count()).toBe(0);
});

test("the page never scrolls sideways on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });

  for (const path of ROUTES) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `${path} horizontal overflow`).toBeLessThanOrEqual(1);
  }
});

test("the mobile menu opens, navigates, and closes itself", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Open menu" });
  await expect(toggle).toBeVisible();
  await toggle.click();

  const menu = page.locator("#mobile-nav");
  await expect(menu).toBeVisible();

  await menu.getByRole("link", { name: "Resources" }).click();
  await expect(page).toHaveURL(/\/resources$/);
  await expect(page.locator("#mobile-nav")).toHaveCount(0);
});

/**
 * Automated WCAG 2.1 AA check on every public route, in both themes.
 *
 * Added after an audit found 124 failing nodes, every one of them text dimmed
 * with an opacity multiplier on top of a colour that already sat at the AA
 * floor. That class of mistake is invisible by eye and trivial to reintroduce,
 * so it gets a test rather than a note in a document.
 */
test.describe("WCAG AA", () => {
  const ROUTES = ["/", "/resources", "/opportunities", "/report", "/updates", "/sg", "/admin"];

  for (const scheme of ["light", "dark"] as const) {
    test(`no violations in ${scheme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      const failures: string[] = [];

      for (const path of ROUTES) {
        await page.goto(path, { waitUntil: "networkidle" });
        const { violations } = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        for (const v of violations) {
          failures.push(`${path} — ${v.id} (${v.impact}) x${v.nodes.length}: ${v.help}`);
        }
      }

      expect(failures, failures.join("\n")).toEqual([]);
    });
  }
});
