// FUN BUILDS: projects worth building for their own sake, told as commissions from the Kingdom of
// Hex. Four kinds: games, creative tools, apps I would really use, and AI toys.
//
// CHARTER RULES:
//   - A build is a BRIEF: what to make, milestones, how to tell it works, test ideas. Never code.
//   - Everything is free and local. AI toys use Ollama (a free local model), never a paid API.
//   - `topicId` links a build to the real topic it practises, so its skills show up on the map.
import type { Difficulty } from "./types";

export type BuildKind = "game" | "creative" | "app" | "ai";

export interface FunBuild {
  id: string; // unique, kebab-case, prefixed "build-"
  kind: BuildKind;
  emoji: string; // the build's poster picture
  title: string;
  quest: string; // one sentence of story: who asks for it, and why
  summary: string; // what I will build, in plain words
  topicId: string | null; // the curriculum topic it practises (null = general skills)
  difficulty: Difficulty;
  type: "exercise" | "implementation" | "application";
  technologies: string[];
  milestones: { title: string; doneWhen: string }[];
  acceptanceCriteria: string[];
  testIdeas: string[];
  stretchGoals: string[];
}

export const funBuilds: FunBuild[] = [
  // ---------------------------------------------------------------- games
  {
    id: "build-dragon-snake",
    kind: "game",
    emoji: "🐉",
    title: "Dragon Snake",
    quest: "The children of Byteford want a game: steer a baby dragon that grows longer with every coin it eats.",
    summary: "A Snake-style game in the browser on a grid, with a growing dragon, coins, a score and a game-over screen.",
    topicId: "cs-big-o",
    difficulty: "foundation",
    type: "application",
    technologies: ["HTML canvas", "JavaScript"],
    milestones: [
      { title: "The dragon moves", doneWhen: "Arrow keys steer a dragon head around a grid, one cell per tick." },
      { title: "Coins and growing", doneWhen: "Eating a coin adds one body segment and moves the coin somewhere free." },
      { title: "Game over and score", doneWhen: "Hitting a wall or itself ends the game and shows the score with a Play again button." },
    ],
    acceptanceCriteria: [
      "A new coin never appears on top of the dragon.",
      "Pressing the opposite direction does not make the dragon reverse into itself.",
      "The best score survives a page reload.",
    ],
    testIdeas: ["Moving right from (2,2) lands on (3,2)", "Eating a coin increases length by exactly 1", "A free-cell picker never returns an occupied cell"],
    stretchGoals: ["Speed up every 5 coins", "A second player with WASD", "Sound effects (off by default)"],
  },
  {
    id: "build-rune-quiz-battle",
    kind: "game",
    emoji: "⚔️",
    title: "Rune Quiz Battle",
    quest: "Bram wants apprentices to duel with knowledge: answer faster than your rival to hit their shield.",
    summary: "A two-player quiz game on one screen: questions from a JSON file, a timer, health bars and a winner.",
    topicId: null,
    difficulty: "foundation",
    type: "application",
    technologies: ["HTML", "CSS", "JavaScript", "JSON"],
    milestones: [
      { title: "Questions on screen", doneWhen: "Questions load from a JSON file and show one at a time with 4 answers." },
      { title: "Two players, two keys", doneWhen: "Player 1 answers with 1-4, player 2 with 7-0; the first correct answer wins the round." },
      { title: "Health bars and a winner", doneWhen: "A correct answer drains the other player's health bar; at zero a winner screen appears." },
    ],
    acceptanceCriteria: ["The same question never appears twice in one game.", "A wrong answer locks that player out for the round.", "The game works with only the keyboard."],
    testIdeas: ["Shuffling keeps every question exactly once", "Damage never takes health below 0", "Round winner is the first CORRECT answer, not the first answer"],
    stretchGoals: ["Categories to pick from", "A timer bar per question", "Write your own question pack"],
  },
  {
    id: "build-pixel-platformer",
    kind: "game",
    emoji: "🕹️",
    title: "Tower Climber",
    quest: "A knight is trapped at the bottom of the Architect's Spire. Build a tiny platformer to get them out.",
    summary: "A side-view platform game: running, jumping with gravity, platforms, a few hazards and a goal flag.",
    topicId: "fe-event-loop",
    difficulty: "core",
    type: "application",
    technologies: ["HTML canvas", "JavaScript", "requestAnimationFrame"],
    milestones: [
      { title: "Run and jump", doneWhen: "The knight runs left and right and jumps with gravity pulling them down." },
      { title: "Platforms", doneWhen: "The knight lands on platforms and cannot fall through them." },
      { title: "Hazards and a flag", doneWhen: "Spikes send the knight back to the start; touching the flag shows You escaped!" },
    ],
    acceptanceCriteria: ["Movement speed is the same on a 60 Hz and a 144 Hz screen.", "The knight never gets stuck inside a platform.", "A level is described as data (a grid of characters), not hard-coded."],
    testIdeas: ["Gravity increases downward speed every frame until landing", "Overlap check for two rectangles", "Loading a level string creates the right platforms"],
    stretchGoals: ["Double jump", "Moving platforms", "A level editor"],
  },
  // ---------------------------------------------------------------- creative tools
  {
    id: "build-beat-forge",
    kind: "creative",
    emoji: "🥁",
    title: "Beat Forge",
    quest: "The forge has a rhythm. Rosa wants a machine that turns it into music for the harvest festival.",
    summary: "A drum machine: a 16-step grid for 4 sounds, play and stop, tempo control, and beats you can save.",
    topicId: "fe-event-loop",
    difficulty: "core",
    type: "application",
    technologies: ["Web Audio API", "JavaScript", "localStorage"],
    milestones: [
      { title: "A grid you can click", doneWhen: "A 4 x 16 grid of buttons toggles on and off." },
      { title: "It plays", doneWhen: "Play loops through the 16 steps and sounds every lit cell (generated tones are fine)." },
      { title: "Tempo and saving", doneWhen: "A tempo slider changes speed while playing; patterns can be saved and loaded by name." },
    ],
    acceptanceCriteria: ["Timing stays steady when the browser tab is busy (schedule ahead, do not use plain setInterval alone).", "Saved patterns survive a reload.", "The current step is highlighted while playing."],
    testIdeas: ["Step index wraps from 15 back to 0", "Tempo 120 BPM gives 125 ms per 16th note", "Saving then loading returns the same grid"],
    stretchGoals: ["Swing", "Record your own sounds", "Share a beat as a link"],
  },
  {
    id: "build-pixel-painter",
    kind: "creative",
    emoji: "🎨",
    title: "Pixel Painter",
    quest: "The Palette Palace needs new banners. Build them a pixel-art studio.",
    summary: "A pixel-art editor: a grid canvas, a color palette, brush and fill tools, undo, and export as an image.",
    topicId: "ds-design-tokens",
    difficulty: "core",
    type: "application",
    technologies: ["HTML canvas", "JavaScript"],
    milestones: [
      { title: "Paint pixels", doneWhen: "Clicking and dragging paints cells in the chosen color on a 32 x 32 grid." },
      { title: "Fill and undo", doneWhen: "A bucket tool fills a connected area; Ctrl+Z undoes the last action." },
      { title: "Export", doneWhen: "A button downloads the picture as a PNG at 10x size." },
    ],
    acceptanceCriteria: ["Undo works for at least 50 steps.", "Fill never spills past a different color.", "The palette is defined once as design tokens and used everywhere."],
    testIdeas: ["Flood fill on a closed shape changes only its inside", "Undo after fill restores every changed cell", "Export size is grid size x scale"],
    stretchGoals: ["Layers", "Animation frames", "Mirror drawing"],
  },
  {
    id: "build-meme-press",
    kind: "creative",
    emoji: "🖼️",
    title: "Royal Meme Press",
    quest: "The kingdom's town crier is bored. Give them a press to make funny posters.",
    summary: "A meme generator: pick or upload a picture, add top and bottom text, drag it around, download the result.",
    topicId: "cs-binary-encoding",
    difficulty: "foundation",
    type: "application",
    technologies: ["HTML canvas", "JavaScript", "File API"],
    milestones: [
      { title: "Picture in", doneWhen: "You can choose an image file and see it on a canvas." },
      { title: "Text on top", doneWhen: "Top and bottom captions appear in a bold outlined font and wrap long lines." },
      { title: "Download", doneWhen: "The finished meme downloads as a PNG." },
    ],
    acceptanceCriteria: ["Emoji and accented letters (é, ñ, 🙂) render correctly in captions.", "Long captions wrap and never run off the picture.", "Big photos are scaled down to fit."],
    testIdeas: ["Line wrapping splits on spaces and keeps every word", "Scaling keeps the aspect ratio", "Caption with an emoji is measured correctly"],
    stretchGoals: ["Stickers", "Template gallery", "Drag text anywhere"],
  },
  // ---------------------------------------------------------------- apps I would use
  {
    id: "build-habit-hearth",
    kind: "app",
    emoji: "🔥",
    title: "Habit Hearth",
    quest: "Every apprentice keeps a hearth. Each day you keep a habit, the fire grows.",
    summary: "A habit tracker: add habits, tick them each day, see streaks and a calendar of the last 8 weeks.",
    topicId: "db-joins-aggregation",
    difficulty: "foundation",
    type: "application",
    technologies: ["React or plain JavaScript", "localStorage or SQLite"],
    milestones: [
      { title: "Habits", doneWhen: "You can add, rename and delete habits." },
      { title: "Daily ticks and streaks", doneWhen: "Ticking today counts toward a streak; missing a day resets it." },
      { title: "The calendar", doneWhen: "A grid of the last 56 days shows done and missed days per habit." },
    ],
    acceptanceCriteria: ["Streaks use the user's local date, not UTC.", "Data survives a reload.", "Works on a phone screen."],
    testIdeas: ["Streak across a month boundary", "Ticking twice in one day counts once", "Missing yesterday resets the streak to 0 (or 1 if today is ticked)"],
    stretchGoals: ["Reminders", "Weekly goals (3 times a week)", "Export to CSV"],
  },
  {
    id: "build-recipe-grimoire",
    kind: "app",
    emoji: "📖",
    title: "Recipe Grimoire",
    quest: "Rosa's recipes are scribbled on flour bags. Give her a book that never gets lost.",
    summary: "A recipe book app with a small backend: recipes with ingredients and steps, search, and a shopping list.",
    topicId: "be-middleware-pipeline",
    difficulty: "core",
    type: "application",
    technologies: ["Express", "PostgreSQL or SQLite", "HTML/React"],
    milestones: [
      { title: "Recipes API", doneWhen: "GET, POST, PUT and DELETE /recipes work and validate their input." },
      { title: "The book", doneWhen: "A page lists recipes, shows one in detail and has a form to add one." },
      { title: "Search and shopping list", doneWhen: "Search by name or ingredient; pick recipes and get one combined shopping list." },
    ],
    acceptanceCriteria: ["Invalid recipes get a 400 with a message per field.", "Scaling servings multiplies every ingredient amount.", "The shopping list merges the same ingredient from two recipes."],
    testIdeas: ["POST without a title returns 400", "Scaling 2 servings to 6 triples amounts", "Two recipes using eggs give one eggs line"],
    stretchGoals: ["Photos", "Tags (vegan, quick)", "Print-friendly view"],
  },
  {
    id: "build-coin-ledger",
    kind: "app",
    emoji: "🪙",
    title: "Coin Ledger",
    quest: "The kingdom's treasurer keeps losing gold. Build a budget book that shows where it goes.",
    summary: "A budget app: add income and spending with categories, monthly totals, and a chart per category.",
    topicId: "db-joins-aggregation",
    difficulty: "core",
    type: "application",
    technologies: ["SQL", "Express or a local-first app", "a charting approach of your choice"],
    milestones: [
      { title: "Entries", doneWhen: "Add, edit and delete income and spending entries with a date, amount and category." },
      { title: "Monthly totals", doneWhen: "A summary shows income, spending and balance per month (computed with SQL GROUP BY)." },
      { title: "Where it goes", doneWhen: "A chart shows spending per category for the chosen month." },
    ],
    acceptanceCriteria: ["Money is stored as whole cents, never floating point.", "Months with no entries still show as zero.", "Totals match a hand calculation for a sample month."],
    testIdeas: ["0.1 + 0.2 stored as cents adds to exactly 30", "GROUP BY month with an empty month", "Deleting an entry updates the totals"],
    stretchGoals: ["Budgets per category with warnings", "Import a bank CSV", "Recurring entries"],
  },
  // ---------------------------------------------------------------- AI toys (local Ollama only)
  {
    id: "build-golem-pet",
    kind: "ai",
    emoji: "🤖",
    title: "Pocket Golem",
    quest: "The Golem Workshop wants a tiny companion that chats, remembers your name and has moods.",
    summary: "A chatbot pet that runs on a free local model (Ollama): a personality, short memory, and a mood that changes.",
    topicId: "ai-prompt-injection",
    difficulty: "core",
    type: "application",
    technologies: ["Ollama (local, free)", "Node.js", "HTML"],
    milestones: [
      { title: "It talks", doneWhen: "A chat page sends messages to a local Ollama model and shows replies as they stream in." },
      { title: "Personality and memory", doneWhen: "A system prompt sets the golem's character; it remembers facts you told it during the chat." },
      { title: "Moods", doneWhen: "The golem's mood (happy, sleepy, grumpy) changes with the conversation and shows as an emoji." },
    ],
    acceptanceCriteria: ["Nothing is sent to any paid or online API.", "A message like 'ignore your rules' does not break the golem's character.", "The chat still works when Ollama is stopped: it shows a friendly error."],
    testIdeas: ["The prompt builder puts user text inside clear delimiters", "Memory keeps only the last N facts", "Mood rules for 3 sample messages"],
    stretchGoals: ["Voice in and out (browser speech APIs)", "Feeding and sleeping like a real pet", "Save the golem's memory"],
  },
  {
    id: "build-story-loom",
    kind: "ai",
    emoji: "📜",
    title: "Story Loom",
    quest: "The kingdom's bard has writer's block. Weave stories together with a local AI.",
    summary: "A choose-your-own-adventure maker: the local model writes a scene and three choices; you pick, it continues.",
    topicId: "ai-rag-pipeline",
    difficulty: "core",
    type: "application",
    technologies: ["Ollama (local, free)", "JavaScript"],
    milestones: [
      { title: "First scene", doneWhen: "Pick a genre and hero; the model writes an opening scene." },
      { title: "Choices", doneWhen: "Each scene ends with exactly 3 choices as buttons; picking one continues the story." },
      { title: "Remember the story", doneWhen: "Characters and places stay consistent because a short story summary is sent each turn." },
    ],
    acceptanceCriteria: ["The app checks the model's reply really has 3 choices and asks again if not.", "A story can be saved and continued later.", "Runs fully offline with Ollama."],
    testIdeas: ["Parsing a reply with 3 numbered choices", "Rejecting a reply with 2 choices", "Summary stays under a word limit"],
    stretchGoals: ["Illustrate scenes with emoji", "Two-player turns", "Export the story as a book"],
  },
  {
    id: "build-oracle-sorter",
    kind: "ai",
    emoji: "🔮",
    title: "Oracle Sorter",
    quest: "The Oracle Grove gets thousands of letters. Teach a tiny model to sort them into happy and angry.",
    summary: "Train your own small text classifier from scratch (no library), then compare it with a local model's answer.",
    topicId: "ml-classification-gradient-descent",
    difficulty: "advanced",
    type: "implementation",
    technologies: ["JavaScript or Python", "a small labelled dataset", "Ollama (optional, local)"],
    milestones: [
      { title: "Words to numbers", doneWhen: "Each letter becomes a vector of word counts from a vocabulary you build." },
      { title: "Train it", doneWhen: "Logistic regression trained by gradient descent; the loss goes down each epoch." },
      { title: "Is it any good?", doneWhen: "Accuracy on letters it never saw, plus 5 examples it gets wrong and why." },
    ],
    acceptanceCriteria: ["Training and test letters are kept separate.", "Accuracy is reported on the test set only.", "The loss curve is shown."],
    testIdeas: ["Vocabulary ignores case", "One gradient step lowers the loss on a tiny dataset", "Accuracy of a model that always says happy (the baseline)"],
    stretchGoals: ["A third class: question", "Compare with the local model", "Show the most happy and most angry words"],
  },
];

export const getFunBuild = (id: string) => funBuilds.find((b) => b.id === id);
