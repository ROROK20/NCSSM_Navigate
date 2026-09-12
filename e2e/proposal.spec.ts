import { expect, test } from "@playwright/test";

/**
 * The proposal stage: what the site must NOT do while it is a candidate's
 * project rather than an adopted Student Government service.
 *
 * These are the tests that matter most in this repository. Everything else
 * here protects a feature; this file protects students from a site that
 * collects reports nobody holds the office to act on, and protects the author
 * from appearing to claim an office they do not hold.
 */

test("the issue API refuses every submission and stores nothing", async ({
  request,
}) => {
  const response = await request.post("/api/issues", {
    data: {
      title: "Dryers take payment and stall",
      description:
        "Three of the dryers on the hall take payment but never start a cycle. It has happened every evening this week.",
      category: "residential-life",
      anonymous: true,
      consent: true,
      website: "",
      elapsedMs: 9000,
    },
  });

  expect(response.status()).toBe(503);
  const body = await response.json();
  expect(body.ok).toBe(false);
  expect(body.error).toBe("not_accepting");
  // The refusal has to say plainly that nothing was kept.
  expect(body.message).toMatch(/nothing was stored/i);
});

test("a refused submission never reaches the editor", async ({ page }) => {
  // Sign in and confirm the submissions tab is genuinely empty, rather than
  // trusting the API's own word for it.
  await page.goto("/admin");
  await page.getByLabel("Editor password").fill("e2e-editor-password-1234");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(
    page.getByRole("navigation", { name: "Editor sections" }),
  ).toBeVisible({ timeout: 15_000 });

  await expect(page.getByText("No submissions yet.")).toBeVisible();
});

test("the report page shows no working form", async ({ page }) => {
  await page.goto("/report");

  await expect(
    page.getByRole("heading", { name: "Reporting an issue" }),
  ).toBeVisible();

  // Nothing submittable anywhere on the page.
  await expect(page.locator("form")).toHaveCount(0);
  await expect(page.locator("textarea")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /Submit to Student Government/ }),
  ).toHaveCount(0);

  // And it points somewhere that actually works today.
  await expect(page.getByText("If you need something now")).toBeVisible();
  await expect(
    page.getByRole("main").getByText(/call 911/).first(),
  ).toBeVisible();
});

test("every page carries the proposal banner", async ({ page }) => {
  for (const path of ["/", "/resources", "/opportunities", "/report", "/updates", "/sg"]) {
    await page.goto(path);
    await expect(
      page.getByText("Not an official NCSSM or Student Government service."),
      `${path} banner`,
    ).toBeVisible();
  }
});

test("the main navigation does not invite issue reports", async ({ page }) => {
  await page.goto("/");

  // On a phone the links sit behind the menu button; open it so the same
  // assertions cover both layouts.
  const toggle = page.getByRole("button", { name: "Open menu" });
  if (await toggle.isVisible()) await toggle.click();

  const nav = page.getByRole("navigation", { name: "Main" }).last();
  await expect(nav.getByRole("link", { name: "Resources" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Opportunities" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "The proposal" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Report an issue" })).toHaveCount(0);
});

test("the homepage separates what works from what is switched off", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /Two more pieces are built and waiting/ }),
  ).toBeVisible();
  await expect(page.getByText("Preview").first()).toBeVisible();
});

test("the SG page makes the case rather than listing officers", async ({
  page,
}) => {
  await page.goto("/sg");

  await expect(
    page.getByRole("heading", { name: /Finding it is the problem/ }),
  ).toBeVisible();
  await expect(page.getByText("What is already built")).toBeVisible();

  // No claim to hold the office: the officer roster and Senate seats belong to
  // the official page only.
  await expect(page.getByText("Elected by hall")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Senate" })).toHaveCount(0);
});

test("the status board is labelled as examples", async ({ page }) => {
  await page.goto("/updates");

  await expect(
    page.getByText("These are examples, not real cases"),
  ).toBeVisible();
  await expect(
    page.getByText("No issue reports are being collected yet."),
  ).toBeVisible();
});
