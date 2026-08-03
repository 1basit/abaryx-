const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  if (!isOptionalString(body.country, 100)) errors.push('country');
  if (!isOptionalString(body.contactMethod, 40)) errors.push('contactMethod');

  return errors;
}
