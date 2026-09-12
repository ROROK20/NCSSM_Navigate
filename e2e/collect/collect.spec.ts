import { expect, test } from "@playwright/test";

/**
 * Candidate-collecting mode: submissions are stored for real, the site still
 * does not claim to be Student Government.
 *
 * The thing these tests guard is the copy. Storing a report and claiming an
 * office are separate, and every surface that says "nothing is sent" has to
 * stop saying it the moment something is.
 */

test("the banner says who reports reach", async ({ page }) => {
  await page.goto("/");
  const banner = page.locator("[data-demo-banner]");
  await expect(banner).toBeVisible();
  await expect(banner).toContainText(/reaches Rohan Khiani|reach Rohan Khiani/);
  await expect(banner).not.toContainText("Nothing you submit is sent");
});

test("the form says it is not Student Government", async ({ page }) => {
  await page.goto("/report");
  await expect(
    page.getByText(/reaches Rohan Khiani, not Student Government/),
  ).toBeVisible();
});

test("a submission is stored and the confirmation does not claim otherwise", async ({
  page,
}) => {
  await page.goto("/report");
  await page.getByLabel("What is the issue?").fill("Collect mode check");
  await page
    .getByLabel("What is happening?")
    .fill("Verifying that a real submission is accepted and described honestly.");
  await page.getByLabel("Category").selectOption("other");
  await page.getByLabel(/Submit anonymously/).check();
  await page.getByLabel(/I understand that SG officers/).check();
  await page.waitForTimeout(1400);
  await page
    .getByRole("button", { name: /Submit to Student Government/ })
    .click();

  await expect(
    page.getByRole("heading", { name: /Rohan Khiani has your report/ }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/did not go to Student Government/)).toBeVisible();
  await expect(page.getByText("Nothing was sent")).toHaveCount(0);
});

test("the status board drops the browser-only panel", async ({ page }) => {
  await page.goto("/updates");
  await expect(page.getByText("Only you can see this.")).toHaveCount(0);
});

test("the proposal page still stands in for the SG page", async ({ page }) => {
  await page.goto("/sg");
  await expect(
    page.getByRole("heading", { name: /Finding it is the problem/ }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Senate" })).toHaveCount(0);
});
