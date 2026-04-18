import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB per chunk

export default Deno.serve(async (req) => {
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

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { file_url, title, description, mimeType } = await req.json();

        if (!file_url || !title) {
            return Response.json({ error: 'Missing file_url or title' }, { status: 400 });
        }

        // 1. Get Access Token for Google Drive
        const { accessToken } = await base44.asServiceRole.connectors.getConnection("googledrive");
        if (!accessToken) {
            return Response.json({ error: 'Google Drive connector not authorized' }, { status: 400 });
        }

        // 2. Fetch file as ArrayBuffer to get exact size and enable chunking
        console.log('Fetching file from temp storage...');
        const fileResponse = await fetch(file_url);
        if (!fileResponse.ok) {
            return Response.json({ error: 'Failed to fetch file from temp storage' }, { status: 400 });
        }

        const fileBuffer = await fileResponse.arrayBuffer();
        const fileSize = fileBuffer.byteLength;
        const fileMimeType = mimeType || fileResponse.headers.get('Content-Type') || 'video/mp4';

        console.log(`File size: ${fileSize} bytes, MIME: ${fileMimeType}`);

        // 3. Initiate Resumable Upload Session
        const metadata = {
            name: title,
            description: description || '',
            mimeType: fileMimeType,
        };

        const initRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Upload-Content-Type': fileMimeType,
                'X-Upload-Content-Length': String(fileSize),
            },
            body: JSON.stringify(metadata)
        });

        if (!initRes.ok) {
            const errText = await initRes.text();
            return Response.json({ error: `Failed to initiate upload: ${errText}` }, { status: 500 });
        }

        const locationUrl = initRes.headers.get('Location');
        if (!locationUrl) {
            return Response.json({ error: 'No upload location header received' }, { status: 500 });
        }

        console.log('Resumable upload session started, uploading in chunks...');

        // 4. Upload file in chunks
        let offset = 0;
        let finalFileId = null;

        while (offset < fileSize) {
            const end = Math.min(offset + CHUNK_SIZE, fileSize);
            const chunk = fileBuffer.slice(offset, end);
            const chunkSize = end - offset;

            console.log(`Uploading chunk: bytes ${offset}-${end - 1}/${fileSize}`);

            const chunkRes = await fetch(locationUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': fileMimeType,
                    'Content-Length': String(chunkSize),
                    'Content-Range': `bytes ${offset}-${end - 1}/${fileSize}`,
                },
                body: chunk,
            });

            // 308 = Resume Incomplete (more chunks needed)
            // 200 or 201 = Upload complete
            if (chunkRes.status === 308) {
                offset = end;
                console.log(`Chunk accepted, continuing... (${Math.round((offset / fileSize) * 100)}%)`);
                continue;
            }

            if (chunkRes.status === 200 || chunkRes.status === 201) {
                const uploadData = await chunkRes.json();
                finalFileId = uploadData.id;
                console.log(`Upload complete! File ID: ${finalFileId}`);
                break;
            }

            // Error
            const errText = await chunkRes.text();
            console.error(`Chunk upload failed with status ${chunkRes.status}: ${errText}`);
            return Response.json({ error: `Chunk upload failed: ${errText}` }, { status: 500 });
        }

        if (!finalFileId) {
            return Response.json({ error: 'Upload finished but no file ID received' }, { status: 500 });
        }

        // 5. Make the file public (Reader)
        const permRes = await fetch(`https://www.googleapis.com/drive/v3/files/${finalFileId}/permissions`, {
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

        // 6. Get file details
        const getFileRes = await fetch(
            `https://www.googleapis.com/drive/v3/files/${finalFileId}?fields=id,webViewLink,webContentLink,thumbnailLink`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        const fileDetails = await getFileRes.json();

        return Response.json({
            success: true,
            fileId: finalFileId,
            webViewLink: fileDetails.webViewLink,
            webContentLink: fileDetails.webContentLink,
            thumbnailLink: fileDetails.thumbnailLink
        });

    } catch (error) {
        console.error('uploadToGoogleDrive error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});