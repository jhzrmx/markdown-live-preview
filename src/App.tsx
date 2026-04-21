import DOMPurify from "dompurify";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import { marked } from "marked";
import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";

const STORAGE_KEY = "markdown-live-preview:document";
const THEME_KEY = "markdown-live-preview:theme";

const defaultMarkdown = `# Markdown Live Preview

Welcome back. Your draft is saved automatically as you type.

## What this app does

- Live preview while writing
- Split-screen editor and preview
- Scroll sync between both panes
- Dark mode with saved preference

## Quick sample

> Try editing this text, refreshing the page, and switching themes.

\`\`\`ts
const greeting = 'Hello, Solid + Tailwind 4!'
console.log(greeting)
\`\`\`

### Checklist

- [x] Persist content in localStorage
- [x] Recover after refresh
- [x] Keep both panes aligned
`;

type ThemeMode = "light" | "dark";

marked.setOptions({
  breaks: true,
  gfm: true,
});

marked.use({
  renderer: {
    code(token) {
      const lang = token.lang || "plaintext";
      const valid = hljs.getLanguage(lang);

      const highlighted = valid
        ? hljs.highlight(token.text, { language: lang }).value
        : hljs.highlightAuto(token.text).value;

      return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
    },
  },
});

function App() {
  const [markdown, setMarkdown] = createSignal(defaultMarkdown);
  const [theme, setTheme] = createSignal<ThemeMode>("dark");

  let editorRef: HTMLTextAreaElement | undefined;
  let previewRef: HTMLDivElement | undefined;
  let syncReleaseTimer: number | undefined;
  let syncSource: "editor" | "preview" | null = null;

  const wordCount = createMemo(() => {
    const trimmed = markdown().trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  });

  const html = createMemo(() =>
    DOMPurify.sanitize(marked.parse(markdown()) as string, {
      USE_PROFILES: { html: true },
    }),
  );

  const applyTheme = (mode: ThemeMode) => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    document.documentElement.style.colorScheme = mode;
  };

  const syncScroll = (source: "editor" | "preview") => {
    const editor = editorRef;
    const preview = previewRef;

    if (!editor || !preview) {
      return;
    }

    const sourceElement = source === "editor" ? editor : preview;
    const targetElement = source === "editor" ? preview : editor;
    const sourceMax = sourceElement.scrollHeight - sourceElement.clientHeight;
    const targetMax = targetElement.scrollHeight - targetElement.clientHeight;

    if (sourceMax <= 0 || targetMax <= 0) {
      targetElement.scrollTop = 0;
      return;
    }

    const progress = sourceElement.scrollTop / sourceMax;
    targetElement.scrollTop = progress * targetMax;
  };

  const handleScroll = (source: "editor" | "preview") => {
    if (syncSource && syncSource !== source) {
      return;
    }

    syncSource = source;
    syncScroll(source);

    window.clearTimeout(syncReleaseTimer);
    syncReleaseTimer = window.setTimeout(() => {
      syncSource = null;
    }, 80);
  };

  onMount(() => {
    const savedMarkdown = window.localStorage.getItem(STORAGE_KEY);
    const savedTheme = window.localStorage.getItem(
      THEME_KEY,
    ) as ThemeMode | null;
    const preferredDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (savedMarkdown) {
      setMarkdown(savedMarkdown);
    }

    const initialTheme = savedTheme ?? (preferredDark ? "dark" : "light");
    setTheme(initialTheme);
    applyTheme(initialTheme);

    requestAnimationFrame(() => syncScroll("editor"));
  });

  onCleanup(() => {
    window.clearTimeout(syncReleaseTimer);
  });

  createEffect(() => {
    const value = markdown();
    window.localStorage.setItem(STORAGE_KEY, value);

    requestAnimationFrame(() => {
      if (syncSource !== "preview") {
        syncScroll("editor");
      }
    });
  });

  createEffect(() => {
    const currentTheme = theme();
    applyTheme(currentTheme);
    window.localStorage.setItem(THEME_KEY, currentTheme);
  });

  return (
    <main class="min-h-screen font-sans bg-stone-100 text-stone-900 transition-colors duration-300 dark:bg-stone-950 dark:text-stone-100">
      <div class="mx-auto flex min-h-screen max-w-[1800px] flex-col">
        <header class="sticky top-0 z-50 border-b border-stone-200 bg-white/80 px-4 py-4 backdrop-blur dark:border-stone-800 dark:bg-stone-950/80 md:px-6">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="space-y-2">
              <div>
                <h1 class="font-sans font-bold text-3xl text-stone-950 dark:text-white md:text-4xl">
                  Markdown Live Preview
                </h1>
                <p class="max-w-2xl text-sm text-stone-600 dark:text-stone-400 md:text-base">
                  Write on the left, review on the right, and keep your draft
                  safe in local storage.
                </p>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <div class="rounded-full border border-stone-300 bg-stone-100 px-4 py-2 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-300">
                {wordCount()} words
              </div>
              <button
                type="button"
                onClick={() => setTheme(theme() === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
                class="flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-900 transition hover:scale-105 hover:border-amber-500 hover:text-amber-600 active:scale-95 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:border-amber-400 dark:hover:text-amber-300"
              >
                {theme() === "dark" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364-1.414-1.414M7.05 7.05 5.636 5.636m12.728 0-1.414 1.414M7.05 16.95l-1.414 1.414M12 8a4 4 0 100 8 4 4 0 000-8z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707 8.001 8.001 0 1017.293 13.293z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </header>

        <section class="grid flex-1 grid-cols-1 bg-white dark:bg-stone-950 lg:grid-cols-2">
          <div class="flex min-h-[40vh] flex-col border-b border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-900/60 lg:min-h-0 lg:border-b-0 lg:border-r">
            <div class="border-b border-stone-200 px-4 py-3 dark:border-stone-800 md:px-6">
              <p class="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400">
                Editor
              </p>
            </div>
            <textarea
              ref={editorRef}
              value={markdown()}
              onInput={(event) => setMarkdown(event.currentTarget.value)}
              onScroll={() => handleScroll("editor")}
              spellcheck={false}
              class="min-h-[50vh] flex-1 resize-none bg-transparent px-4 py-5 font-mono text-sm leading-7 text-stone-900 outline-none placeholder:text-stone-400 dark:text-stone-100 md:px-6 md:text-base"
              placeholder="Start typing markdown..."
            />
          </div>

          <div class="flex min-h-[40vh] flex-col bg-white dark:bg-stone-950">
            <div class="border-b border-stone-200 px-4 py-3 dark:border-stone-800 md:px-6">
              <p class="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400">
                Preview
              </p>
            </div>
            <div
              ref={previewRef}
              onScroll={() => handleScroll("preview")}
              class="min-h-[50vh] flex-1 overflow-auto px-4 py-5 md:px-6"
            >
              <article
                class="markdown-preview github-font mx-auto max-w-none font-sans"
                innerHTML={html()}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
