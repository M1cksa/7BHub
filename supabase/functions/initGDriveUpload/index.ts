import { handlePreflight, jsonResponse } from '../_shared/cors.ts';
import { requireUser } from '../_shared/auth.ts';
import { getAccessToken, driveFolderId } from '../_shared/googleDrive.ts';

/**
 * Startet eine resumable Upload-Session auf Google Drive.
 * Payload: { title, description?, mimeType, fileSize }
 * Antwort: { locationUrl, accessToken }   (Client lädt dann Chunks direkt hoch)
 */
Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  try {
    await requireUser(req);

    const { title, description, mimeType, fileSize } = await req.json();
    if (!title || !mimeType || !fileSize) {
      return jsonResponse({ error: 'title, mimeType und fileSize sind erforderlich' }, 400);
    }

    const accessToken = await getAccessToken();
    const folderId = driveFolderId();

    const metadata: Record<string, unknown> = {
      name: title,
      description: description || '',
      mimeType,
    };
    if (folderId) metadata.parents = [folderId];

    const initRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': mimeType,
          'X-Upload-Content-Length': String(fileSize),
        },
        body: JSON.stringify(metadata),
      },
    );
    if (!initRes.ok) {
      const text = await initRes.text();
      return jsonResponse({ error: `Drive-Init fehlgeschlagen: ${text}` }, 500);
    }
    const locationUrl = initRes.headers.get('Location');
    if (!locationUrl) return jsonResponse({ error: 'Kein Location-Header' }, 500);

    // accessToken wird ebenfalls zurückgegeben, damit der Client Chunks direkt
    // an Drive senden kann. Er hat Scope `drive` und läuft in ca. 1h ab.
    return jsonResponse({ locationUrl, accessToken });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('initGDriveUpload error:', err);
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
