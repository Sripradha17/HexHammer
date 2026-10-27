import { describe, expect, it } from "vitest";
import { checkDemoUrl, checkGithubUrl, validateProject } from "./validateProject";

describe("GitHub URL check (shape only, never fetched)", () => {
  it.each([
    "https://github.com/ada/analytical-engine",
    "https://github.com/ada/analytical-engine.git",
    "https://github.com/ada/analytical-engine/tree/main/src",
  ])("accepts %s", (url) => expect(checkGithubUrl(url)).toBeNull());

  it.each([
    "http://github.com/ada/repo",
    "https://gitlab.com/ada/repo",
    "https://github.com/ada",
    "https://github.com.evil.example/ada/repo",
    "javascript:alert(1)",
  ])("rejects %s", (url) => expect(checkGithubUrl(url)).not.toBeNull());
});

describe("demo URL check", () => {
  it("allows https anywhere and http only on localhost", () => {
    expect(checkDemoUrl("https://ada.example.com")).toBeNull();
    expect(checkDemoUrl("http://localhost:5173")).toBeNull();
    expect(checkDemoUrl("http://ada.example.com")).not.toBeNull();
    expect(checkDemoUrl("ftp://x")).not.toBeNull();
  });
});

describe("project validation", () => {
  it("requires a title and description on create, with defaults for the rest", () => {
    expect(validateProject({})).toEqual({ errors: { title: "This is required.", description: "This is required." } });
    const ok = validateProject({ title: " Growth Lab ", description: "Charts." });
    expect(ok).toMatchObject({ value: { title: "Growth Lab", type: "implementation", status: "planned", repoUrl: null } });
  });

  it("refuses to mark a project complete without evidence", () => {
    const r = validateProject({ title: "T", description: "D", status: "complete" });
    expect("errors" in r ? r.errors?.evidence : undefined).toBeTruthy();
  });

  it("partial updates only touch the fields sent", () => {
    expect(validateProject({ repoUrl: "https://github.com/a/b" }, true)).toEqual({ value: { repoUrl: "https://github.com/a/b" } });
  });

  it("reports every bad field at once", () => {
    const r = validateProject({ title: "T", description: "D", status: "done-ish", repoUrl: "nope", technologies: "React" });
    expect(Object.keys(("errors" in r && r.errors) || {}).sort()).toEqual(["repoUrl", "status", "technologies"]);
  });
});
