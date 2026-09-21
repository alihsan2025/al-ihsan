# Deployment Guide: Cloudflare Pages

This project is built with **Vite + React** and deploys to **Cloudflare Pages** using **Wrangler**.

## One-time setup

1. Install dependencies (Wrangler is already a dev dependency):
   ```bash
   npm install
   ```
2. Authenticate Wrangler with your Cloudflare account:
   ```bash
   npx wrangler login
   ```
   In a non-interactive/CI environment, instead set these environment variables:
   ```bash
   export CLOUDFLARE_API_TOKEN=your-api-token   # needs "Cloudflare Pages: Edit" permission
   export CLOUDFLARE_ACCOUNT_ID=your-account-id
   ```
3. Set the runtime environment variables the build needs (copy `.env.example` to `.env` locally, or configure them as **Build variables** on the Cloudflare Pages project / as `--var` flags):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_CLOUDINARY_CLOUD_NAME`
   - `VITE_CLOUDINARY_UPLOAD_PRESET`

## Deploy

```bash
npm run deploy
```

This runs `npm run build` (producing `dist/`) and then `wrangler pages deploy dist --project-name=alihsanrelief`. The first deploy creates the `alihsanrelief` Pages project in your Cloudflare account if it doesn't already exist.

## Custom domain (alihsanrelief.org)

After the first deploy, attach the production domain in the Cloudflare dashboard (Workers & Pages → alihsanrelief → Custom domains → Add `alihsanrelief.org` and `www.alihsanrelief.org`), or via Wrangler:
```bash
npx wrangler pages domain add alihsanrelief.org --project-name=alihsanrelief
```
If the domain's DNS is not already on Cloudflare, you'll need to update the domain's nameservers (or add a CNAME record) at your registrar to point to Cloudflare before the custom domain becomes active.

## SPA routing

`public/_redirects` contains `/* /index.html 200` so client-side routes (e.g. `/donate`, `/about`) resolve correctly instead of 404ing on refresh.

## Config

`wrangler.toml` sets `pages_build_output_dir = "dist"`, so `wrangler pages deploy dist` (or a Git-connected Cloudflare Pages project pointed at this repo) picks up the correct build output automatically.
