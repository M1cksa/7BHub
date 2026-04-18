import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { videoBase64, metadata } = body;

    if (!videoBase64) {
      return Response.json({ error: 'No video data' }, { status: 400 });
    }

    // Upload via Core integration - pass base64 directly
    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({
     file: videoBase64
    });

    if (!uploadResult?.file_url) {
      throw new Error('Upload returned no URL');
    }

    // Create Short entity
    const short = await base44.asServiceRole.entities.Short.create({
      video_url: uploadResult.file_url,
      thumbnail_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400',
      title: metadata.title,
      description: metadata.description || '',
      creator_username: metadata.creator_username,
      creator_avatar: metadata.creator_avatar,
      tags: metadata.tags || [],
      likes_count: 0,
      comments_count: 0,
      views: 0
    });

    return Response.json({
      success: true,
      short: short
    });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({
      error: error.message || 'Upload failed'
    }, { status: 500 });
  }
});