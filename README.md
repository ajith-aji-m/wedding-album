# Wedding Album

A cinematic, responsive wedding album experience built with Next.js and TypeScript for mobile, desktop, and TV browsers.

## Current prototype

- Cinematic landing page with warm, dark editorial styling
- Responsive memory gallery with All Memories, Photographs, and Films filters
- Animated album-cover preview with page navigation
- Google Drive OAuth 2.0 routes and encrypted, HTTP-only session cookie
- API routes to list Drive folders and image/video files after authorization
- Health endpoint at `/api/health`

The gallery still uses sample imagery; it is not yet wired into the live gallery UI. Full 3D page-turn animation, QR sharing, and real video playback are not yet implemented.

## Run locally

Requirements: Node.js 20.9+ and npm.

```bash
git clone https://github.com/ajith-aji-m/wedding-album.git
cd wedding-album
npm install
cp .env.example .env.local
npm run dev
```

Generate a strong application secret for `APP_SECRET` (for example, `openssl rand -base64 32`) and place it in `.env.local`. Fill the Google OAuth variables as described below.

## Google Drive OAuth setup

1. In Google Cloud Console, create or select a project.
2. Enable the **Google Drive API**.
3. Configure the OAuth consent screen and add your Google account as a test user while the app is in testing.
4. Create an OAuth client ID of type **Web application**.
5. Add this Authorized redirect URI exactly: `http://localhost:3000/api/auth/google/callback`.
6. Copy the client ID and client secret into `.env.local`; set `GOOGLE_REDIRECT_URI` to the exact same URI.
7. Restart the dev server.
8. Visit `http://localhost:3000/api/auth/google` and approve read-only Drive access.

For production, add the deployed domain's callback URL to Google Cloud Console and set the matching environment variables in Vercel. Never commit `.env.local`, client secrets, access tokens, or refresh tokens.

## API routes implemented

- `GET /api/auth/google` — start Google OAuth consent
- `GET /api/auth/google/callback` — validate OAuth state and establish an encrypted session cookie
- `POST /api/auth/google/disconnect` — clear the local Drive session cookie
- `GET /api/drive/folders` — list folders visible to the connected Google account
- `GET /api/drive/files?folderId=<folder-id>` — list image and video files; omit folderId to list all accessible image/video files
- `GET /api/health` — basic deployment health response

## Deploy to Vercel

1. Import `ajith-aji-m/wedding-album` into Vercel and deploy with the Next.js preset.
2. Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, and `APP_SECRET` in Vercel Project Settings → Environment Variables.
3. Add the exact production callback URL (`https://YOUR_DOMAIN/api/auth/google/callback`) to the OAuth client's Authorized redirect URIs.
4. Redeploy after changing environment variables.

## Remaining work

- Run a production build and fix any build/lint errors
- Connect the API data to the gallery UI and implement actual video playback
- Add album folder selection and pagination
- Implement genuine page-turn animation and accessible keyboard/touch controls
- Add secure QR sharing with a clear privacy model
- Test on mobile, desktop, and TV browsers

The OAuth routes are initial implementation and still need an end-to-end test with real Google Cloud credentials before production use.
