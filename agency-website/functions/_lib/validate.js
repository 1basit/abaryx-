const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Protocol optional — the browser normalizes to https:// before sending, but
// the API is public, so accept the bare-domain form here too.
const URL_RE = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d{2,5})?([/?#][^\s]*)?$/i;
const PHONE_RE = /^[0-9+()\-.\s]{6,40}$/;
// CR/LF in any field that could reach an email header is a header-injection
// vector; NUL and other C0 controls have no legitimate use in this form.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

function hasHeaderInjection(v) {
  return typeof v === 'string' && /[\r\n]/.test(v);
}

function isNonEmptyString(v, maxLen) {
  return typeof v === 'string' && v.trim().length > 0 && v.length <= maxLen;
}

function isOptionalString(v, maxLen) {
  return v === undefined || v === null || (typeof v === 'string' && v.length <= maxLen);
}

export function validateInquiry(body) {
  const errors = [];

  if (!Array.isArray(body.services) || body.services.length === 0 || body.services.length > 20) {
    errors.push('services');
  } else if (!body.services.every(s => typeof s === 'string' && s.length <= 100)) {
    errors.push('services');
  }

  if (!isNonEmptyString(body.projectName, 200)) errors.push('projectName');
  if (!isOptionalString(body.description, 5000)) errors.push('description');
  if (!isNonEmptyString(body.budget, 100)) errors.push('budget');
  if (!isNonEmptyString(body.timeline, 100)) errors.push('timeline');
  if (!isNonEmptyString(body.fullName, 200)) errors.push('fullName');

  if (!isNonEmptyString(body.email, 254) || !EMAIL_RE.test(body.email.trim())) errors.push('email');

  if (!isOptionalString(body.companyName, 200)) errors.push('companyName');
  if (!isOptionalString(body.businessWebsite, 300)) errors.push('businessWebsite');
  else if (body.businessWebsite && body.businessWebsite.trim() && !URL_RE.test(body.businessWebsite.trim())) {
    errors.push('businessWebsite');
  }
  if (!isOptionalString(body.industry, 100)) errors.push('industry');
  if (!isOptionalString(body.challenges, 5000)) errors.push('challenges');
  if (!isOptionalString(body.outcome, 5000)) errors.push('outcome');
  // Additional confirmation recipients: optional, but each supplied
  // address must be a real address since we actually send mail to it.
  if (body.additionalEmails !== undefined) {
    if (!Array.isArray(body.additionalEmails) || body.additionalEmails.length > 5) {
      errors.push('additionalEmails');
    } else if (!body.additionalEmails.every(
      (e) => typeof e === 'string' && e.length <= 254 && EMAIL_RE.test(e.trim())
    )) {
      errors.push('additionalEmails');
    }
  }
  if (!isOptionalString(body.phone, 40)) errors.push('phone');
  else if (body.phone && body.phone.trim() && !PHONE_RE.test(body.phone.trim())) errors.push('phone');
  if (!isOptionalString(body.country, 100)) errors.push('country');
  if (!isOptionalString(body.contactMethod, 40)) errors.push('contactMethod');

  // Single-line fields feed the email Subject and other header-adjacent
  // spots, so reject CR/LF outright rather than relying on escaping.
  ['projectName', 'fullName', 'email', 'companyName', 'industry', 'budget',
   'timeline', 'phone', 'country', 'contactMethod', 'businessWebsite'
  ].forEach((k) => {
    if (hasHeaderInjection(body[k]) && !errors.includes(k)) errors.push(k);
  });

  // Control characters anywhere in any supplied string.
  Object.keys(body).forEach((k) => {
    const v = body[k];
    if (typeof v === 'string' && CONTROL_CHARS.test(v) && !errors.includes(k)) errors.push(k);
    if (Array.isArray(v)) {
      v.forEach((item) => {
        if (typeof item === 'string' && (CONTROL_CHARS.test(item) || hasHeaderInjection(item)) && !errors.includes(k)) {
          errors.push(k);
        }
      });
    }
  });

  return errors;
}
