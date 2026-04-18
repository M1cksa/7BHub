import { handlePreflight, jsonResponse } from '../_shared/cors.ts';
import { requireUser } from '../_shared/auth.ts';
import { getAccessToken } from '../_shared/googleDrive.ts';

/**
 * Liefert URLs zu einer Drive-Datei.
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
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,webViewLink,webContentLink,thumbnailLink&supportsAllDrives=true`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!res.ok) {
      const text = await res.text();
      return jsonResponse({ error: text }, res.status);
    }
    const meta = await res.json();
    return jsonResponse({
      ...meta,
      directUrl: `https://drive.google.com/uc?export=download&id=${meta.id}`,
      embedUrl: `https://drive.google.com/file/d/${meta.id}/preview`,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('getGoogleDriveVideoUrl error:', err);
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
