import { expect, test } from "@playwright/test";

/**
 * The issue submission flow, including the parts that must fail.
 *
 * The privacy assertions here are the point of the file: a regression that
 * starts publishing submissions would be caught by the last test.
 */

const DESCRIPTION =
  "Three of the dryers on the hall take payment but never start a cycle. It has happened every evening this week to several people.";

test("validation errors appear inline before anything is sent", async ({
  page,
}) => {
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
  await expect(
    page.getByRole("alert").filter({ hasText: "Check the highlighted fields" }),
  ).toBeVisible();
});

test("a named submission requires a contact route", async ({ page }) => {
  await page.goto("/report");

  await page.getByLabel("What is the issue?").fill("Dryers take payment and stall");
  await page.getByLabel("What is happening?").fill(DESCRIPTION);
  await page.getByLabel("Category").selectOption("residential-life");
  await page.getByLabel(/I understand that SG officers/).check();

  await page
    .getByRole("button", { name: /Submit to Student Government/ })
    .click();

  await expect(
    page.getByText("Add an email, or tick the anonymous box"),
  ).toBeVisible();
});

test("an anonymous submission succeeds and confirms what happens next", async ({
  page,
}) => {
  await page.goto("/report");

  await page.getByLabel("What is the issue?").fill("Dryers take payment and stall");
  await page.getByLabel("What is happening?").fill(DESCRIPTION);
  await page.getByLabel("Category").selectOption("residential-life");
  await page.getByLabel("Where on campus?").fill("Bryan, 3rd floor laundry");
  await page.getByLabel(/Submit anonymously/).check();

  // The API rejects implausibly fast posts. A real student cannot fill this
  // form in under a second either, so wait before submitting.
  await page.waitForTimeout(1500);

  // Hiding the contact field is the visible consequence of going anonymous.
  await expect(page.getByLabel("How can SG reach you?")).toHaveCount(0);

  await page.getByLabel(/I understand that SG officers/).check();
  await page
    .getByRole("button", { name: /Submit to Student Government/ })
    .click();

  await expect(
    page.getByRole("heading", {
      name: "Student Government has your submission.",
    }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/cannot promise to resolve every issue/)).toBeVisible();
});

test("the API never serves submissions and rejects bot-shaped posts", async ({
  request,
}) => {
  const readBack = await request.get("/api/issues");
  expect(readBack.status()).toBe(405);

  const honeypot = await request.post("/api/issues", {
    data: {
      title: "Dryers take payment and stall",
      description: DESCRIPTION,
      category: "residential-life",
      anonymous: true,
      consent: true,
      website: "http://spam.example",
      elapsedMs: 9000,
    },
  });
  expect(honeypot.status()).toBe(400);
  expect((await honeypot.json()).error).toBe("rejected");

  const tooFast = await request.post("/api/issues", {
    data: {
      title: "Dryers take payment and stall",
      description: DESCRIPTION,
      category: "residential-life",
      anonymous: true,
      consent: true,
      website: "",
      elapsedMs: 40,
    },
  });
  expect(tooFast.status()).toBe(400);
});

test("nothing a student submitted is reachable from a public page", async ({
  page,
  request,
}) => {
  const marker = `canary-${Date.now()}-do-not-publish`;

  const submitted = await request.post("/api/issues", {
    data: {
      title: `Private title ${marker}`,
      description: `${DESCRIPTION} ${marker}`,
      category: "dining",
      contact: `${marker}@ncssm.edu`,
      anonymous: false,
      consent: true,
      website: "",
      elapsedMs: 9000,
    },
  });
  expect(submitted.ok()).toBeTruthy();

  for (const path of ["/", "/resources", "/opportunities", "/updates", "/sg", "/report"]) {
    await page.goto(path);
    const html = await page.content();
    expect(html, `${path} must not contain submission text`).not.toContain(
      marker,
    );
  }

  // The export endpoint carries published content only, and is editor-gated.
  const exported = await request.get("/api/admin/export");
  expect(exported.status()).toBe(401);
});
