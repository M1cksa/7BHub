import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Step 2: Upload a single chunk directly to Google Drive resumable session
// Body: multipart/form-data with fields: locationUrl, chunkStart, chunkEnd, fileSize, mimeType, chunk (binary)

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

        const formData = await req.formData();
        const locationUrl = formData.get('locationUrl');
        const chunkStart = parseInt(formData.get('chunkStart'));
        const chunkEnd = parseInt(formData.get('chunkEnd'));
        const fileSize = parseInt(formData.get('fileSize'));
        const mimeType = formData.get('mimeType');
        const chunkBlob = formData.get('chunk');

        if (!locationUrl || isNaN(chunkStart) || isNaN(chunkEnd) || isNaN(fileSize) || !chunkBlob) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const chunkBuffer = await chunkBlob.arrayBuffer();
        const chunkSize = chunkEnd - chunkStart;

        console.log(`Uploading chunk: bytes ${chunkStart}-${chunkEnd - 1}/${fileSize}`);

        const chunkRes = await fetch(locationUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': mimeType || 'video/mp4',
                'Content-Length': String(chunkSize),
                'Content-Range': `bytes ${chunkStart}-${chunkEnd - 1}/${fileSize}`,
            },
            body: chunkBuffer,
        });

        // 308 = Resume Incomplete (more chunks needed)
        if (chunkRes.status === 308) {
            return Response.json({ status: 'incomplete', nextByte: chunkEnd });
        }

        // 200 or 201 = Upload complete
        if (chunkRes.status === 200 || chunkRes.status === 201) {
            const uploadData = await chunkRes.json();
            return Response.json({ status: 'complete', fileId: uploadData.id });
        }

        const errText = await chunkRes.text();
        console.error(`Chunk upload failed ${chunkRes.status}: ${errText}`);
        return Response.json({ error: `Chunk failed: ${errText}`, statusCode: chunkRes.status }, { status: 500 });

    } catch (error) {
        console.error('uploadGDriveChunk error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});