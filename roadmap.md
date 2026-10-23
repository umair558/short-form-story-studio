# Platform upgrade
- [x] Saved light/dark themes, horizontal mobile tool cards, back navigation and coming-soon cards.
- [x] Compact thumbnail toolbars preserving Pollinations and local image editing.
- [x] Registration, login, reset, logout and protected profile account.
- [x] Atomic daily five-thumbnail allowance with indexed Cloud storage.
- [x] 37 tests passed including real database concurrency and five-success enforcement. Browser verified theme persistence, account gate/login/profile/logout, server rejection of sixth request, mobile rows/toolbar, and local 1280x720 PNG export.
- [ ] Live Pollinations success: one Generate click did not produce a downloadable result within 210 seconds; no retry or fallback. Provider cost and exact upstream result were not captured. A further paid request needs user permission.
- [ ] Email confirmation and password-recovery delivery: require a real test inbox; reserved example.com registration was correctly rejected. Login/profile flows used a temporary confirmed test account, removed afterward.
- [ ] 60,000-account capacity: indexed queries and atomic quotas are implemented; requires load testing and infrastructure sizing.

# Pollinations AI Thumbnail Integration
- [x] Connection failures: production logs confirm generic fetch exceptions (underlying cause was swallowed). Verified current official endpoint, bearer auth, model and binary responses; removed compatibility-sensitive cache option, added timeout, safe diagnostics and manual Retry. 14 tests and build passed. Exactly one live manual Retry in preview returned Pollinations HTTP 200 and a valid 1280x720 PNG; charge has not appeared yet. Production intermittency remains unverified until the update is published; no automatic retry/fallback or other-tool changes.
- [x] Verify official OpenAPI documentation and live image catalog; use `tongyi-mai/z-image-turbo` via `GET https://gen.pollinations.ai/image/{prompt}` with server-header authentication.
- [x] Collect Pollinations key securely and replace the thumbnail provider without fallback or automatic retries.
- [x] Generate exactly one real image (HTTP 200), verify 1280x720 PNG download and mobile no-overflow layout; billing record reports `cost_usd: 0.004` for one generated image.
- [x] Preserve all other tools; original integration checks passed.
- [x] Fix cached Regenerate results with fresh supported seeds; 4 regression tests passed and build OK. Exactly one live Regenerate request returned HTTP 200 from Pollinations `tongyi-mai/z-image-turbo`, changed image pixels and downloaded a valid 1280x720 PNG. No browser errors or fallback; the new charge has not appeared in provider usage records.