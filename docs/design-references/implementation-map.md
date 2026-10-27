# Implementation map: reference → decision → code

| Idea (reference) | Where it lives | Files |
| --- | --- | --- |
| Giant single statement + one quiet sentence (Awwwards 11, Mobbin 04) | Mission Control hero "Next: …" | `apps/web/src/pages/MissionControlPage.tsx`, `.mission__hero` / `.display` in `styles/pages.css` |
| Primary + soft secondary CTA pair (Mobbin 04) | Hero actions, editors | `Button` variants in `packages/design-system/src/Button.tsx` |
| Quiet icon+label rail with "current" pill (Godly 12, recent.design 02) | Desktop navigation | `App.tsx` `.rail`, `styles/shell.css` |
| Floating pill dock (Awwwards 11) | Phone navigation | `App.tsx` `.dock`, `styles/shell.css` |
| Mono letter-spaced labels and breadcrumb (Motion 07) | Every eyebrow and breadcrumb | `.eyebrow`, `.crumbs` in `styles/base.css` |
| "On this page" outline (Motion 07, shadcn 09) | Learning Studio table of contents | `TopicStudioPage.tsx` `.studio__toc` |
| Search as hero + suggestion list (Refero 03) | Interview Arena, Glossary | `InterviewArenaPage.tsx`, `GlossaryPage.tsx`, `.search` |
| Chip filter row (recent.design 02) | Arena, Glossary, Portfolio, Radar | `Chip.tsx`, `.filters` |
| Asymmetric editorial band (Siteinspire 06) | Region page: story left, modules right | `RegionPage.tsx`, `.region__band` |
| Two-weight caption (Siteinspire 06) | Radar items: title + "published … · discovered …" | `RadarPage.tsx` `.update-item` |
| Framed live object (Hoverstates 05) | Every lab bench, live previews | `labs/shared.tsx` `LabFrame`, `styles/labs.css` |
| Empty and Field as first-class components (shadcn 08) | Every empty list, every form row | `EmptyState.tsx`, `Field.tsx` |
| Dialog with inert background (shadcn 09) | Delete project, approve/reject proposal | `ConfirmDialog.tsx` |
| Solid callout for important notes (R3F 10) | Locked region notes, honest-status notes, radar scheduler note | `.callout` |
| Avoid identical card grids (Godly 12 anti-pattern) | Honeycomb map, varied tiles, featured portfolio item | `WorldMapPage.tsx`, `.strip`, `.showcase` |
| No WebGL, no Motion library (R3F 10, Motion 07) | CSS transitions + tiny canvas/SVG in labs | `tokens.css` motion tokens; `labs/DecisionBoundaryLab.tsx` (canvas) |
