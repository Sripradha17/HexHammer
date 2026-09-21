# Roadmap

Each phase adds levels. The Professional Skills and Interview tracks grow in every phase.

| Phase | Scope                                       | Runner types                                                                      |
| ----- | ------------------------------------------- | --------------------------------------------------------------------------------- |
| 1     | Level 1 (Red), classroom app, design system | Level 1: browser Web Worker                                                       |
| 2     | Levels 2-3 (Orange, Yellow) + DSA track     | Level 2: browser Web Worker. Level 3: browser Web Worker + guided local exercises |
| 3     | Levels 4-5 (Green, Blue)                    | Level 4: sandboxed iframe. Level 5: local-only server runner                      |
| 4     | Levels 6-7 (Indigo, Violet)                 | Level 6: sandboxed iframe. Level 7: guided, local first (AWS free plan)           |
| 5     | Level 8 (Gold) + public browser-only deploy | Level 8: local Ollama only                                                        |

Level 2, Level 3 and the DSA track were written early, ahead of Phase 2. The Level 2 Interview Pack is done too (Level 3 has none yet). The DSA track has 14 strikes, one per topic, each with three interview-style problems.

## Warnings

- **Level 5 server runner:** running learner code on the server is dangerous. It must be **local-only**, show clear warnings, and the app must **never** be publicly deployed with it enabled.
- **Level 7 AWS:** use the AWS free plan only. It lasts up to 6 months or until credits run out, so open the account only when you reach Level 7. Every lesson must warn about cost traps and show how to tear down.
- **Level 8 AI:** local Ollama only, never a paid API.
- **Phase 5 public deploy:** browser-only build (no server runner, no database server).

## Tracks

- **DSA** starts at Level 2 (2-3 problems a week).
- **Professional Skills** and **Interview** grow every phase (system design drills from Level 5 on).
