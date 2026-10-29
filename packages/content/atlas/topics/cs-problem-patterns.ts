// Topic: Problem-solving patterns (the Foundations boss). A COMPLETE topic (all 18 parts).
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const csProblemPatterns: Topic = {
  id: "cs-problem-patterns",
  domainId: "",
  moduleId: "",
  title: "Problem-solving patterns",
  stage: "complete",
  difficulty: "advanced",
  capstone: true,
  learningObjectives: [
    "Recognise when two pointers, sliding window, hashing, or dynamic programming applies.",
    "Solve a problem with dynamic programming by defining state, transition and base cases.",
    "Talk through a solution out loud before coding, as in an interview: clarify, example, brute force, optimise, test.",
  ],
  prerequisites: ["cs-hashing", "cs-linear-structures"],
  subtopics: ["The interview method", "Two pointers", "Sliding window", "Prefix sums", "Dynamic programming", "Greedy choices", "Pattern recognition cues"],
  strikeIds: ["dsa-s04", "dsa-s05", "dsa-s13"],

  story:
    "You have solved 200 practice problems, yet a new one in an interview still feels blank. The trick top candidates use is not memorising answers; it is recognising the SHAPE of a problem: 'contiguous subarray' whispers sliding window, 'sorted array and a pair' whispers two pointers, 'count the ways' whispers dynamic programming. This is the boss of Foundations: putting every structure you learned to work, out loud.",
  mentalModel: {
    plain:
      "Most interview problems are a small number of patterns in disguise. A pattern is a reusable way to avoid redundant work: two pointers walk inward instead of checking every pair; a sliding window updates a running total instead of re-summing; dynamic programming stores answers to sub-problems instead of recomputing them; a hash map remembers what you have seen.",
    analogy:
      "A doctor does not memorise every patient; they learn to recognise symptoms that point to a diagnosis, then apply the standard treatment, then check it worked. Problem cues are symptoms, patterns are treatments, and test cases are the check-up.",
    analogyLimit:
      "Some problems combine patterns or need a fresh idea. The method (clarify, brute force, optimise, test) still works when no pattern fits.",
  },
  lessonSections: [
    {
      heading: "1. The interview method, out loud",
      body:
        "1. Clarify: inputs, sizes, edge cases (empty? duplicates? negatives?).\n2. Example: work one small case by hand.\n3. Brute force: say the simple solution and its complexity. It proves you understand the problem.\n4. Optimise: find the repeated work and remove it with a pattern.\n5. Code it, narrating.\n6. Test: trace your example and the edge cases.\n\nInterviewers grade the thinking you SAY, not only the final code.",
    },
    {
      heading: "2. Two pointers",
      body:
        "Cue: a sorted array, or comparing items from both ends (pairs that sum to a target, palindromes, removing duplicates in place).\n\nStart one pointer at each end. If the pair sum is too small, move the left pointer right; too big, move the right pointer left. Each step discards a whole row of pairs: O(n) instead of O(n²).",
    },
    {
      heading: "3. Sliding window",
      body:
        "Cue: 'contiguous subarray or substring' with a best length, sum or count.\n\nKeep a window [left, right]. Extend right one step at a time, updating a running value. When the window breaks a rule (sum too big, a duplicate character), move left forward until it is valid again. Every element enters and leaves once: O(n).",
    },
    {
      heading: "4. Dynamic programming",
      body:
        "Cue: 'how many ways', 'minimum cost', 'longest', where choices overlap and the same sub-question repeats.\n\nRecipe: define the state (what dp[i] means in words), the transition (how dp[i] is built from smaller states), and the base cases. Then fill a table bottom-up, or recurse with a memo (top-down).\n\nExample: ways to climb n stairs taking 1 or 2 steps: dp[i] = dp[i-1] + dp[i-2], with dp[0] = dp[1] = 1.",
    },
    {
      heading: "5. Greedy, and when not to trust it",
      body:
        "Greedy: always take the locally best option (pick the meeting that ends earliest, give the largest coin). It is simple and fast, but only correct when you can argue that a local choice never hurts later.\n\nCounterexample habit: with coins [1, 3, 4] and target 6, greedy takes 4 + 1 + 1 (3 coins) but 3 + 3 (2 coins) is better. When greedy fails, it is usually a DP problem.",
    },
    {
      heading: "6. A cue sheet",
      body:
        "Sorted array, pairs: two pointers.\nContiguous subarray or substring: sliding window or prefix sums.\nHave I seen X before? Count things? Hash map or Set.\nTop k, next smallest: heap.\nShortest steps, nearest: BFS.\nAll combinations or arrangements: backtracking.\nCount ways, min/max cost with overlapping choices: DP.\nSorted search space with a yes/no test: binary search on the answer.",
    },
  ],
  visualizationType: "none",
  visualNote:
    "Each pattern is shown on a real problem in the worked example with its brute-force alternative, which makes the saved work concrete; the strikes then make you write each pattern by hand.",
  codeExamples: [
    {
      title: "Three patterns, three problems",
      language: "js",
      code: `// Two pointers: does a SORTED array have a pair summing to target?
function pairSum(sorted, target) {
  let l = 0, r = sorted.length - 1;
  while (l < r) {
    const s = sorted[l] + sorted[r];
    if (s === target) return [sorted[l], sorted[r]];
    if (s < target) l++; else r--;
  }
  return null;
}
console.log(pairSum([1, 3, 4, 6, 9, 11], 13));

// Sliding window: longest substring without repeating characters
function longestUnique(s) {
  const lastSeen = new Map();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    if (lastSeen.has(s[right]) && lastSeen.get(s[right]) >= left) left = lastSeen.get(s[right]) + 1;
    lastSeen.set(s[right], right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}
console.log(longestUnique("abcabcbb"), longestUnique("pwwkew"));

// Dynamic programming: fewest coins to make an amount
function minCoins(coins, amount) {
  const dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;                                         // base case
  for (let a = 1; a <= amount; a++)
    for (const c of coins) if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);   // transition
  return dp[amount] === Infinity ? -1 : dp[amount];
}
console.log(minCoins([1, 3, 4], 6), minCoins([2], 3));`,
      expectedOutput: `[ 4, 9 ]
3 3
2 -1`,
      steps: [
        "Two pointers start at 1 and 11 (sum 12, too small: move left), then 3 + 11 = 14 (too big: move right), then 3 + 9 = 12 (too small), then 4 + 9 = 13: found, in 4 steps instead of checking all 15 pairs.",
        "The sliding window grows to the right; when a character repeats inside the window, left jumps past its previous position. 'abcabcbb' has 'abc' (3); 'pwwkew' has 'wke' (3).",
        "minCoins builds dp[a] = fewest coins for amount a, from dp[0] = 0 upward. For 6 with coins 1, 3, 4 the answer is 2 (3 + 3), where a greedy choice of 4 first would need 3 coins.",
        "Amount 3 cannot be made from 2s, so it stays Infinity and the function returns -1.",
      ],
    },
  ],
  practicalApplication:
    "Patterns show up outside interviews too: sliding windows power rate limiters and moving averages, two pointers merge sorted results, DP drives diff tools, spell-check distance and route pricing, and greedy algorithms schedule meetings and compress data. For interview preparation, practise by pattern: solve 3 to 5 problems per pattern, saying the method out loud each time, then mix them so you practise recognition.",
  commonMistakes: [
    {
      mistake: "Jumping straight to code.",
      symptom: "You solve the wrong problem, or freeze halfway when an edge case appears.",
      fix: "Clarify and work one example by hand first, out loud, every time.",
    },
    {
      mistake: "Trusting a greedy idea without a counterexample check.",
      symptom: "Passes your examples, fails hidden tests.",
      fix: "Try to break it with a small tricky case (like coins 1, 3, 4 for 6). If it breaks, consider DP.",
    },
    {
      mistake: "DP without a clear state definition.",
      symptom: "Off-by-one indexes and a table you cannot explain.",
      fix: "Write in words what dp[i] means before writing any code, then the base cases.",
    },
  ],
  misconceptions: [
    { myth: "Getting good at interviews means memorising hundreds of solutions.", truth: "A handful of patterns plus a clear method covers most problems; recognition beats memory." },
    { myth: "The optimal solution is the only thing that counts.", truth: "A clearly explained brute force plus a reasoned optimisation, even if unfinished, often scores better than silent perfect code." },
    { myth: "Dynamic programming is a special kind of code.", truth: "It is just recursion with remembered answers, or the same thing filled in a table." },
  ],
  exercises: [
    { kind: "strike", strikeId: "dsa-s04", why: "Two pointers by hand, on problems that look like nested loops." },
    { kind: "strike", strikeId: "dsa-s05", why: "Sliding windows: grow, shrink, and keep the running answer." },
    { kind: "strike", strikeId: "dsa-s13", why: "Dynamic programming: state, transition, base case, by hand." },
    {
      kind: "predict",
      question: {
        id: "cs-problem-patterns-p1",
        prompt: "'Find the maximum sum of any 3 consecutive numbers in an array of a million numbers.' Which approach is O(n)?",
        choices: ["Check every subarray", "Sort the array, take the top 3", "Sliding window: add the new number, subtract the one leaving", "Binary search"],
        answerIndex: 2,
        explanation: "The window keeps a running sum, updating it in O(1) per step. Sorting breaks 'consecutive', and checking every subarray re-sums work.",
        objective: 0,
      },
    },
  ],
  knowledgeChecks: [
    {
      id: "cs-problem-patterns-k1",
      prompt: "A problem says 'count the number of ways to...' and choices overlap. Which pattern is the first suspect?",
      choices: ["Two pointers", "Dynamic programming", "Binary search", "Greedy"],
      answerIndex: 1,
      explanation: "Counting ways over overlapping sub-problems is the classic DP cue.",
      objective: 0,
    },
    {
      id: "cs-problem-patterns-k2",
      prompt: "What should you do FIRST when given an interview problem?",
      choices: ["Start typing the optimal solution", "Clarify inputs, constraints and edge cases, then work an example", "Say it is impossible", "Ask for the answer"],
      answerIndex: 1,
      explanation: "Clarifying avoids solving the wrong problem and shows structured thinking.",
      objective: 2,
    },
  ],
  project: {
    title: "Pattern Notebook: your own interview playbook, proven by tests",
    summary: "Solve two problems per pattern (two pointers, sliding window, hashing, heap, BFS, backtracking, DP, binary search on the answer), each with brute force and optimised versions, tests that prove they agree, and a written walkthrough as you would say it in an interview.",
    type: "implementation",
    objectivesCovered: [0, 1, 2],
    requirements: [
      "16 problems: 2 for each of 8 patterns, with brute-force and optimised implementations.",
      "Randomised tests showing brute force and optimised versions agree on many inputs.",
      "For each problem, a short write-up: clarifying questions, cue that revealed the pattern, complexity of both versions.",
      "A timing table showing the speed-up on large inputs.",
    ],
    acceptanceCriteria: [
      "Every optimised solution matches its brute force on at least 200 random cases.",
      "Each DP solution's README states the state, transition and base cases in words.",
      "You can explain any one problem out loud in under 5 minutes (record yourself once).",
    ],
    technologies: ["TypeScript", "Vitest"],
    milestones: [
      { title: "Harness", done_when: "A test helper compares brute force and optimised on random inputs." },
      { title: "Patterns 1 to 4", done_when: "Two pointers, sliding window, hashing and heap problems pass." },
      { title: "Patterns 5 to 8", done_when: "BFS, backtracking, DP and binary-search-on-answer pass." },
      { title: "Playbook", done_when: "Write-ups and the timing table are complete." },
    ],
    testIdeas: ["Empty inputs for every problem", "All-equal values", "Maximum-size inputs for timing"],
    stretchGoals: ["Do a timed mock interview with a friend using one problem", "Add a 9th pattern: union-find"],
  },
  assessment: {
    passingScore: 0.75,
    questions: [
      {
        id: "cs-problem-patterns-a1",
        prompt: "'Given a sorted array, remove duplicates in place.' Which pattern fits best?",
        choices: ["Two pointers (a read pointer and a write pointer)", "Dynamic programming", "BFS", "Heap"],
        answerIndex: 0,
        explanation: "One pointer reads every item; the other marks where the next unique value goes. O(n) time, O(1) space.",
        objective: 0,
      },
      {
        id: "cs-problem-patterns-a2",
        prompt: "In the climbing-stairs DP (1 or 2 steps at a time), what is dp[5] if dp[0] = 1 and dp[1] = 1?",
        choices: ["5", "8", "13", "10"],
        answerIndex: 1,
        explanation: "dp[i] = dp[i-1] + dp[i-2]: 1, 1, 2, 3, 5, 8. So dp[5] = 8.",
        objective: 1,
      },
      {
        id: "cs-problem-patterns-a3",
        prompt: "Coins are [1, 5, 6, 9] and the amount is 11. Greedy (largest coin first) gives 9 + 1 + 1. What does the true minimum use?",
        choices: ["3 coins: greedy is right", "2 coins (5 + 6)", "1 coin", "4 coins"],
        answerIndex: 1,
        explanation: "5 + 6 = 11 uses 2 coins. Greedy is not always optimal for coin change; DP is.",
        objective: 1,
      },
      {
        id: "cs-problem-patterns-a4",
        prompt: "Why say the brute-force solution out loud in an interview?",
        choices: [
          "To waste time",
          "It proves you understand the problem and gives a baseline to optimise from",
          "Because interviewers want the slowest answer",
          "It is required by law",
        ],
        answerIndex: 1,
        explanation: "A correct baseline shows understanding, gives something to test against, and makes the optimisation a clear story.",
        objective: 2,
      },
    ],
  },
  interviewQuestions: [
    {
      id: "cs-problem-patterns-q01", tags: ["interview-method"], difficulty: "core", kind: "behavioral",
      prompt: "Walk me through how you approach a coding problem you have never seen.",
      expectedElements: ["clarify constraints", "work an example", "brute force with complexity", "optimise by finding repeated work", "code while narrating", "test edge cases"],
      modelAnswer: "I restate the problem and ask about input sizes, edge cases and constraints. I work a small example by hand to make sure I understand it. Then I describe a brute-force solution and its complexity, and look for the repeated work in it, which usually points to a pattern: a hash map, two pointers, a window or DP. I code the improved version while explaining it, then trace my example and the edge cases, and finally state the time and space complexity.",
      explanation: "This structure is what interviewers literally score.",
      commonWrongAnswers: ["I start coding and see what happens."],
    },
    {
      id: "cs-problem-patterns-q02", tags: ["sliding-window"], difficulty: "core", kind: "implementation",
      prompt: "Find the length of the longest substring without repeating characters.",
      expectedElements: ["sliding window", "map of last seen index", "move left past previous occurrence", "O(n)"],
      modelAnswer: "I use a sliding window with a map from character to its last index. I extend right one character at a time. If the character was seen inside the current window, I move left to one past its previous position. I update its last index and track the best window length. Each character is processed once, so it is O(n) time and O(alphabet) space.",
      explanation: "One of the most asked problems.",
      commonWrongAnswers: ["Check every substring: O(n³)."],
    },
    {
      id: "cs-problem-patterns-q03", tags: ["dynamic-programming"], difficulty: "core", kind: "concept",
      prompt: "How do you recognise and approach a dynamic programming problem?",
      expectedElements: ["overlapping subproblems", "optimal substructure", "define state in words", "transition and base cases", "top-down memo vs bottom-up table", "optimise space"],
      modelAnswer: "Cues are questions like count the ways, minimum cost or longest sequence, where the brute-force recursion solves the same sub-question many times and the best answer is built from best sub-answers. I define the state in words, such as 'dp[i] is the fewest coins for amount i', write the transition from smaller states and the base cases, then implement either top-down with memoisation or bottom-up with a table. Often I can then keep only the last row or two to cut memory.",
      explanation: "State in words is the habit that makes DP manageable.",
      commonWrongAnswers: ["DP is when you use a 2D array."],
    },
    {
      id: "cs-problem-patterns-q04", tags: ["two-pointers"], difficulty: "core", kind: "implementation",
      prompt: "Container with most water: given heights, pick two lines that hold the most water.",
      expectedElements: ["two pointers at both ends", "area = min height × width", "move the shorter line inward", "why it is safe", "O(n)"],
      modelAnswer: "Start pointers at both ends and compute the area: the shorter height times the distance. Then move the pointer at the shorter line inward, because keeping it can never produce a bigger area: the width only shrinks and the height is capped by that short line. Track the maximum. Each pointer moves at most n times: O(n).",
      explanation: "The justification for moving the shorter side is what is tested.",
      commonWrongAnswers: ["Try every pair."],
    },
    {
      id: "cs-problem-patterns-q05", tags: ["greedy"], difficulty: "core", kind: "concept",
      prompt: "When is a greedy algorithm correct? Give an example where it is and one where it is not.",
      expectedElements: ["greedy choice property", "proof or exchange argument", "correct: interval scheduling by earliest end", "incorrect: coin change with odd coins"],
      modelAnswer: "Greedy is correct when taking the locally best choice never prevents an optimal overall solution, which you show with an exchange argument. Choosing meetings that end earliest to fit the most meetings is correct: any optimal schedule can swap in the earliest-ending meeting without losing anything. Coin change with coins 1, 3, 4 for 6 is a failure: greedy takes 4, 1, 1, but 3, 3 is better, so you need DP.",
      explanation: "A counterexample is the strongest evidence.",
      commonWrongAnswers: ["Greedy always works if it is fast."],
    },
    {
      id: "cs-problem-patterns-q06", tags: ["prefix-sums"], difficulty: "advanced", kind: "implementation",
      prompt: "Count the subarrays whose sum equals k.",
      expectedElements: ["prefix sums", "map of prefix sum counts", "count += seen[prefix - k]", "handles negatives", "O(n)"],
      modelAnswer: "Keep a running prefix sum and a map counting how often each prefix sum has occurred, starting with {0: 1}. At each index, any earlier prefix equal to current minus k marks a subarray ending here that sums to k, so add map.get(prefix - k) to the count, then record the current prefix. It is O(n) and works with negative numbers, where a sliding window would not.",
      explanation: "Combining prefix sums with hashing is a senior-level pattern.",
      commonWrongAnswers: ["Sliding window (fails with negatives)."],
    },
    {
      id: "cs-problem-patterns-q07", tags: ["backtracking"], difficulty: "core", kind: "implementation",
      prompt: "Generate all subsets of a set of distinct numbers.",
      expectedElements: ["backtracking include/exclude", "or iterative doubling", "2^n subsets", "O(n · 2^n)"],
      modelAnswer: "With backtracking, at each index I make two choices, include the number or skip it, recursing to the next index, and record the current subset when I reach the end. Iteratively, I start with [[]] and for each number append a copy of every existing subset with that number added. There are 2^n subsets, so the work is O(n · 2^n), which is unavoidable because that is the output size.",
      explanation: "Noting the output-size lower bound is a nice touch.",
      commonWrongAnswers: ["Nested loops over all pairs."],
    },
    {
      id: "cs-problem-patterns-q08", tags: ["communication"], difficulty: "foundation", kind: "behavioral",
      prompt: "You are stuck halfway through an interview problem. What do you do?",
      expectedElements: ["say so and narrate thinking", "return to the example", "simplify the problem", "consider patterns / data structures", "accept hints gracefully"],
      modelAnswer: "I say out loud where I am stuck and what I have tried, because the interviewer can only help with thinking they can hear. I go back to my small example and solve it by hand, noticing what I do naturally. I try a simpler version of the problem, run through my pattern list for one that fits, and if the interviewer offers a hint I take it, thank them and build on it. A brute-force solution that works is better than a perfect idea that is not finished.",
      explanation: "Interviewers often care most about this behaviour.",
      commonWrongAnswers: ["Go silent and keep trying."],
    },
  ],
  references: [
    { title: "MIT 6.006 Introduction to Algorithms (OpenCourseWare): dynamic programming lectures", url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/", kind: "course" },
    { title: "Introduction to Algorithms (CLRS), ch. 14 and 15: Dynamic Programming and Greedy Algorithms", url: "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/", kind: "book" },
    { title: "Tech Interview Handbook: Algorithms study cheatsheet", url: "https://www.techinterviewhandbook.org/algorithms/study-cheatsheet/", kind: "article" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 3, assessmentScore: 0.75, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Two pointers, sliding windows, dynamic programming and greedy reasoning are permanent tools."],
  versionSpecific: [],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
