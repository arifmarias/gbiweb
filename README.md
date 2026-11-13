# gbi.chat

Static site for GBI (Generative BI). No build step. Hosted on GitHub Pages.

- `index.html`, `styles.css`, `main.js`: the page
- `vendor/`: GSAP 3.13 and ScrollTrigger (local copy, no CDN)
- `CNAME`: custom domain `gbi.chat`
- Preview: `python3 -m http.server 8765`, then open http://localhost:8765
- Check for AI-slop tells: `npx impeccable detect http://localhost:8765`

## Deploy
1. Push `main` to https://github.com/arifmarias/gbiweb
2. Repo Settings > Pages > Deploy from branch > `main` / root. Set custom domain `gbi.chat`, tick Enforce HTTPS.
3. At Joker.com > gbi.chat > DNS records:
   - A `@` to 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - CNAME `www` to `arifmarias.github.io`
4. Set up `hello@gbi.chat` (Joker email forwarding). The "Request access" buttons use it.
