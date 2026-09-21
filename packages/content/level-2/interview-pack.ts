import type { InterviewPack } from "../types";

// Level 2 Interview Pack: Say-It cards, one Solve-It problem (tests only, NO solution), one STAR prompt.
export const interviewPack: InterviewPack = {
  level: 2,

  sayIt: [
    {
      question:
        "What do map, filter and reduce do, and which one changes the original array?",
      answer:
        "map builds a new array by changing every item. filter builds a new array with only the items that pass a test. reduce squashes the whole array into one value. None of them change the original array: they all return something new.",
    },
    {
      question:
        "Why is it safer to copy an array or object (with spread) than to change it in place?",
      answer:
        "Other parts of the program may be holding the same array or object. If you change it in place, they see a surprise change. A copy, like [...list, item] or { ...a, ...b }, leaves the original alone, so bugs are easier to find.",
    },
    {
      question: "What is a closure? Give one use.",
      answer:
        "A closure is a function that remembers the variables from the place where it was created, even after that place has finished running. Uses: private data (a counter or bank balance nobody else can touch), and functions that are set up once and used later, like makeAdder(5).",
    },
    {
      question: "What does this point to inside a method, and how can it get lost?",
      answer:
        "Inside a method, this is the object before the dot when the method is called, so dog.speak() has this as dog. If you pull the method out and call it alone, this is lost. Fix it with bind, or use an arrow function, which uses the this of the surrounding code.",
    },
    {
      question:
        "What is recursion, and what two things must every recursive function have?",
      answer:
        "Recursion is a function calling itself on a smaller version of the problem. It needs a base case (a simple answer where it stops) and a step that moves toward that base case. Without a base case it never stops and you get a stack overflow.",
    },
    {
      question:
        "Explain try, catch, finally and throw. When would you make a custom error?",
      answer:
        "throw raises an error. try runs risky code. catch runs only if the try block threw, and receives the error. finally runs either way (good for cleanup). A custom error (a class that extends Error) lets callers tell your kinds of failure apart, for example ValidationError versus a network error.",
    },
    {
      question: "What is Big-O? Name O(1), O(n) and O(n squared) with an example each.",
      answer:
        "Big-O describes how the work grows as the input grows. O(1): reading array[0] or looking up a hash map key. O(n): one loop over all items. O(n squared): a loop inside a loop, like comparing every pair. As input grows, O(n squared) gets slow very fast.",
    },
    {
      question: "Why is a hash map lookup fast, and what is a classic use?",
      answer:
        "A hash map turns the key into a position in memory, so it jumps straight to the value instead of searching. That makes get and set O(1) on average. Classic uses: counting things, remembering what you have seen (like the Two Sum problem), and grouping items by a key.",
    },
    {
      question: "What is the difference between a stack and a queue? Where is each used?",
      answer:
        "A stack is last in, first out: you add and remove at the same end, like a pile of pancakes. A queue is first in, first out: you add at the back and remove from the front, like a line of people. Stacks power undo, the call stack and bracket matching. Queues power task lists, job queues and breadth-first search.",
    },
    {
      question: "What does class ... extends do, and what are prototypes?",
      answer:
        "extends makes a new class that starts with everything its parent class has, and lets you add or override methods. Under the hood, JavaScript objects have a prototype: if an object does not have a method, it asks its prototype, then that one's prototype, and so on up the chain. Classes are a friendlier way to write that.",
    },
  ],

  solveIt: {
    title: "Word counter",
    minutes: 30,
    prompt: `Write three functions that work on text. A "word" is a run of letters a to z, ignoring upper or lower case. Punctuation and spaces separate words.

1. wordCounts(text) returns an object that counts each word, in lowercase.
   wordCounts("The cat and the hat.") is { the: 2, cat: 1, and: 1, hat: 1 }.
   wordCounts("Hello, hello!!") is { hello: 2 }. Empty text gives {}.

2. mostCommonWord(text) returns the word that appears the most.
   If two words tie, return the one that appeared FIRST in the text.
   If there are no words, return "" (empty text).

3. isAnagram(a, b) returns true if the two texts use exactly the same letters, ignoring case, spaces and punctuation.
   "Listen" and "Silent" are anagrams. "abc" and "abd" are not.

Talk out loud as you work: say your plan before you type, then say what each part is doing. Start a 30-minute timer.`,
    starterCode: `// Solve-It: word counter.

function wordCounts(text) {
  // your code here
}

function mostCommonWord(text) {
  // your code here
}

function isAnagram(a, b) {
  // your code here
}
`,
    tests: `test("wordCounts counts words in lowercase", () => {
  expect(wordCounts("The cat and the hat.")).toEqual({ the: 2, cat: 1, and: 1, hat: 1 });
});

test("wordCounts ignores case and punctuation", () => {
  expect(wordCounts("Hello, hello!!")).toEqual({ hello: 2 });
});

test("wordCounts of empty text is an empty object", () => {
  expect(wordCounts("")).toEqual({});
  expect(wordCounts("  ...  ")).toEqual({});
});

test("mostCommonWord finds the winner", () => {
  expect(mostCommonWord("to be or not to be to")).toBe("to");
});

test("mostCommonWord breaks ties by first appearance", () => {
  expect(mostCommonWord("a b b c c")).toBe("b");
  expect(mostCommonWord("Zoo apple zoo Apple")).toBe("zoo");
});

test("mostCommonWord of no words is an empty string", () => {
  expect(mostCommonWord("")).toBe("");
  expect(mostCommonWord("123 !!!")).toBe("");
});

test("isAnagram says yes for real anagrams", () => {
  expect(isAnagram("Listen", "Silent")).toBe(true);
  expect(isAnagram("a gentleman", "elegant man")).toBe(true);
});

test("isAnagram says no for different letters", () => {
  expect(isAnagram("abc", "abd")).toBe(false);
  expect(isAnagram("aab", "ab")).toBe(false);
});
`,
  },

  star: {
    prompt:
      "Tell me about a bug that was hard to find. How did you track it down, and what did you change so it would not happen again?",
    tips: [
      "S (Situation): what was the system, and what was going wrong for users? One or two sentences.",
      "T (Task): what was YOUR part? Were you the one asked to find it?",
      "A (Action): the steps YOU took. What did you try first? How did you narrow it down (logs, a smaller example, checking one thing at a time)?",
      "R (Result): what was the cause, how did you fix it, and what did you add so it stays fixed (a test, a check, a note)?",
      "Interviewers love hearing your METHOD, not just the answer. Practice out loud for about two minutes, and write it in your notes file by hand.",
    ],
  },
};
