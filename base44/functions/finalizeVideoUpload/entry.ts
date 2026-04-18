import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  console.log('=== Finalize Started ===');
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await req.json();
    const { uploadId, metadata } = body;

    if (!uploadId || !metadata) {
      return Response.json({ 
        error: 'Missing data',
        success: false 
      }, { status: 400 });
    }

    console.log('Fetching chunks for:', uploadId);

    // Get chunks
    const chunks = await base44.asServiceRole.entities.VideoChunk.filter({ 
      upload_id: uploadId 
    });
    
    if (!chunks || chunks.length === 0) {
      return Response.json({ 
        error: 'No chunks',
        success: false 
      }, { status: 404 });
    }

    console.log('Found chunks:', chunks.length);

    // Sort and merge
    chunks.sort((a, b) => a.chunk_index - b.chunk_index);
    const fullBase64 = chunks.map(c => c.chunk_url).join('');

    console.log('Merged base64 length:', fullBase64.length);

    // Create data URL - NO conversion needed
    const videoDataUrl = `data:video/mp4;base64,${fullBase64}`;

    // Handle thumbnail
    let thumbnailDataUrl = null;
    if (metadata.thumbnailData) {
      thumbnailDataUrl = `data:image/jpeg;base64,${metadata.thumbnailData}`;
    }

    console.log('Creating video entity...');

    // Create video
    const video = await base44.asServiceRole.entities.Video.create({
      title: metadata.title,
      description: metadata.description || '',
      video_url: videoDataUrl,
      thumbnail_url: thumbnailDataUrl,
      category: metadata.category || 'entertainment',
      duration: metadata.duration || '0:00',
      creator_name: user.username,
      creator_avatar: user.avatar_url,
      status: 'ready',
      views: 0,
      likes: 0
    });

    console.log('Video created:', video.id);

    // Cleanup
    for (const chunk of chunks) {
      await base44.asServiceRole.entities.VideoChunk.delete(chunk.id).catch(() => {});
    }

    console.log('=== Success ===');
    
    return Response.json({ 
      success: true, 
      videoId: video.id
    });

  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});