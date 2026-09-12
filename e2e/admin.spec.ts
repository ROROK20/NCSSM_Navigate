import { expect, test, type Page } from "@playwright/test";

/**
 * The editor workflow, end to end: sign in, change content, see it on the
 * public site, sign out.
 *
 * Each test gets a fresh browser context, so each one signs in for itself
 * rather than relying on a session left behind by the test before it.
 */

const PASSWORD = "e2e-editor-password-1234";

test.describe.configure({ mode: "serial" });

/**
 * One of these tests signs in with the wrong password on purpose, which spends
 * from the server's per-network failure budget. Presenting a fresh client
 * identity per run keeps repeated local runs off the previous run's bucket.
 */
test.use({
  extraHTTPHeaders: { "x-forwarded-for": `10.77.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` },
});

async function signIn(page: Page) {
  await page.goto("/admin");
  await page.getByLabel("Editor password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(
    page.getByRole("navigation", { name: "Editor sections" }),
  ).toBeVisible({ timeout: 15_000 });
}

test("the editor is gated and a wrong password is refused", async ({ page }) => {
  await page.goto("/admin");

  await expect(page.getByLabel("Editor password")).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Editor sections" }),
  ).toHaveCount(0);

  await page.getByLabel("Editor password").fill("definitely-not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByText("That password is not right.")).toBeVisible();
  await expect(page.getByLabel("Editor password")).toBeVisible();
});

test("an editor can verify a resource and it shows on the public directory", async ({
  page,
}) => {
  await signIn(page);

  const tabs = page.getByRole("navigation", { name: "Editor sections" });
  await tabs.getByRole("link", { name: "Resources" }).click();
  await expect(page.getByText("Needs review").first()).toBeVisible();

  const row = page.locator("li").filter({ hasText: "Information Technology Services (ITS)" }).first();
  await row.getByRole("button", { name: "Mark verified" }).click();

  await expect(
    page
      .locator("li")
      .filter({ hasText: "Information Technology Services (ITS)" })
      .first()
      .getByText(/^Verified/),
  ).toBeVisible({ timeout: 15_000 });

  // The public page reads the same override, with no rebuild.
  await page.goto("/resources");
  await page
    .getByRole("searchbox", { name: /Search resources/i })
    .fill("Information Technology Services");
  await expect(page.getByText(/Checked \w+ \d+, \d{4}/)).toBeVisible();
});

test("an editor can publish a status update and students can read it", async ({
  page,
}) => {
  const title = `Bike racks by the gym need repair ${Date.now()}`;

  await signIn(page);
  await page.goto("/admin?tab=updates");
  await page.getByRole("button", { name: "Post a new update" }).click();

  await page.getByLabel("Public title").fill(title);
  await page.getByLabel("Category", { exact: true }).selectOption("student-life");
  await page.getByLabel("Status", { exact: true }).selectOption("under-review");
  await page
    .getByLabel("Public summary")
    .fill(
      "Several reports about damaged bike racks. SG is checking who owns outdoor fixtures before raising it.",
    );
  await page.getByRole("button", { name: "Publish update" }).click();

  await expect(page.getByText("Update posted.")).toBeVisible({ timeout: 15_000 });

  await page.goto("/updates");
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(
    page.locator("li").filter({ hasText: title }).getByText("Under review"),
  ).toBeVisible();
});

test("signing out closes the editor", async ({ page }) => {
  await signIn(page);

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByLabel("Editor password")).toBeVisible({
    timeout: 15_000,
  });

  // And the gated endpoint stops answering.
  const exported = await page.request.get("/api/admin/export");
  expect(exported.status()).toBe(401);
});

test("the editor export is not reachable without a session", async ({
  request,
}) => {
  const exported = await request.get("/api/admin/export");
  expect(exported.status()).toBe(401);
});
