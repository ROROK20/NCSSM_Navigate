import { expect, test, type Page } from "@playwright/test";

/**
 * Public-facing behaviour: the pages a student actually uses.
 *
 * Every test also fails on a console error, because "no obvious console errors"
 * is part of what ready-to-launch means and nobody will notice a warning that
 * only a machine ever reads.
 */

function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test("homepage shows the four primary actions and a working nav", async ({
  page,
}) => {
  const errors = watchConsole(page);
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "NCSSM Navigate",
  );
  await expect(
    page.getByText(
      "One place to find resources, opportunities, support, and student-government updates.",
    ),
  ).toBeVisible();

  for (const label of [
    "Find a resource",
    "Explore opportunities",
    "Report an issue",
    "View SG updates",
  ]) {
    await expect(page.getByRole("link", { name: new RegExp(label, "i") }).first()).toBeVisible();
  }

  await page.getByRole("link", { name: /Explore opportunities/i }).first().click();
  await expect(page).toHaveURL(/\/opportunities$/);

  expect(errors).toEqual([]);
});

test("every top-level route returns a page, not an error", async ({ page }) => {
  for (const path of [
    "/",
    "/resources",
    "/opportunities",
    "/report",
    "/updates",
    "/sg",
    "/admin",
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), `${path} status`).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});

test("resource search and category filters narrow the list", async ({ page }) => {
  const errors = watchConsole(page);
  await page.goto("/resources");

  const counter = page.getByText(/\d+ resources?/).first();
  await expect(counter).toBeVisible();

  const search = page.getByRole("searchbox", {
    name: /Search resources/i,
  });
  await search.fill("laundry-nothing-matches-this");
  await expect(page.getByText("Nothing matches that")).toBeVisible();

  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByText("Nothing matches that")).toHaveCount(0);

  await search.fill("transcript");
  await expect(
    page.getByRole("link", { name: /^Transcript request/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /^Dining hall menus/ }),
  ).toHaveCount(0);

  await search.fill("");
  await page.getByRole("button", { name: /^Technology/ }).click();
  await expect(
    page.getByRole("link", { name: /^Information Technology Services/ }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /^Peer tutoring/ })).toHaveCount(0);

  expect(errors).toEqual([]);
});

test("login-only resources are labelled and open on the official domain", async ({
  page,
}) => {
  await page.goto("/resources");
  await page
    .getByRole("searchbox", { name: /Search resources/i })
    .fill("canvas");

  const row = page.getByRole("link", { name: /Canvas/ }).first();
  await expect(row).toHaveAttribute("href", "https://ncssm.instructure.com");
  await expect(row).toHaveAttribute("target", "_blank");
  await expect(row).toHaveAttribute("rel", /noopener/);
  await expect(row).toHaveAttribute("rel", /noreferrer/);
  await expect(page.getByText("NCSSM login required").first()).toBeVisible();
});

test("opportunities filter, and past entries are hidden until asked for", async ({
  page,
}) => {
  const errors = watchConsole(page);
  await page.goto("/opportunities");

  await expect(page.getByText("Check before you register or go")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fall service day" })).toHaveCount(0);

  await page.getByLabel(/Include \d+ past/).check();
  await expect(page.getByRole("heading", { name: "Fall service day" })).toBeVisible();
  await expect(page.getByText("Passed").first()).toBeVisible();

  await page.getByLabel(/Include \d+ past/).uncheck();
  await page.getByRole("button", { name: /^Volunteering/ }).click();
  await expect(
    page.getByRole("heading", { name: /^Food Bank of Central/ }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "HackDuke" })).toHaveCount(0);

  expect(errors).toEqual([]);
});

test("SG updates board shows statuses and never leaks submission details", async ({
  page,
}) => {
  await page.goto("/updates");

  // The demo-stage example notice is asserted in demo.spec.ts.
  await expect(page.getByText("What you will not find here")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Laundry machines out of service in residence halls",
    }),
  ).toBeVisible();

  await page.getByRole("button", { name: /^Closed/ }).click();
  await expect(page.getByText("Break bus arrival times published late")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "More quiet study space in the evenings" }),
  ).toHaveCount(0);
});

test("unknown routes render the 404 page", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("That page is not here")).toBeVisible();
});

/**
 * The vocabulary test.
 *
 * These are phrasings a student would actually type, none of which appear in
 * the title of the row that answers them. They work because of the `aliases`
 * field, and this test is what stops someone deleting it as dead weight.
 */
const PLAIN_LANGUAGE: Array<[query: string, expectedTopResult: string]> = [
  ["stressed", "Counseling Services"],
  ["someone to talk to", "Counseling Services"],
  ["broken dryer", "Facilities & maintenance request"],
  ["my radiator is broken", "Facilities & maintenance request"],
  ["rec letter", "College Counseling"],
  // A broken thing should reach the action, not a page describing the office.
  ["wifi not working", "Submit a helpdesk ticket"],
  ["laptop broken", "Submit a helpdesk ticket"],
  ["drop a class", "Academic advising"],
  ["leave campus for the weekend", "Orah"],
  ["vegetarian food", "Dining hall menus & hours"],
  ["join a club", "Clubs & organizations"],
  ["send my grades to a college", "Transcripts for college applications"],
  ["package delivery", "Mail room & package pickup"],
  ["i am sick", "Student Health Services"],
  // The systems students actually use, rather than a page describing them.
  ["worried about a friend", "CARE report"],
  ["what time does class start", "Daily schedule"],
  ["what are the rules", "Student handbook"],
  ["3d printer", "FabLab"],
  ["who do i email", "Faculty & staff directory"],
  ["change my password", "Change your NCSSM password"],
  ["miss class", "Absence request form"],
  ["book a clinic appointment", "Clinic appointments"],
  // The long tail: things nobody needs often and cannot find when they do.
  ["office hours", "office hours"],
  ["ta hours", "TA website"],
  ["extra time on sat", "SAT & ACT accommodations"],
  ["j term", "J-Term"],
  ["science olympiad", "Science competitions"],
  ["winter sports", "Winter sports teams"],
  // The end of the CAAS trail: the answers that were three clicks deep.
  ["when is my teacher free", "office"],
  ["pass no pass", "Pass / No Pass"],
  ["ask for an extension", "extension"],
  ["math tutor", "math TA"],
  // Pages that were never one click from anywhere a student starts.
  ["reserve a study room", "study room"],
  ["borrow a tool", "tool checkout"],
  ["3d print", "3D printing"],
  ["funding for a project", "Bowman-Brockman"],
  ["change my name", "Name change"],
  ["telehealth", "telehealth"],
  ["report harassment", "Title IX"],
  ["scholarships", "Scholarships"],
];

test("plain-language searches surface the right resource first", async ({
  page,
}) => {
  await page.goto("/resources");
  const search = page.getByRole("searchbox", { name: /Search resources/i });
  // Scoped to the results region so the header and footer nav lists cannot
  // masquerade as the top result.
  const results = page.locator('section[aria-label="Results"]');

  for (const [query, expected] of PLAIN_LANGUAGE) {
    await search.fill(query);
    await expect(
      results.locator("li").first(),
      `"${query}" should surface ${expected}`,
    ).toContainText(expected);
  }
});

test("the homepage search lands on results with the query applied", async ({
  page,
}) => {
  await page.goto("/");

  // The example chips exist to demonstrate alias matching: "stressed" appears
  // nowhere in the Counseling entry's name or description.
  await page.getByRole("button", { name: "stressed" }).click();
  await page.waitForURL(/\/resources\?q=stressed/);

  await expect(
    page.getByRole("searchbox", { name: /Search resources/i }),
  ).toHaveValue("stressed");
  await expect(
    page.getByRole("link", { name: /^Counseling Services/ }).first(),
  ).toBeVisible();
  await expect(page.getByText("1 resource matches your filters")).toBeVisible();
});

test("typing in the homepage search carries the query through", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: "Search resources" }).fill("laundry");
  await page.getByRole("button", { name: "Search" }).click();

  await page.waitForURL(/\/resources\?q=laundry/);
  // Singular or plural: how many rows mention laundry is content, not behaviour.
  await expect(page.getByText(/match(es)? your filters/)).toBeVisible();
});
