import { handlePreflight, jsonResponse } from '../_shared/cors.ts';

/**
 * Generischer E-Mail-Versand über Resend.
 * Payload:
 *   { to: string | string[], subject: string, html?: string, text?: string,
 *     from?: string, reply_to?: string }
 */
Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  try {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return jsonResponse({ error: 'RESEND_API_KEY fehlt' }, 500);

    const {
      to,
      subject,
      html,
      text,
      from,
      reply_to,
    } = await req.json();

    if (!to || !subject || (!html && !text)) {
      return jsonResponse({ error: 'to, subject und html/text sind erforderlich' }, 400);
    }

    const fromAddress =
      from || Deno.env.get('RESEND_FROM_EMAIL') || '7B Hub <noreply@7bhub.com>';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
        reply_to,
      }),
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return jsonResponse({ error: payload?.message || 'Resend-Fehler', detail: payload }, res.status);
    }

    return jsonResponse({ success: true, id: payload?.id });
  } catch (err) {
    console.error('sendEmail error:', err);
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
