// THE USER JOURNEYS, driven through the real UI in a real browser, in order.
// Each test builds on the previous one's saved data (one shared throwaway database).
import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { getTopic, topics } from "../packages/content/atlas/index";

config({ path: ".env" });
const db = new PrismaClient({
  datasourceUrl: (process.env.DATABASE_URL ?? "").replace(
    /schema=[^&]+/,
    "schema=hexhammer_e2e",
  ),
});
const TOPIC = getTopic("cs-binary-encoding")!; // no prerequisites, so it is open from the start
const FIRST = getTopic("cs-hardware-os")!; // the first quest on the map: Home offers it first
const SHOTS = "docs/screenshots/e2e";

test.describe.configure({ mode: "serial" });
// E2E_VIDEO=1 npm run test:e2e  also records a video of every journey (test-results/), to watch the
// animations play.
if (process.env.E2E_VIDEO) test.use({ video: { mode: "on", size: { width: 1440, height: 900 } } });
test.afterAll(() => db.$disconnect());
test.beforeEach(async ({ page }, info) => {
  if (!info.title.startsWith("0.")) await page.addInitScript(() => localStorage.setItem("hexhammer-seen-about", "1"));
});

async function toast(page: Page, text: RegExp | string) {
  await expect(page.locator(".toasts").getByText(text).first()).toBeVisible();
}

// Click "Next" through Bram's lines until a button with this name appears, then click it.
async function talkThrough(page: Page, finalButton: string | RegExp) {
  const panel = page.locator(".quest__panel");
  for (let i = 0; i < 8; i++) {
    const final = panel.getByRole("button", { name: finalButton });
    // Wait until the panel shows one of the two (it may still be loading).
    await expect(panel.getByRole("button", { name: /^Next/ }).or(final).first()).toBeVisible();
    if (await final.count()) {
      await final.first().click();
      return;
    }
    await panel.getByRole("button", { name: /^Next/ }).click();
  }
  throw new Error(`never reached the button ${finalButton}`);
}

// Open the quest at a chapter. The player remembers its chapter in the browser's storage, and
// every test starts with an empty browser, so later tests set it first (0 = Arrival, 5 = Riddles,
// 6 = Bridge Trial). Progress itself (XP, exercises, the assessment) is still the server's.
async function openChapter(page: Page, chapter: number) {
  await page.goto("/");
  await page.evaluate(([id, n]) => localStorage.setItem(`hexhammer-quest-${id}`, n), [TOPIC.id, String(chapter)]);
  await page.goto(`/quest/${TOPIC.id}`);
}

// Light exactly these lanterns (by their value) using the accessible lantern buttons.
async function light(page: Page, values: number[]) {
  for (const v of values) await page.getByRole("button", { name: `Lantern worth ${v}`, exact: true }).click();
}

test("0. a first visit opens the About page, which explains the four steps and the pages", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("heading", { level: 1, name: "Welcome to Hexhammer" })).toBeVisible();
  const steps = page.locator(".about__step strong");
  await expect(steps).toHaveText(["Study", "Play", "Build", "Test"]);
  await page.screenshot({ path: `${SHOTS}/00-about.png` });
  // Seen once: Today no longer redirects.
  await page.getByRole("link", { name: "Start learning" }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/");
  await expect(page).not.toHaveURL(/\/about$/);
});

test("1. launch: Today shows the next topic, its four steps and one big button", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 2, name: FIRST.title })).toBeVisible();
  await expect(page.getByRole("link", { name: /Start: Study/ })).toBeVisible();
  await expect(page.locator(".flow-steps li")).toHaveText(["1 Study", "2 Play", "3 Build", "4 Test"]);
  await expect(page.locator(".rmap__base")).toBeVisible(); // the painted realm map is really there
  await expect(page.getByRole("button", { name: /Bram, the guide/ })).toBeVisible(); // the owl guide
  await expect(page.getByText(/Classic Levels/i)).toHaveCount(0);
  await page.waitForTimeout(2500); // let the entrance animations finish
  await page.screenshot({ path: `${SHOTS}/01-mission-control.png` });
});

test("2 + 19. explore the world map with the keyboard only", async ({ page }) => {
  await page.goto("/map");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  // Every island has a real button (its name tag). Select one with Enter.
  await page.getByRole("button", { name: "Webmoor Harbor" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/map\/web$/);
  await expect(page.locator(".rpanel").getByRole("heading", { level: 2 })).toContainText("Webmoor Harbor");
  // A locked town says how to open it.
  await page.getByRole("button", { name: "Pixel Gardens" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Opens when you pass a topic in/)).toBeVisible();
  await page.getByRole("button", { name: "Byteford" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/map\/cs$/);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOTS}/02-region.png` });
  await page.locator(".rpanel").getByRole("link", { name: /Start: Study/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new RegExp(`/topic/${FIRST.id}`)); // the town's first topic, at Study
  await expect(page.locator(".path")).toContainText("Study");
  // Any row opens its topic page too.
  await page.goto("/map/cs");
  await page.locator(".rpanel .mrow", { hasText: TOPIC.title }).click();
  await expect(page).toHaveURL(new RegExp(`/topic/${TOPIC.id}`));
});

test("3. the quest story: lanterns, hex marks, and fixing the sign (lesson read, lab goal)", async ({ page }) => {
  // The Play step links to the story game.
  await page.goto(`/topic/${TOPIC.id}#play`);
  await page.locator(".story-game").getByRole("link").click();
  await expect(page).toHaveURL(new RegExp(`/quest/${TOPIC.id}`));
  await talkThrough(page, /Go to the forge/);
  // Chapter 2: light 5 = 4 + 1. The Rune Engine only opens after a real solve.
  await light(page, [4]);
  await expect(page.locator(".readout__bits")).toHaveText("00000100"); // the binary digits follow the lanterns
  await expect(page.locator(".stone.is-on .stone__beam")).toHaveCount(1); // one beam of energy to the crystal
  await expect(page.locator(".engine__pillar")).toHaveCount(0); // the engine has not woken
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOTS}/03a-quest-lantern-lit.png` });
  await light(page, [1]);
  await expect(page.getByText(/You wrote the number 5/)).toBeVisible();
  await expect(page.locator(".engine__pillar")).toBeVisible(); // a real solve wakes the Rune Engine
  await expect(page.getByText("The Rune Engine wakes!")).toBeVisible();
  await page.waitForTimeout(2300); // the crystal flares, the pillar of light drops, the floor ring lights
  await page.screenshot({ path: `${SHOTS}/03b-quest-rune-engine-opens.png` });
  await page.locator(".quest__panel").getByRole("button", { name: /Continue/ }).click();
  // Chapter 3: the biggest rune, 255
  await light(page, [128, 64, 32, 16, 8, 4, 2, 1]);
  await expect(page.getByText(/255!/).first()).toBeVisible();
  await page.locator(".quest__panel").getByRole("button", { name: /Continue/ }).click();
  // Chapter 4: hex mark A5 = 128 + 32 + 4 + 1
  await talkThrough(page, /Let me try/);
  await light(page, [128, 32, 4, 1]);
  await expect(page.getByText(/The lock opens/)).toBeVisible();
  await page.locator(".quest__panel").getByRole("button", { name: /Continue/ }).click();
  // Chapter 5: find the letter that needs two runes
  await talkThrough(page, /Find the broken letter/);
  await page.getByRole("button", { name: /^J/ }).click();
  await expect(page.getByText(/small enough for one rune/)).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${SHOTS}/03c-quest-sign-broken.png` });
  await page.getByRole("button", { name: /^é/ }).click();
  await toast(page, "+10 XP"); // the lesson counts as read
  await toast(page, /Lab goal reached/);
  await expect(page.getByText(/Fixed!/).first()).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/03-quest-sign.png` });
  await talkThrough(page, /On to the riddles/);
});

test("4. a riddle (predict the output), wrong first then right", async ({ page }) => {
  await openChapter(page, 5); // Riddles
  const riddles = TOPIC.exercises.filter((e) => e.kind === "predict" || e.kind === "debug");
  const n = riddles.findIndex((e) => e.kind === "predict");
  const ex = riddles[n];
  if (!ex || ex.kind !== "predict") throw new Error("fixture topic has no predict exercise");
  for (let i = 0; i < n; i++) await page.getByRole("button", { name: "Next riddle" }).click();
  const card = page.locator("fieldset.choice").filter({ hasText: "What will it print?" });
  const wrong = (ex.question.answerIndex + 1) % ex.question.choices.length;
  await card.getByLabel(ex.question.choices[wrong], { exact: true }).check();
  await card.getByRole("button", { name: "Check my answer" }).click();
  await expect(card.getByText(/Not quite/)).toBeVisible();
  await card.getByRole("button", { name: "Try again" }).click();
  await card.getByLabel(ex.question.choices[ex.question.answerIndex], { exact: true }).check();
  await card.getByRole("button", { name: "Check my answer" }).click();
  await expect(card.getByText("Right.", { exact: true })).toBeVisible();
  await toast(page, "+20 XP");
  await page.getByRole("button", { name: /I'm ready for the trial/ }).click();
});

test("5 + 6. the Bridge Trial (the real assessment), then every answer explained", async ({ page }) => {
  await openChapter(page, 6); // Bridge Trial
  await talkThrough(page, /Begin the trial/);
  const questions = TOPIC.assessment!.questions;
  const plain = (s: string) => s.replace(/`/g, "");
  for (let i = 0; i < questions.length; i++) {
    const prompt = (await page.locator(".trial__q").innerText()).trim();
    const q = questions.find((x) => prompt.startsWith(plain(x.prompt).slice(0, 25)))!;
    await page.locator(".choice-btn").filter({ has: page.getByText(plain(q.choices[q.answerIndex]), { exact: true }) }).click();
    if (i < questions.length - 1) await expect(page.locator(".trial__q")).not.toHaveText(prompt);
  }
  await expect(page.getByText(/The light is running back across the bridge/)).toBeVisible();
  await toast(page, /Achievement unlocked: Proved it/);
  await expect(page.locator(".toast--achievement .medal__img")).toBeVisible(); // the painted medal
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SHOTS}/05a-achievement-medal.png` });
  await page.getByText("See every answer explained").click();
  await expect(page.getByText(plain(questions[0].explanation).slice(0, 40)).first()).toBeVisible();
  await page.waitForTimeout(2200); // watch the light sweep back across the bridge
  await page.screenshot({ path: `${SHOTS}/05-assessment.png` });
  await page.locator(".quest__panel").getByRole("button", { name: /Celebrate/ }).click();
  await expect(page.getByText(/Byteford is saved/)).toBeVisible();
});

test("7. reload: progress persisted (the quest is done on the map)", async ({ page }) => {
  await page.goto("/map/cs");
  await page.reload();
  const row = page.locator(".rpanel .mrow", { hasText: TOPIC.title });
  await expect(row).toContainText("Done");
});

test("8-11. Workshop: start a build, run the workbench, finish a milestone, edit the blueprint, complete, portfolio", async ({ page }) => {
  await page.goto(`/projects?start=${TOPIC.id}`); // opens the "From your quests" shelf
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
  await expect(page.getByRole("link", { name: "Repository", exact: true })).toHaveAttribute("href", "https://github.com/learner/byte-inspector");
  await page.screenshot({ path: `${SHOTS}/10-portfolio.png` });
});

test("12. open and finish a review mission", async ({ page }) => {
  // Time travel: make the review due now (it was scheduled for tomorrow).
  await db.reviewItem.updateMany({
    where: { refId: TOPIC.id },
    data: { dueAt: new Date(Date.now() - 60_000) },
  });
  await page.goto("/reviews");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Today's reviews");
  await expect(page.locator(".memory__orbs li.is-now")).toHaveCount(1); // today's progress orbs
  const pool = [...TOPIC.knowledgeChecks, ...TOPIC.assessment!.questions];
  const sets = page.locator(".memory__card fieldset.memory-q");
  const count = await sets.count();
  for (let i = 0; i < count; i++) {
    const set = sets.nth(i);
    const text = (await set.locator(".memory-q__prompt").innerText()).replace(/^\d+\s*/, "").trim();
    const q = pool.find((p) => text.startsWith(p.prompt.replace(/`/g, "").slice(0, 25)))!;
    await set.locator(".memory-q__option").filter({ has: page.getByText(q.choices[q.answerIndex], { exact: true }) }).click();
  }
  await page.locator(".sure__option", { hasText: "Fairly sure" }).click();
  await page.screenshot({ path: `${SHOTS}/12-memory-garden.png` });
  await page.getByRole("button", { name: "Check my memory" }).click();
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
  await expect(page.getByText("v1 to v2", { exact: false })).toBeVisible();
  await expect(page.getByText("Only the async pipeline API exists.", { exact: false })).toBeVisible();

  // 18: earlier progress on another topic is untouched.
  await page.goto("/map/cs");
  await expect(page.locator(".rpanel .mrow", { hasText: TOPIC.title })).toContainText("Done");
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

test("21. the art is alive: map, clouds, Bram and quest animate, unlocks play, and reduced motion stills them", async ({ page }) => {
  // How many animations are running on the first element that matches.
  const running = (selector: string) =>
    page.locator(selector).first().evaluate((el) => el.getAnimations().filter((a) => a.playState === "running").length);

  await page.goto("/map");
  await expect(page.locator(".rnode").first()).toBeVisible();
  expect(await running(".rmap__flow")).toBeGreaterThan(0); // light travelling along the roads
  expect(await running(".rmap__cool")).toBeGreaterThan(0); // crystals breathing
  expect(await running(".rmap__cloud")).toBeGreaterThan(0); // painted clouds drifting

  // A town unlocked since my last visit plays the unlock sequence. Make the browser "forget" it
  // had seen Webmoor Harbor open, then come back.
  await page.evaluate(() => {
    const seen: string[] = JSON.parse(localStorage.getItem("hexhammer-unlocked-regions") ?? "[]");
    localStorage.setItem("hexhammer-unlocked-regions", JSON.stringify(seen.filter((id) => id !== "web")));
  });
  await page.goto("/map/web");
  await expect(page.locator('.rnode.is-fresh[aria-label="Webmoor Harbor"]')).toBeVisible();
  await expect(page.locator(".rnode.is-fresh .rnode__lock.is-breaking")).toBeVisible();
  await page.waitForTimeout(1300); // mid-sequence: the lock breaking away, the colour flooding in
  await page.screenshot({ path: `${SHOTS}/21a-unlock-sequence.png` });

  // Bram breathes and blinks on Home; tapping him swaps to a reaction painting and the next tip.
  await page.goto("/");
  await page.waitForTimeout(1300); // he flies in and lands
  expect(await running(".owl-hero .owl__breath")).toBeGreaterThan(0);
  expect(await running(".owl-hero .owl__blink")).toBeGreaterThan(0);
  const firstTip = await page.locator(".owl-hero__line").innerText();
  await page.getByRole("button", { name: /Bram, the guide/ }).click();
  await expect(page.locator(".owl-hero .owl__pose.is-on")).not.toHaveAttribute("src", /owl-stand/);
  await expect(page.locator(".owl-hero__line")).not.toHaveText(firstTip);
  await page.screenshot({ path: `${SHOTS}/21b-owl-reacts.png` });
  // On a quest his painting follows his mood.
  await page.goto(`/quest/${TOPIC.id}`);
  await expect(page.locator(".stage .owl__pose.is-on")).toHaveCount(1);
  await page.waitForTimeout(1300);
  expect(await running(".stage .owl__breath")).toBeGreaterThan(0);
  // Every other page stands in a painted place, with Bram's tip in the corner.
  await page.goto("/interview");
  await expect(page.locator(".backdrop__scene")).toBeVisible();
  await expect(page.locator(".buddy__bubble")).toBeVisible();

  // Reduced motion: no flowing light, no packets, the art simply stands still (and still shows).
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/map");
  await expect(page.locator(".rmap__base")).toBeVisible();
  await expect(page.locator(".rmap__flow")).toBeHidden();
  expect(await running(".rmap__cool")).toBe(0);
  expect(await running(".rmap__cloud")).toBe(0);
  await page.goto("/");
  await expect(page.getByRole("button", { name: /Bram, the guide/ })).toBeVisible();
  expect(await running(".owl-hero .owl__breath")).toBe(0);
  await page.screenshot({ path: `${SHOTS}/21c-home-reduced-motion.png` });
});

test("22. the new Foundations topics are real missions, and the references lab reaches its goal", async ({ page }) => {
  // The five language building blocks are written lessons now, not "Coming soon".
  await page.goto("/map/cs");
  for (const title of ["Variables, values, types and coercion", "Conditionals and loops", "Functions, scope and closures", "Values, references, mutability and copying", "Exceptions and error handling"]) {
    await expect(page.locator(".rpanel .mrow", { hasText: title })).not.toContainText("Coming soon");
  }
  // The lab: share one box, see a change through b reach a; then copy and change b alone.
  await page.goto("/topic/cs-references-mutability#play");
  const lab = page.getByRole("region", { name: "Names and boxes lab" });
  await lab.getByRole("button", { name: "let b = a;" }).click();
  await lab.getByRole("button", { name: "b.push(4);" }).click();
  await expect(lab.locator(".refs__box.is-shared")).toContainText("[1, 2, 3, 4]");
  await lab.getByRole("button", { name: "Start again" }).click();
  await lab.getByRole("button", { name: "let b = [...a];" }).click();
  await lab.getByRole("button", { name: "b.push(4);" }).click();
  await expect(lab.getByText("Goal reached", { exact: true })).toBeVisible();
  await expect(lab.locator(".refs__log")).toContainText("console.log(a); // [1, 2, 3]");
  await toast(page, /Lab goal reached/);
  await page.screenshot({ path: `${SHOTS}/22-references-lab.png` });
});

test("23. a topic in order: Study (plain cards, then the lesson), Play (the story game), Test", async ({ page }) => {
  const topic = getTopic("cs-control-flow")!;
  // 1. Study: plain-words cards first, then the full lesson; the last lesson card marks it read.
  await page.goto(`/topic/${topic.id}`);
  const plainCards = page.locator(".plain");
  await expect(plainCards).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/23a-study-plain-words.png` });
  for (let i = 0; i < 8 && (await plainCards.getByRole("button", { name: "Next card" }).count()); i++) await plainCards.getByRole("button", { name: "Next card" }).click();
  await plainCards.getByRole("button", { name: /Got it: show me the full lesson/ }).click();
  const briefing = page.locator(".briefing");
  for (let i = 0; i < 12 && (await briefing.getByRole("button", { name: "Next card" }).count()); i++) await briefing.getByRole("button", { name: "Next card" }).click();
  await toast(page, "+10 XP");

  // 2. Play: the story game. Arrival, the worked example (guess, then run), a real riddle, done.
  await page.goto(`/quest/${topic.id}`);
  await expect(page.locator(".quest__name")).toContainText(topic.title);
  await talkThrough(page, /Show me/);
  await page.getByRole("button", { name: /Run it/ }).click();
  await expect(page.locator(".qexample__output")).toContainText("excellent pass try again");
  await page.screenshot({ path: `${SHOTS}/23b-story-game-centred.png` });
  await talkThrough(page, /Time to practise/);
  const riddle = topic.exercises.find((e) => e.kind === "predict")!;
  if (riddle.kind !== "predict") throw new Error("fixture needs a predict exercise");
  const card = page.locator("fieldset.choice").first();
  await card.getByLabel(riddle.question.choices[riddle.question.answerIndex], { exact: true }).check();
  await card.getByRole("button", { name: "Check my answer" }).click();
  await expect(card.getByText("Right.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Finish the game/ }).click();
  // Victory: click through Bram's lines, then go to the test.
  const toTest = page.locator(".quest__panel").getByRole("link", { name: /Take the test/ });
  for (let i = 0; i < 6 && !(await toTest.count()); i++) await page.locator(".quest__panel").getByRole("button", { name: /^Next/ }).click();
  await toTest.click();

  // 3. Test: the topic's real assessment, scored by the server.
  await expect(page).toHaveURL(new RegExp(`/topic/${topic.id}#test`));
  const questions = topic.assessment!.questions;
  const plain = (x: string) => x.replace(/`/g, "");
  for (let i = 0; i < questions.length; i++) {
    const prompt = (await page.locator(".quiz__prompt").innerText()).trim();
    const q = questions.find((x) => prompt.startsWith(plain(x.prompt).slice(0, 25)))!;
    await page.locator(".quiz__option").filter({ has: page.getByText(plain(q.choices[q.answerIndex]), { exact: true }) }).click();
    const next = page.getByRole("button", { name: "Next question" });
    if (i < questions.length - 1) await next.click();
  }
  await page.getByRole("button", { name: /^Submit/ }).click();
  await expect(page.getByText("Proven.")).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/23c-test-passed.png` });
  // Saved for real: the map shows it done after a reload
  await page.goto("/map/cs");
  await expect(page.locator(".rpanel .mrow", { hasText: topic.title })).toContainText("Done");
});

test("24. Quick fire: answer a random riddle and the streak grows", async ({ page }) => {
  await page.goto("/interview");
  await expect(page.getByRole("tab", { name: /Quick fire/ })).toHaveAttribute("aria-selected", "true"); // the default mode
  const pool = topics.filter((t) => t.stage === "complete").flatMap((t) => [...t.knowledgeChecks, ...t.exercises.flatMap((e) => ("question" in e ? [e.question] : []))]);
  const plain = (x: string) => x.replace(/`/g, "");
  const prompt = (await page.locator(".quickfire .choice__prompt").innerText()).trim();
  const q = pool.find((p) => prompt.startsWith(plain(p.prompt).slice(0, 30)))!;
  await page.locator(".quickfire").getByLabel(plain(q.choices[q.answerIndex]), { exact: true }).check();
  await page.locator(".quickfire").getByRole("button", { name: "Check my answer" }).click();
  await expect(page.locator(".quickfire").getByText("Right.", { exact: true })).toBeVisible();
  await expect(page.locator(".quickfire__streak")).toHaveText("1 in a row");
  await page.screenshot({ path: `${SHOTS}/24-quick-fire.png` });
  await page.getByRole("button", { name: /Next challenge/ }).click();
  await expect(page.locator(".quickfire .choice__prompt")).not.toHaveText(prompt);
});
