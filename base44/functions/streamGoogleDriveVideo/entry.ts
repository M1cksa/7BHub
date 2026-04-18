import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_id } = await req.json();

    if (!file_id) {
      return Response.json({ error: 'file_id required' }, { status: 400 });
    }

    // Get Google Drive access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');

    // Get file metadata first to check size
    const metadataResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${file_id}?fields=id,name,mimeType,size`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!metadataResponse.ok) {
      throw new Error('File not found or access denied');
    }

    const metadata = await metadataResponse.json();

    // Handle range requests for video seeking
    const rangeHeader = req.headers.get('range');
    const driveHeaders = {
      'Authorization': `Bearer ${accessToken}`
    };

    if (rangeHeader) {
      driveHeaders['Range'] = rangeHeader;
    }

    // Stream the file from Google Drive with range support
    const driveResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${file_id}?alt=media`,
      { headers: driveHeaders }
    );

    if (!driveResponse.ok) {
      throw new Error('Failed to fetch video from Google Drive');
    }

    // Get the content from Drive
    const videoStream = driveResponse.body;
    const contentLength = driveResponse.headers.get('content-length');
    const contentRange = driveResponse.headers.get('content-range');
    const status = rangeHeader ? 206 : 200;

    // Build response headers
    const responseHeaders = new Headers({
      'Content-Type': metadata.mimeType || 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Range',
      'Cache-Control': 'public, max-age=3600'
    });

    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange);
    } else if (metadata.size) {
      responseHeaders.set('Content-Length', metadata.size);
    }

    // Return streaming response
    return new Response(videoStream, {
      status,
      headers: responseHeaders
    });

  } catch (error) {
    console.error('Stream error:', error);
    return Response.json({ 
      error: error.message || 'Failed to stream video' 
    }, { status: 500 });
  }
});