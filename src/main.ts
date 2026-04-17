import type {
  ProgramistokBundle,
  ProgramistokSlide,
  ProgramistokStep,
  SlideDemoModal,
  SlideLayout,
} from "./types.js";

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Krok 0 = wstęp (hero); 1..n = treść z presentation.json */
function parseHash(): { step: number; slide: number } {
  const h = window.location.hash.replace(/^#/, "").trim();
  if (!h) return { step: 0, slide: 1 };
  const [s, sl] = h.split(".").map((x) => Number.parseInt(x, 10));
  const step = Number.isFinite(s) && s >= 0 ? s : 0;
  return {
    step,
    slide: Number.isFinite(sl) && sl > 0 ? sl : 1,
  };
}

function setHash(stepIndex: number, slideIndex1: number): void {
  window.location.hash = `${stepIndex}.${slideIndex1}`;
}

async function loadBundle(): Promise<ProgramistokBundle> {
  const res = await fetch(
    new URL("presentation.json", window.location.href).toString(),
  );
  if (!res.ok) throw new Error(`Brak presentation.json (${res.status})`);
  return res.json() as Promise<ProgramistokBundle>;
}

let slideDemoModalCtl: { open: (m: SlideDemoModal) => void } | null = null;

function getSlideDemoModal(): { open: (m: SlideDemoModal) => void } {
  if (!slideDemoModalCtl) slideDemoModalCtl = buildSlideDemoModal();
  return slideDemoModalCtl;
}

function buildSlideDemoModal(): { open: (m: SlideDemoModal) => void } {
  const dialog = document.createElement("dialog");
  dialog.className = "slide-demo-modal";

  const panel = el("div", "slide-demo-modal__panel");
  const header = el("header", "slide-demo-modal__header");
  const titleEl = el("h2", "slide-demo-modal__title");
  titleEl.id = "slide-demo-modal-title";
  dialog.setAttribute("aria-labelledby", titleEl.id);

  const closeBtn = el("button", "btn slide-demo-modal__close", "Zamknij");
  closeBtn.type = "button";
  closeBtn.addEventListener("click", () => dialog.close());

  header.appendChild(titleEl);
  header.appendChild(closeBtn);

  const bodyEl = el("div", "prose slide-demo-modal__body");
  const note = el(
    "p",
    "slide-demo-modal__note",
    "Metafora podejścia z AI: slajd to szkielet myślenia, modal — „żywy” przykład produktu bez drugiego narzędzia.",
  );

  panel.appendChild(header);
  panel.appendChild(bodyEl);
  panel.appendChild(note);
  dialog.appendChild(panel);

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  document.body.appendChild(dialog);

  return {
    open(m: SlideDemoModal): void {
      titleEl.textContent = m.title;
      bodyEl.innerHTML = m.bodyHtml;
      if (!dialog.open) dialog.showModal();
    },
  };
}

function slideImageUrl(imageSrc: string | null | undefined): string | null {
  if (!imageSrc?.trim()) return null;
  try {
    return new URL(imageSrc.trim(), window.location.href).href;
  } catch {
    return null;
  }
}

function appendSlideContent(
  inner: HTMLElement,
  slide: ProgramistokSlide,
  openDemo?: (m: SlideDemoModal) => void,
): void {
  const slideTop = el("div", "slide-meta");
  slideTop.appendChild(el("span", "slide-label", slide.slideOrder));
  slideTop.appendChild(el("h3", "slide-title", slide.title));
  inner.appendChild(slideTop);

  const layout: SlideLayout = slide.layout ?? "no-image";
  const imgHref = slideImageUrl(slide.imageSrc);

  if (!imgHref || layout === "no-image") {
    const body = el("div", "prose slide-body");
    body.innerHTML = slide.bodyHtml;
    inner.appendChild(body);
  } else {
    const shell = el("div", `slide-shell slide-shell--${layout}`);
    const fig = el("figure", "slide-media");
    const img = document.createElement("img");
    img.src = imgHref;
    img.alt = slide.imageAlt ?? "";
    img.decoding = "async";
    fig.appendChild(img);

    const prose = el("div", "prose slide-body");
    prose.innerHTML = slide.bodyHtml;
    shell.appendChild(fig);
    shell.appendChild(prose);
    inner.appendChild(shell);
  }

  const dm = slide.demoModal;
  if (dm && openDemo) {
    const bar = el("div", "slide-demo-bar");
    const hint = el("p", "slide-demo-hint", "Przykład w tym samym interfejsie:");
    const btn = el("button", "btn btn-accent", dm.label);
    btn.type = "button";
    btn.addEventListener("click", () => openDemo(dm));
    bar.appendChild(hint);
    bar.appendChild(btn);
    inner.appendChild(bar);
  }
}

function render(root: HTMLElement, data: ProgramistokBundle): void {
  root.innerHTML = "";
  const wrap = el("div", "layout");
  const openSlideDemo = getSlideDemoModal().open;
  let isPresentationMode = Boolean(document.fullscreenElement);

  let { step: curStep, slide: curSlide } = parseHash();

  const maxStepIndex = data.steps.length; // 0..maxStepIndex where 0 intro, 1..n steps

  const applyNavState = (): void => {
    if (curStep < 0) curStep = 0;
    if (curStep > maxStepIndex) curStep = maxStepIndex;
    if (curStep === 0) {
      curSlide = 1;
    } else {
      const st = data.steps[curStep - 1];
      const maxSl = st?.slides.length ?? 1;
      if (curSlide > maxSl) curSlide = maxSl;
      if (curSlide < 1) curSlide = 1;
    }
    setHash(curStep, curSlide);
  };

  applyNavState();

  const goIntro = (): void => {
    curStep = 0;
    curSlide = 1;
    applyNavState();
    renderView();
  };

  const goToStep = (stepIndex: number, slide1 = 1): void => {
    curStep = stepIndex;
    curSlide = slide1;
    applyNavState();
    renderView();
  };

  /** Strzałki ↑↓: zmiana kroku (zawsze pierwszy slajd treści). */
  const goStepDelta = (delta: number): void => {
    const next = curStep + delta;
    if (next < 0 || next > maxStepIndex) return;
    curStep = next;
    curSlide = curStep === 0 ? 1 : 1;
    applyNavState();
    renderView();
  };

  /** Strzałki ←→: tylko slajdy w aktualnym kroku (wstęp ignoruje). */
  const goSlideDelta = (delta: number): void => {
    if (curStep === 0 || delta === 0) return;
    const step = data.steps[curStep - 1];
    if (!step) return;
    const maxSl = step.slides.length;
    const next = curSlide + delta;
    if (next < 1 || next > maxSl) return;
    curSlide = next;
    applyNavState();
    renderView();
  };

  const setPresentationMode = async (next: boolean): Promise<void> => {
    try {
      if (next && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else if (!next && document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // Brak wsparcia/fullscreen zablokowany — nie przerywamy prezentacji.
    }
  };

  const togglePresentationMode = (): void => {
    void setPresentationMode(!isPresentationMode);
  };

  const buildPresentationBtn = (): HTMLButtonElement => {
    const label = isPresentationMode ? "Wyłącz tryb prezentacji" : "Tryb prezentacji";
    const btn = el("button", "btn btn-ghost btn-presentation", label);
    btn.type = "button";
    btn.title = "Skrót: F lub F11";
    btn.addEventListener("click", togglePresentationMode);
    return btn;
  };

  function buildToc(): HTMLElement {
    const aside = el("aside", "toc");
    aside.setAttribute("aria-label", "Spis treści");
    aside.appendChild(el("p", "toc-heading", "Spis treści"));

    const mkItem = (stepIndex: number, label: string): void => {
      const btn = el("button", "toc-item", label);
      btn.type = "button";
      if (stepIndex === curStep) {
        btn.classList.add("toc-item--active");
        btn.setAttribute("aria-current", "step");
      } else {
        btn.removeAttribute("aria-current");
      }
      btn.addEventListener("click", () => goToStep(stepIndex, 1));
      aside.appendChild(btn);
    };

    mkItem(0, "Wstęp");
    data.steps.forEach((s, i) => {
      mkItem(i + 1, `${i + 1}. ${s.title}`);
    });

    aside.appendChild(el("p", "toc-hint", "↑↓ krok · ←→ slajd · F fullscreen"));

    requestAnimationFrame(() => {
      aside.querySelector(".toc-item--active")?.scrollIntoView({ block: "nearest" });
    });

    return aside;
  }

  const renderIntro = (host: HTMLElement): void => {
    const screen = el("section", "deck-screen deck-screen--intro");
    const top = el("div", "deck-top");
    top.appendChild(el("span", "deck-brand", data.meta.siteTitle));
    top.appendChild(el("span", "deck-progress", "Wstęp"));
    top.appendChild(buildPresentationBtn());
    screen.appendChild(top);

    const scroll = el("div", "deck-scroll");
    const inner = el("div", "deck-scroll-inner deck-scroll-inner--narrow");

    const hero = el("header", "hero hero--fullscreen");
    hero.appendChild(el("p", "hero-kicker", data.meta.siteTitle));
    const h1 = el("h1", "hero-title");
    h1.textContent = data.meta.meetupTitle;
    hero.appendChild(h1);
    const teaser = el("div", "prose hero-teaser");
    teaser.innerHTML = data.meta.talkTeaserHtml;
    hero.appendChild(teaser);
    if (data.meta.presenterBioHtml.trim()) {
      const bioBlock = el("section", "bio");
      bioBlock.appendChild(el("h2", "bio-title", "O mnie"));
      const bio = el("div", "prose");
      bio.innerHTML = data.meta.presenterBioHtml;
      bioBlock.appendChild(bio);
      hero.appendChild(bioBlock);
    }
    inner.appendChild(hero);
    scroll.appendChild(inner);
    screen.appendChild(scroll);

    const nav = el("footer", "deck-nav");
    const start = el("div", "deck-nav-start");
    const mid = el("div", "deck-nav-mid");
    const end = el("div", "deck-nav-end");
    const prev = el("button", "btn", "←");
    prev.disabled = true;
    prev.title = "Jesteś na ekranie startowym";
    const next = el("button", "btn btn-primary", "Dalej — krok 1 →");
    next.addEventListener("click", () => goToStep(1, 1));
    start.appendChild(prev);
    end.appendChild(next);
    nav.appendChild(start);
    nav.appendChild(mid);
    nav.appendChild(end);
    screen.appendChild(nav);

    host.appendChild(screen);
  };

  const renderStepScreen = (host: HTMLElement, step: ProgramistokStep, stepIndex1: number): void => {
    const screen = el("section", "deck-screen");
    const top = el("div", "deck-top");
    top.appendChild(el("span", "deck-brand", data.meta.siteTitle));
    top.appendChild(
      el("span", "deck-progress", `Krok ${stepIndex1} z ${data.steps.length}: ${step.title}`),
    );
    top.appendChild(buildPresentationBtn());
    screen.appendChild(top);

    const scroll = el("div", "deck-scroll");
    const inner = el("div", "deck-scroll-inner");

    const stepHead = el("div", "step-head step-head--fullscreen");
    stepHead.appendChild(el("span", "step-index", String(stepIndex1)));
    stepHead.appendChild(el("h2", "step-title", step.title));
    inner.appendChild(stepHead);

    const slideIndex = curSlide - 1;
    const slide = step.slides[slideIndex];
    if (slide) {
      appendSlideContent(inner, slide, openSlideDemo);
    }

    scroll.appendChild(inner);
    screen.appendChild(scroll);

    const nav = el("footer", "deck-nav");
    const start = el("div", "deck-nav-start");
    const mid = el("div", "deck-nav-mid");
    const end = el("div", "deck-nav-end");
    const home = el("button", "btn btn-ghost", "Wstęp");
    home.addEventListener("click", goIntro);
    const prev = el("button", "btn", "← Poprzedni");
    const next = el("button", "btn btn-primary", "Następny →");
    const pos = el("span", "slide-pos", `${curSlide} / ${step.slides.length}`);

    const canPrevSlide = curSlide > 1;
    const canPrevStep = stepIndex1 > 1;
    const canPrevIntro = stepIndex1 === 1;
    prev.disabled = !canPrevSlide && !canPrevStep && !canPrevIntro;

    prev.addEventListener("click", () => {
      if (canPrevSlide) {
        curSlide -= 1;
      } else if (canPrevStep) {
        const prevStep = data.steps[stepIndex1 - 2];
        curStep = stepIndex1 - 1;
        curSlide = prevStep.slides.length;
      } else if (canPrevIntro) {
        curStep = 0;
        curSlide = 1;
      }
      applyNavState();
      renderView();
    });

    const canNextSlide = curSlide < step.slides.length;
    const canNextStep = stepIndex1 < data.steps.length;
    next.textContent =
      canNextSlide
        ? "Następny slajd →"
        : canNextStep
          ? "Następny krok →"
          : "Koniec";
    next.disabled = !canNextSlide && !canNextStep;

    next.addEventListener("click", () => {
      if (canNextSlide) {
        curSlide += 1;
      } else if (canNextStep) {
        curStep = stepIndex1 + 1;
        curSlide = 1;
      }
      applyNavState();
      renderView();
    });

    start.appendChild(home);
    start.appendChild(prev);
    mid.appendChild(pos);
    end.appendChild(next);
    nav.appendChild(start);
    nav.appendChild(mid);
    nav.appendChild(end);
    screen.appendChild(nav);

    host.appendChild(screen);
  };

  function renderView(): void {
    wrap.innerHTML = "";
    applyNavState();
    isPresentationMode = Boolean(document.fullscreenElement);
    wrap.classList.toggle("layout--presentation", isPresentationMode);

    wrap.appendChild(buildToc());
    const main = el("div", "deck-main");

    if (curStep === 0) {
      renderIntro(main);
    } else {
      const step = data.steps[curStep - 1];
      if (step) renderStepScreen(main, step, curStep);
      else goIntro();
    }

    wrap.appendChild(main);
  }

  const onKeyDown = (e: KeyboardEvent): void => {
    if (e.defaultPrevented) return;
    if (document.querySelector("dialog.slide-demo-modal[open]")) {
      if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        return;
      }
    }
    const t = e.target;
    if (
      t instanceof HTMLInputElement ||
      t instanceof HTMLTextAreaElement ||
      (t instanceof HTMLElement && t.isContentEditable)
    ) {
      return;
    }

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        goStepDelta(1);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        goStepDelta(-1);
        break;
      }
      case "ArrowRight": {
        e.preventDefault();
        goSlideDelta(1);
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        goSlideDelta(-1);
        break;
      }
      case "f":
      case "F":
      case "F11": {
        e.preventDefault();
        togglePresentationMode();
        break;
      }
      default:
        break;
    }
  };

  window.addEventListener("keydown", onKeyDown);

  renderView();

  window.addEventListener("hashchange", () => {
    const p = parseHash();
    curStep = p.step;
    curSlide = p.slide;
    applyNavState();
    renderView();
  });

  document.addEventListener("fullscreenchange", () => {
    isPresentationMode = Boolean(document.fullscreenElement);
    renderView();
  });

  root.appendChild(wrap);
}

async function main(): Promise<void> {
  const root = document.getElementById("root");
  if (!root) return;
  try {
    const data = await loadBundle();
    document.title = data.meta.siteTitle;
    render(root, data);
  } catch (err) {
    const pre = el("pre", "error");
    pre.textContent = err instanceof Error ? err.message : String(err);
    root.appendChild(pre);
  }
}

void main();
