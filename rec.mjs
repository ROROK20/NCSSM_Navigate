import { chromium } from "@playwright/test";

const B = "https://ncssm-navigate.vercel.app";
const OUT = process.argv[2];

const b = await chromium.launch();
const ctx = await b.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  recordVideo: { dir: OUT, size: { width: 390, height: 844 } },
});

/* A visible tap marker. Screen recordings have no cursor, so without this a
   viewer cannot tell the difference between the app reacting and a jump cut. */
await ctx.addInitScript(() => {
  document.addEventListener(
    "pointerdown",
    (e) => {
      const d = document.createElement("div");
      d.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;
        width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:999px;
        background:rgba(122,183,241,.55);border:2px solid rgba(122,183,241,.95);
        pointer-events:none;z-index:99999;transform:scale(.4);opacity:1;
        transition:transform .45s cubic-bezier(.22,1,.36,1),opacity .45s linear`;
      document.body.appendChild(d);
      requestAnimationFrame(() => {
        d.style.transform = "scale(3.4)";
        d.style.opacity = "0";
      });
      setTimeout(() => d.remove(), 500);
    },
    true,
  );
});

const p = await ctx.newPage();
const wait = (ms) => p.waitForTimeout(ms);

// --- load and settle -------------------------------------------------------
await p.goto(B + "/", { waitUntil: "networkidle" });
await wait(1200); // trimmed off the front later

// --- beat 1: search -------------------------------------------------------
await wait(900);                                        // board on screen
await p.getByRole("button", { name: "broken dryer" }).tap();
await p.waitForURL(/q=broken\+dryer|q=broken%20dryer/);
await p.getByRole("link", { name: /Maintenance|maintenance/ })
  .first()
  .waitFor({ state: "visible", timeout: 15000 });
await wait(1800);                                       // read the result
await p.mouse.wheel(0, 240);
await wait(1200);

// --- beat 2: the tracker --------------------------------------------------
await p.goto(B + "/updates", { waitUntil: "networkidle" });
await p.getByText(/issues tracked/).waitFor({ state: "visible", timeout: 15000 });
await p.mouse.wheel(0, 620);                            // down to the strip
await wait(1700);                                       // stage counts read
await p.mouse.wheel(0, 420);                            // into the rows
await wait(1700);
await p.mouse.wheel(0, 380);                            // progression tracks
await wait(1800);

await ctx.close();
await b.close();
console.log("recorded");
