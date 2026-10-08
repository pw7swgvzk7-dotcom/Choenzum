# Choenzum

Scroll-driven floral atelier site. No dependencies; needs Node 18+.

## Run on localhost
    ADMIN_PASSWORD="choose-a-password" npm start
Open http://localhost:3000 (if you skip ADMIN_PASSWORD the password is `choenzum-admin`).

## Edit text (admin)
Click **Admin** in the footer, enter the password, click any text, change it, press **Save**.
Saved text is written to `public/content.json`, so commit that file to keep it.

## Domain
Suggested: choenzum.com (availability not checked; verify at a registrar).
The order button uses hello@choenzum.com; change the `href` in `public/index.html`.
Deploy `public/` plus `server.js` to any Node host (Render, Railway, Fly.io) and point the domain's DNS at it.
Host only `public/` on static hosting (GitHub Pages) and the page works, but Admin saves stay in one browser.

## GitHub
    git init && git add . && git commit -m "Choenzum site"
    git remote add origin <your-repo-url> && git push -u origin main
