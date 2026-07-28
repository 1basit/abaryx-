// Cloudflare Worker entry point. Cloudflare's dashboard created this
// project as a "Worker with static assets" rather than classic Pages, so
// routing is handled here directly instead of via functions/ file-based
// routing (that convention only applies to Pages projects).
import { validateInquiry } from './functions/_lib/validate.js';
import { ownerEmailHtml, clientEmailHtml } from './functions/_lib/email-templates.js';
import { sendZohoMail, hasZohoCredentials } from './functions/_lib/zoho-mail.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Fixed-window per-IP counter in Cloudflare KV. Requires a KV namespace
// bound as RATE_LIMIT_KV in the Worker's settings — skipped gracefully
// if it isn't configured. For infra-level protection, also add a
// Cloudflare Rate Limiting Rule on this path (Security -> WAF).
async function checkRateLimit(env, ip) {
  if (!env.RATE_LIMIT_KV) return true;
  const key = `inquiry-rl:${ip}`;
  const current = await env.RATE_LIMIT_KV.get(key);
  const count = current ? parseInt(current, 10) : 0;
  if (count >= 5) return false;
  await env.RATE_LIMIT_KV.put(key, String(count + 1), { expirationTtl: 900 });
  return true;
}

async function sendEmail(env, { to, subject, html }) {
  if (!hasZohoCredentials(env)) {
    console.log(`[dev email] to=${to} subject="${subject}"`);
    return;
  }
  await sendZohoMail(env, { to, subject, html });
}

async function handleProjectInquiry(request, env) {
  const body = await request.json().catch(() => ({}));
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

  if (typeof body.companyUrlHp === 'string' && body.companyUrlHp.trim().length > 0) {
    console.warn('[worker] Honeypot triggered — silently discarding submission.');
    return json({ success: true });
  }
  if (typeof body.formLoadedAt === 'number' && Date.now() - body.formLoadedAt < 2500) {
    console.warn('[worker] Timing check failed — silently discarding submission.');
    return json({ success: true });
  }

  const allowed = await checkRateLimit(env, ip);
  if (!allowed) {
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

  const submittedAt = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  const ownerEmail = env.OWNER_EMAIL || 'abdulbasit@abaryx.com';

  try {
    await Promise.all([
      sendEmail(env, {
        to: ownerEmail,
        subject: `New Project Inquiry — ${body.projectName}`,
        html: ownerEmailHtml(body, submittedAt)
      }),
      sendEmail(env, {
        to: body.email.trim(),
        subject: 'We received your project inquiry — Abraxis Solutions',
        html: clientEmailHtml(body)
      })
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

    if (url.pathname === '/api/project-inquiry' && request.method === 'POST') {
      return handleProjectInquiry(request, env);
    }

    // Everything else — the actual site — is served from the bound
    // static assets (all the HTML/CSS/JS/images in this directory).
    return env.ASSETS.fetch(request);
  }
};
