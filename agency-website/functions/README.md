# Project inquiry backend (Cloudflare Pages Functions)

`api/project-inquiry.js` handles the "Start a Project" form submission: spam
checks, validation, and two emails (owner notification + client confirmation)
sent through Zoho's HTTPS Mail API. It uses the HTTP API instead of SMTP
because Cloudflare's edge runtime doesn't support the raw socket connections
a library like Nodemailer needs.

## One-time Zoho setup (do this once, in your own Zoho account)

1. Go to the [Zoho API Console](https://api-console.zoho.com/) and click
   **Add Client** → **Self Client**.
2. On the **Client Secret** tab, copy the **Client ID** and **Client Secret**.
3. Go to the **Generate Code** tab. Enter:
   - Scope: `ZohoMail.messages.CREATE,ZohoMail.accounts.READ`
   - Time duration: 10 minutes
   - Description: anything (e.g. "website backend")
   Click **Create**, then copy the grant token it shows you (looks like
   `1000.abcd1234....`). You only have ~10 minutes to use it.
4. Immediately exchange it for a refresh token:
   ```bash
   curl -X POST "https://accounts.zoho.com/oauth/v2/token" \
     -d "grant_type=authorization_code" \
     -d "client_id=YOUR_CLIENT_ID" \
     -d "client_secret=YOUR_CLIENT_SECRET" \
     -d "code=YOUR_GRANT_TOKEN"
   ```
   The response includes `access_token` (expires in ~1 hour) and
   `refresh_token` (long-lived — this is the one you'll store permanently).
5. Look up your Zoho Mail account ID using the `access_token` from step 4:
   ```bash
   curl -X GET "https://mail.zoho.com/api/accounts" \
     -H "Authorization: Zoho-oauthtoken YOUR_ACCESS_TOKEN"
   ```
   Find the entry for `abdulbasit@abaryx.com` and copy its `accountId`.

You now have everything needed: `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`,
`ZOHO_REFRESH_TOKEN` (from step 4), and `ZOHO_ACCOUNT_ID` (from step 5).

## Local testing

```bash
cp .dev.vars.example .dev.vars   # then fill in the values from above
npx wrangler pages dev .
```

If `.dev.vars` is left with placeholder values, the function logs emails to
the console instead of sending them, so you can test the whole flow without
the Zoho setup done yet.

## Deploying

In the Cloudflare dashboard: **Workers & Pages** → **Create** → **Pages** →
connect this GitHub repo, set the project's root directory to
`agency-website`, and leave the build command empty (it's a static site with
Functions, no build step). Then add the same variables from `.dev.vars` under
**Settings → Environment variables** as **secrets** (not plain text) for the
Production environment.

## Rate limiting

The function checks a `RATE_LIMIT_KV` binding if you create one (Workers &
Pages → your project → Settings → Functions → KV namespace bindings) — 5
requests per 15 minutes per IP. Without it, this check is skipped, so it's
also worth adding a Cloudflare **Rate Limiting Rule** (Security → WAF) on
`/api/project-inquiry` for infra-level protection regardless.
