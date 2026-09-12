import { chromium } from "@playwright/test";
const OUT = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
await p.goto("file://" + OUT + "/slides.html", { waitUntil: "networkidle" });
await p.waitForTimeout(1200); // fonts
for (const id of ["s1", "s2", "s3", "s4", "s5"]) {
  await p.locator("#" + id).screenshot({ path: `${OUT}/slide-${id.slice(1)}.png` });
}
await b.close();
console.log("slides rendered");
