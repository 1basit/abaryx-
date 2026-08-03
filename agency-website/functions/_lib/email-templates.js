export function escapeHtml(str) {
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

export function ownerEmailHtml(body, submittedAt) {
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
      <a href="mailto:${escapeHtml(body.email)}" style="color:#15803d;">${escapeHtml(body.email)}</a><br>
      ${escapeHtml(body.phone) || 'No phone provided'}<br>
      ${escapeHtml(body.country) || ''}<br>
      Prefers: ${escapeHtml(body.contactMethod) || 'Email'}
    </p>
    ${(body.additionalEmails && body.additionalEmails.length) ? `
    <div style="${LABEL_STYLE}">Also Notified</div>
    <p style="${VALUE_STYLE}">${body.additionalEmails.map(e => escapeHtml(e)).join('<br>')}</p>` : ''}
  </div>`;
}

export function clientEmailHtml(body) {
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
    <p style="${VALUE_STYLE}">— The Abaryx Solutions Team</p>
  </div>`;
}
