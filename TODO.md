# Disclosure Project TODO & Status

## Current Checkpoint (April 2026)
- **Status**: Backend Vertex AI Gateway running locally/GKE (Port 8080).
- **Frontend**: Vite + React stack running successfully.
- **Routing**: CORS updated for `*.ngrok-free.dev`. Vercel configuration moved to `frontend/vercel.json` with API rewrites pointing to Ngrok. Git push completed to trigger Vercel pipeline.

## Pending Tasks
- [ ] Add the domain name to the site (currently on temp domain).
- [ ] Enhance graphics.
- [ ] Enhance codebase/features.
- [ ] Verify deployment on `anw-aetheric-envoy`.
- [ ] Verify Vercel successfully builds the frontend and hits the Ngrok tunnel during a live session.
- [ ] Address any remaining UI updates within the frontend component logic (`RitualLayer.tsx`, etc.).
