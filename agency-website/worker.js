// Cloudflare Worker entry point. Cloudflare's dashboard created this
// project as a "Worker with static assets" rather than classic Pages, so
// routing is handled here directly instead of via functions/ file-based
// routing (that convention only applies to Pages projects).
import { validateInquiry } from './functions/_lib/validate.js';
import { ownerEmailHtml, clientEmailHtml } from './functions/_lib/email-templates.js';
import { sendZohoMail, hasZohoCredentials } from './functions/_lib/zoho-mail.js';

// Applied to every response, HTML and API alike. Cloudflare terminates
// TLS but adds none of these itself, so without this block the site was
// shipping no HSTS, no clickjacking protection, no MIME-sniffing
// protection and a full referrer to third parties.
const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  // Deliberately permissive enough for the site's real dependencies:
  // Google Fonts, the GSAP CDN, and the Cal.com embed (which injects a
  // script and an iframe). frame-src must allow cal.com or the booking
  // overlay breaks.
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://app.cal.com https://cal.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https:",
    "connect-src 'self' https://app.cal.com https://cal.com",
    "frame-src https://app.cal.com https://cal.com",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'"
  ].join('; ')
};

function withSecurityHeaders(res) {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) headers.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      // Never let an API response be cached by a proxy or the browser.
      'Cache-Control': 'no-store'
    }
  });
}

// Fixed-window per-IP counter in Cloudflare KV. Requires a KV namespace
// bound as RATE_LIMIT_KV in the Worker's settings — skipped gracefully
// if it isn't configured. For infra-level protection, also add a
// Cloudflare Rate Limiting Rule on this path (Security -> WAF).
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SEC = 900; // 15 minutes

function rateLimitKey(ip) { return `inquiry-rl:${ip}`; }

async function isRateLimited(env, ip) {
  if (!env.RATE_LIMIT_KV) return false;
  const current = await env.RATE_LIMIT_KV.get(rateLimitKey(ip));
  return (current ? parseInt(current, 10) : 0) >= RATE_LIMIT_MAX;
}

// Counted separately from the check, and only for submissions that
// actually pass validation and trigger email sends. Counting rejected
// requests too would mean a visitor who trips validation a handful of
// times is locked out for 15 minutes — the limit exists to protect the
// expensive operation (sending mail), not to punish typos. Malformed
// payloads are already cheap and are bounded by the size/content-type
// gates above plus Cloudflare's own volumetric protections.
async function recordRateLimitedRequest(env, ip) {
  if (!env.RATE_LIMIT_KV) return;
  const key = rateLimitKey(ip);
  const current = await env.RATE_LIMIT_KV.get(key);
  const count = current ? parseInt(current, 10) : 0;
  await env.RATE_LIMIT_KV.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW_SEC });
}

async function sendEmail(env, { to, subject, html }) {
  if (!hasZohoCredentials(env)) {
    // Never silently "succeed" here. This previously logged and returned,
    // so a deploy with no secrets configured showed every visitor a
    // success screen while sending nothing at all — a total delivery
    // outage that looked completely healthy from the outside. Failing
    // loudly turns that into a visible 502 instead.
    // Local dev opts into the console fallback explicitly via .dev.vars.
    if (env.DEV_EMAIL_FALLBACK === 'true') {
      console.log(`[dev email] to=${to} subject="${subject}"`);
      return;
    }
    throw new Error('Zoho credentials are not configured on this deployment');
  }
  await sendZohoMail(env, { to, subject, html });
}

const MAX_BODY_BYTES = 32 * 1024; // generous for this form, tiny for an attacker

async function handleProjectInquiry(request, env) {
  const url = new URL(request.url);

  // --- Reject malformed/oversized requests BEFORE reading the body, so a
  // large payload is never pulled into memory or parsed. ---
  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return json({ success: false, message: 'Unsupported content type.' }, 415);
  }

  const declaredLength = parseInt(request.headers.get('Content-Length') || '0', 10);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return json({ success: false, message: 'Request too large.' }, 413);
  }

  // Same-origin only. This endpoint is called by our own form via a
  // relative path, so a cross-origin Origin header is never legitimate —
  // this is the CSRF control for a cookie-less JSON endpoint.
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== url.host) {
    return json({ success: false, message: 'Cross-origin requests are not allowed.' }, 403);
  }

  const raw = await request.text();
  // Content-Length can be absent (chunked) — enforce the cap on the real
  // byte length too rather than trusting the header.
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return json({ success: false, message: 'Request too large.' }, 413);
  }

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ success: false, message: 'Malformed JSON.' }, 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json({ success: false, message: 'Malformed request body.' }, 400);
  }
  // Defence-in-depth against prototype-pollution style payloads. JSON.parse
  // itself creates these as plain own properties rather than mutating the
  // prototype, but nothing downstream has any use for them.
  delete body.__proto__;
  delete body.constructor;
  delete body.prototype;

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

  if (typeof body.companyUrlHp === 'string' && body.companyUrlHp.trim().length > 0) {
    console.warn('[worker] Honeypot triggered — silently discarding submission.');
    return json({ success: true });
  }
  if (typeof body.formLoadedAt === 'number' && Date.now() - body.formLoadedAt < 2500) {
    console.warn('[worker] Timing check failed — silently discarding submission.');
    return json({ success: true });
  }

  if (await isRateLimited(env, ip)) {
    return json({ success: false, message: 'Too many requests. Please try again in a few minutes.' }, 429);
  }

  const errors = validateInquiry(body);
  if (errors.length) {
    return json({
      success: false,
      message: 'Please check your submission — some fields are missing or invalid.',
      fields: errors
    }, 400);
  }

  // Passed validation, so this one counts against the window.
  await recordRateLimitedRequest(env, ip);

  const submittedAt = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  const ownerEmail = env.OWNER_EMAIL || 'abdulbasit@abaryx.com';

  // The confirmation goes to the submitter plus any additional contacts
  // they listed. De-duplicated (case-insensitively) so nobody who typed
  // their own address into the extra rows gets it twice.
  const extras = Array.isArray(body.additionalEmails) ? body.additionalEmails : [];
  const confirmationRecipients = [...new Set(
    [body.email, ...extras].map((e) => String(e || '').trim()).filter(Boolean)
      .map((e) => e.toLowerCase())
  )];

  try {
    await Promise.all([
      sendEmail(env, {
        to: ownerEmail,
        subject: `New Project Inquiry — ${body.projectName}`,
        html: ownerEmailHtml(body, submittedAt)
      }),
      ...confirmationRecipients.map((to) => sendEmail(env, {
        to,
        subject: 'We received your project inquiry — Abaryx Solutions',
        html: clientEmailHtml(body)
      }))
    ]);
  } catch (err) {
    console.error('[worker] Failed to send inquiry emails:', err);
    return json({
      success: false,
      message: 'We could not send your inquiry right now. Please try again in a moment or email us directly.'
    }, 502);
  }

  return json({ success: true });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/project-inquiry') {
      // Explicit 405 rather than falling through to the asset handler,
      // which would confusingly return the 404 page for a GET.
      if (request.method !== 'POST') {
        return withSecurityHeaders(
          new Response(JSON.stringify({ success: false, message: 'Method not allowed.' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json', 'Allow': 'POST' }
          })
        );
      }
      try {
        return withSecurityHeaders(await handleProjectInquiry(request, env));
      } catch (err) {
        // Catch-all so an unexpected throw can never leak a stack trace
        // to the client; the detail stays in the server-side log.
        console.error('[worker] Unhandled error:', err);
        return withSecurityHeaders(
          json({ success: false, message: 'Unexpected server error.' }, 500)
        );
      }
    }

    // Everything else — the actual site — is served from the bound
    // static assets (all the HTML/CSS/JS/images in this directory).
    return withSecurityHeaders(await env.ASSETS.fetch(request));
  }
};
