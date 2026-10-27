// THE 20 USER JOURNEYS, driven through the real UI in a real browser, in order.
// Each test builds on the previous one's saved data (one shared throwaway database).
import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { getTopic } from "../packages/content/atlas/index";

config({ path: ".env" });
const db = new PrismaClient({ datasourceUrl: (process.env.DATABASE_URL ?? "").replace(/schema=[^&]+/, "schema=hexhammer_e2e") });
const TOPIC = getTopic("cs-binary-encoding")!; // no prerequisites, so it is open from the start
const SHOTS = "docs/screenshots/e2e";

test.describe.configure({ mode: "serial" });
test.afterAll(() => db.$disconnect());

async function toast(page: Page, text: RegExp | string) {
  await expect(page.locator(".toasts").getByText(text).first()).toBeVisible();
}

test("1. launch: Mission Control answers where am I and what next", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Next:");
  await expect(page.getByRole("link", { name: "Start this mission" })).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/01-mission-control.png` });
});

test("2 + 19. navigate to a domain with the keyboard only", async ({ page }) => {
  await page.goto("/map");
  // The skip link is the first stop and jumps to the main content.
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  // Tab to the first region hexagon and open it with Enter.
  const firstRegion = page.locator(".world__map").getByRole("link", { name: /^1\. Computer Science/ });
  await firstRegion.focus();
  await expect(firstRegion).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/map\/cs$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Computer Science & Programming Fundamentals");
  await page.screenshot({ path: `${SHOTS}/02-region.png` });
});

test("3. open a lesson and read it (XP once)", async ({ page }) => {
  await page.goto(`/topic/${TOPIC.id}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(TOPIC.title);
  await page.getByRole("button", { name: "Show all" }).click();
  await toast(page, "+10 XP");
  await expect(page.getByText(/All sections read/)).toBeVisible();
});

test("4. complete an interactive exercise (predict the output)", async ({ page }) => {
  await page.goto(`/topic/${TOPIC.id}#exercises`);
  const ex = TOPIC.exercises.find((e) => e.kind === "predict");
  if (!ex || ex.kind !== "predict") throw new Error("fixture topic has no predict exercise");
  const card = page.locator("fieldset.choice").filter({ hasText: "Predict the output" });
  // Pick a wrong answer first: it explains and lets me retry, with no penalty.
  const wrong = (ex.question.answerIndex + 1) % ex.question.choices.length;
  await card.getByLabel(ex.question.choices[wrong], { exact: true }).check();
  await card.getByRole("button", { name: "Check my answer" }).click();
  await expect(card.getByText(/Not quite/)).toBeVisible();
  await card.getByRole("button", { name: "Try again" }).click();
  await card.getByLabel(ex.question.choices[ex.question.answerIndex], { exact: true }).check();
  await card.getByRole("button", { name: "Check my answer" }).click();
  await expect(card.getByText("✓ Right.")).toBeVisible();
  await toast(page, "+20 XP");
});

test("5 + 6. submit the assessment and review the explanations", async ({ page }) => {
  await page.goto(`/topic/${TOPIC.id}#assessment`);
  const form = page.locator("form.assessment");
  for (const q of TOPIC.assessment!.questions) {
    const set = form.locator("fieldset").filter({ hasText: q.prompt.slice(0, 30) });
    await set.getByLabel(q.choices[q.answerIndex], { exact: true }).check();
  }
  await form.getByRole("button", { name: "Submit assessment" }).click();
  await expect(page.getByText(/Passed/).first()).toBeVisible();
  await expect(page.getByText(TOPIC.assessment!.questions[0].explanation.slice(0, 40))).toBeVisible();
  await toast(page, /Achievement unlocked: Proved it/);
  await page.screenshot({ path: `${SHOTS}/05-assessment.png` });
});

test("7. reload: progress persisted (assessed, not mastered)", async ({ page }) => {
  await page.goto(`/topic/${TOPIC.id}`);
  await page.reload();
  await expect(page.locator(".studio__head .eyebrow")).toContainText("Assessment passed");
  await expect(page.getByText(/Pass 2 spaced reviews after the assessment/)).toBeVisible();
});

test("8-11. add a project with a GitHub URL, edit it, see it in the portfolio, finish a milestone", async ({ page }) => {
  await page.goto(`/projects/new?topic=${TOPIC.id}`);
  await expect(page.getByLabel("Title")).toHaveValue(TOPIC.project!.title);
  await page.getByLabel("GitHub repository").fill("https://gitlab.com/me/nope");
  await page.getByRole("button", { name: "Create project" }).click();
  await expect(page.getByText(/Use a GitHub repository address/)).toBeVisible(); // validation shown next to the field
  await page.getByLabel("GitHub repository").fill("https://github.com/learner/byte-inspector");
  await page.getByRole("button", { name: "Create project" }).click();
  await toast(page, /Achievement unlocked: Builder/);
  await expect(page).toHaveURL(/\/projects\/\d+$/);

  await page.getByLabel("Demo URL").fill("https://learner.example.com/bytes");
  await page.getByLabel("Status").selectOption("in_progress");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();

  const firstMilestone = page.locator(".milestone-list input[type=checkbox]").first();
  await firstMilestone.check();
  await toast(page, "+25 XP");

  await page.goto("/portfolio");
  await expect(page.getByRole("link", { name: TOPIC.project!.title })).toBeVisible();
  await expect(page.getByRole("link", { name: "Repository ↗" })).toHaveAttribute("href", "https://github.com/learner/byte-inspector");
  await page.screenshot({ path: `${SHOTS}/10-portfolio.png` });
});

test("12. open and finish a review mission", async ({ page }) => {
  // Time travel: make the review due now (it was scheduled for tomorrow).
  await db.reviewItem.updateMany({ where: { refId: TOPIC.id }, data: { dueAt: new Date(Date.now() - 60_000) } });
  await page.goto("/reviews");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Today's review mission");
  const pool = [...TOPIC.knowledgeChecks, ...TOPIC.assessment!.questions];
  const sets = page.locator(".review-card fieldset.choice");
  const count = await sets.count();
  for (let i = 0; i < count; i++) {
    const set = sets.nth(i);
    const text = (await set.locator(".choice__prompt").innerText()).trim();
    const q = pool.find((p) => text.startsWith(p.prompt.slice(0, 25)))!;
    await set.getByLabel(q.choices[q.answerIndex], { exact: true }).check();
  }
  await page.getByLabel("Fairly sure").check();
  await page.getByRole("button", { name: "Check my review" }).click();
  await expect(page.getByText(/Next review in/)).toBeVisible();
});

test("13. answer an interview question before seeing the model answer", async ({ page }) => {
  const q = TOPIC.interviewQuestions[0];
  await page.goto(`/interview?topic=${TOPIC.id}`);
  await page.getByRole("button", { name: new RegExp(q.prompt.slice(0, 30).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) }).click();
  await expect(page.getByText(q.modelAnswer.slice(0, 40))).toHaveCount(0); // not revealed yet
  await page.getByRole("textbox").fill("Unicode assigns numbers to characters; UTF-8 stores those numbers as 1 to 4 bytes.");
  await page.getByRole("button", { name: "Commit my answer and reveal" }).click();
  await expect(page.getByText(q.modelAnswer.slice(0, 40))).toBeVisible();
  await page.getByRole("button", { name: /^Partly/ }).click();
  await expect(page.getByText(/Saved\. You'll see this again/)).toBeVisible();
});

test("14-18. radar: discover from a fixture, deduplicate, propose, approve, version history, progress intact", async ({ page }) => {
  await page.goto("/radar");
  const row = page.getByRole("row", { name: /Test fixture: Fixture Framework releases/ });
  await row.getByRole("button", { name: "Check now" }).click();
  await expect(row.getByText("3 new, 0 already known")).toBeVisible();
  await row.getByRole("button", { name: "Check now" }).click();
  await expect(row.getByText("0 new, 3 already known")).toBeVisible(); // deduplicated

  await page.getByRole("button", { name: "New", exact: true }).click();
  await page.getByRole("link", { name: "Fixture Framework v3.0.0" }).click();
  // The summary says "Breaking change … removed", so that rule fires (before the version rule).
  await expect(page.getByText(/mentions breaking changes, removals/)).toBeVisible();
  await expect(page.getByText(/not stated by the source|Oct/).first()).toBeVisible();
  await page.getByLabel("Topic").selectOption("fe-event-loop");
  await page.getByRole("button", { name: "Create proposal draft" }).click();
  await expect(page).toHaveURL(/\/radar\/proposals\/\d+$/);
  await expect(page.getByText(/must be written before approval/).first()).toBeVisible();

  await page.getByLabel("2. Why did it change?").fill("The release notes say the legacy hook was removed to simplify the async API.");
  await page.getByLabel("3. What was true before?").fill("Middleware used onNext() hooks.");
  await page.getByLabel("4. What is true now?").fill("Only the async pipeline API exists.");
  await page.getByLabel("8. A debugging or migration exercise").fill("Migrate one handler from onNext() to the pipeline API and keep its tests green.");
  await page.getByRole("button", { name: "Approve and publish…" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Approve and publish" }).click();
  await expect(page.getByText(/Published as version 2/).first()).toBeVisible();

  await page.goto("/topic/fe-event-loop#changes");
  await expect(page.getByRole("heading", { name: "What changed" })).toBeVisible();
  await expect(page.getByText("Version 1 → 2", { exact: false })).toBeVisible();
  await expect(page.getByText("Only the async pipeline API exists.")).toBeVisible();

  // 18: earlier progress on another topic is untouched.
  await page.goto(`/topic/${TOPIC.id}`);
  await expect(page.locator(".studio__head .eyebrow")).toContainText("Assessment passed");
});

test("20. representative layouts on desktop and phone, and automated accessibility checks", async ({ page }) => {
  for (const path of ["/", "/map", `/topic/${TOPIC.id}`, "/interview", "/projects", "/radar", "/analytics", "/glossary"]) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const name = path === "/" ? "home" : path.slice(1).replace(/\//g, "-");
    await page.screenshot({ path: `${SHOTS}/desktop-${name}.png` });
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${path}: ${v.id} (${v.nodes.length})`)).toEqual([]);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${SHOTS}/mobile-${name}.png` });
    // No horizontal scrolling on a phone.
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${path} scrolls sideways on a phone`).toBeLessThanOrEqual(1);
  }
});
