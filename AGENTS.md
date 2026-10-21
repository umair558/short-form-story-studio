<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Tool registry lives in `src/lib/tools.ts`; cards, search, footer and filters read from it so adding a tool is one entry plus one route file.
- AI calls go only through server functions in `src/lib/ai.functions.ts`, which lazy-import `src/lib/ai.server.ts`; keeps the API key server-side and returns `{ok,error}` instead of throwing so the UI shows honest "unavailable" messages, never fake output.
- Image tools run fully client-side via canvas (`src/lib/image.ts`) and are lazy-loaded behind `ClientOnly`; no image uploads.
- Ad placements use `AdSlot`, which renders nothing until a provider is configured; no fake ads.
- Platform logos come only from `src/components/brand-icons.tsx` (official Simple Icons paths) and per-tool colours from `tone` in the registry mapped via `src/lib/tone.ts`; keeps brand marks accurate and colour classes literal for Tailwind.
