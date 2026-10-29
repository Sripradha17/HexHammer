// Topic: The shell, files and processes. A COMPLETE topic (all 18 parts).
import type { Topic } from "../types";
import { ATLAS_V1_DATE, DEFAULT_REVIEW } from "../outline";

export const csShellProcesses: Topic = {
  id: "cs-shell-processes",
  domainId: "",
  moduleId: "",
  title: "The shell, files and processes",
  stage: "complete",
  difficulty: "foundation",
  learningObjectives: [
    "Navigate and manipulate files from a terminal with confidence.",
    "Explain processes, exit codes, stdin, stdout, stderr and pipes.",
    "Use environment variables and understand how programs receive configuration.",
  ],
  prerequisites: [],
  subtopics: ["Paths: absolute and relative", "Everyday commands", "Processes and PIDs", "stdin, stdout, stderr", "Pipes and redirection", "Exit codes", "Environment variables and PATH"],
  strikeIds: ["l3-s09"],

  story:
    "A CI pipeline reports green while the tests actually failed, because the test command's failure was piped into another command that succeeded. A deploy script works on one laptop and not another because PATH points to a different Node version. A server crashes on start with no error because it logged to stderr, which nobody was reading. The terminal is the cockpit of a developer's machine; knowing its few core ideas removes a whole class of mysterious problems.",
  mentalModel: {
    plain:
      "The shell is a program that reads your commands and starts other programs (processes). Each process gets three streams: stdin (input), stdout (normal output) and stderr (errors). A pipe connects one process's stdout to the next one's stdin. When a process ends it returns an exit code: 0 means success, anything else means failure. Environment variables are named settings passed from parent process to child.",
    analogy:
      "A kitchen pass-through. Each cook (process) takes ingredients in one hatch (stdin), sends finished plates out another (stdout), and shouts problems through a third (stderr). A pipe puts one cook's output hatch against the next cook's input hatch. At the end, each cook raises a thumb up (exit code 0) or down (non-zero).",
    analogyLimit:
      "In a pipeline all cooks work at the same time, passing items as soon as they are ready, not one after another.",
  },
  lessonSections: [
    {
      heading: "1. Where am I? Paths",
      body:
        "`pwd` prints the current directory. `ls` lists files, `cd folder` moves in, `cd ..` moves up.\n\nAn absolute path starts at the root (`/home/ada/project` or `C:\\Users\\ada`). A relative path starts from where you are (`src/index.ts`, `../docs`). `~` is your home folder. Most 'file not found' errors are a relative path run from a different folder.",
    },
    {
      heading: "2. Everyday commands",
      body:
        "`mkdir` makes a folder, `touch` creates an empty file, `cp` copies, `mv` moves or renames, `rm` deletes (no recycle bin: be careful with `rm -rf`).\n\n`cat` prints a file, `less` pages through it, `head`/`tail` show the start or end (`tail -f` follows a growing log). `grep pattern file` finds lines; `find . -name \"*.ts\"` finds files.",
    },
    {
      heading: "3. Three streams and redirection",
      body:
        "stdout is normal output; stderr is for errors and diagnostics, so they can be separated.\n\n`> file` writes stdout to a file (overwriting), `>> file` appends, `2> errors.log` sends stderr to a file, `2>&1` merges stderr into stdout. `< file` feeds a file to stdin.",
    },
    {
      heading: "4. Pipes: small tools joined together",
      body:
        "`cat access.log | grep \" 500 \" | wc -l` counts server errors: each program does one job and passes its output on.\n\nIn a pipeline, the shell normally reports only the LAST command's exit code, so `npm test | tee out.log` can look successful even if the tests failed. In bash, `set -o pipefail` makes the whole pipeline fail if any part fails.",
    },
    {
      heading: "5. Exit codes",
      body:
        "Every process ends with a number: 0 is success, non-zero is failure (1 is a general error; 127 is 'command not found'; 130 is Ctrl+C). `echo $?` shows the last one.\n\n`a && b` runs b only if a succeeded; `a || b` runs b only if a failed. CI systems, Docker health checks and scripts all decide what to do from exit codes, so your own programs should exit non-zero on failure (process.exit(1) or an uncaught error).",
    },
    {
      heading: "6. Environment variables and PATH",
      body:
        "Environment variables are key-value settings a process inherits from the one that started it: `export PORT=3000` (bash), then the app reads `process.env.PORT`. They are how apps get configuration and secrets without hard-coding them.\n\nPATH is a list of folders the shell searches for commands. `which node` (or `where node` on Windows) shows which one wins. Wrong PATH order is the classic 'wrong version' bug.",
    },
  ],
  visualizationType: "none",
  visualNote:
    "Shell behaviour is learned at a real terminal; the worked example shows a real session's commands and output, and the strike runs commands in a safe sandbox.",
  codeExamples: [
    {
      title: "Streams, pipes and exit codes in one session",
      language: "bash",
      code: `$ printf "200\\n500\\n200\\n404\\n500\\n" > statuses.txt
$ grep 500 statuses.txt | wc -l
2
$ grep 999 statuses.txt; echo "exit code: $?"
exit code: 1
$ ls missing-file 2> errors.log; echo "exit code: $?"
exit code: 2
$ grep -c 200 statuses.txt && echo "found some 200s"
2
found some 200s`,
      expectedOutput: `2
exit code: 1
exit code: 2
2
found some 200s`,
      steps: [
        "printf writes five status codes into a file using > (redirect stdout to a file).",
        "grep finds the lines containing 500 and pipes them to wc -l, which counts lines: 2.",
        "grep finds nothing for 999, prints nothing, and exits with 1: 'no match' is a failure as far as the shell is concerned.",
        "ls fails on a missing file. Its error message goes to stderr, which 2> sends into errors.log, so nothing appears on screen; the exit code is 2.",
        "grep -c counts matching lines (2) and succeeds, so && runs the echo.",
      ],
    },
  ],
  practicalApplication:
    "In CI, every step's exit code decides pass or fail, so scripts should use `set -euo pipefail` in bash and programs should exit non-zero on failure. Logs go to stdout and stderr in containers, where the platform collects them. Configuration comes from environment variables (twelve-factor apps), never hard-coded secrets. Daily, pipes plus grep, sort, uniq and wc answer questions about logs in seconds.",
  commonMistakes: [
    {
      mistake: "Running a script from the wrong directory with relative paths.",
      symptom: "ENOENT: no such file or directory, but only when started from elsewhere.",
      fix: "Resolve paths from the script's own location (import.meta.dirname or __dirname), not the current directory.",
    },
    {
      mistake: "Piping a test command and trusting the result.",
      symptom: "CI is green but the tests failed.",
      fix: "Use set -o pipefail, or avoid piping critical commands.",
    },
    {
      mistake: "Programs that print errors but exit 0.",
      symptom: "Scripts and CI carry on as if everything worked.",
      fix: "Exit with a non-zero code on failure; let unhandled errors crash the process.",
    },
    {
      mistake: "Committing secrets instead of using environment variables.",
      symptom: "API keys appear in Git history.",
      fix: "Read secrets from the environment (and a git-ignored .env file locally); rotate any key that was committed.",
    },
  ],
  misconceptions: [
    { myth: "Exit code 1 always means a crash.", truth: "Non-zero means 'did not succeed' as defined by that program: grep exits 1 simply when nothing matches." },
    { myth: "stderr is only for errors.", truth: "It is for diagnostics in general (progress, warnings), so stdout stays clean for data that may be piped." },
    { myth: "Setting an environment variable in one terminal sets it everywhere.", truth: "It only affects that shell and the processes it starts afterwards." },
  ],
  exercises: [
    { kind: "strike", strikeId: "l3-s09", why: "Use the shell by hand: paths, files, pipes and exit codes." },
    {
      kind: "predict",
      question: {
        id: "cs-shell-processes-p1",
        prompt: "In bash without pipefail, `npm test | tee results.txt` runs and the tests fail. What exit code does the whole line report?",
        choices: ["The tests' non-zero code", "0, from tee", "127", "It depends on the number of failures"],
        answerIndex: 1,
        explanation: "By default a pipeline reports the exit code of its LAST command, tee, which succeeded. set -o pipefail fixes this.",
        objective: 1,
      },
    },
    {
      kind: "debug",
      question: {
        id: "cs-shell-processes-d1",
        prompt: "`node --version` prints v16 but the project needs v20, which is installed. What is the most likely cause?",
        choices: ["Node 20 is broken", "PATH lists the folder with Node 16 before the folder with Node 20", "The project is wrong", "Environment variables cannot affect Node"],
        answerIndex: 1,
        explanation: "The shell uses the first matching command found in PATH. Check with `which node` (or `where node`) and fix PATH or use a version manager.",
        objective: 2,
      },
    },
  ],
  knowledgeChecks: [
    {
      id: "cs-shell-processes-k1",
      prompt: "Which exit code means success?",
      choices: ["1", "0", "-1", "200"],
      answerIndex: 1,
      explanation: "By convention, 0 is success and any other number is a kind of failure.",
      objective: 1,
    },
    {
      id: "cs-shell-processes-k2",
      prompt: "What does `cmd > out.txt 2>&1` do?",
      choices: ["Sends only errors to out.txt", "Sends both normal output and errors to out.txt", "Runs cmd twice", "Deletes out.txt"],
      answerIndex: 1,
      explanation: "> sends stdout to the file; 2>&1 sends stderr wherever stdout is going.",
      objective: 1,
    },
  ],
  project: {
    title: "Log Detective: a CLI that plays well with pipes",
    summary: "Write a small command-line tool that reads web server logs from stdin or a file, reports statistics to stdout, warnings to stderr, and uses correct exit codes, so it can be combined with other shell tools and used in CI.",
    type: "implementation",
    objectivesCovered: [0, 1, 2],
    requirements: [
      "Read log lines from a file argument or from stdin when piped.",
      "Print a summary (requests per status code, top 5 paths) to stdout; unparseable lines as warnings to stderr.",
      "Exit 0 when the error rate is under a threshold, 1 when above it, 2 on bad usage.",
      "Read the threshold from an environment variable with a command-line flag overriding it.",
    ],
    acceptanceCriteria: [
      "A test runs the CLI as a child process with piped input and checks stdout, stderr and the exit code separately.",
      "`cat access.log | log-detective | grep 500` works.",
      "A missing file gives a clear message on stderr and exit code 2.",
    ],
    technologies: ["Node.js", "process.stdin/stdout/stderr", "child_process (in tests)", "Vitest"],
    milestones: [
      { title: "Input", done_when: "Reads from a file or stdin." },
      { title: "Output", done_when: "Summary on stdout, warnings on stderr." },
      { title: "Exit codes", done_when: "0, 1 and 2 are returned in the right cases, with tests." },
      { title: "Config", done_when: "Env variable and flag both work, flag wins." },
    ],
    testIdeas: ["Empty input", "A 1-million-line file streamed without loading it all", "Malformed lines"],
    stretchGoals: ["Output JSON with --json for other tools", "Follow a growing file like tail -f"],
  },
  assessment: {
    passingScore: 0.75,
    questions: [
      {
        id: "cs-shell-processes-a1",
        prompt: "You are in /home/ada/project/src. Where does `cd ../docs` take you?",
        choices: ["/home/ada/project/src/docs", "/home/ada/project/docs", "/docs", "/home/ada/docs"],
        answerIndex: 1,
        explanation: ".. goes up one level to /home/ada/project, then into docs.",
        objective: 0,
      },
      {
        id: "cs-shell-processes-a2",
        prompt: "What does a pipe (|) connect?",
        choices: ["Two files", "The stdout of one command to the stdin of the next", "Two terminals", "stderr to stdout"],
        answerIndex: 1,
        explanation: "Each command's normal output becomes the next one's input.",
        objective: 1,
      },
      {
        id: "cs-shell-processes-a3",
        prompt: "In `npm run build && npm run deploy`, when does deploy run?",
        choices: ["Always", "Only if build exits with 0", "Only if build fails", "At the same time as build"],
        answerIndex: 1,
        explanation: "&& runs the next command only after a successful (exit 0) previous command.",
        objective: 1,
      },
      {
        id: "cs-shell-processes-a4",
        prompt: "How should an app get its database password in production?",
        choices: ["Hard-coded in the source", "From an environment variable or secret store at runtime", "From a comment in the README", "Typed in by a developer on every start"],
        answerIndex: 1,
        explanation: "Configuration and secrets belong in the environment (or a secret manager), not in code.",
        objective: 2,
      },
    ],
  },
  interviewQuestions: [
    {
      id: "cs-shell-processes-q01", tags: ["shell", "streams"], difficulty: "foundation", kind: "concept",
      prompt: "Explain stdin, stdout and stderr.",
      expectedElements: ["three standard streams", "stdin input, stdout normal output, stderr diagnostics", "can be redirected separately", "why separate: pipe data, keep errors visible"],
      modelAnswer: "Every process starts with three streams: stdin to read input, stdout for its normal output, and stderr for errors and diagnostics. Keeping them separate means you can pipe or save the real data from stdout while errors still appear on the screen or go to a different file, for example cmd > data.txt 2> errors.log.",
      explanation: "The 'why separate' part is the insight.",
      commonWrongAnswers: ["stderr is the same as stdout."],
    },
    {
      id: "cs-shell-processes-q02", tags: ["exit-codes", "ci"], difficulty: "foundation", kind: "concept",
      prompt: "Why do exit codes matter, especially in CI?",
      expectedElements: ["0 success, non-zero failure", "CI decides pass/fail from them", "scripts chain with && / ||", "pipefail", "programs must exit non-zero on failure"],
      modelAnswer: "Exit codes are how a process tells whoever started it whether it succeeded: 0 for success, non-zero for failure. CI marks a step failed based on them, scripts chain on them with && and ||, and orchestrators restart containers based on them. So programs must exit non-zero when they fail, and shell scripts should use set -euo pipefail so failures in the middle of pipelines are not hidden.",
      explanation: "Linking to CI correctness is the practical angle.",
      commonWrongAnswers: ["They are only for humans to read."],
    },
    {
      id: "cs-shell-processes-q03", tags: ["environment"], difficulty: "foundation", kind: "concept",
      prompt: "What are environment variables and how should apps use them?",
      expectedElements: ["key-value settings inherited from parent", "configuration per environment", "secrets not in code", "validate at startup", "twelve-factor"],
      modelAnswer: "Environment variables are key-value strings a process inherits from its parent. Apps use them for configuration that changes between environments, like ports, database URLs and API keys, so the same build runs in development, staging and production, which is the twelve-factor approach. I read and validate them once at startup, converting types, and fail fast with a clear message if a required one is missing.",
      explanation: "Validation at startup ties back to fail-fast.",
      commonWrongAnswers: ["They are global variables in JavaScript."],
    },
    {
      id: "cs-shell-processes-q04", tags: ["shell", "pipes"], difficulty: "core", kind: "implementation",
      prompt: "Using shell commands, how would you find the 5 IP addresses that made the most requests in an access log?",
      expectedElements: ["extract field (awk/cut)", "sort", "uniq -c", "sort -nr", "head -5"],
      modelAnswer: "Extract the IP field, count, then sort by count: awk '{print $1}' access.log | sort | uniq -c | sort -nr | head -5. awk prints the first column, sort groups identical IPs together so uniq -c can count them, sort -nr orders by count descending, and head keeps the top five.",
      explanation: "A classic practical interview question for backend roles.",
      commonWrongAnswers: ["Open the file in an editor and count."],
    },
    {
      id: "cs-shell-processes-q05", tags: ["processes", "signals"], difficulty: "core", kind: "concept",
      prompt: "What happens when you press Ctrl+C, and how should a server handle it?",
      expectedElements: ["SIGINT signal", "default terminates", "graceful shutdown: stop accepting, finish in-flight, close connections", "SIGTERM from orchestrators", "exit code"],
      modelAnswer: "Ctrl+C sends the SIGINT signal to the foreground process, which by default terminates it. Orchestrators like Docker and Kubernetes send SIGTERM before killing a container. A server should handle these for a graceful shutdown: stop accepting new connections, let in-flight requests finish within a timeout, close database connections, then exit. Otherwise deploys drop requests.",
      explanation: "Graceful shutdown is a real production concern.",
      commonWrongAnswers: ["It deletes the program."],
    },
    {
      id: "cs-shell-processes-q06", tags: ["path"], difficulty: "foundation", kind: "debugging",
      prompt: "A command works in your terminal but fails in a cron job or CI with 'command not found'. Why?",
      expectedElements: ["different PATH/environment", "non-interactive shell doesn't load profile", "use absolute paths or set PATH", "version managers"],
      modelAnswer: "The other environment has a different PATH, and often runs a non-interactive shell that does not load my profile, where tools like nvm add themselves to PATH. Fix it by using absolute paths, setting PATH explicitly in the job, or installing the tool in the CI image rather than relying on my personal shell setup.",
      explanation: "Very common real-world issue.",
      commonWrongAnswers: ["The command is broken in CI."],
    },
    {
      id: "cs-shell-processes-q07", tags: ["processes"], difficulty: "foundation", kind: "concept",
      prompt: "How do you find and stop a process that is holding port 3000?",
      expectedElements: ["find PID: lsof -i :3000 / netstat / Get-NetTCPConnection", "kill PID (SIGTERM) then -9 if needed", "check it is the right process"],
      modelAnswer: "Find which process is listening on the port, for example lsof -i :3000 on macOS or Linux, or Get-NetTCPConnection -LocalPort 3000 on Windows, which gives the PID. Check that it is the process I expect, then stop it with kill PID, which asks it to shut down gracefully, and only use kill -9 if it refuses.",
      explanation: "Checking before killing shows care.",
      commonWrongAnswers: ["Restart the computer."],
    },
    {
      id: "cs-shell-processes-q08", tags: ["shell", "safety"], difficulty: "core", kind: "concept",
      prompt: "What does `set -euo pipefail` do at the top of a bash script?",
      expectedElements: ["-e exit on error", "-u error on unset variables", "-o pipefail pipeline fails if any part fails", "safer scripts"],
      modelAnswer: "-e makes the script stop as soon as a command fails instead of carrying on. -u makes using an unset variable an error, which catches typos like rm -rf \"$DIRR/\" that would otherwise expand to rm -rf /. -o pipefail makes a pipeline fail if any command in it fails, not just the last. Together they make scripts fail loudly instead of doing damage silently.",
      explanation: "The unset-variable rm example is memorable.",
      commonWrongAnswers: ["It makes the script faster."],
    },
  ],
  references: [
    { title: "The Missing Semester of Your CS Education (MIT): The Shell", url: "https://missing.csail.mit.edu/2020/course-shell/", kind: "course" },
    { title: "GNU Bash manual", url: "https://www.gnu.org/software/bash/manual/bash.html", kind: "official-docs" },
    { title: "The Twelve-Factor App: Config", url: "https://12factor.net/config", kind: "article" },
  ],
  masteryCriteria: { lessonRead: true, exercisesRequired: 2, assessmentScore: 0.75, projectRequired: false, reviewsRequired: 2 },
  reviewRules: DEFAULT_REVIEW,
  timeless: ["Processes, standard streams, pipes, exit codes and environment variables have worked this way for decades."],
  versionSpecific: ["Exact commands differ between bash, zsh and PowerShell; the concepts are the same."],
  contentVersion: 1,
  lastReviewedAt: ATLAS_V1_DATE,
  reviewStatus: "reviewed",
};
