import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";

const require = createRequire(import.meta.url);

const [url, widthText = "390", heightText = "844", screenshotPath] = process.argv.slice(2);
if (!url) throw new Error("Usage: node browser-audit.mjs <url> [width] [height] [screenshot-path]");
const endpoint = process.env.CDP_ENDPOINT || "http://127.0.0.1:9224";
const pages = await (await fetch(`${endpoint}/json`)).json();
const page = pages.find((item) => item.type === "page");
if (!page) throw new Error("No Chrome page target is available");

const socket = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
let callId = 0;
socket.onmessage = (event) => {
  const message = JSON.parse(String(event.data));
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
};
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++callId;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});

const width = Number(widthText);
const height = Number(heightText);
await call("Page.enable");
await call("Runtime.enable");
await call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
await call("Page.navigate", { url });
await new Promise((resolve) => setTimeout(resolve, 2500));
if (process.env.AHD_AUDIT_ADMIN_EMAIL && process.env.AHD_AUDIT_ADMIN_PASSWORD) {
  await call("Runtime.evaluate", { expression: `(() => {
    const setValue = (selector, value) => { const input = document.querySelector(selector); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })); };
    setValue('[data-testid="admin-email"]', ${JSON.stringify(process.env.AHD_AUDIT_ADMIN_EMAIL)});
    setValue('[data-testid="admin-password"]', ${JSON.stringify(process.env.AHD_AUDIT_ADMIN_PASSWORD)});
    document.querySelector('[data-testid="admin-login"]').click();
  })()` });
  await new Promise((resolve) => setTimeout(resolve, 4500));
}
const expression = `(() => {
  const visible = (element) => { const style = getComputedStyle(element); const rect = element.getBoundingClientRect(); return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0; };
  const controls = [...document.querySelectorAll('button,a,input,select,textarea')].filter(visible);
  const accessibleName = (element) => element.getAttribute('aria-label') || element.getAttribute('title') || (element.labels && [...element.labels].map(label => label.innerText).join(' ')) || element.innerText || '';
  const viewportWidth = document.documentElement.clientWidth;
  const overflow = [...document.querySelectorAll('body *')].filter(visible).flatMap(element => { const rect = element.getBoundingClientRect(); return rect.left < -1 || rect.right > viewportWidth + 1 ? [{ tag: element.tagName, testId: element.getAttribute('data-testid'), className: String(element.className).slice(0, 120), left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) }] : []; }).slice(0, 25);
  return {
    url: location.href,
    title: document.title,
    lang: document.documentElement.lang,
    dir: document.documentElement.dir,
    viewport: { innerWidth, innerHeight, htmlClientWidth: document.documentElement.clientWidth, htmlScrollWidth: document.documentElement.scrollWidth, bodyScrollWidth: document.body.scrollWidth },
    h1Count: document.querySelectorAll('h1').length,
    unnamedControls: controls.filter(element => !accessibleName(element).trim()).map(element => element.outerHTML.slice(0, 180)),
    unlabeledFields: controls.filter(element => /^(INPUT|SELECT|TEXTAREA)$/.test(element.tagName) && element.type !== 'hidden' && !(element.labels && element.labels.length) && !element.getAttribute('aria-label')).map(element => element.outerHTML.slice(0, 180)),
    imagesWithoutAlt: [...document.querySelectorAll('img')].filter(image => !image.hasAttribute('alt')).map(image => image.outerHTML.slice(0, 180)),
    duplicateIds: [...document.querySelectorAll('[id]')].map(element => element.id).filter((id, index, ids) => ids.indexOf(id) !== index),
    overflow,
  };
})()`;
const result = await call("Runtime.evaluate", { expression, returnByValue: true });
const axeSource = await readFile(require.resolve("axe-core/axe.min.js"), "utf8");
await call("Runtime.evaluate", { expression: axeSource });
const axe = await call("Runtime.evaluate", {
  expression: `axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } }).then(result => ({
    violations: result.violations.map(item => ({ id: item.id, impact: item.impact, targets: item.nodes.map(node => node.target) })),
    incomplete: result.incomplete.map(item => ({ id: item.id, impact: item.impact, targets: item.nodes.map(node => node.target) })),
  }))`,
  awaitPromise: true,
  returnByValue: true,
});
if (screenshotPath) {
  const screenshot = await call("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
  await writeFile(screenshotPath, Buffer.from(screenshot.data, "base64"));
}
console.log(JSON.stringify({ ...result.result.value, axeViolations: axe.result.value.violations, axeIncomplete: axe.result.value.incomplete }));
socket.close();
