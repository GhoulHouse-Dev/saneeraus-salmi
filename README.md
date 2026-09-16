# Saneerauspalvelu Salmi Oy — Lead Landing Page

Ultra-responsive, zero-framework lead-generation landing page for social and paid traffic.

## Included

- Mobile-first CRO landing page with a 3-field hero form
- 4-step high-intent lead form
- Service sections for AHA/asbestos, structural repairs and water damage
- Trust signals and mobile sticky CTA
- Accessible semantic HTML and responsive CSS
- GA4 / Meta Pixel hooks, disabled until IDs are configured
- Vercel serverless lead endpoint with validation + honeypot
- Resend email delivery with a phone fallback if the integration is unavailable
- SEO title/description + JSON-LD
- Node built-in tests with no runtime npm dependencies

## Verification

```bash
npm test
npm run verify
```

## Vercel environment variables

Set these before enabling live lead capture:

- `RESEND_API_KEY` — Resend API key
- `LEAD_TO_EMAIL` — destination mailbox; defaults to `toimisto@saneerauspalvelusalmi.fi`
- `LEAD_FROM_EMAIL` — verified Resend sender; defaults to `Saneerauspalvelu Salmi <leads@ghoulhouse.fi>`

## Analytics

Edit `site-config.js`:

```js
window.SALMI_SITE_CONFIG = {
  ga4Id: 'G-XXXXXXXXXX',
  metaPixelId: '1234567890'
};
```

When IDs are blank, no third-party analytics scripts are loaded.

Tracked actions:

- `lead_form_start`
- `lead_form_step`
- `lead_submit`
- `contact_phone_click`
- Meta `Lead` on successful form submission
- Meta `Contact` on phone clicks

## Production-domain gate

The landing page intentionally ships with `meta robots=noindex` because the final campaign domain was not specified in the build request. Before public indexing:

1. Confirm the final domain.
2. Add the canonical URL to `index.html`.
3. Add the public site URL to JSON-LD.
4. Change the robots meta value from `noindex,follow` to `index,follow`.
5. Add/update `sitemap.xml` and its URL in `robots.txt`.

This prevents an unconfirmed or placeholder domain from being indexed accidentally.

## Conversion architecture

The page follows one primary funnel:

1. Recognise the problem
2. Establish technical trust
3. Explain the next step
4. Capture a low-friction lead

The visitor is never required to diagnose the building themselves; `En osaa sanoa` is an explicit service option.
