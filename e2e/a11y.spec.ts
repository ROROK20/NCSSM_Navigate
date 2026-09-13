import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility and responsive checks that would otherwise only be caught by
 * someone manually tabbing through the site.
 */

const ROUTES = ["/", "/resources", "/academic-help", "/discounts", "/amenities", "/clubs", "/opportunities", "/report", "/updates", "/transparency", "/sg"];

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
  const ROUTES = ["/", "/resources", "/academic-help", "/discounts", "/amenities", "/clubs", "/opportunities", "/report", "/updates", "/transparency", "/sg", "/admin"];

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

/**
 * The theme toggle. Three states, and the choice has to survive a navigation.
 */
test.describe("theme", () => {
  test("switches, persists, and beats the OS preference", async ({ page }) => {
    // Start on a dark-preferring device to prove an explicit light choice wins.
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");

    // On a phone the toggle lives in the menu sheet rather than the header bar.
    const menu = page.getByRole("button", { name: "Open menu" });
    if (await menu.isVisible()) await menu.click();

    const group = page
      .getByRole("radiogroup", { name: "Colour theme" })
      .filter({ visible: true })
      .first();
    await expect(group).toBeVisible();

    await group.getByRole("radio", { name: "Light" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    // Survives a navigation, and without a flash: the attribute is present on
    // the very first frame because an inline script sets it before paint.
    await page.goto("/resources");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    const menuAgain = page.getByRole("button", { name: "Open menu" });
    if (await menuAgain.isVisible()) await menuAgain.click();
    const group2 = page
      .getByRole("radiogroup", { name: "Colour theme" })
      .filter({ visible: true })
      .first();

    await group2.getByRole("radio", { name: "Dark" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    // Back to system: the attribute is removed, not set to a value.
    await group2.getByRole("radio", { name: "System" }).click();
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.*/);
  });
});

/**
 * The status board reads as a tracker, not a list.
 */
test.describe("issue tracker", () => {
  test("shows stage counts and filters by stage", async ({ page }) => {
    await page.goto("/updates");

    await expect(page.getByText(/\d+ issues tracked/)).toBeVisible();

    const resolved = page.getByRole("button", { name: /Resolved/ }).first();
    await resolved.scrollIntoViewIfNeeded();
    await resolved.click();
    await expect(page.getByText(/issues? match your filters/)).toBeVisible();
    await expect(resolved).toHaveAttribute("aria-pressed", "true");
  });

  test("each issue shows where it sits in the pipeline", async ({ page }) => {
    await page.goto("/updates");
    await expect(
      page.getByRole("img", { name: /Stage \d of 5:|Closed:/ }).first(),
    ).toBeVisible();
  });
});
