// All the mascot pictures in one place, so pages never hard-code file names.
// The files live in src/assets/mascots (resized to about 600px wide).
import astronaut from "./assets/mascots/astronaut.jpg";
import beaverClimb from "./assets/mascots/beaver-climb.jpg";
import beaverLaptop from "./assets/mascots/beaver-laptop.jpg";
import beaverPuzzle from "./assets/mascots/beaver-puzzle.jpg";
import beaverThumbs from "./assets/mascots/beaver-thumbs.jpg";
import browser from "./assets/mascots/browser.jpg";
import bulb from "./assets/mascots/bulb.jpg";
import hammer from "./assets/mascots/hammer.jpg";
import flashcards from "./assets/mascots/flashcards.jpg";
import headphones from "./assets/mascots/headphones.jpg";
import interviewTable from "./assets/mascots/interview-table.jpg";
import laptopStar from "./assets/mascots/laptop-star.jpg";
import octopus from "./assets/mascots/octopus.jpg";
import penguinLaunch from "./assets/mascots/penguin-launch.jpg";
import plant from "./assets/mascots/plant.jpg";
import redPanda from "./assets/mascots/red-panda.jpg";
import frog from "./assets/mascots/frog.jpg";
import foxDebug from "./assets/mascots/fox-debug.jpg";
import robotBook from "./assets/mascots/robot-book.jpg";
import robot from "./assets/mascots/robot.jpg";
import rocket from "./assets/mascots/rocket.jpg";
import toolbox from "./assets/mascots/toolbox.jpg";
import whiteboard from "./assets/mascots/whiteboard.jpg";

// One picture per level, chosen to match the level's topic.
export const levelArt: Record<number, string> = {
  1: plant, // a seed growing: the very beginning
  2: robot, // built from stacked parts: lists and loops
  3: toolbox, // tiny tools
  4: browser, // web pages
  5: headphones, // a terminal listening for requests: servers
  6: beaverLaptop, // building components
  7: rocket, // launching to the cloud
  8: astronaut, // AI and the capstone
};

// Pictures for special places in the app.
export const art = {
  logo: hammer, // the Hexhammer hammer
  hero: beaverClimb, // climbing the levels
  hint: bulb, // "need a nudge?"
  celebrate: laptopStar, // all tests passed
  interview: headphones, // say it out loud
  flashcards, // the Say-It flashcards card
  whiteboard, // the Solve-It card (talk while you write)
  interviewTable, // the STAR story card (a behavioral interview)
  puzzle: beaverPuzzle, // the Rebuild Lab card
  thumbs: beaverThumbs, // a finished strike
  look: robotBook, // the Look card: reading a tiny example
  type: redPanda, // the Type card: typing by hand
  breakIt: foxDebug, // the Break card: taking it apart to see how it works
  launch: penguinLaunch, // the Test results card: press the button, see what happens
  loading: frog, // waiting for the server
};

// One picture per track on the Level Map.
export const trackArt: Record<string, string> = {
  dsa: octopus, // many things at once: data structures and algorithms
  professional: beaverPuzzle, // fitting the pieces together with other people
  interview: interviewTable,
};
