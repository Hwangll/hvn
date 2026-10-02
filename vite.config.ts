import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import postcss, { type Root } from "postcss";
import { defineConfig, type HtmlTagDescriptor, type Plugin } from "vite";

/**
 * Fonts are only discovered once React has painted text, which is too late for the titles: without a preload the
 * Part II title is first set in the fallback serif and re-wraps when Literata lands (CLS 0.14 on desktop). Only the
 * title face is preloaded, at low priority, so it is in flight early without competing with the JS that has to run
 * before anything paints. Body text measured no layout shift when its face swaps in, so it is not preloaded.
 */
const criticalFonts = ["literata-latin.woff2", "literata-vietnamese.woff2", "literata-vietnamese-ext.woff2"];

function preloadCriticalFonts(): Plugin {
  return {
    name: "hvn:preload-critical-fonts",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(_html, { bundle }) {
        if (!bundle) return [];
        return Object.values(bundle)
          .filter((file) => file.type === "asset" && file.names.some((name) => criticalFonts.includes(name)))
          .map<HtmlTagDescriptor>((file) => ({
            tag: "link",
            attrs: { rel: "preload", href: `/${file.fileName}`, as: "font", type: "font/woff2", crossorigin: "", fetchpriority: "low" },
            injectTo: "head",
          }));
      },
    },
  };
}

/**
 * Both pages load the same stylesheets in the same order, but half the rules are scoped to one page through the
 * classes only that page ever renders (`.story-part-2`, `.story-page-part-two`, `.app-part-two` and their Part I
 * twins). Part II imports its copies with `?page=two`, so each page gets its own CSS file, and this drops the
 * selectors that can only match on the other page. Nothing else moves, so the cascade of what remains is unchanged.
 */
const otherPageScope = {
  partOne: /\.(?:story-part-2|story-page-part-two|app-part-two)(?![\w-])/,
  partTwo: /\.(?:story-part-1|story-page-part-one|app-part-one)(?![\w-])/,
};

/** A page class inside :not(), :is() or :where() does not tie a selector to that page, so those groups are ignored. */
function withoutNeutralGroups(selector: string): string {
  let out = "";
  for (let i = 0; i < selector.length; ) {
    const group = /^:(?:not|is|where)\(/.exec(selector.slice(i));
    if (!group) {
      out += selector[i++];
      continue;
    }
    let depth = 0;
    let j = i + group[0].length - 1;
    for (; j < selector.length; j++) {
      if (selector[j] === "(") depth++;
      else if (selector[j] === ")" && --depth === 0) break;
    }
    out += ":is(*)";
    i = j + 1;
  }
  return out;
}

function dropEmptyAtRules(root: Root) {
  let removed = true;
  while (removed) {
    removed = false;
    root.walkAtRules((rule) => {
      if (rule.nodes && rule.nodes.length === 0) {
        rule.remove();
        removed = true;
      }
    });
  }
}

function pageScopedCss(): Plugin {
  return {
    name: "hvn:page-scoped-css",
    apply: "build",
    transform(code, id) {
      if (!/\/src\/styles\/[^/]+\.css(?:\?|$)/.test(id)) return null;
      const drop = /[?&]page=two\b/.test(id) ? otherPageScope.partTwo : otherPageScope.partOne;
      const root = postcss.parse(code);
      root.walkRules((rule) => {
        if (rule.parent?.type === "atrule" && /keyframes$/i.test((rule.parent as { name: string }).name)) return;
        const kept = rule.selectors.filter((selector) => !drop.test(withoutNeutralGroups(selector)));
        if (kept.length === rule.selectors.length) return;
        if (kept.length) rule.selectors = kept;
        else rule.remove();
      });
      dropEmptyAtRules(root);
      return { code: root.toString(), map: null };
    },
    // Keyframes are only safe to drop once a page's whole stylesheet is assembled: they are often defined in one
    // file and used from another.
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type !== "asset" || !file.fileName.endsWith(".css")) continue;
        const root = postcss.parse(String(file.source));
        const words = new Set<string>();
        root.walkDecls((declaration) => declaration.value.split(/[\s,()]+/).forEach((word) => words.add(word)));
        root.walkAtRules(/keyframes$/i, (rule) => {
          if (!words.has(rule.params.trim())) rule.remove();
        });
        dropEmptyAtRules(root);
        file.source = root.toString();
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), preloadCriticalFonts(), pageScopedCss()],
  build: {
    chunkSizeWarningLimit: 1200,
    // The small vietnamese-ext font cuts are under Vite's 4 kB inline limit; as data URIs they would sit in the
    // render-blocking stylesheet of every page instead of being fetched only when a page uses that weight.
    assetsInlineLimit: (file) => (file.endsWith(".woff2") ? false : undefined),
    rollupOptions: {
      input: {
        main: "index.html",
        partTwo: "part-2/index.html",
      },
      output: {
        // Libraries change far less often than the story, so a content edit keeps returning readers' vendor cache warm.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return "react";
          if (/node_modules\/(gsap|@gsap|lenis)\//.test(id)) return "motion";
          return undefined;
        },
      },
    },
  },
});
