# Pollinations AI Thumbnail Integration
- [ ] Connection failures: inspect production logs and current API docs, remove compatibility-sensitive fetch options, add safe diagnostics and manual Retry; run tests and exactly one live image request with PNG and cost verification.
- [x] Verify official OpenAPI documentation and live image catalog; use `tongyi-mai/z-image-turbo` via `GET https://gen.pollinations.ai/image/{prompt}` with server-header authentication.
- [x] Collect Pollinations key securely and replace the thumbnail provider without fallback or automatic retries.
- [x] Generate exactly one real image (HTTP 200), verify 1280x720 PNG download and mobile no-overflow layout; billing record reports `cost_usd: 0.004` for one generated image.
- [x] Preserve all other tools; original integration checks passed.
- [x] Fix cached Regenerate results with fresh supported seeds; 4 regression tests passed and build OK. Exactly one live Regenerate request returned HTTP 200 from Pollinations `tongyi-mai/z-image-turbo`, changed image pixels and downloaded a valid 1280x720 PNG. No browser errors or fallback; the new charge has not appeared in provider usage records.