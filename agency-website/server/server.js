require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

const PORT = process.env.PORT || 3001;
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'abdulbasit@abaryx.com';
const FROM_NAME = process.env.FROM_NAME || 'Abraxis Solutions';
const ZOHO_EMAIL = process.env.ZOHO_EMAIL; // e.g. abdulbasit@abaryx.com
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

// Falls back to a console-log "dev mode" when no credentials are
// configured, so the whole flow can be tested locally before real
// credentials exist. See server/.env.example for how to get an
// app-specific password from Zoho Mail.
const transporter = (ZOHO_EMAIL && process.env.ZOHO_APP_PASSWORD)
  ? nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST || 'smtp.zoho.com',
    port: Number(process.env.ZOHO_SMTP_PORT) || 465,
    secure: true,
    auth: { user: ZOHO_EMAIL, pass: process.env.ZOHO_APP_PASSWORD }
  })
  : null;
if (!transporter) {
  console.warn('[server] ZOHO_EMAIL / ZOHO_APP_PASSWORD not set — emails will be logged to the console instead of sent. See server/.env.example.');
}

const app = express();

// CSP is disabled here because this same server also serves the static
// site, which loads Google Fonts, a GSAP CDN script, and a Zoho iframe —
// helmet's strict default CSP would block all of them. Other helmet
// protections (frameguard, noSniff, HSTS, etc.) stay on.
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json({ limit: '100kb' }));

// Serve the static site itself so `node server.js` is a one-command
// local setup with no CORS friction between frontend and API.
app.use(express.static(path.join(__dirname, '..')));

const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again in a few minutes.' }
});

// ------------------------------------------
// Validation
// ------------------------------------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(v, maxLen) {
  return typeof v === 'string' && v.trim().length > 0 && v.length <= maxLen;
}

function isOptionalString(v, maxLen) {
  return v === undefined || v === null || (typeof v === 'string' && v.length <= maxLen);
}

function validateInquiry(body) {
  const errors = [];

  if (!Array.isArray(body.services) || body.services.length === 0 || body.services.length > 20) {
    errors.push('services');
  } else if (!body.services.every(s => typeof s === 'string' && s.length <= 100)) {
    errors.push('services');
  }

  if (!isNonEmptyString(body.projectName, 200)) errors.push('projectName');
  if (!isNonEmptyString(body.description, 5000)) errors.push('description');
  if (!isNonEmptyString(body.budget, 100)) errors.push('budget');
  if (!isNonEmptyString(body.timeline, 100)) errors.push('timeline');
  if (!isNonEmptyString(body.fullName, 200)) errors.push('fullName');

  if (!isNonEmptyString(body.email, 254) || !EMAIL_RE.test(body.email.trim())) errors.push('email');

  if (!isOptionalString(body.companyName, 200)) errors.push('companyName');
  if (!isOptionalString(body.businessWebsite, 300)) errors.push('businessWebsite');
  if (!isOptionalString(body.industry, 100)) errors.push('industry');
  if (!isOptionalString(body.challenges, 5000)) errors.push('challenges');
  if (!isOptionalString(body.outcome, 5000)) errors.push('outcome');
  if (!isOptionalString(body.contactCompany, 200)) errors.push('contactCompany');
  if (!isOptionalString(body.phone, 40)) errors.push('phone');
  if (!isOptionalString(body.country, 100)) errors.push('country');
  if (!isOptionalString(body.contactMethod, 40)) errors.push('contactMethod');

  return errors;
}

// ------------------------------------------
// Email templates
// ------------------------------------------
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function nl2br(str) {
  return escapeHtml(str).replace(/\n/g, '<br>');
}

const EMAIL_WRAP_STYLE = 'font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;';
const LABEL_STYLE = 'font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#6b7280;margin:20px 0 4px;';
const VALUE_STYLE = 'font-size:15px;line-height:1.6;color:#1a1a1a;margin:0;';
const SECTION_DIVIDER = '<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">';

function ownerEmailHtml(body, submittedAt) {
  const servicesHtml = body.services.map(s => `<span style="display:inline-block;background:#ecfdf5;color:#15803d;border:1px solid #bbf7d0;border-radius:999px;padding:4px 12px;font-size:13px;font-weight:600;margin:0 6px 6px 0;">${escapeHtml(s)}</span>`).join('');

  return `
  <div style="${EMAIL_WRAP_STYLE}">
    <h2 style="font-size:20px;margin-bottom:4px;">New Project Inquiry</h2>
    <p style="color:#6b7280;font-size:13px;margin-top:0;">Submitted ${escapeHtml(submittedAt)}</p>
    ${SECTION_DIVIDER}
    <div style="${LABEL_STYLE}">Services Requested</div>
    <div>${servicesHtml}</div>

    <div style="${LABEL_STYLE}">Project Name</div>
    <p style="${VALUE_STYLE}">${escapeHtml(body.projectName)}</p>

    <div style="${LABEL_STYLE}">Company</div>
    <p style="${VALUE_STYLE}">${escapeHtml(body.companyName) || '—'}</p>

    <div style="${LABEL_STYLE}">Business Website</div>
    <p style="${VALUE_STYLE}">${escapeHtml(body.businessWebsite) || '—'}</p>

    <div style="${LABEL_STYLE}">Industry</div>
    <p style="${VALUE_STYLE}">${escapeHtml(body.industry) || '—'}</p>

    <div style="${LABEL_STYLE}">Description</div>
    <p style="${VALUE_STYLE}">${nl2br(body.description)}</p>

    <div style="${LABEL_STYLE}">Current Challenges</div>
    <p style="${VALUE_STYLE}">${nl2br(body.challenges) || '—'}</p>

    <div style="${LABEL_STYLE}">Desired Outcome</div>
    <p style="${VALUE_STYLE}">${nl2br(body.outcome) || '—'}</p>

    ${SECTION_DIVIDER}
    <div style="${LABEL_STYLE}">Budget</div>
    <p style="${VALUE_STYLE}">${escapeHtml(body.budget)}</p>

    <div style="${LABEL_STYLE}">Timeline</div>
    <p style="${VALUE_STYLE}">${escapeHtml(body.timeline)}</p>

    ${SECTION_DIVIDER}
    <div style="${LABEL_STYLE}">Contact</div>
    <p style="${VALUE_STYLE}">
      ${escapeHtml(body.fullName)}<br>
      ${escapeHtml(body.contactCompany) || ''}<br>
      <a href="mailto:${escapeHtml(body.email)}" style="color:#15803d;">${escapeHtml(body.email)}</a><br>
      ${escapeHtml(body.phone) || 'No phone provided'}<br>
      ${escapeHtml(body.country) || ''}<br>
      Prefers: ${escapeHtml(body.contactMethod) || 'Email'}
    </p>
  </div>`;
}

function clientEmailHtml(body) {
  return `
  <div style="${EMAIL_WRAP_STYLE}">
    <h2 style="font-size:20px;margin-bottom:12px;">Thanks for reaching out, ${escapeHtml(body.fullName.split(' ')[0] || body.fullName)}!</h2>
    <p style="${VALUE_STYLE}">
      We've received your project inquiry${body.projectName ? ` for <strong>${escapeHtml(body.projectName)}</strong>` : ''}
      and a member of our team will review the details and get back to you within one business day.
    </p>
    <p style="${VALUE_STYLE}">Here's a quick summary of what you shared with us:</p>
    ${SECTION_DIVIDER}
    <div style="${LABEL_STYLE}">Services</div>
    <p style="${VALUE_STYLE}">${escapeHtml(body.services.join(', '))}</p>
    <div style="${LABEL_STYLE}">Budget</div>
    <p style="${VALUE_STYLE}">${escapeHtml(body.budget)}</p>
    <div style="${LABEL_STYLE}">Timeline</div>
    <p style="${VALUE_STYLE}">${escapeHtml(body.timeline)}</p>
    ${SECTION_DIVIDER}
    <p style="${VALUE_STYLE}">
      In the meantime, feel free to reply directly to this email if anything changes on your end.
    </p>
    <p style="${VALUE_STYLE}">— The Abraxis Solutions Team</p>
  </div>`;
}

async function sendEmail({ to, subject, html }) {
  if (!transporter) {
    console.log(`[dev email] to=${to} subject="${subject}"`);
    return;
  }
  // Zoho requires the From address to match the authenticated mailbox
  // (or a configured alias) — it rejects/flags mail otherwise.
  await transporter.sendMail({ from: `${FROM_NAME} <${ZOHO_EMAIL}>`, to, subject, html });
}

// ------------------------------------------
// Routes
// ------------------------------------------
app.post('/api/project-inquiry', inquiryLimiter, async (req, res) => {
  const body = req.body || {};

  // --- Spam protection ---
  // Honeypot field: real visitors never see or fill it in.
  if (typeof body.companyUrlHp === 'string' && body.companyUrlHp.trim().length > 0) {
    console.warn('[server] Honeypot triggered — silently discarding submission.');
    return res.json({ success: true });
  }
  // Timing trap: a human can't complete a 6-step form in under ~2.5s.
  if (typeof body.formLoadedAt === 'number' && Date.now() - body.formLoadedAt < 2500) {
    console.warn('[server] Timing check failed — silently discarding submission.');
    return res.json({ success: true });
  }

  const errors = validateInquiry(body);
  if (errors.length) {
    return res.status(400).json({
      success: false,
      message: 'Please check your submission — some fields are missing or invalid.',
      fields: errors
    });
  }

  const submittedAt = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  try {
    await Promise.all([
      sendEmail({
        to: OWNER_EMAIL,
        subject: `New Project Inquiry — ${body.projectName}`,
        html: ownerEmailHtml(body, submittedAt)
      }),
      sendEmail({
        to: body.email.trim(),
        subject: 'We received your project inquiry — Abraxis Solutions',
        html: clientEmailHtml(body)
      })
    ]);
  } catch (err) {
    console.error('[server] Failed to send inquiry emails:', err);
    return res.status(502).json({
      success: false,
      message: 'We could not send your inquiry right now. Please try again in a moment or email us directly.'
    });
  }

  return res.json({ success: true });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[server] Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Unexpected server error.' });
});

app.listen(PORT, () => {
  console.log(`[server] Abraxis backend running at http://localhost:${PORT}`);
  console.log(`[server] Serving static site from ${path.join(__dirname, '..')}`);
});
