# Wedding Album — Development Checklist

## Implemented in the repository
- [x] Next.js App Router + TypeScript project setup
- [x] Cinematic responsive landing page and sample gallery filters
- [x] Album preview with page navigation (prototype, not true 3D)
- [x] Google OAuth start/callback routes with random state validation
- [x] Read-only Google Drive scope
- [x] Encrypted, HTTP-only cookie session for Google tokens
- [x] Access-token refresh flow
- [x] API endpoint to list Google Drive folders
- [x] API endpoint to list image/video files, optionally filtered by folder
- [x] Landing page panel to connect Drive and list real media filenames
- [x] Interactive cinematic photo lightbox for mock memories
- [x] 3D perspective album-cover opening animation and page navigation using mock photos
- [x] Environment-variable example and Google Cloud setup instructions
- [x] Health endpoint and CI build workflow definition

## Still required
- [ ] Add real Google OAuth credentials to local/Vercel environment and test sign-in end to end
- [ ] Verify GitHub Actions production build; no run result has been confirmed yet
- [ ] Show authenticated Drive thumbnails in the gallery (currently the Drive panel lists filenames)
- [ ] Connect selected Drive media to the main gallery and page preview
- [ ] Replace hard-coded sample images with a richer mock-data set and connect real thumbnails after OAuth is tested
- [ ] Implement actual video playback
- [ ] Implement genuine page-turn animation and keyboard/touch accessibility
- [ ] Add QR sharing with an explicit private/public album access model
- [ ] Test on mobile, desktop, and TV browsers
- [ ] Review token/session handling and deployment security before production

## Configuration needed from the owner
Set these in `.env.local` for local development and in Vercel Environment Variables for production:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` — must exactly match the Google Cloud OAuth redirect URI
- `APP_SECRET` — a strong random secret, at least 32 characters

Never commit real secrets, access tokens, or refresh tokens to GitHub.
