import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Step 3: Make file public and return links

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

        const { fileId } = await req.json();
        if (!fileId) return Response.json({ error: 'Missing fileId' }, { status: 400 });

        const { accessToken } = await base44.asServiceRole.connectors.getConnection("googledrive");
        if (!accessToken) return Response.json({ error: 'Google Drive not authorized' }, { status: 400 });

        // Make public
        const permRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: 'reader', type: 'anyone' })
        });
        if (!permRes.ok) {
            console.error('Failed to set permissions', await permRes.text());
        }

        // Get file details
        const getFileRes = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,webViewLink,webContentLink,thumbnailLink`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        const fileDetails = await getFileRes.json();

        return Response.json({
            success: true,
            fileId,
            webViewLink: fileDetails.webViewLink,
            webContentLink: fileDetails.webContentLink,
            thumbnailLink: fileDetails.thumbnailLink
        });

    } catch (error) {
        console.error('finalizeGDriveUpload error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});