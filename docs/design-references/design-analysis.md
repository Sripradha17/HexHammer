# Design analysis

What the captured references have in common, and what that means for a learning app that someone uses for an hour at a time. Each claim points to a screenshot in `screenshots/`.

## 1. One idea per screen, said loudly

**Seen in:** Awwwards "NOMINEES" (11), Mobbin hero (04), Refero hero (03).

The strongest pages put a single statement in very large type, with one quiet sentence under it and at most two actions. Nothing competes with it.

**For Hexhammer:** Mission Control leads with exactly one thing, the next mission, as a display headline ("Next: Bits, bytes, hex and text encoding"). It has one primary action (ember) and one secondary action (outline). Everything else sits below the fold, in smaller, calmer tiles. This answers "what should I learn next?" in under a second.

## 2. Navigation that stays out of the way

**Seen in:** Godly's icon+label sidebar with a filled "current" pill (12), recent.design's dot-marked current section (02), Awwwards' floating pill dock (11).

Product libraries use a quiet left rail; editorial sites float a compact dock over the content.

**For Hexhammer:** both, by screen size. Wide screens get a left rail: the current page has a surface pill plus an ember edge, and `aria-current` for screen readers. Phones get a floating bottom dock with the five most-used places plus "More", with page padding so it never covers content.

## 3. Filters as chips, search as the hero

**Seen in:** recent.design chip row (02), Refero's big input with suggestion tabs (03), Siteinspire category band (06).

**For Hexhammer:** the Interview Arena and Glossary put a large search field first and suggest example searches, which doubles as an empty state. Filters are toggle chips (real buttons with `aria-pressed`), on one row above the results.

## 4. Engineered precision through monospace labels

**Seen in:** Motion docs: "DOCS / REACT" breadcrumb, letter-spaced mono section labels (07).

**For Hexhammer:** every page has a mono, uppercase, letter-spaced eyebrow ("WORLD MAP · 16 REGIONS"). It fits a technical subject, adds hierarchy without colour, and is cheap to render.

## 5. Avoid the grid of identical cards

**Seen as an anti-pattern in:** Godly's three-column card grid (12), Siteinspire's uniform tiles (06). They are fine for a gallery, but wrong for a learning journey with structure.

**For Hexhammer:**
- The World Map is a honeycomb of 16 regions with real unlock paths between them.
- Region pages use an asymmetric editorial band: the story on the left, modules on the right.
- Mission Control uses tiles of different widths for different jobs.
- The portfolio gives a completed project a full-width slot.

## 6. Make live things look live

**Seen in:** Hoverstates frames each featured site in a fake browser window (05).

**For Hexhammer:** every lab is a framed "bench" with a note that says honestly what is real and what is simulated. Live previews of learner HTML keep their own framed iframe.

## 7. Accessible components are behaviour, not looks

**Seen in:** shadcn/ui's component index, which lists Empty and Field as first-class components (08), and its Dialog definition: "rendering the content underneath inert" (09).

**For Hexhammer:** the design system gained `Field` (label, hint and error wired by id), `EmptyState`, `Chip` (`aria-pressed`) and `ConfirmDialog`. `ConfirmDialog` uses native `<dialog>.showModal()`, which provides inert background, a focus trap and Escape, and puts initial focus on the safe button. We copied the behaviours, not the code: the stack has no Tailwind or Radix.

## 8. Motion with a reason, or none

**Seen in:** the Motion docs' guidance (07) and the R3F intro (10). Both libraries make motion and 3D easy, but that is not a reason to use them.

**Decisions:**
- No Motion library and no WebGL. Each animation communicates something:
  - a page entering;
  - a lesson section appearing;
  - a hex lifting under focus;
  - an achievement medal popping;
  - a bit flipping in the binary lab;
  - a bar growing in a waterfall.
- The old app's constant mouse-follow parallax, spotlight, film grain and card tilt were retired. They moved all the time while the learner was trying to read.
- All durations come from tokens, which collapse to 0 under `prefers-reduced-motion` or the Settings "Reduce motion" choice.

## 9. Atmosphere through light, not decoration

Cinematic references create mood with light and dark contrast and large type, not with floating shapes.

**For Hexhammer:**
- One soft radial "forge glow" in the page background.
- A deep ink dark theme ("night forge") and a warm paper light theme ("daylight workshop").
- Colour reserved for meaning: ember means "do this next / you are here", violet means "review due", region hues mean "which part of the map".
- No decorative SVGs that communicate nothing.

## What we explicitly did not take

- Third-party logos and brand marks (Mobbin, Refero, Siteinspire): never.
- Marketing claims with numbers ("621,500 screens"): we only show numbers computed from the learner's real data.
- Sponsored slots, cookie banners and infinite feeds.
- Blurred or experimental typography for body text (Hoverstates).
