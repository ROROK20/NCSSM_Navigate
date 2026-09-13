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
    "/academic-help",
    "/discounts",
    "/amenities",
    "/clubs",
    "/opportunities",
    "/report",
    "/updates",
    "/transparency",
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
  await expect(page.getByText("NCSSM login").first()).toBeVisible();
});

test("opportunities are real programmes, filterable, with honest dates", async ({
  page,
}) => {
  const errors = watchConsole(page);
  await page.goto("/opportunities");

  await expect(
    page.getByText("Check with the organiser before you commit"),
  ).toBeVisible();

  // Real organisations, not invented listings.
  await expect(
    page.getByRole("heading", { name: /Duke Research in Engineering/ }),
  ).toBeVisible();

  await page.getByRole("button", { name: /^Volunteering/ }).click();
  await expect(
    page.getByRole("heading", { name: /^Food Bank of Central/ }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "HackDuke" })).toHaveCount(0);

  // Nothing claims a date that was never confirmed.
  await expect(page.getByText("Ongoing").first()).toBeVisible();

  expect(errors).toEqual([]);
});

test("the academic help finder groups routes by subject", async ({ page }) => {
  const errors = watchConsole(page);
  await page.goto("/academic-help");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Academic help",
  );

  // Browsing is grouped by subject, so being stuck in one subject is one tap.
  await expect(page.getByRole("heading", { name: /^Math/ })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /^Computer science/ }),
  ).toBeVisible();

  const results = page.locator('section[aria-label="Results"]');

  // The chips are the same demonstration the homepage makes: a whole sentence
  // that only resolves because of an aliases field.
  await page.getByRole("button", { name: "stuck in math" }).click();
  await expect(results.locator("li").first()).toContainText("math TA");

  const search = page.getByRole("searchbox", { name: /Search by subject/i });

  // A subject with no route of its own still has to reach the general one,
  // because peer tutoring and a teacher's own office hours do cover it.
  await search.fill("chemistry");
  await expect(results.locator("li").first()).toContainText(
    "Durham academic assistance",
  );

  // This page adds no destinations. Every row is an existing resource, opened
  // on its own site.
  const first = results.locator("li").first().getByRole("link").first();
  await expect(first).toHaveAttribute("rel", /noopener/);
  await expect(first).toHaveAttribute("rel", /noreferrer/);

  expect(errors).toEqual([]);
});

test("student discounts name the place without inventing the deal", async ({
  page,
}) => {
  const errors = watchConsole(page);
  await page.goto("/discounts");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Student discounts",
  );
  await expect(
    page.getByText("Nobody has confirmed what these discounts are"),
  ).toBeVisible();

  // Every row says the terms are unknown rather than showing a number. This is
  // the assertion that stops someone helpfully filling in a percentage.
  await expect(page.getByText("Terms not confirmed yet")).toHaveCount(7);
  const body = await page.locator("main").innerText();
  expect(body, "no page may claim a percentage off").not.toMatch(
    /\d+\s?%\s?(off|discount)/i,
  );

  // Tapping a name opens Google Maps: keyless URL, business plus city, and the
  // address, hours and phone stay Google's problem rather than this repo's.
  const link = page.getByRole("link", { name: "Quickly Tea House" });
  await expect(link).toHaveAttribute(
    "href",
    "https://www.google.com/maps/search/?api=1&query=Quickly%20Tea%20House%20Durham%20NC",
  );
  await expect(link).toHaveAttribute("rel", /noopener/);
  await expect(link).toHaveAttribute("rel", /noreferrer/);

  // Four of the seven have a page of their own. The other three correctly have
  // none: a directory listing is not the business's own site.
  const sites = page.getByRole("link", { name: /Their own site/ });
  await expect(sites).toHaveCount(4);
  await expect(sites.first()).toHaveAttribute("rel", /noopener/);
  await expect(sites.first()).toHaveAttribute("rel", /noreferrer/);

  // What each place sells is the one confirmed fact, so it is searchable.
  const search = page.getByRole("searchbox", { name: /Search by name/i });
  await search.fill("boba");
  await expect(page.getByRole("link", { name: "Quickly Tea House" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Chicken Bee" })).toHaveCount(0);

  await search.fill("");
  await page.getByRole("button", { name: /^Mexican/ }).click();
  await expect(page.getByText("2 places match your search")).toBeVisible();

  expect(errors).toEqual([]);
});

test("the amenity finder says nothing rather than guessing a location", async ({
  page,
}) => {
  const errors = watchConsole(page);
  await page.goto("/amenities");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Amenities");
  await expect(page.getByText("Nothing has been logged yet")).toBeVisible();

  // No controls over an empty set. A search that can only fail is theatre.
  await expect(page.getByRole("searchbox")).toHaveCount(0);

  // The failure this page exists to avoid: a room number nobody stood in front
  // of. Until somebody walks the buildings, there are none to print.
  const body = await page.locator("main").innerText();
  expect(body, "no invented room numbers").not.toMatch(/\b(room|rm\.?)\s*\d/i);
  expect(body, "no invented floors").not.toMatch(/\b\d(st|nd|rd|th)\s+floor\b/i);

  await expect(
    page.getByRole("link", { name: /Tell SG where one is/ }),
  ).toBeVisible();

  expect(errors).toEqual([]);
});

test("the club directory is a scaffold, not a list of invented clubs", async ({
  page,
}) => {
  const errors = watchConsole(page);
  await page.goto("/clubs");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Clubs");
  await expect(page.getByText("No clubs listed yet")).toBeVisible();

  // No club rows, and therefore no meeting time, room, or contact address that
  // nobody has confirmed.
  await expect(page.getByRole("heading", { level: 3 })).toHaveCount(0);
  await expect(page.locator('a[href^="mailto:"]').first()).toHaveAttribute(
    "href",
    /sg@ncssm\.edu/,
  );

  // While it is empty it sends students to the school's own clubs page rather
  // than to a dead end.
  await page.getByRole("link", { name: /clubs page/i }).click();
  await expect(page).toHaveURL(/\/resources\?q=clubs/);

  expect(errors).toEqual([]);
});

test("SG updates board shows statuses and never leaks submission details", async ({
  page,
}) => {
  await page.goto("/updates");

  // The demo-stage example notice is asserted in demo.spec.ts.
  await expect(
    page.getByText(/Individual submissions are never published/),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Laundry machines out of service in residence halls",
    }),
  ).toBeVisible();

  // Filtering by a closed stage leaves only closed issues on the board.
  await page.getByRole("button", { name: /Resolved/ }).first().click();
  await expect(
    page.getByRole("heading", { name: "Library study rooms double-booked" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "More quiet study space in the evenings" }),
  ).toHaveCount(0);
});

test("the transparency feed labels its examples as examples", async ({
  page,
}) => {
  const errors = watchConsole(page);
  await page.goto("/transparency");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "SG transparency",
  );

  // Every shipped row is an illustration, and says so on the row rather than
  // only in a notice somebody may have scrolled past. A fabricated meeting on
  // a transparency page is the worst thing this site could publish.
  await expect(page.getByText("Every entry below is an example")).toBeVisible();
  const rows = page.locator("ul > li").filter({ hasText: "Example entry" });
  await expect(rows).toHaveCount(3);

  // It is a different board from the issue tracker, and each names the other.
  await expect(page.getByRole("link", { name: "issue tracker" })).toBeVisible();
  await page.goto("/updates");
  await page.getByRole("link", { name: "SG transparency" }).first().click();
  await expect(page).toHaveURL(/\/transparency$/);

  // Proposals carry a stage, and passing Senate is not the same as adopted.
  await expect(page.getByText("Before Senate").first()).toBeVisible();
  await expect(page.getByText("Nothing has changed yet")).toBeVisible();

  // Filtering by kind leaves only that kind on the board.
  await page.getByRole("button", { name: /^Policy proposal/ }).click();
  await expect(page.getByText("1 entry matches your filters")).toBeVisible();

  expect(errors).toEqual([]);
});

/**
 * The demo/working distinction.
 *
 * This site is a candidate's proposal, so the difference between a page that
 * works today and one that needs the office is the whole argument. It is also
 * the easiest thing to quietly overclaim, which is why it is asserted rather
 * than trusted: one table feeds the homepage, the pages, and the proposal
 * list, and this test reads all three.
 */
test("every surface says whether it works today or is a demo", async ({
  page,
}) => {
  const errors = watchConsole(page);

  await page.goto("/");
  const actions = page.getByRole("list").filter({ hasText: "Find a resource" });
  await expect(
    actions.getByRole("listitem").filter({ hasText: "Find a resource" }),
  ).toContainText("Working now");
  await expect(
    actions.getByRole("listitem").filter({ hasText: "Report an issue" }),
  ).toContainText("Demo only");
  await expect(
    actions.getByRole("listitem").filter({ hasText: "View SG updates" }),
  ).toContainText("Demo only");

  // The pages themselves carry the same label as the homepage promised.
  for (const [path, label] of [
    ["/resources", "Working now"],
    ["/academic-help", "Working now"],
    ["/discounts", "Working now"],
    ["/amenities", "Needs data"],
    ["/clubs", "Needs data"],
    ["/transparency", "Examples only"],
    ["/report", "Demo only"],
    ["/updates", "Demo only"],
  ] as const) {
    await page.goto(path);
    // Scoped to the page header inside <main>: the site's sticky nav is also
    // a <header>, and it is the one .first() finds.
    await expect(
      page.locator("main header").first(),
      `${path} readiness tag`,
    ).toContainText(label);
  }

  // The proposal page explains what the four tags mean, so a reader who only
  // sees a pill somewhere else can find out what it claims.
  await page.goto("/sg");
  await expect(page.getByText("What the tags mean")).toBeVisible();
  for (const label of [
    "Working now",
    "Needs data",
    "Examples only",
    "Demo only",
  ]) {
    await expect(page.getByText(label).first()).toBeVisible();
  }

  expect(errors).toEqual([]);
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
  // Hours live on the row, so the question about hours has to reach the row.
  ["when does the dining hall close", "Dining hall menus & hours"],
  ["is breakfast still open", "Dining hall menus & hours"],
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
