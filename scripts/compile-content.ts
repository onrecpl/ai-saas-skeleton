import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import type {
  ProgramistokBundle,
  ProgramistokMeta,
  ProgramistokSlide,
  ProgramistokStep,
  SlideAssetCopy,
  SlideDemoModal,
  SlideLayout,
} from "../src/types.js";

marked.setOptions({ gfm: true, breaks: false });

const STEP_DIR_RE = /^(\d+)-(.+)$/;

const LAYOUT_ALIASES: Record<string, SlideLayout> = {
  "no-image": "no-image",
  none: "no-image",
  text: "no-image",
  "split-left": "split-left",
  left: "split-left",
  imageLeft: "split-left",
  "split-right": "split-right",
  right: "split-right",
  imageRight: "split-right",
  "header-image": "header-image",
  header: "header-image",
  top: "header-image",
};

export function parseSlideLayout(raw: unknown): SlideLayout {
  if (typeof raw !== "string") return "no-image";
  const key = raw.trim();
  if (!key) return "no-image";
  return LAYOUT_ALIASES[key] ?? "no-image";
}

export function splitLandingSections(raw: string): {
  meetupTitle: string;
  talkMarkdown: string;
  bioMarkdown: string;
} {
  const lines = raw.split(/\r?\n/);
  let h1 = "Prezentacja";
  let i = 0;
  if (lines[0]?.startsWith("# ")) {
    h1 = lines[0].slice(2).trim();
    i = 1;
  }
  const bioIdx = lines.findIndex(
    (l, idx) => idx >= i && /^##\s+o mnie\b/i.test(l.trim()),
  );
  if (bioIdx === -1) {
    return {
      meetupTitle: h1,
      talkMarkdown: lines.slice(i).join("\n").trim(),
      bioMarkdown: "",
    };
  }
  return {
    meetupTitle: h1,
    talkMarkdown: lines.slice(i, bioIdx).join("\n").trim(),
    bioMarkdown: lines.slice(bioIdx + 1).join("\n").trim(),
  };
}

export async function readLandingMeta(
  landingPath: string,
  siteTitleFallback: string,
): Promise<ProgramistokMeta> {
  const raw = await fs.readFile(landingPath, "utf8");
  const { data, content } = matter(raw);
  const siteTitle =
    typeof data.siteTitle === "string" ? data.siteTitle : siteTitleFallback;
  const { meetupTitle, talkMarkdown, bioMarkdown } =
    splitLandingSections(content);

  const frontMeetup =
    typeof data.meetupTitle === "string" ? data.meetupTitle : undefined;
  const finalMeetup = frontMeetup ?? meetupTitle;

  return {
    siteTitle,
    meetupTitle: finalMeetup,
    talkTeaserHtml: await marked.parse(talkMarkdown),
    presenterBioHtml: bioMarkdown ? await marked.parse(bioMarkdown) : "",
  };
}

function slideOrderFromFilename(file: string): string {
  const base = path.basename(file, ".md");
  const m = /^(\d+[a-z]?)-/i.exec(base);
  return m?.[1] ?? base;
}

function titleFromMd(body: string, fmTitle: unknown, basename: string): string {
  if (typeof fmTitle === "string" && fmTitle.trim()) return fmTitle.trim();
  const line = body.split(/\r?\n/).find((l) => l.trim().startsWith("# "));
  if (line) return line.replace(/^#\s+/, "").trim();
  return basename.replace(/^\d+[a-z]?-/, "").replace(/-/g, " ");
}

function slugifyFileSegment(name: string): string {
  const s = name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return s || "image";
}

/** Pliki `*.demo.md` to treść pod przycisk — nie są osobnymi slajdami. */
export function isSlideMarkdownFile(name: string): boolean {
  return name.endsWith(".md") && name !== "_step.md" && !name.endsWith(".demo.md");
}

async function loadSlideDemoModal(
  stepPath: string,
  stepDirLabel: string,
  slideFile: string,
  data: Record<string, unknown>,
): Promise<SlideDemoModal | null> {
  const label = data.demoModalLabel;
  const fileField = data.demoModalFile;
  if (typeof label !== "string" || !label.trim()) return null;
  if (typeof fileField !== "string" || !fileField.trim()) {
    throw new Error(
      `Slajd ${stepDirLabel}/${slideFile}: ustawiono demoModalLabel bez demoModalFile`,
    );
  }
  const modalAbs = path.normalize(path.join(stepPath, fileField.trim()));
  const stepRel = path.relative(stepPath, modalAbs);
  if (stepRel.startsWith("..") || path.isAbsolute(stepRel)) {
    throw new Error(
      `Slajd ${stepDirLabel}/${slideFile}: demoModalFile poza katalogiem kroku (${fileField})`,
    );
  }
  try {
    await fs.stat(modalAbs);
  } catch {
    throw new Error(
      `Slajd ${stepDirLabel}/${slideFile}: brak pliku modala:\n  ${modalAbs}`,
    );
  }
  const raw = await fs.readFile(modalAbs, "utf8");
  const parsed = matter(raw);
  const bodyHtml = await marked.parse(parsed.content.trim());
  const titleRaw = data.demoModalTitle;
  const title =
    typeof titleRaw === "string" && titleRaw.trim()
      ? titleRaw.trim()
      : `Przykład: ${label.trim()}`;
  return { label: label.trim(), title, bodyHtml };
}

/** Obraz: ścieżka względem `content/` albo względem katalogu pliku .md (`./` lub `../`). */
export function resolveImageSourcePath(
  contentRoot: string,
  mdDir: string,
  imageRaw: string,
): string {
  const trimmed = imageRaw.trim();
  if (!trimmed) throw new Error("Pusty `image` we frontmatter.");
  if (trimmed.startsWith("/") || /^[a-z]+:/i.test(trimmed)) {
    throw new Error(
      `Niedozwolona ścieżka obrazka (tylko relatywne): ${JSON.stringify(trimmed)}`,
    );
  }
  if (trimmed.startsWith("./") || trimmed.startsWith("../")) {
    return path.normalize(path.join(mdDir, trimmed));
  }
  return path.normalize(path.join(contentRoot, trimmed));
}

export async function compileSteps(
  contentRoot: string,
): Promise<{ steps: ProgramistokStep[]; slideAssetCopies: SlideAssetCopy[] }> {
  const stepsDir = path.join(contentRoot, "steps");
  const entries = await fs.readdir(stepsDir, { withFileTypes: true });
  const dirs = entries
    .filter((e) => e.isDirectory() && STEP_DIR_RE.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const steps: ProgramistokStep[] = [];
  const slideAssetCopies: SlideAssetCopy[] = [];

  for (const dir of dirs) {
    const m = STEP_DIR_RE.exec(dir);
    if (!m) continue;
    const order = Number(m[1]);
    const slug = m[2];
    const stepPath = path.join(stepsDir, dir);
    const files = (await fs.readdir(stepPath))
      .filter(isSlideMarkdownFile)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    let stepTitle = `${order}. ${slug.replace(/-/g, " ")}`;
    try {
      const stepMetaRaw = await fs.readFile(path.join(stepPath, "_step.md"), "utf8");
      const { data } = matter(stepMetaRaw);
      if (typeof data.title === "string" && data.title.trim()) {
        stepTitle = data.title.trim();
      }
    } catch {
      // brak _step.md
    }

    const slides: ProgramistokSlide[] = [];
    for (const file of files) {
      const full = path.join(stepPath, file);
      const src = await fs.readFile(full, "utf8");
      const { data, content } = matter(src);
      const body = content.trim();
      const basename = path.basename(file, ".md");
      const slideOrder = slideOrderFromFilename(file);
      const title = titleFromMd(body, data.title, basename);
      const bodyHtml = await marked.parse(body);

      let layout = parseSlideLayout(data.layout);
      const imageAlt = typeof data.imageAlt === "string" ? data.imageAlt : "";
      let imageSrc: string | null = null;

      const imageField = data.image;
      if (typeof imageField === "string" && imageField.trim()) {
        const absFrom = resolveImageSourcePath(contentRoot, stepPath, imageField);
        try {
          await fs.stat(absFrom);
        } catch {
          throw new Error(
            `Slajd ${dir}/${file}: brak pliku obrazka:\n  ${absFrom}`,
          );
        }
        const ext = path.extname(absFrom);
        const base = path.basename(absFrom, ext);
        const safeFile = `${slideOrder}-${slugifyFileSegment(base)}${ext}`;
        const urlPath = [
          "assets",
          "slides",
          `${String(order).padStart(2, "0")}-${slug}`,
          safeFile,
        ].join("/");
        imageSrc = `./${urlPath}`;
        slideAssetCopies.push({ absFrom, urlPath });
        if (layout === "no-image") layout = "split-left";
      } else if (layout !== "no-image") {
        layout = "no-image";
      }

      const demoModal = await loadSlideDemoModal(stepPath, dir, file, data);

      slides.push({
        id: `${dir}/${basename}`,
        stepOrder: order,
        stepSlug: slug,
        slideOrder,
        title,
        bodyHtml,
        layout,
        imageSrc,
        imageAlt,
        demoModal,
      });
    }

    steps.push({ order, slug, title: stepTitle, slides });
  }

  return { steps, slideAssetCopies };
}

export type CompilePresentationResult = {
  bundle: ProgramistokBundle;
  slideAssetCopies: SlideAssetCopy[];
};

export async function compilePresentation(
  contentRoot: string,
): Promise<CompilePresentationResult> {
  const landingPath = path.join(contentRoot, "landing.md");
  const meta = await readLandingMeta(landingPath, "Programistok");
  const { steps, slideAssetCopies } = await compileSteps(contentRoot);
  return { bundle: { meta, steps }, slideAssetCopies };
}

/** Kompatybilność z testami / prostymi importami — bez kopiowania plików. */
export async function compileBundle(
  contentRoot: string,
): Promise<ProgramistokBundle> {
  const { bundle } = await compilePresentation(contentRoot);
  return bundle;
}

export async function copySlideAssets(
  distDir: string,
  copies: SlideAssetCopy[],
): Promise<void> {
  const written = new Set<string>();
  for (const { absFrom, urlPath } of copies) {
    const dest = path.join(distDir, ...urlPath.split("/"));
    if (written.has(dest)) continue;
    written.add(dest);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.copyFile(absFrom, dest);
  }
}
