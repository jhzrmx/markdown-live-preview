# Markdown Live Preview

A clean, split-screen Markdown editor built with SolidJS, Vite, TypeScript, and Tailwind CSS v4.

This project is designed for fast writing, instant previewing, and safe local recovery. It keeps your draft in `localStorage`, syncs scrolling between the editor and preview panes, and includes a persistent dark mode toggle for a comfortable writing experience.

## Preview

`markdown-live-preview` is a lightweight frontend app focused on a smooth Markdown editing workflow:

- Split-screen editor and rendered preview
- Real-time Markdown updates
- Scroll sync between both panes
- Automatic draft persistence with `localStorage`
- Theme toggle with saved preference
- Syntax highlighting in multiline code if language is specified
- Built with SolidJS and Vite for a fast development experience

## Tech Stack

- `SolidJS`
- `Vite`
- `TypeScript`
- `Tailwind CSS v4`
- `marked`
- `DOMPurify`

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/jhzrmx/markdown-live-preview.git
cd markdown-live-preview
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open the local Vite URL shown in your terminal, usually `http://localhost:5173`.

## Available Scripts

```bash
npm run dev
```

Runs the app in development mode.

```bash
npm run build
```

Builds the app for production.

```bash
npm run preview
```

Serves the production build locally for preview.

## Project Structure

```text
markdown-live-preview/
├─ src/
│  ├─ App.tsx
│  ├─ index.css
│  └─ index.tsx
├─ index.html
├─ package.json
├─ vite.config.ts
└─ README.md
```

## How It Works

The app stores the current Markdown content in `localStorage`, so a page refresh does not wipe out the draft. The preview is rendered live from the editor content, sanitized before injection, and kept visually aligned with the editor through synchronized scrolling logic.

## Contributing

Contributions are welcome. If you want to improve the UI, fix bugs, refine Markdown rendering, or add quality-of-life features, feel free to open an issue or submit a pull request.

### Suggested contribution flow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the app locally
5. Open a pull request with a clear description

### Good areas for contribution

- Better Markdown styling
- Accessibility improvements
- Keyboard shortcuts
- Export or copy helpers
- Improved mobile editing experience
- Test coverage

## Development Notes

- Tailwind is configured using the Tailwind v4 Vite plugin, with no PostCSS setup
- Markdown is parsed with `marked`
- Rendered HTML is sanitized with `DOMPurify`
- Theme preference and draft content are persisted in the browser

## License

No license has been added yet.
