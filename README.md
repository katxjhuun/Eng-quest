# English Quest

English Quest is a mobile-friendly English-learning PWA with music rewards and optional Google account progress sync.

## Deployment status

This repository is being prepared for Render + Supabase. **Do not put secrets or a real `.env` file in this repository.** The repository is currently public, so every committed file is publicly readable.

## Required application files

The application source ZIP contains:
- `server.js`
- `package.json`
- `public/index.html`, `public/sw.js`, manifest and icons
- `database/supabase-schema.sql`
- `render.yaml`

Upload the contents of the latest `english_quest_google_cloud_v20.zip` to the repository root, merging these files and replacing the placeholder files when prompted. Do not upload `.env`, local `data/` folders, or API keys.

## Deploy to Render

1. Create a Supabase project and run `database/supabase-schema.sql` in SQL Editor.
2. Create a Render Web Service from this GitHub repo.
3. Use Build Command `npm install` and Start Command `npm start`.
4. Set `GOOGLE_CLIENT_ID`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and `SESSION_SECRET` as Render environment variables.
5. Configure the deployed HTTPS origin in Google Cloud Console OAuth client settings.
6. Open the resulting HTTPS URL on Android Chrome or iPhone Safari and add it to the home screen.

See the full setup guide in the v20 ZIP's README.
