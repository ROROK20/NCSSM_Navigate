import { chromium } from "@playwright/test";
const OUT = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
await p.goto("file://" + OUT + "/post.html", { waitUntil: "networkidle" });
await p.waitForTimeout(1200);
await p.locator("#post").screenshot({ path: `${OUT}/post-final.png` });
await b.close();
console.log("post rendered");
