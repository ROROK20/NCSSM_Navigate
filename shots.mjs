import { chromium } from "@playwright/test";
const B = "https://ncssm-navigate.vercel.app";
const OUT = process.argv[2];
const b = await chromium.launch();

async function shot(name, path, scheme, prep) {
  const c = await b.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    colorScheme: scheme,
  });
  const p = await c.newPage();
  // networkidle on a live site is flaky; wait for the DOM and then for the
  // element each shot actually needs.
  for (let attempt = 1; ; attempt++) {
    try {
      await p.goto(B + path, { waitUntil: "domcontentloaded", timeout: 45000 });
      break;
    } catch (e) {
      if (attempt >= 3) throw e;
      await p.waitForTimeout(1500);
    }
  }
  await p.waitForLoadState("load").catch(() => {});
  await p.waitForTimeout(900);
  if (prep) await prep(p);
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${OUT}/${name}.png` });
  await c.close();
}

// 1 — homepage, dark, the board
await shot("s-home-dark", "/", "dark");

// 2 — the search result
await shot("s-search", "/resources?q=broken+dryer", "dark", async (p) => {
  await p.getByRole("link", { name: /maintenance/i }).first().waitFor();
  await p.mouse.wheel(0, 330);
});

// 3 — the tracker with the stage strip
await shot("s-tracker", "/updates", "dark", async (p) => {
  await p.getByText(/issues tracked/).waitFor();
  await p.mouse.wheel(0, 560);
});

// 4a — opportunities
await shot("s-opps", "/opportunities", "dark", async (p) => {
  // Entries sort alphabetically, so the top of the list is not the strongest
  // view. Searching shows the programmes a reader recognises.
  await p.getByRole("searchbox", { name: /Search opportunities/i }).fill("duke");
  await p.waitForTimeout(400);
  await p.mouse.wheel(0, 330);
});

// 4b — the report form
await shot("s-report", "/report", "dark", async (p) => {
  await p.getByLabel("What is the issue?").waitFor();
  await p.getByLabel("What is the issue?").fill("Dryers on 3rd take payment without running");
  await p.getByLabel(/Submit anonymously/).check();
  await p.mouse.wheel(0, 560);
});

await b.close();
console.log("shots done");
