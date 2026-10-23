# Pollinations AI Thumbnail Integration
- [x] Verify official OpenAPI documentation and live image catalog; use `tongyi-mai/z-image-turbo` via `GET https://gen.pollinations.ai/image/{prompt}` with server-header authentication.
- [x] Collect Pollinations key securely and replace the thumbnail provider without fallback or automatic retries.
- [x] Generate exactly one real image (HTTP 200), verify 1280x720 PNG download and mobile no-overflow layout; billing record reports `cost_usd: 0.004` for one generated image.
- [x] Preserve all other tools; 26 focused tests passed and current build is OK. Regenerate remains wired and enabled but was not clicked, respecting the one-image test limit.