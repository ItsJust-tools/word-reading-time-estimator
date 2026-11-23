# Word Reading Time Estimator

Estimate how long any text takes to read or speak. Paste text, pick a speed, and get instant word counts and time estimates - a practical pacing utility for writers, students and presenters.

**Live:** [word-reading-time-estimator.itsjust.tools](https://word-reading-time-estimator.itsjust.tools)

## Features

- Paste large text with live word, character, sentence, and paragraph counts
- Reading-speed presets: slow (150), average (200), fast (300 WPM), plus a custom WPM field
- Separate speaking-time mode at 130 WPM default for presentations
- Per-paragraph breakdown table showing estimated time each paragraph takes
- Longest and shortest word statistics plus average word length
- Copy the summary to the clipboard with toast feedback
- Shareable state via URL, `.itsjust.json` import/export and image/PDF export
- 100% client-side - no data ever leaves your browser

## Usage

1. Paste or type text into the input area.
2. Switch between **Reading time** and **Speaking time** tabs.
3. Pick a speed preset or enter a custom words-per-minute value in the sidebar.
4. Toggle the per-paragraph breakdown to see pacing paragraph by paragraph.
5. Use **Copy summary** or **Save to history** to keep estimates, and the share button to create a URL that restores this state.
6. Export the report as PNG, JPEG, WebP or PDF when needed.

## How it works

```
seconds = (word count / words per minute) x 60
```

Paragraphs are split on blank lines, sentences on `.`, `!` and `?` terminators, and words on whitespace. All analysis runs in the browser; nothing is uploaded.

## Tech

- Next.js App Router + React 19 + TypeScript
- Vitest unit tests and Playwright e2e smoke test
- `@itsjust/core` tool shell with import/export and URL sharing

## Scripts

```sh
npm install
npm run dev      # local development
npm test         # unit tests
npm run build    # production build
```

## License

MIT
