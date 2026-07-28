// Sends mail via Zoho's HTTPS Mail API instead of raw SMTP, because
// Cloudflare's edge runtime doesn't support the socket connections
// Nodemailer/SMTP need. See functions/README.md for how to obtain the
// OAuth credentials this needs (ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET,
// ZOHO_REFRESH_TOKEN, ZOHO_ACCOUNT_ID).

async function getAccessToken(env) {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: env.ZOHO_REFRESH_TOKEN,
    client_id: env.ZOHO_CLIENT_ID,
    client_secret: env.ZOHO_CLIENT_SECRET
  });

  const res = await fetch('https://accounts.zoho.com/oauth/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error('Failed to refresh Zoho access token: ' + JSON.stringify(data));
  }
  return data.access_token;
}

export function hasZohoCredentials(env) {
  return Boolean(env.ZOHO_CLIENT_ID && env.ZOHO_CLIENT_SECRET && env.ZOHO_REFRESH_TOKEN && env.ZOHO_ACCOUNT_ID && env.ZOHO_EMAIL);
}

export async function sendZohoMail(env, { to, subject, html }) {
  const accessToken = await getAccessToken(env);
  const apiDomain = env.ZOHO_MAIL_API_DOMAIN || 'mail.zoho.com';

  const res = await fetch(`https://${apiDomain}/api/accounts/${env.ZOHO_ACCOUNT_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fromAddress: env.ZOHO_EMAIL,
      toAddress: to,
      subject,
      content: html,
      mailFormat: 'html'
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error('Zoho Mail API error: ' + JSON.stringify(data));
  }
  return data;
}
