# Wedding Album — Development Checklist

## Completed in the current prototype
- [x] Next.js App Router + TypeScript project setup
- [x] Responsive cinematic landing page and styling
- [x] Sample photo/video gallery with category filters
- [x] CSS-based album-cover/page preview with page navigation
- [x] Basic health endpoint at `/api/health`
- [x] Environment-variable template (empty placeholders only)
- [x] Local development and Vercel deployment instructions

## Remaining before this is a real usable album
- [ ] Run a production build and fix any build/lint errors
- [ ] Deploy to Vercel and verify the live URL
- [ ] Replace sample images with actual album media
- [ ] Implement a genuine page-turn interaction and accessible keyboard/touch controls
- [ ] Implement Google OAuth sign-in and secure server-side token storage
- [ ] Let the user select a Drive folder and list its image/video files
- [ ] Add thumbnails, loading states, error handling, and video playback
- [ ] Implement QR sharing with an explicit privacy model
- [ ] Test on Android/iOS browsers, desktop browsers, and TV browsers
- [ ] Add privacy/security checks before allowing shared access

## Important notes
- The gallery currently uses public sample image URLs; it does not read Google Drive.
- The video card is a placeholder, not a working video player.
- The album preview is a CSS interaction, not a full 3D/WebGL book.
- Do not add Google client secrets, access tokens, or refresh tokens to Git.
