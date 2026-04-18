import { corsHeaders, handlePreflight } from '../_shared/cors.ts';
import { getAccessToken } from '../_shared/googleDrive.ts';

/**
 * Streamt eine Drive-Datei mit Range-Support an den Client.
 *
 * Aufruf: GET /streamGoogleDriveVideo?fileId=XYZ  (Header: Range, Authorization)
 *
 * Dieser Endpoint wird absichtlich NICHT durch requireUser geschützt, da
 * HTML5-<video>-Elemente keine Authorization-Header senden. Wenn du den
 * Zugriff einschränken willst, füge hier einen Signed-Token-Check ein.
 */
Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  try {
    const url = new URL(req.url);
    const fileId = url.searchParams.get('fileId');
    if (!fileId) {
      return new Response(JSON.stringify({ error: 'fileId erforderlich' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = await getAccessToken();
    const range = req.headers.get('Range');

    const driveRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...(range ? { Range: range } : {}),
        },
      },
    );

    // Relevant Drive-Header ans Frontend durchreichen
    const headers = new Headers(corsHeaders);
    const pass = ['content-type', 'content-length', 'content-range', 'accept-ranges', 'last-modified'];
    for (const name of pass) {
      const v = driveRes.headers.get(name);
      if (v) headers.set(name, v);
    }
    if (!headers.get('accept-ranges')) headers.set('Accept-Ranges', 'bytes');

    return new Response(driveRes.body, {
      status: driveRes.status,
      headers,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
