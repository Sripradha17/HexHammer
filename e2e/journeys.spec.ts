// THE USER JOURNEYS, driven through the real UI in a real browser, in order.
// Each test builds on the previous one's saved data (one shared throwaway database).
import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { getTopic } from "../packages/content/atlas/index";

config({ path: ".env" });
const db = new PrismaClient({
  datasourceUrl: (process.env.DATABASE_URL ?? "").replace(
    /schema=[^&]+/,
    "schema=hexhammer_e2e",
  ),
});
const TOPIC = getTopic("cs-binary-encoding")!; // no prerequisites, so it is open from the start
const SHOTS = "docs/screenshots/e2e";

test.describe.configure({ mode: "serial" });
test.afterAll(() => db.$disconnect());

async function toast(page: Page, text: RegExp | string) {
  await expect(page.locator(".toasts").getByText(text).first()).toBeVisible();
}

test("1. launch: Home shows the next mission, one action, and a live scene", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(TOPIC.title);
  await expect(page.getByRole("link", { name: "Enter mission" })).toBeVisible();
  // The encoding scene is real: pick € and see its code point and UTF-8 bytes.
  await page.getByRole("button", { name: "€", exact: true }).click();
  await expect(page.getByText("U+20AC")).toBeVisible();
  await expect(page.getByText("E2 82 AC")).toBeVisible();
  // Classic Levels are gone from the product.
  await expect(page.getByText(/Classic Levels/i)).toHaveCount(0);
  await page.screenshot({ path: `${SHOTS}/01-mission-control.png` });
});

test("2 + 19. navigate the world map with the keyboard only", async ({ page }) => {
  await page.goto("/map");
  // The skip link is the first stop.
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  // A district is a focusable button: select The Web with Enter, then come back to Foundations.
  const web = page.getByRole("button", { name: /^The Web\./ });
  await web.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/map\/web$/);
  await expect(page.getByRole("heading", { level: 2, name: "The Web" })).toBeVisible();
  // A locked district explains why.
  await page.getByRole("button", { name: /^Frontend\./ }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Opens when you pass one assessment/)).toBeVisible();
  await page.getByRole("button", { name: /^Foundations\./ }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/map\/cs$/);
  await page.screenshot({ path: `${SHOTS}/02-region.png` });
  // Enter the next mission straight from the region panel.
  await page.locator(".rpanel").getByRole("link", { name: "Enter mission" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new RegExp(`/topic/${TOPIC.id}`));
});

test("3. Discover: read the briefing card by card (XP once)", async ({ page }) => {
  await page.goto(`/topic/${TOPIC.id}#discover`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(TOPIC.title);
  for (let i = 1; i < TOPIC.lessonSections.length; i++) {
    await page.getByRole("button", { name: "Next card" }).click();
  }
  await toast(page, "+10 XP");
  await expect(page.getByText("Briefing complete")).toBeVisible();
  await page.getByRole("button", { name: "Unlock" }).click();
  await expect(page.locator(".seals li.is-met", { hasText: "Read every lesson section" })).toBeVisible();
});

test("4. Solve: a challenge (predict the output), wrong first then right", async ({ page }) => {
  await page.goto(`/topic/${TOPIC.id}#solve`);
  const n = TOPIC.exercises.findIndex((e) => e.kind === "predict");
  const ex = TOPIC.exercises[n];
  if (!ex || ex.kind !== "predict") throw new Error("fixture topic has no predict exercise");
  await page.getByRole("button", { name: new RegExp(`Challenge ${n + 1}$`) }).click();
  const card = page.locator("fieldset.choice").filter({ hasText: "Predict the output" });
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

test("5 + 6. Prove: the assessment one question at a time, then review the explanations", async ({ page }) => {
  await page.goto(`/topic/${TOPIC.id}#prove`);
  const questions = TOPIC.assessment!.questions;
  for (let i = 0; i < questions.length; i++) {
    const prompt = (await page.locator(".quiz__prompt").innerText()).trim();
    const q = questions.find((x) => prompt.startsWith(x.prompt.replace(/`/g, "").slice(0, 25)))!;
    await page.getByRole("radio", { name: q.choices[q.answerIndex].replace(/`/g, ""), exact: true }).check();
    if (i < questions.length - 1) await page.getByRole("button", { name: "Next question" }).click();
  }
  await page.getByRole("button", { name: /^Submit/ }).click();
  await expect(page.getByText("Proven.")).toBeVisible();
  await toast(page, /Achievement unlocked: Proved it/);
  await page.getByText("Review every answer").click();
  await expect(page.getByText(questions[0].explanation.replace(/`/g, "").slice(0, 40)).first()).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/05-assessment.png` });
});

test("7. reload: progress persisted (proven, not mastered)", async ({ page }) => {
  await page.goto(`/topic/${TOPIC.id}#unlock`);
  await page.reload();
  await expect(page.locator(".path li.is-done", { hasText: "Prove" })).toBeVisible();
  await expect(page.locator(".path li.is-done", { hasText: "Unlock" })).toHaveCount(0);
  await expect(page.getByText(/Pass 2 spaced reviews after the assessment/)).toBeVisible();
});

test("8-11. Workshop: start a build, run the workbench, finish a milestone, edit the blueprint, complete, portfolio", async ({ page }) => {
  await page.goto(`/projects?start=${TOPIC.id}`);
  await page.locator(`#build-${TOPIC.id}`).getByRole("button", { name: "Start build" }).click();
  await expect(page).toHaveURL(/\/projects\/\d+$/);
  await toast(page, "Build bay open");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(TOPIC.project!.title);

  // BUILD: the workbench really runs code (in a Web Worker) and runs tests.
  await page.getByRole("button", { name: "Build", exact: true }).click();
  // The first run can hit the 3-second safety timeout while the dev server compiles the worker.
  await expect(async () => {
    await page.getByRole("button", { name: "Run", exact: true }).click();
    await expect(page.locator(".bench__lines")).toContainText("undefined", { timeout: 4000 });
  }).toPass({ timeout: 30_000 });
  await expect(page.getByText("1 of 1 tests passed")).toBeVisible();
  await page.getByRole("button", { name: "Mark milestone done" }).click();
  await toast(page, "+25 XP");

  // The full blueprint: server validation shows next to the field.
  const url = page.url().split("#")[0];
  await page.goto(`${url}/blueprint`);
  await page.getByLabel("GitHub repository").fill("https://gitlab.com/me/nope");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText(/Use a GitHub repository address/)).toBeVisible();
  await page.getByLabel("GitHub repository").fill("https://github.com/learner/byte-inspector");
  await page.getByLabel("Demo URL").fill("https://learner.example.com/bytes");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();
  await toast(page, /Achievement unlocked: Builder/); // a project with a linked GitHub repository

  // COMPLETE: evidence is required, then the build is done.
  await page.goto(`${url}#complete`);
  await page.getByLabel("Evidence it works (required)").fill("All three milestones checked by hand; the inspector prints the table for café and 🙂.");
  await page.getByRole("button", { name: "Complete build" }).click();
  await expect(page.getByText("It's in your portfolio.")).toBeVisible();

  await page.goto("/portfolio");
  await expect(page.getByRole("link", { name: TOPIC.project!.title })).toBeVisible();
  await expect(page.getByRole("link", { name: "Repository ↗" })).toHaveAttribute("href", "https://github.com/learner/byte-inspector");
  await page.screenshot({ path: `${SHOTS}/10-portfolio.png` });
});

test("12. open and finish a review mission", async ({ page }) => {
  // Time travel: make the review due now (it was scheduled for tomorrow).
  await db.reviewItem.updateMany({
    where: { refId: TOPIC.id },
    data: { dueAt: new Date(Date.now() - 60_000) },
  });
  await page.goto("/reviews");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Today's review mission",
  );
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

test("13. Challenge mode: commit an answer before seeing the model answer", async ({ page }) => {
  const q = TOPIC.interviewQuestions[0];
  await page.goto(`/interview?topic=${TOPIC.id}`);
  await expect(page.getByRole("tab", { name: /This mission/ })).toHaveAttribute("aria-selected", "true");
  // Pick this exact challenge from "Browse all".
  await page.getByText("Browse all challenges").click();
  await page.locator(".browse__list").getByRole("button", { name: new RegExp(q.prompt.slice(0, 30).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) }).click();
  await expect(page.locator("#arena-q")).toContainText(q.prompt.slice(0, 30));
  await expect(page.getByText(q.modelAnswer.slice(0, 40))).toHaveCount(0); // not revealed yet
  await page.locator(".arena__text").fill("Unicode assigns numbers to characters; UTF-8 stores those numbers as 1 to 4 bytes.");
  await page.getByRole("button", { name: "Commit answer" }).click();
  await expect(page.getByText(q.modelAnswer.slice(0, 40))).toBeVisible();
  await page.getByRole("button", { name: /^Partly/ }).click();
  await expect(page.getByText(/Saved\. It comes back/)).toBeVisible();
});

test("14-18. radar: discover from a fixture, deduplicate, propose, approve, version history, progress intact", async ({
  page,
}) => {
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

  await page
    .getByLabel("2. Why did it change?")
    .fill("The release notes say the legacy hook was removed to simplify the async API.");
  await page
    .getByLabel("3. What was true before?")
    .fill("Middleware used onNext() hooks.");
  await page
    .getByLabel("4. What is true now?")
    .fill("Only the async pipeline API exists.");
  await page
    .getByLabel("8. A debugging or migration exercise")
    .fill(
      "Migrate one handler from onNext() to the pipeline API and keep its tests green.",
    );
  await page.getByRole("button", { name: "Approve and publish…" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Approve and publish" })
    .click();
  await expect(page.getByText(/Published as version 2/).first()).toBeVisible();

  await page.goto("/topic/fe-event-loop#unlock");
  await page.getByText("Sources, glossary and version history").click();
  await expect(page.getByText("v1 → v2", { exact: false })).toBeVisible();
  await expect(page.getByText("Only the async pipeline API exists.", { exact: false })).toBeVisible();

  // 18: earlier progress on another topic is untouched.
  await page.goto(`/topic/${TOPIC.id}#unlock`);
  await expect(page.locator(".path li.is-done", { hasText: "Prove" })).toBeVisible();
});

test("20. representative layouts on desktop and phone, and automated accessibility checks", async ({
  page,
}) => {
  for (const path of [
    "/",
    "/map",
    `/topic/${TOPIC.id}`,
    "/interview",
    "/projects",
    "/radar",
    "/progress",
    "/glossary",
  ]) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const name = path === "/" ? "home" : path.slice(1).replace(/\//g, "-");
    await page.screenshot({ path: `${SHOTS}/desktop-${name}.png` });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(
      serious.map(
        (v) =>
          `${path}: ${v.id} ${v.nodes.map((n) => `${n.target.join(", ")}: ${n.failureSummary}`).join("; ")}`,
      ),
    ).toEqual([]);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${SHOTS}/mobile-${name}.png` });
    // No horizontal scrolling on a phone.
    const { overflow, culprits } = await page.evaluate(() => {
      const width = document.documentElement.clientWidth;
      // Elements sticking out past the right edge (ignoring ones inside their own scroll strip).
      const clipped = (el: Element) => {
        for (let a = el.parentElement; a; a = a.parentElement) {
          if (["auto", "scroll", "hidden"].includes(getComputedStyle(a).overflowX)) return true;
        }
        return false;
      };
      const over = [...document.querySelectorAll("body *")].filter((el) => el.getBoundingClientRect().right > width + 1 && !clipped(el));
      const culprits = over
        .filter((el) => !over.includes(el.parentElement as Element)) // only the outermost offenders
        .slice(0, 5)
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.getAttribute("class") ?? "")} (${Math.round(el.getBoundingClientRect().width)}px)`);
      return { overflow: document.documentElement.scrollWidth - width, culprits };
    });
    expect(overflow, `${path} scrolls sideways on a phone: ${culprits.join(", ")}`).toBeLessThanOrEqual(1);
  }
});
