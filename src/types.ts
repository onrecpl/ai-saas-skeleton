export type ProgramistokMeta = {
  siteTitle: string;
  meetupTitle: string;
  presenterBioHtml: string;
  talkTeaserHtml: string;
};

/** Szablon slajdu z obrazem (frontmatter: `layout`). */
export type SlideLayout =
  | "no-image"
  | "split-left"
  | "split-right"
  | "header-image";

/** Treść modala „przykład realizacji” (generowana z pliku `*.demo.md` przy buildzie). */
export type SlideDemoModal = {
  label: string;
  title: string;
  bodyHtml: string;
};

export type ProgramistokSlide = {
  id: string;
  stepOrder: number;
  stepSlug: string;
  slideOrder: string;
  title: string;
  bodyHtml: string;
  layout: SlideLayout;
  /** URL względem `index.html`, np. `./assets/slides/01-prd/01a-x.svg` lub `null` */
  imageSrc: string | null;
  imageAlt: string;
  demoModal: SlideDemoModal | null;
};

export type ProgramistokStep = {
  order: number;
  slug: string;
  title: string;
  slides: ProgramistokSlide[];
};

export type ProgramistokBundle = {
  meta: ProgramistokMeta;
  steps: ProgramistokStep[];
};

export type SlideAssetCopy = {
  absFrom: string;
  /** Ścieżka względem katalogu `dist/` ze slashem POSIX */
  urlPath: string;
};
