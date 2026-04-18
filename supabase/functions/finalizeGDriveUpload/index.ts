import { handlePreflight, jsonResponse } from '../_shared/cors.ts';
import { requireUser } from '../_shared/auth.ts';
import { getAccessToken } from '../_shared/googleDrive.ts';

/**
 * Schließt einen Drive-Upload ab:
 *  - setzt die Datei auf "anyone with link can view"
 *  - liest Metadaten (webViewLink, webContentLink, thumbnailLink, size)
 * Payload: { fileId }
 */
Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  try {
    await requireUser(req);
    const { fileId } = await req.json();
    if (!fileId) return jsonResponse({ error: 'fileId erforderlich' }, 400);

    const accessToken = await getAccessToken();

    // 1. Öffentlich freigeben (reader-Rolle, Type anyone)
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions?supportsAllDrives=true`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'reader', type: 'anyone' }),
    });

    // 2. Metadaten abfragen
    const metaRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,webViewLink,webContentLink,thumbnailLink,iconLink&supportsAllDrives=true`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!metaRes.ok) {
      const text = await metaRes.text();
      return jsonResponse({ error: `Metadaten-Abruf fehlgeschlagen: ${text}` }, 500);
    }
    const meta = await metaRes.json();

    return jsonResponse({
      fileId: meta.id,
      name: meta.name,
      mimeType: meta.mimeType,
      size: meta.size,
      webViewLink: meta.webViewLink,
      webContentLink: meta.webContentLink,
      thumbnailLink: meta.thumbnailLink,
      directUrl: `https://drive.google.com/uc?export=download&id=${meta.id}`,
      embedUrl: `https://drive.google.com/file/d/${meta.id}/preview`,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('finalizeGDriveUpload error:', err);
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
