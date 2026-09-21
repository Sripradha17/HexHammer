import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "l3-s09",
  level: 3,
  order: 9,
  title: "Terminal and Linux basics",

  look: `The terminal is a window where you talk to your computer by TYPING instead of clicking. It looks old-fashioned, but it is fast, and almost every developer tool (Git, npm, Docker, servers) lives there.

Think of it as texting your computer. You send a short command, it answers.

The commands to learn first:

  pwd                     print working directory: "where am I right now?"
  ls                      list the files here            ls -la  = show everything, with details
  cd projects             change directory: walk into the folder called projects
  cd ..                   walk back UP one folder
  mkdir notes             make a new folder called notes
  touch a.txt             make an empty file called a.txt
  cat a.txt               show what is inside a.txt
  grep "todo" a.txt       show only the lines containing the word todo
  rm a.txt                remove (delete) a file. There is NO recycle bin!
  ls | wc -l              the pipe |: send the output of one command into the next (here: count the files)

Tip: press the Tab key to auto-complete names, and the Up arrow to bring back the last command.

Windows users: Git Bash (it comes with Git) understands all of these. PowerShell has different names for some of them.

This is a GUIDED-LOCAL strike: open a terminal on your computer and try every command in a NEW empty folder.`,

  type: `Fill in the answers object with the command for each job:
  whereAmI        print the folder I am in
  listAll         list everything (including hidden files), with details
  goUp            move up one folder
  makeFolder      make a folder called projects
  makeFile        make an empty file called notes.txt
  showFile        show the contents of notes.txt
  findTodo        show only the lines of notes.txt that contain todo
  countFiles      count how many files are in the current folder, using a pipe
  deleteFile      delete notes.txt`,

  break: `Try every command for real. In your terminal:
  mkdir terminal-play
  cd terminal-play
Then run each of your answers, in order, and look at what happens. Put a few lines in notes.txt with:  echo "todo: buy milk" >> notes.txt
Break it on purpose: run cat on a file that does not exist. Read the error. Errors in the terminal are just short, honest messages, and reading them is a superpower.
Careful with rm: it deletes for good. Only ever use it on files you made for this practice.`,

  say: `In one sentence: what is the terminal, and what is one command you now know how to use?`,

  starterCode: `// Strike 9: terminal and Linux basics. Type the command for each job.

const answers = {
  whereAmI: "",
  listAll: "",
  goUp: "",
  makeFolder: "",
  makeFile: "",
  showFile: "",
  findTodo: "",
  countFiles: "",
  deleteFile: "",
};
`,

  tests: `function said(text) {
  return String(text).trim().split(" ").filter(Boolean).join(" ");
}
function need(what, actual, accepted) {
  if (!accepted.includes(said(actual))) {
    throw new Error(what + ' (you wrote: "' + said(actual) + '")');
  }
}

test("whereAmI", () => {
  need("Print the folder I am in", answers.whereAmI, ["pwd"]);
});
test("listAll", () => {
  need("List everything, with details (ls with -la)", answers.listAll, ["ls -la", "ls -al", "ls -a -l", "ls -l -a"]);
});
test("goUp", () => {
  need("Move up one folder", answers.goUp, ["cd .."]);
});
test("makeFolder", () => {
  need("Make a folder called projects", answers.makeFolder, ["mkdir projects"]);
});
test("makeFile", () => {
  need("Make an empty file called notes.txt", answers.makeFile, ["touch notes.txt"]);
});
test("showFile", () => {
  need("Show what is inside notes.txt", answers.showFile, ["cat notes.txt"]);
});
test("findTodo", () => {
  need("Show only the lines of notes.txt that contain todo", answers.findTodo, [
    'grep "todo" notes.txt',
    "grep 'todo' notes.txt",
    "grep todo notes.txt",
  ]);
});
test("countFiles", () => {
  need("Count the files: list them, pipe (|) into wc -l", answers.countFiles, ["ls | wc -l", "ls|wc -l"]);
});
test("deleteFile", () => {
  need("Delete notes.txt", answers.deleteFile, ["rm notes.txt"]);
});
`,

  hints: [
    "Short names: pwd, ls, cd, mkdir, touch, cat, grep, rm. Most take the name of a file or folder after them.",
    "ls -la: the l means long details and the a means all (hidden files too). cd .. means the folder above (two dots).",
    "For counting: ls lists the files, the | pipe passes that list to the next command, and wc -l counts lines. So: ls | wc -l",
  ],

  solution: `=== CODE ===
const answers = {
  whereAmI: "pwd",
  listAll: "ls -la",
  goUp: "cd ..",
  makeFolder: "mkdir projects",
  makeFile: "touch notes.txt",
  showFile: "cat notes.txt",
  findTodo: 'grep "todo" notes.txt',
  countFiles: "ls | wc -l",
  deleteFile: "rm notes.txt",
};
=== LINE BY LINE ===
pwd prints the full path of the folder you are standing in. ls shows what is inside it. The -l flag means long details and -a means include hidden files (their names start with a dot).
cd .. : two dots always mean "the parent folder", the one above.
mkdir makes a directory (folder). touch makes an empty file. cat prints a file (it is short for concatenate, but everyone just uses it to read files).
grep "todo" notes.txt searches inside a file and prints only the matching lines.
The pipe | connects the output of one command to the input of the next: ls lists the files, wc -l counts the lines of that list, so you get the number of files.
rm removes a file for good, so use it carefully.`,
};
