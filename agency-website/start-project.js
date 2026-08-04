(function () {
  'use strict';

  // Relative path — works locally (`wrangler pages dev` serves this
  // page + the /api/* Function from the same origin) and in production
  // on Cloudflare Pages, which does the same.
  const API_ENDPOINT = '/api/project-inquiry';

  const TOTAL_STEPS = 6;
  const MAX_EXTRA_EMAILS = 5;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Protocol optional — "basitcuts.com" is what people actually type.
  // normalizeWebsite() adds https:// before the value is sent.
  const URL_RE = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d{2,5})?([/?#][^\s]*)?$/i;
  const PHONE_RE = /^[0-9+()\-.\s]{6,40}$/;
  const formLoadedAt = Date.now();

  function init() {
    const card = document.getElementById('op-card');
    if (!card) return; // not on the start-project page

    const steps = Array.from(document.querySelectorAll('.op-step[data-step]'));
    const progressFill = document.getElementById('op-progress-fill');
    const progressSteps = Array.from(document.querySelectorAll('.op-progress-step[data-progress-step]'));
    const prevBtn = document.getElementById('op-prev');
    const nextBtn = document.getElementById('op-next');
    const nextLabel = document.getElementById('op-next-label');
    const nextSpinner = document.getElementById('op-next-spinner');
    const reviewEl = document.getElementById('op-review');
    const successEl = document.getElementById('op-success');
    const errorBanner = document.getElementById('op-error-banner');
    const errorMessage = document.getElementById('op-error-message');
    const progressWrap = document.getElementById('op-progress');
    const navWrap = document.getElementById('op-nav');

    let currentStep = 1;

    // ------------------------------------------
    // Additional contact emails — dynamic add/remove rows.
    // Everyone listed here also receives the confirmation email.
    // ------------------------------------------
    const emailList = document.getElementById('op-email-list');
    const addEmailBtn = document.getElementById('op-add-email');

    function getExtraEmailInputs() {
      return emailList ? Array.from(emailList.querySelectorAll('.op-extra-email')) : [];
    }

    function getExtraEmails() {
      return getExtraEmailInputs()
        .map((i) => i.value.trim())
        .filter((v) => v.length > 0);
    }

    function syncAddButton() {
      if (addEmailBtn) addEmailBtn.disabled = getExtraEmailInputs().length >= MAX_EXTRA_EMAILS;
      // Always leave at least one visible box, so the "one email per box"
      // pattern stays self-evident instead of collapsing to a bare button.
      const rows = emailList ? Array.from(emailList.querySelectorAll('.op-email-row')) : [];
      rows.forEach((row) => {
        const btn = row.querySelector('.op-email-remove');
        if (btn) btn.style.visibility = rows.length > 1 ? 'visible' : 'hidden';
      });
    }

    function addEmailRow(focus) {
      if (!emailList || getExtraEmailInputs().length >= MAX_EXTRA_EMAILS) return;

      const row = document.createElement('div');
      row.className = 'op-email-row';

      const input = document.createElement('input');
      input.type = 'email';
      input.className = 'op-input op-extra-email';
      input.placeholder = 'teammate@company.com';
      input.setAttribute('aria-label', 'Additional contact email');
      // Clear the invalid state as soon as they start correcting it.
      input.addEventListener('input', () => input.classList.remove('is-invalid'));

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'op-email-remove';
      remove.setAttribute('aria-label', 'Remove this email');
      remove.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
      remove.addEventListener('click', () => {
        row.remove();
        syncAddButton();
      });

      row.appendChild(input);
      row.appendChild(remove);
      emailList.appendChild(row);
      syncAddButton();
      if (focus) input.focus();
    }

    card.addEventListener('input', (e) => {
      if (e.target.classList) e.target.classList.remove('is-invalid');
    });

    if (addEmailBtn) addEmailBtn.addEventListener('click', () => addEmailRow(true));
    // Start with one empty box visible so it's immediately clear that each
    // box holds a single address; blank rows are ignored on submit.
    addEmailRow(false);

    // ------------------------------------------
    // Selectable option cards (services / budget / timeline)
    // ------------------------------------------
    document.querySelectorAll('[data-select-group]').forEach(group => {
      const mode = group.getAttribute('data-select-mode');
      group.querySelectorAll('.op-option-card').forEach(card => {
        card.addEventListener('click', () => {
          if (mode === 'single') {
            group.querySelectorAll('.op-option-card').forEach(c => c.classList.remove('is-selected'));
            card.classList.add('is-selected');
          } else {
            card.classList.toggle('is-selected');
          }
        });
      });
    });

    function getSelections(groupName) {
      return Array.from(document.querySelectorAll(`[data-select-group="${groupName}"] .is-selected`))
        .map(el => el.getAttribute('data-value'));
    }

    // ------------------------------------------
    // Step navigation
    // ------------------------------------------
    function hideFieldError(id) {
      const el = document.getElementById(id);
      if (el) el.hidden = true;
    }

    function showFieldError(id, message) {
      const el = document.getElementById(id);
      if (!el) return;
      // Remember the markup's default text so a specific message can be
      // swapped in and later restored.
      if (!el.dataset.defaultMsg) el.dataset.defaultMsg = el.textContent;
      el.textContent = message || el.dataset.defaultMsg;
      el.hidden = false;
    }

    // Mark/unmark a single input and collect a specific reason. Keeps the
    // messages actionable ("Website must start with http") instead of one
    // generic "check your submission".
    // Users type "basitcuts.com"; links in the notification email need a
    // scheme or they resolve relative to the mail client. Added at send time
    // rather than rewriting the input, so the field keeps what they typed.
    function normalizeWebsite(value) {
      const v = (value || '').trim();
      if (!v) return '';
      return /^https?:\/\//i.test(v) ? v : 'https://' + v;
    }

    function checkField(el, rules) {
      if (!el) return null;
      const v = el.value.trim();
      let reason = null;
      if (rules.required && !v) reason = rules.label + ' is required.';
      else if (v && rules.min && v.length < rules.min) reason = rules.label + ' is too short.';
      else if (v && rules.max && v.length > rules.max) reason = rules.label + ' is too long (max ' + rules.max + ' characters).';
      else if (v && rules.pattern && !rules.pattern.test(v)) reason = rules.message;
      el.classList.toggle('is-invalid', Boolean(reason));
      return reason;
    }

    function validateStep(step) {
      if (step === 1) {
        const ok = getSelections('services').length > 0;
        if (ok) hideFieldError('op-error-services'); else showFieldError('op-error-services');
        return ok;
      }
      if (step === 2) {
        const reasons = [
          checkField(document.getElementById('op-project-name'), {
            label: 'Project name', required: true, min: 2, max: 200
          }),
          checkField(document.getElementById('op-description'), {
            label: 'Project description', max: 5000
          }),
          checkField(document.getElementById('op-website'), {
            // 292 not 300: normalizeWebsite() may prepend 8 chars ("https://")
            // and the API caps the stored value at 300.
            label: 'Business website', max: 292, pattern: URL_RE,
            message: 'Website should look like yourcompany.com'
          }),
          checkField(document.getElementById('op-company-name'), { label: 'Company name', max: 200 }),
          checkField(document.getElementById('op-challenges'), { label: 'Current challenges', max: 5000 }),
          checkField(document.getElementById('op-outcome'), { label: 'Desired outcome', max: 5000 })
        ].filter(Boolean);
        if (!reasons.length) hideFieldError('op-error-project');
        else showFieldError('op-error-project', reasons[0]);
        return reasons.length === 0;
      }
      if (step === 3) {
        const ok = getSelections('budget').length > 0;
        if (ok) hideFieldError('op-error-budget'); else showFieldError('op-error-budget');
        return ok;
      }
      if (step === 4) {
        const ok = getSelections('timeline').length > 0;
        if (ok) hideFieldError('op-error-timeline'); else showFieldError('op-error-timeline');
        return ok;
      }
      if (step === 5) {
        const reasons = [
          checkField(document.getElementById('op-full-name'), {
            label: 'Full name', required: true, min: 2, max: 200
          }),
          checkField(document.getElementById('op-email'), {
            label: 'Email address', required: true, max: 254, pattern: EMAIL_RE,
            message: 'Please enter a valid email address.'
          }),
          checkField(document.getElementById('op-phone'), {
            label: 'Phone number', max: 40, pattern: PHONE_RE,
            message: 'Phone number can only contain digits, spaces and + ( ) -'
          }),
          checkField(document.getElementById('op-country'), { label: 'Country', max: 100 })
        ].filter(Boolean);
        const primaryOk = reasons.length === 0;
        if (primaryOk) hideFieldError('op-error-contact');
        else showFieldError('op-error-contact', reasons[0]);

        // Every non-empty additional email must be valid too; blank rows
        // are simply ignored so an unused row can't block submission.
        let extrasOk = true;
        getExtraEmailInputs().forEach((input) => {
          const v = input.value.trim();
          const bad = v.length > 0 && !EMAIL_RE.test(v);
          input.classList.toggle('is-invalid', bad);
          if (bad) extrasOk = false;
        });
        if (extrasOk) hideFieldError('op-error-extra-emails'); else showFieldError('op-error-extra-emails');

        return primaryOk && extrasOk;
      }
      return true;
    }

    function buildEl(tag, className, text) {
      const el = document.createElement(tag);
      if (className) el.className = className;
      if (text) el.textContent = text;
      return el;
    }

    function buildReviewGroup(title, valueNodes) {
      const group = buildEl('div', 'op-review-group');
      group.appendChild(buildEl('div', 'op-review-title', title));
      valueNodes.forEach(node => group.appendChild(node));
      return group;
    }

    function reviewValue(text) {
      return buildEl('p', 'op-review-value', text || '—');
    }

    function populateReview() {
      reviewEl.innerHTML = '';

      const services = getSelections('services');
      const pillsWrap = buildEl('div', 'op-review-pills');
      if (services.length) {
        services.forEach(s => pillsWrap.appendChild(buildEl('span', null, s)));
      } else {
        pillsWrap.appendChild(buildEl('span', null, '—'));
      }
      reviewEl.appendChild(buildReviewGroup('Services', [pillsWrap]));

      reviewEl.appendChild(buildReviewGroup('Project', [
        reviewValue(document.getElementById('op-project-name').value.trim() || '—'),
        reviewValue(document.getElementById('op-company-name').value.trim()),
        reviewValue(document.getElementById('op-website').value.trim()),
        reviewValue(document.getElementById('op-industry').value.trim())
      ]));

      reviewEl.appendChild(buildReviewGroup('Description', [
        reviewValue(document.getElementById('op-description').value.trim())
      ]));

      const challenges = document.getElementById('op-challenges').value.trim();
      const outcome = document.getElementById('op-outcome').value.trim();
      if (challenges || outcome) {
        reviewEl.appendChild(buildReviewGroup('Challenges & Outcome', [
          reviewValue(challenges),
          reviewValue(outcome)
        ]));
      }

      reviewEl.appendChild(buildReviewGroup('Budget & Timeline', [
        reviewValue(`${getSelections('budget')[0] || '—'}  ·  ${getSelections('timeline')[0] || '—'}`)
      ]));

      const extras = getExtraEmails();
      reviewEl.appendChild(buildReviewGroup('Contact', [
        reviewValue(document.getElementById('op-full-name').value.trim()),
        reviewValue(document.getElementById('op-email').value.trim()),
        reviewValue(extras.length ? 'Also notifying: ' + extras.join(', ') : ''),
        reviewValue(document.getElementById('op-phone').value.trim()),
        reviewValue(document.getElementById('op-country').value.trim()),
        reviewValue('Prefers: ' + document.getElementById('op-contact-method').value)
      ]));
    }

    function goToStep(step) {
      currentStep = step;
      steps.forEach(s => s.classList.toggle('is-active', Number(s.getAttribute('data-step')) === step));
      progressSteps.forEach(p => {
        const n = Number(p.getAttribute('data-progress-step'));
        p.classList.toggle('is-active', n === step);
        p.classList.toggle('is-complete', n < step);
      });
      progressFill.style.width = ((step - 1) / (TOTAL_STEPS - 1)) * 100 + '%';
      prevBtn.style.visibility = step === 1 ? 'hidden' : 'visible';
      nextLabel.textContent = step === TOTAL_STEPS ? 'Submit Project Inquiry' : 'Next';
      if (step === TOTAL_STEPS) populateReview();
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) goToStep(currentStep - 1);
    });

    nextBtn.addEventListener('click', () => {
      if (currentStep < TOTAL_STEPS) {
        if (!validateStep(currentStep)) return;
        goToStep(currentStep + 1);
      } else {
        if (!validateStep(5)) { goToStep(5); return; }
        submitInquiry();
      }
    });

    // ------------------------------------------
    // Submission
    // ------------------------------------------
    function setSubmitting(isSubmitting) {
      nextBtn.disabled = isSubmitting;
      prevBtn.disabled = isSubmitting;
      nextSpinner.hidden = !isSubmitting;
      nextLabel.textContent = isSubmitting ? 'Submitting…' : 'Submit Project Inquiry';
    }

    function buildPayload() {
      return {
        services: getSelections('services'),
        projectName: document.getElementById('op-project-name').value.trim(),
        companyName: document.getElementById('op-company-name').value.trim(),
        businessWebsite: normalizeWebsite(document.getElementById('op-website').value),
        industry: document.getElementById('op-industry').value.trim(),
        description: document.getElementById('op-description').value.trim(),
        challenges: document.getElementById('op-challenges').value.trim(),
        outcome: document.getElementById('op-outcome').value.trim(),
        budget: getSelections('budget')[0] || '',
        timeline: getSelections('timeline')[0] || '',
        fullName: document.getElementById('op-full-name').value.trim(),
        email: document.getElementById('op-email').value.trim(),
        additionalEmails: getExtraEmails(),
        phone: document.getElementById('op-phone').value.trim(),
        country: document.getElementById('op-country').value.trim(),
        contactMethod: document.getElementById('op-contact-method').value,
        // Spam-protection signals — see server/server.js for how these are used.
        companyUrlHp: document.getElementById('op-hp-field').value,
        formLoadedAt
      };
    }

    function submitInquiry() {
      errorBanner.hidden = true;
      setSubmitting(true);

      fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload())
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.success) {
            throw new Error(data.message || 'Something went wrong sending your inquiry. Please try again.');
          }
          return data;
        })
        .then(() => {
          progressWrap.hidden = true;
          steps.forEach(s => s.classList.remove('is-active'));
          navWrap.hidden = true;
          successEl.hidden = false;
        })
        .catch((err) => {
          errorMessage.textContent = err.message || 'Something went wrong sending your inquiry. Please try again.';
          errorBanner.hidden = false;
          setSubmitting(false);
        });
    }

    goToStep(1);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
