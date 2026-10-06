import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { StoryPage } from "../../../app/storyPage";
import { windBurst } from "../utils/scrollWind";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Instant film developing: milky, warm and soft at 0, the photo itself at 1 (no filter at all, so it costs nothing). */
function developPhoto(image: HTMLElement, amount: number) {
  if (amount >= 0.999) {
    image.style.removeProperty("filter");
    return;
  }
  const left = 1 - amount;
  image.style.filter = `saturate(${(0.15 + amount * 0.85).toFixed(3)}) contrast(${(0.72 + amount * 0.28).toFixed(3)}) brightness(${(1.22 - amount * 0.22).toFixed(3)}) sepia(${(left * 0.45).toFixed(3)}) blur(${(left * 2.4).toFixed(2)}px)`;
}

/** The middle of an element on screen, where a burst of wind starts. */
function centreOf(element: Element): [number, number] {
  const box = element.getBoundingClientRect();
  return [box.left + box.width / 2, box.top + box.height / 2];
}

/**
 * The page's scroll choreography around the chapters (whose scenes usePartTwoScroll drives): every section makes an
 * entrance tied to the reader's scroll, so scrolling back plays it backwards. The hero's title drifts apart as it
 * leaves; the scrapbook's photos are tossed onto the page and land; the part's title letters flip up one by one and its
 * chapters slide in; the big chapter numerals travel past faster than the words; each chapter's keepsake photo swings
 * round and develops like instant film; the keepsake box tips up into view and its buttons pop in; albums are dealt out
 * like cards; the ending's photo drops in and rocks to rest, and the ending throws a handful of petals (or glints) into
 * the air. Part II's title page parts in layers as it leaves, its great numeral swelling past the reader.
 *
 * Everything moves `transform`, `opacity` or a filter that is dropped once settled; where another system already owns
 * an element's transform (CSS animations, the pointer's tilt), the move goes through registered custom properties read
 * by the individual `rotate`/`scale`/`translate` properties instead (scroll-life.css). Readers who prefer reduced motion
 * get none of it, and the GSAP context puts every inline style back when the layout or the preference changes.
 */
export function useScrollChoreography(scope: RefObject<HTMLElement | null>, page: StoryPage, mobile: boolean, reducedMotion: boolean) {
  useGSAP(() => {
    const root = scope.current;
    if (!root || reducedMotion) return undefined;
    const all = (selector: string, within: ParentNode = root) => Array.from(within.querySelectorAll<HTMLElement>(selector));
    const cleanups: Array<() => void> = [];
    const scale = mobile ? 0.55 : 1;

    /* ---------- Part I's hero: the title drifts apart as the page lifts away from it ---------- */
    const hero = root.querySelector<HTMLElement>(".story-intro");
    const heroWords = hero ? all(".intro-title-word", hero) : [];
    if (hero && heroWords.length) {
      const middle = (heroWords.length - 1) / 2;
      const leave = gsap.timeline({ defaults: { ease: "power1.in" }, scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
      heroWords.forEach((word, index) => {
        const away = index - middle;
        leave.to(word, {
          x: away * 34 * scale,
          y: -(16 + Math.abs(away) * 14) * scale,
          rotation: away * 3 + (index % 2 ? 2.5 : -2),
          scale: 1 + Math.abs(away) * 0.035,
        }, 0);
      });
    }

    /* ---------- The scrapbook: photos tossed onto the page, then drifting at their own pace ---------- */
    const scrapbook = root.querySelector<HTMLElement>(".mood-scrapbook");
    if (scrapbook) {
      const throws = [{ x: -42, y: 30, turn: -18 }, { x: 40, y: 38, turn: 16 }, { x: -6, y: 56, turn: -11 }];
      const drifts = [6, -9, 3];
      all(".mood-photo", scrapbook).forEach((photo, index) => {
        const toss = throws[index % throws.length];
        const rest = Number(gsap.getProperty(photo, "rotation")) || 0;
        const drift = ((drifts[index] ?? 0) * window.innerHeight) / 100;
        gsap.fromTo(photo, { y: -drift }, { y: drift, ease: "none", scrollTrigger: { trigger: scrapbook, start: "top bottom", end: "bottom top", scrub: true } });
        // Spread over the scrapbook's whole way up the screen, so the throw is seen in flight rather than already landed.
        gsap.fromTo(photo,
          { xPercent: toss.x * scale, yPercent: toss.y * scale, rotation: rest + toss.turn, scale: 0.8, opacity: 0 },
          { xPercent: 0, yPercent: 0, rotation: rest, scale: 1, opacity: 1, ease: "power2.inOut",
            scrollTrigger: { trigger: scrapbook, start: `top ${104 - index * 5}%`, end: `top ${38 - index * 5}%`, scrub: true } });
      });
    }

    /* ---------- Part I's title: letters flip up one by one, then the chapters slide in ---------- */
    all(".story-part-heading").forEach((heading) => {
      const letters = all(".heading-letter", heading);
      if (letters.length) {
        gsap.fromTo(letters,
          { yPercent: 110, rotationX: -80, opacity: 0, transformPerspective: 520, transformOrigin: "50% 100%" },
          { yPercent: 0, rotationX: 0, opacity: 1, ease: "power3.out", stagger: 0.045,
            scrollTrigger: { trigger: heading, start: "top 88%", end: "top 34%", scrub: true } });
      }
      const index = heading.querySelector<HTMLElement>(".diary-chapter-index");
      const rows = index ? all(".diary-index-heading, li", index) : [];
      if (index && rows.length) {
        gsap.fromTo(rows, { x: -48 * scale, opacity: 0 }, { x: 0, opacity: 1, ease: "power2.out", stagger: 0.12,
          scrollTrigger: { trigger: index, start: "top 94%", end: "top 52%", scrub: true } });
      }
    });

    /* ---------- Chapter numerals: the big outlined numbers travel past faster than the words ---------- */
    // Position only: a scale changing every frame would have the browser redraw the outlined glyphs at each new size.
    all(".story-step-numeral").forEach((numeral) => {
      const step = numeral.closest<HTMLElement>(".story-step") ?? numeral;
      gsap.fromTo(numeral, { yPercent: 60 }, { yPercent: -60, ease: "none",
        scrollTrigger: { trigger: step, start: "top bottom", end: "bottom top", scrub: true } });
    });

    /* ---------- Each Part I chapter's keepsake photo swings round to face the reader and develops ---------- */
    all(".story-part-1 .story-step-keepsake").forEach((photo) => {
      const image = photo.querySelector<HTMLElement>("img");
      const lean = photo.classList.contains("tilt-right") ? 1 : -1;
      const rest = Number(gsap.getProperty(photo, "rotation")) || 0;
      const film = { developed: 0 };
      const arrive = gsap.timeline({ scrollTrigger: { trigger: photo, start: "top 98%", end: "top 46%", scrub: true } });
      arrive.fromTo(photo,
        { rotationY: lean * -40, rotationX: 14, rotation: rest + lean * 7, yPercent: 24, scale: 0.8, transformPerspective: 900, transformOrigin: "50% 100%" },
        { rotationY: 0, rotationX: 0, rotation: rest, yPercent: 0, scale: 1, ease: "power2.out", duration: 1 }, 0);
      arrive.fromTo(photo, { "--sheen": "-130%" }, { "--sheen": "130%", ease: "power1.inOut", duration: 0.55 }, 0.42);
      if (image) {
        arrive.fromTo(film, { developed: 0 }, { developed: 1, ease: "power1.inOut", duration: 0.9, onUpdate: () => developPhoto(image, film.developed) }, 0.1);
        cleanups.push(() => image.style.removeProperty("filter"));
      }
    });

    /* ---------- The keepsake box tips up into view; its buttons pop in after it ---------- */
    const stage = root.querySelector<HTMLElement>(".keepsake-stage");
    const box = stage?.querySelector<HTMLElement>(".keepsake-canvas");
    if (stage && box) {
      gsap.fromTo(box,
        { rotationX: 20, yPercent: 9, scale: 0.88, transformPerspective: 1400, transformOrigin: "50% 100%" },
        { rotationX: 0, yPercent: 0, scale: 1, ease: "power2.out", scrollTrigger: { trigger: stage, start: "top bottom", end: "top 30%", scrub: true } });
    }
    const controls = root.querySelector<HTMLElement>(".keepsake-controls");
    if (controls) {
      gsap.from(all("button", controls), {
        y: 26, scale: 0.86, opacity: 0, duration: 0.75, ease: "back.out(1.8)", stagger: 0.07, clearProps: "transform,opacity",
        scrollTrigger: { trigger: controls, start: "top 92%", once: true },
      });
    }

    /* ---------- Albums are dealt out from one pile, like cards ---------- */
    all(".photo-filmstrip").forEach((strip) => {
      const thumbs = all(".photo-thumb", strip);
      if (thumbs.length < 2) return;
      const [first] = thumbs;
      gsap.from(thumbs, {
        x: (index: number) => (first.offsetLeft - thumbs[index].offsetLeft) * 0.86,
        y: (index: number) => (first.offsetTop - thumbs[index].offsetTop) * 0.86 + 34,
        rotation: (index: number) => (index % 2 ? 10 : -8) + index * 1.5,
        scale: 0.84, opacity: 0, duration: 0.95, ease: "back.out(1.3)", stagger: 0.09, clearProps: "transform,opacity",
        scrollTrigger: { trigger: strip, start: "top 90%", once: true },
      });
    });

    /* ---------- Part II's title page parts in layers as it leaves; its numeral swells past the reader ---------- */
    const titlePage = root.querySelector<HTMLElement>(".story-part-transition");
    if (titlePage) {
      const leave = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: titlePage, start: "top top", end: "bottom top", scrub: true } });
      const layers: Array<[string, number]> = [[".part-transition-copy", -16], [".part-transition-title", -7], [".part-transition-stops", -24]];
      for (const [selector, rise] of layers) {
        const layer = titlePage.querySelector(selector);
        if (layer) leave.to(layer, { y: (rise * window.innerHeight * scale) / 100 }, 0);
      }
      const numeral = titlePage.querySelector(".part-transition-numeral");
      if (numeral) leave.fromTo(numeral, { "--numeral-zoom": 0 }, { "--numeral-zoom": 1 }, 0);
      const title = titlePage.querySelector("h2");
      if (title) {
        // The title page is where Part II opens: a few glints rise from the title as its words arrive.
        ScrollTrigger.create({ trigger: title, start: "top 75%", once: true, onEnter: () => {
          gsap.delayedCall(0.7, () => windBurst(...centreOf(title), mobile ? 14 : 26));
        } });
      }
    }

    /* ---------- The endings: the photo drops in and rocks to rest; petals or glints are thrown into the air ---------- */
    all(".story-ending").forEach((ending) => {
      const photo = ending.querySelector<HTMLElement>(".polaroid");
      if (photo) {
        gsap.fromTo(photo, { "--swing": -16, "--drop": 1 }, { "--swing": 0, "--drop": 0, ease: "elastic.out(1, 0.42)",
          scrollTrigger: { trigger: photo, start: "top bottom", end: "top 40%", scrub: true } });
      }
      const title = ending.querySelector("h2");
      if (title) {
        ScrollTrigger.create({ trigger: title, start: "top 72%", once: true, onEnter: () => {
          gsap.delayedCall(0.35, () => windBurst(...centreOf(title), mobile ? 22 : 40));
        } });
      }
    });

    /* Photos and fonts arriving below the fold move every later section; measure the triggers again once they settle. */
    let height = root.offsetHeight;
    let pending = 0;
    const resize = new ResizeObserver(() => {
      if (root.offsetHeight === height) return;
      height = root.offsetHeight;
      window.clearTimeout(pending);
      pending = window.setTimeout(() => ScrollTrigger.refresh(), 160);
    });
    resize.observe(root);
    cleanups.push(() => {
      resize.disconnect();
      window.clearTimeout(pending);
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, { scope, dependencies: [page, mobile, reducedMotion], revertOnUpdate: true });
}
