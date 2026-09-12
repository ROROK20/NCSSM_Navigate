import { expect, test } from "@playwright/test";

/**
 * Demo stage: everything is explorable, and nothing leaves the browser.
 *
 * Two things are being protected here. That the demo is genuinely complete -
 * the form validates, confirms, and the entry reaches the status board - and
 * that no submission ever reaches the server or gets mistaken for a real
 * report. A demo that quietly fools someone with an actual problem is the one
 * failure mode worth having tests for.
 */

const DESCRIPTION =
  "Three of the dryers on the hall take payment but never start a cycle. It has happened every evening this week to several people.";

test("submitting is fully interactive and never touches the network", async ({
  page,
}) => {
  const apiCalls: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/issues")) {
      apiCalls.push(`${request.method()} ${request.url()}`);
    }
  });

  await page.goto("/report");

  // Expectations are set before the form, not only after it.
  await expect(page.getByText("This form is a demonstration")).toBeVisible();

  await page.getByLabel("What is the issue?").fill("Dryers take payment and stall");
  await page.getByLabel("What is happening?").fill(DESCRIPTION);
  await page.getByLabel("Category").selectOption("residential-life");
  await page.getByLabel("Where on campus?").fill("Bryan, 3rd floor laundry");
  await page.getByLabel(/Submit anonymously/).check();
  await page.getByLabel(/I understand that SG officers/).check();
  await page
    .getByRole("button", { name: /Submit to Student Government/ })
    .click();

  await expect(
    page.getByRole("heading", { name: "That is what submitting looks like." }),
  ).toBeVisible({ timeout: 15_000 });

  // The confirmation has to say plainly that nothing was sent.
  await expect(page.getByText(/Nothing was sent/)).toBeVisible();

  expect(apiCalls, "a demo must not call the submission API").toEqual([]);
});

test("validation still runs for real", async ({ page }) => {
  await page.goto("/report");
  await page
    .getByRole("button", { name: /Submit to Student Government/ })
    .click();

  await expect(
    page.getByText("Give the issue a title of at least 8 characters."),
  ).toBeVisible();
  await expect(
    page.getByText("You need to acknowledge how submissions are handled."),
  ).toBeVisible();
});

test("a demo submission appears on the status board and can be cleared", async ({
  page,
}) => {
  await page.goto("/report");
  await page.getByLabel("What is the issue?").fill("Bike racks by the gym are bent");
  await page.getByLabel("What is happening?").fill(DESCRIPTION);
  await page.getByLabel("Category").selectOption("student-life");
  await page.getByLabel(/Submit anonymously/).check();
  await page.getByLabel(/I understand that SG officers/).check();
  await page
    .getByRole("button", { name: /Submit to Student Government/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "That is what submitting looks like." }),
  ).toBeVisible({ timeout: 15_000 });

  await page.goto("/updates");
  await expect(
    page.getByRole("heading", { name: "Bike racks by the gym are bent" }),
  ).toBeVisible();

  // The board explains why this would not be public in the real thing.
  await expect(page.getByText("Only you can see this.")).toBeVisible();

  await page.getByRole("button", { name: "Clear" }).click();
  await expect(
    page.getByRole("heading", { name: "Bike racks by the gym are bent" }),
  ).toHaveCount(0);
});

test("the API refuses submissions even when called directly", async ({
  request,
}) => {
  const response = await request.post("/api/issues", {
    data: {
      title: "Dryers take payment and stall",
      description: DESCRIPTION,
      category: "residential-life",
      anonymous: true,
      consent: true,
      website: "",
      elapsedMs: 9000,
    },
  });

  expect(response.status()).toBe(503);
  const body = await response.json();
  expect(body.error).toBe("not_accepting");
  expect(body.message).toMatch(/nothing was stored/i);
});

test("nothing a visitor submits reaches the editor", async ({ page }) => {
  await page.goto("/admin");
  await page.getByLabel("Editor password").fill("e2e-editor-password-1234");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(
    page.getByRole("navigation", { name: "Editor sections" }),
  ).toBeVisible({ timeout: 15_000 });

  await expect(page.getByText("No submissions yet.")).toBeVisible();
});

test("every page carries the demo marker", async ({ page }) => {
  for (const path of ["/", "/resources", "/opportunities", "/report", "/updates", "/sg"]) {
    await page.goto(path);
    await expect(
      page.getByText(/Nothing you submit is sent, stored, or seen by anyone/),
      `${path} demo marker`,
    ).toBeVisible();
  }
});

test("the SG page makes the case rather than listing officers", async ({
  page,
}) => {
  await page.goto("/sg");

  await expect(
    page.getByRole("heading", { name: /Finding it is the problem/ }),
  ).toBeVisible();
  await expect(page.getByText("What is already built")).toBeVisible();

  // No claim to hold the office.
  await expect(page.getByText("Elected by hall")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Senate" })).toHaveCount(0);
});

test("the board labels its example entries", async ({ page }) => {
  await page.goto("/updates");
  await expect(page.getByText("These entries are examples")).toBeVisible();
});
