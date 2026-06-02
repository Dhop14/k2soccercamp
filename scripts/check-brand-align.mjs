import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 200 } });
await page.goto("http://localhost:8080/", {
  waitUntil: "networkidle",
  timeout: 8000,
});

const m = await page.evaluate(() => {
  const link =
    document.querySelector('header a[href="/"]') ??
    document.querySelector("header a");
  const spans = [...(link?.querySelectorAll("span") ?? [])];
  const logo = spans.find((el) => el.querySelector("svg"));
  const text = spans.find((el) => el.textContent?.trim() === "Soccer Camp");
  if (!logo || !text) return { error: "elements not found" };
  const lr = logo.getBoundingClientRect();
  const tr = text.getBoundingClientRect();
  return {
    logoCenterY: (lr.top + lr.bottom) / 2,
    textCenterY: (tr.top + tr.bottom) / 2,
    delta: (tr.top + tr.bottom) / 2 - (lr.top + lr.bottom) / 2,
  };
});

console.log(JSON.stringify(m, null, 2));
await browser.close();
