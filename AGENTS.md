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
- Text AI calls use `src/lib/ai.functions.ts`; AI thumbnails use `/api/generate-thumbnail` to proxy the external provider through `src/lib/image-gateway.server.ts`, keeping credentials and provider errors server-side.
- Thumbnail responses are binary images decoded in the browser and re-exported as exact-size PNG; no automatic retries or provider/sample-image fallback, avoiding hidden charges.
- Each thumbnail request uses a fresh explicit provider-supported random seed and a no-store fetch, preventing fixed random-sentinel URLs from returning cached variations.
- Image tools run fully client-side via canvas (`src/lib/image.ts`) and are lazy-loaded behind `ClientOnly`; no image uploads.
- Ad placements use `AdSlot`, which renders nothing until a provider is configured; no fake ads.
- Platform logos come only from `src/components/brand-icons.tsx` (official Simple Icons paths) and per-tool colours from `tone` in the registry mapped via `src/lib/tone.ts`; keeps brand marks accurate and colour classes literal for Tailwind.
