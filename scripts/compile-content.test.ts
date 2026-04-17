import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  isSlideMarkdownFile,
  parseSlideLayout,
  resolveImageSourcePath,
  splitLandingSections,
} from "./compile-content.js";

describe("splitLandingSections", () => {
  it("wycina sekcję O mnie", () => {
    const raw = `# Tytuł główny

Wstęp do talka.

## O mnie

Bio tutaj.`;
    const r = splitLandingSections(raw);
    expect(r.meetupTitle).toBe("Tytuł główny");
    expect(r.talkMarkdown).toContain("Wstęp do talka");
    expect(r.talkMarkdown).not.toContain("Bio");
    expect(r.bioMarkdown).toContain("Bio tutaj");
  });
});

describe("isSlideMarkdownFile", () => {
  it("pomija _step.md i pliki .demo.md", () => {
    expect(isSlideMarkdownFile("01a-idea.md")).toBe(true);
    expect(isSlideMarkdownFile("_step.md")).toBe(false);
    expect(isSlideMarkdownFile("01a-onTatami.demo.md")).toBe(false);
  });
});

describe("parseSlideLayout", () => {
  it("rozpoznaje aliasy i domyślne", () => {
    expect(parseSlideLayout(undefined)).toBe("no-image");
    expect(parseSlideLayout("header")).toBe("header-image");
    expect(parseSlideLayout("split-left")).toBe("split-left");
    expect(parseSlideLayout("right")).toBe("split-right");
    expect(parseSlideLayout("nosuch")).toBe("no-image");
  });
});

describe("resolveImageSourcePath", () => {
  it("łączy ścieżkę względem content lub katalogu md", () => {
    const content = path.join("/", "proj", "content");
    const mdDir = path.join(content, "steps", "01-prd");
    expect(resolveImageSourcePath(content, mdDir, "assets/x.png")).toBe(
      path.join(content, "assets", "x.png"),
    );
    expect(resolveImageSourcePath(content, mdDir, "./local.svg")).toBe(
      path.join(mdDir, "local.svg"),
    );
  });

  it("odrzuca ścieżkę absolutną i URL", () => {
    expect(() =>
      resolveImageSourcePath("/c", "/m", "/etc/passwd"),
    ).toThrow("relatywne");
    expect(() => resolveImageSourcePath("/c", "/m", "http://x/y")).toThrow(
      "relatywne",
    );
  });
});
