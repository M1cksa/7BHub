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

    // Get file metadata to check if it exists
    const metadataResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${file_id}?fields=id,name,mimeType,webContentLink,webViewLink`,
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

    // Generate embeddable URL for iframe player
    const embedUrl = `https://drive.google.com/file/d/${file_id}/preview`;
    
    // Generate direct stream URL (works if file is public)
    const streamUrl = `https://drive.google.com/uc?export=download&id=${file_id}`;

    return Response.json({
      success: true,
      file_id: metadata.id,
      file_name: metadata.name,
      mime_type: metadata.mimeType,
      embed_url: embedUrl,
      stream_url: streamUrl,
      view_url: metadata.webViewLink
    });

  } catch (error) {
    console.error('Get URL error:', error);
    return Response.json({ 
      error: error.message || 'Failed to get video URL' 
    }, { status: 500 });
  }
});