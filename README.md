# Edmovinn public website

This repository now contains the React/Vite website from
`doaaabed94/edmovinn-83` at `d3f06d7fcd6d3cb87ddb512df13909f6e7e62b36`.
The former Nuxt website remains in Git history through
`a2bdd2aeca483d46002cb96610f5740e671aa0e5`; no published history was rewritten.

The website and owner portal at `https://app.edmovinn.com` use the same PHP API:
`https://api.edmovinn.com`. Pages, contact details, residences, room pricing,
facilities, media and booking requests are managed through the owner portal.

## Development

Use Node 22 and the committed npm lockfile:

```sh
npm ci
cp .env.example .env.local
npm run dev
```

`.env.example` points to the local PHP API. Configure that API's allowed origins
for your development URL. Credentials and private configuration must never be
committed or added to `VITE_` variables.

## Production build

```sh
npm ci --include=dev
npm run typecheck
npm run build
```

The tracked `.env.production` contains only the public API URL. `npm run generate`
also produces the same `dist/` directory for static deployment tooling previously
used with Nuxt. This project no longer has a Nuxt server or payment middleware.

GitHub Actions checks the exact `main` revision and saves `dist/` as a release
artifact. A successful build is not itself a hosting deployment.

Publish `dist/` to the existing website hosting origin. Serve SPA routes with an
`index.html` fallback, including `/ar/*`, `/tr/*`, `/rooms/*`, `/accommodations/*`,
`/auth` and `/checkout`. Upload hashed assets before activating `index.html`.
Keep a private rollback copy of the previous release and invalidate the CDN's
HTML/route cache. Do not cache `index.html` across releases. A CDN with a positive
minimum TTL also needs its HTML cache policy adjusted by the hosting operator.

On 2026-11-01 the public domain was served by Amazon S3 through CloudFront
`decj7n1izh2ht.cloudfront.net`, independently of the older unused Nginx site on
the app/API server. This repository does not contain that hosting account's
credentials. Do not change DNS or assume that updating the old server checkout
replaces the public domain. Verify the deployed HTML, current asset hashes,
deep links, published catalogue and admin/API connection after activation.

## Data and booking readiness

Publish reviewed residences from Website & Bookings in the owner portal.
Imported price periods and physical availability must be reviewed before
enabling bookings; publishing a listing does not automatically approve these.
The 12 MovInn offers matched the existing public source during the 2026-11-01
review, but their imported pricing period ended on 2026-10-24. Other draft
properties must not be treated as verified inventory.

Home, about, contact and footer use the published EN/AR/TR CMS pages. Hidden
sections stay hidden. Contact phone changes also update the footer and WhatsApp.
Deploy API revision `d7a5c103bb339fac851ffa44444fec38bb5904cf` or later for
residence-scoped search and room transport notes. Payments and authentication
providers are controlled by the API's existing production configuration.
