// THE REALM ART: every illustration the app shows, in one place, so pages never hard-code file
// names. The pictures are made from the Canva art in assets/webdesign/ by scripts/prepare-art.mjs
// (and the medallions by scripts/cut-art.mjs).
//
// What lives here:
//   OWL_POSES / OWL_FACES   Bram the owl: his cut-out poses and his faces
//   scene(n)                a painted scene by its picture number (big, or small for cards)
//   REGION_ART              for each of the 16 regions: its spot on the map, emblem and scene
//   sceneForPath(path)      which painted place each page of the app stands in
//   medalFor(achievementId) the painted medal for an achievement
import mapSrc from "../assets/realm/map.webp";
import mapWarm from "../assets/realm/map-warm.webp";
import mapCool from "../assets/realm/map-cool.webp";
import cloud1 from "../assets/realm/cloud-1.webp";
import cloud2 from "../assets/realm/cloud-2.webp";
import cloud3 from "../assets/realm/cloud-3.webp";
import cloud4 from "../assets/realm/cloud-4.webp";
import cloud5 from "../assets/realm/cloud-5.webp";
import mist from "../assets/realm/mist.webp";
import owlStand from "../assets/realm/owl-stand.webp";
import owlProud from "../assets/realm/owl-proud.webp";
import owlWalk from "../assets/realm/owl-walk.webp";
import owlThink from "../assets/realm/owl-think.webp";
import owlExplain from "../assets/realm/owl-explain.webp";
import owlPoint from "../assets/realm/owl-point.webp";
import owlCheer from "../assets/realm/owl-cheer.webp";
import owlWow from "../assets/realm/owl-wow.webp";
import owlOops from "../assets/realm/owl-oops.webp";
import owlFly from "../assets/realm/owl-fly.webp";
import owlBlink from "../assets/realm/owl-blink.webp";
import faceCalm from "../assets/realm/face-calm.webp";
import faceGrin from "../assets/realm/face-grin.webp";
import faceThink from "../assets/realm/face-think.webp";
import faceOops from "../assets/realm/face-oops.webp";
import faceProud from "../assets/realm/face-proud.webp";
import faceWow from "../assets/realm/face-wow.webp";
import iconProgramming from "../assets/realm/icon-programming.webp";
import iconFrontend from "../assets/realm/icon-frontend.webp";
import iconBackend from "../assets/realm/icon-backend.webp";
import iconDatabases from "../assets/realm/icon-databases.webp";
import iconAlgorithms from "../assets/realm/icon-algorithms.webp";
import iconApis from "../assets/realm/icon-apis.webp";
import iconTesting from "../assets/realm/icon-testing.webp";
import iconSecurity from "../assets/realm/icon-security.webp";
import iconNetworking from "../assets/realm/icon-networking.webp";
import iconCloud from "../assets/realm/icon-cloud.webp";
import iconSystemDesign from "../assets/realm/icon-system-design.webp";
import iconAi from "../assets/realm/icon-ai.webp";
import iconDebugging from "../assets/realm/icon-debugging.webp";
import iconMastery from "../assets/realm/icon-mastery.webp";
import iconAchievements from "../assets/realm/icon-achievements.webp";
import medalFirstMission from "../assets/realm/medal-first-mission.webp";
import medalSkillMastered from "../assets/realm/medal-skill-mastered.webp";
import medalProjectFinished from "../assets/realm/medal-project-finished.webp";
import medalHardChallenge from "../assets/realm/medal-hard-challenge.webp";
import medalNewRegion from "../assets/realm/medal-new-region.webp";

// ---------------------------------------------------------------- the world map

export const MAP = { src: mapSrc, warm: mapWarm, cool: mapCool, width: 1456, height: 1088 };
// The five clouds, each cut out on its own, so each can drift at its own speed and depth.
export const CLOUDS = [cloud1, cloud2, cloud3, cloud4, cloud5];
export const MIST = mist;

// ---------------------------------------------------------------- Bram the owl

// Each pose is a different painting. Bram changes pose by swapping paintings (never by stretching
// one), the way a flip-book works.
export type Pose = "stand" | "proud" | "walk" | "think" | "explain" | "point" | "cheer" | "wow" | "oops" | "fly";
export const OWL_POSES: Record<Pose, string> = {
  stand: owlStand,
  proud: owlProud,
  walk: owlWalk,
  think: owlThink,
  explain: owlExplain,
  point: owlPoint,
  cheer: owlCheer,
  wow: owlWow,
  oops: owlOops,
  fly: owlFly,
};
// How tall each painting is once the empty page around the owl is trimmed (in the original
// pictures' pixels; they were all painted at the same size). Showing every painting at the SAME
// zoom keeps Bram the same size: raised wings simply reach higher.
export const POSE_HEIGHT: Record<Pose, number> = {
  stand: 1505,
  proud: 1458,
  walk: 1305,
  think: 1394,
  explain: 1279,
  point: 1140,
  cheer: 1370,
  wow: 1265,
  oops: 1503,
  fly: 1496,
};
// The blink: a small patch of closed eyes from picture 57, laid exactly over the standing pose's
// eyes (the position is printed by scripts/prepare-art.mjs, in % of the standing cut-out).
export const BLINK = { src: owlBlink, left: 33.29, top: 20.53, width: 39.24, height: 9.97 };

export type Face = "calm" | "grin" | "think" | "oops" | "proud" | "wow";
export const OWL_FACES: Record<Face, string> = {
  calm: faceCalm,
  grin: faceGrin,
  think: faceThink,
  oops: faceOops,
  proud: faceProud,
  wow: faceWow,
};

// ---------------------------------------------------------------- painted scenes

// Every scene picture (2..46), found by Vite at build time. `scene(22)` is the big one for stages
// and backdrops; `scene(22, true)` is the small one for cards and panels.
const SCENE_FILES = import.meta.glob<string>("../assets/realm/scene-*.webp", { eager: true, import: "default" });
export function scene(n: number, small = false) {
  return SCENE_FILES[`../assets/realm/scene-${n}${small ? "-small" : ""}.webp`] ?? SCENE_FILES["../assets/realm/scene-21.webp"];
}

// The quest stages (picture numbers).
export const STAGE_SCENES = {
  village: 10, // Byteford's waterfall village
  bridge: 27, // the bridge to the market
  market: 22, // the night market, where Rosa's bakery is
  engine: 8, // the archive with the great crystal: the Rune Engine
};

// ---------------------------------------------------------------- the 16 regions

// x and y: where the town is on the world map, in % of the map picture. Every one of the 16 is a
// painted island on the map; the medallion sits at the foot of its building.
export interface RegionArt {
  x: number;
  y: number;
  icon: string;
  scene: number;
}
export const REGION_ART: Record<string, RegionArt> = {
  cs: { x: 17.5, y: 24, icon: iconProgramming, scene: 46 }, // the domed library
  adv: { x: 47, y: 17, icon: iconMastery, scene: 31 }, // the crystal mountains
  web: { x: 79, y: 27, icon: iconApis, scene: 45 }, // the harbor
  be: { x: 23.5, y: 43, icon: iconBackend, scene: 42 }, // the forge fortress
  fe: { x: 42, y: 40, icon: iconFrontend, scene: 44 }, // the crystal spires
  ds: { x: 64.5, y: 41, icon: iconSystemDesign, scene: 43 }, // the stained-glass palace
  db: { x: 86, y: 45, icon: iconDatabases, scene: 41 }, // the mine
  dist: { x: 7.5, y: 47, icon: iconNetworking, scene: 40 }, // the rope-bridge islands
  arch: { x: 21.5, y: 64, icon: iconAlgorithms, scene: 39 }, // the architect's tower
  test: { x: 43, y: 61, icon: iconTesting, scene: 38 }, // the hedge maze
  ops: { x: 61.5, y: 63, icon: iconCloud, scene: 37 }, // the sky port
  sec: { x: 86, y: 67, icon: iconSecurity, scene: 36 }, // the shield castle
  obs: { x: 11, y: 88, icon: iconDebugging, scene: 35 }, // the lighthouse
  ml: { x: 32, y: 88, icon: iconAi, scene: 34 }, // the purple tree
  ai: { x: 58, y: 89, icon: iconAi, scene: 33 }, // the golem workshop
  pt: { x: 79, y: 90, icon: iconAchievements, scene: 32 }, // the guild hall
};
export const regionArt = (id: string): RegionArt => REGION_ART[id] ?? REGION_ART.cs;

// ---------------------------------------------------------------- every page is a place

// Which painted place each page stands in. Home, World and quests draw their own (null).
export function sceneForPath(path: string): number | null {
  if (path === "/" || path.startsWith("/map")) return null;
  if (path.startsWith("/projects")) return 22; // the night market: build things
  if (path.startsWith("/interview")) return 11; // the amphitheater: speak and prove
  if (path.startsWith("/progress")) return 21; // the rune fountain courtyard
  if (path.startsWith("/reviews")) return 26; // the moon-pool garden: calm remembering
  if (path.startsWith("/portfolio")) return 29; // the cathedral plaza: your finished works
  if (path.startsWith("/glossary")) return 13; // the library observatory
  if (path.startsWith("/radar")) return 25; // the armillary observatory: what's new out there
  if (path.startsWith("/settings")) return 6; // the forest crossroads
  if (path.startsWith("/strike")) return 5; // the forge: typing by hand
  return 21;
}

// ---------------------------------------------------------------- achievements

// Five painted medals; every achievement the server knows gets the one closest in meaning.
const MEDALS: Record<string, string> = {
  "first-steps": medalFirstMission,
  "first-strike": medalFirstMission,
  "proved-it": medalFirstMission,
  "five-proofs": medalHardChallenge,
  "boss-battle": medalHardChallenge,
  "interview-ready": medalHardChallenge,
  "first-mastery": medalSkillMastered,
  reviewer: medalSkillMastered,
  curator: medalSkillMastered,
  builder: medalProjectFinished,
  "milestone-maker": medalProjectFinished,
  shipped: medalProjectFinished,
  "portfolio-three": medalProjectFinished,
  explorer: medalNewRegion,
};
export const medalFor = (achievementId: string) => MEDALS[achievementId] ?? medalSkillMastered;
