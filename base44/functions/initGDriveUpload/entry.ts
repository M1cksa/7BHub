import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Step 1: Initiate a resumable upload session on Google Drive
// Returns the session locationUrl

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    }

    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { title, description, mimeType, fileSize } = await req.json();
        if (!title || !mimeType || !fileSize) {
            return Response.json({ error: 'Missing title, mimeType or fileSize' }, { status: 400 });
        }

        const { accessToken } = await base44.asServiceRole.connectors.getConnection("googledrive");
        if (!accessToken) return Response.json({ error: 'Google Drive not authorized' }, { status: 400 });

        const metadata = { name: title, description: description || '', mimeType };

        const initRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Upload-Content-Type': mimeType,
                'X-Upload-Content-Length': String(fileSize),
                'Origin': req.headers.get('Origin') || '*',
            },
            body: JSON.stringify(metadata)
        });

        if (!initRes.ok) {
            const errText = await initRes.text();
            return Response.json({ error: `Failed to initiate: ${errText}` }, { status: 500 });
        }

        const locationUrl = initRes.headers.get('Location');
        if (!locationUrl) return Response.json({ error: 'No location header' }, { status: 500 });

        // Store accessToken alongside locationUrl so finalizeGDriveUpload can use it
        return Response.json({ locationUrl, accessToken });

    } catch (error) {
        console.error('initGDriveUpload error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});