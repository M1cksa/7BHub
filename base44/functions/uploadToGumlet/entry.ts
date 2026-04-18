import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, category } = await req.json();

    if (!title) {
      return Response.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    const GUMLET_API_KEY = Deno.env.get('GUMLET_API_KEY');
    const GUMLET_WORKSPACE_ID = Deno.env.get('GUMLET_WORKSPACE_ID');
    const GUMLET_COLLECTION_ID = Deno.env.get('GUMLET_COLLECTION_ID');
    
    if (!GUMLET_API_KEY || !GUMLET_WORKSPACE_ID || !GUMLET_COLLECTION_ID) {
      return Response.json({ success: false, error: 'Gumlet credentials not configured' }, { status: 500 });
    }

    const requestBody = JSON.stringify({
      workspace_id: GUMLET_WORKSPACE_ID,
      collection_id: GUMLET_COLLECTION_ID,
      format: 'ABR',
      title: title,
      description: description || '',
      tag: [category || 'entertainment'],
      resolution: ['360p', '480p', '720p', '1080p'],
      mp4_access: true,
      per_title_encoding: true,
      enable_preview_thumbnails: true
    });

    const createAssetResponse = await fetch('https://api.gumlet.com/v1/video/assets/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GUMLET_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: requestBody
    });

    if (!createAssetResponse.ok) {
      const errorText = await createAssetResponse.text();
      console.error('Gumlet API Response:', createAssetResponse.status, errorText);
      return Response.json({ 
        success: false, 
        error: 'Gumlet API error: ' + createAssetResponse.status + ' - ' + errorText
      }, { status: 500 });
    }

    const assetData = await createAssetResponse.json();
    console.log('Gumlet response:', JSON.stringify(assetData));

    return Response.json({
      success: true,
      asset_id: assetData.asset_id,
      upload_url: assetData.upload_url,
      playback_url: assetData.output?.playback_url || '',
      thumbnail_url: assetData.output?.thumbnail_url?.[0] || '',
      status_url: assetData.output?.status_url || ''
    });

  } catch (error) {
    console.error('Upload to Gumlet error:', error);
    return Response.json({ 
      success: false, 
      error: error.message
    }, { status: 500 });
  }
});