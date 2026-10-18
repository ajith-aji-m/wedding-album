# Wedding Album

A cinematic, responsive wedding album experience built with Next.js and TypeScript, designed for mobile, desktop, and TV browsers.

## Current prototype

- Cinematic landing page with warm, dark editorial styling
- Responsive memory gallery with All Memories, Photographs, and Films filters
- Animated album-cover preview with page navigation
- Mobile-friendly layout and reduced-motion support
- Vercel-compatible Next.js App Router setup

The gallery currently uses sample imagery. Video playback and Google Drive access are not connected yet.

## Run locally

Requirements: Node.js 20.9+ and npm.

```bash
git clone https://github.com/ajith-aji-m/wedding-album.git
cd wedding-album
npm install
npm run dev
```

Open http://localhost:3000.

To make a production build locally:

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Import `ajith-aji-m/wedding-album` into Vercel.
2. Keep the framework preset as Next.js.
3. Deploy with the default build settings.
4. Each push to the connected branch can trigger a new deployment.

## Planned next steps

1. Connect Google Drive using OAuth 2.0 with server-side token handling.
2. Let the owner choose the private Drive folder to read.
3. Detect image and video MIME types and render the right media player.
4. Add secure QR sharing and test playback on phones, laptops, and TV browsers.

Never commit Google OAuth client secrets, access tokens, or refresh tokens to GitHub.
