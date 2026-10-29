// Domain 1: Computer Science and Programming Fundamentals.
import { defineDomain } from "../outline";
import { csBigO } from "../topics/cs-big-o";
import { csBinaryEncoding } from "../topics/cs-binary-encoding";
import { csValuesTypes } from "../topics/cs-values-types";
import { csControlFlow } from "../topics/cs-control-flow";
import { csFunctionsScope } from "../topics/cs-functions-scope";
import { csReferencesMutability } from "../topics/cs-references-mutability";
import { csErrors } from "../topics/cs-errors";
import { csHardwareOs } from "../topics/cs-hardware-os";
import { csCompileInterpret } from "../topics/cs-compile-interpret";
import { csModulesPackages } from "../topics/cs-modules-packages";
import { csOopClasses } from "../topics/cs-oop-classes";
import { csStringsDataFormats } from "../topics/cs-strings-data-formats";
import { csCallStackRecursion } from "../topics/cs-call-stack-recursion";
import { csMemoryGc } from "../topics/cs-memory-gc";
import { csConcurrencyAsync } from "../topics/cs-concurrency-async";
import { csSearchSort } from "../topics/cs-search-sort";
import { csHashing } from "../topics/cs-hashing";
import { csLinearStructures } from "../topics/cs-linear-structures";
import { csTreesGraphs } from "../topics/cs-trees-graphs";
import { csHeapsTries } from "../topics/cs-heaps-tries";
import { csProblemPatterns } from "../topics/cs-problem-patterns";
import { csDebugging } from "../topics/cs-debugging";
import { csShellProcesses } from "../topics/cs-shell-processes";
import { csGit } from "../topics/cs-git";

export const d01 = defineDomain(
  {
    id: "cs",
    number: 1,
    title: "Computer Science & Programming Fundamentals",
    short: "Foundations",
    tagline: "How a computer turns your text into running work, and how to make that work small.",
    story:
      "Every bug you will ever chase lives on top of these ideas: bits, values, references, the call stack, and how work grows. Re-learning them is the fastest way to feel fluent again.",
    hue: 28,
    col: 0,
    row: 0,
    unlockedBy: [],
  },
  [
    {
      id: "cs-machine",
      title: "How computers run code",
      summary: "Hardware, operating systems, bits, and the journey from source code to a running process.",
      topics: [
        csHardwareOs,
        csBinaryEncoding,
        csCompileInterpret,
      ],
    },
    {
      id: "cs-language",
      title: "Language building blocks",
      summary: "Values, types, control flow, functions, references and errors.",
      topics: [
        csValuesTypes,
        csControlFlow,
        csFunctionsScope,
        csReferencesMutability,
        csErrors,
        csModulesPackages,
        csOopClasses,
        csStringsDataFormats,
      ],
    },
    {
      id: "cs-execution",
      title: "How code executes",
      summary: "The call stack, recursion, memory, garbage collection and concurrency.",
      topics: [
        csCallStackRecursion,
        csMemoryGc,
        csConcurrencyAsync,
      ],
    },
    {
      id: "cs-algorithms",
      title: "Algorithms and data structures",
      summary: "Complexity, searching, sorting, hashing and the classic structures interviewers love.",
      topics: [
        csBigO,
        csSearchSort,
        csHashing,
        csLinearStructures,
        csTreesGraphs,
        csHeapsTries,
        csProblemPatterns,
      ],
    },
    {
      id: "cs-tools",
      title: "Developer tools",
      summary: "Debugging, the shell, processes and Git.",
      topics: [
        csDebugging,
        csShellProcesses,
        csGit,
      ],
    },
  ],
);
