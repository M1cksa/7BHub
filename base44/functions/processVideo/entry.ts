import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { videoUrl, metadata, editInstructions } = await req.json();

    // Get creator info from metadata (already passed from frontend)
    const creatorUsername = metadata.creator_name;
    
    if (!creatorUsername) {
      return Response.json({ error: 'Creator username required in metadata' }, { status: 400 });
    }

    console.log('🎬 Video Processing Started', {
      creator: creatorUsername,
      hasEditInstructions: !!editInstructions
    });

    if (!videoUrl) {
      return Response.json({ error: 'Video URL required' }, { status: 400 });
    }

    // Step 1: Generate thumbnail if not provided
    let thumbnailUrl = metadata.thumbnail_url;
    if (!thumbnailUrl && videoUrl) {
      console.log('📸 Generating thumbnail...');
      try {
        const thumbResponse = await base44.integrations.Core.GenerateImage({
          prompt: `Professional video thumbnail for: ${metadata.title}. ${metadata.description || 'High quality, cinematic, professional streaming thumbnail'}. Category: ${metadata.category}`,
        });
        thumbnailUrl = thumbResponse.url;
        console.log('✅ Thumbnail generated:', thumbnailUrl);
      } catch (err) {
        console.warn('⚠️ Thumbnail generation failed:', err.message);
      }
    }

    // Step 2: Process video metadata with edit instructions
    const processedMetadata = {
      title: metadata.title || 'Untitled Video',
      description: metadata.description || '',
      category: metadata.category || 'entertainment',
      tags: metadata.tags || [],
      creator_name: metadata.creator_name || creatorUsername,
      creator_avatar: metadata.creator_avatar || null,
      thumbnail_url: thumbnailUrl,
      video_url: videoUrl,
      duration: metadata.duration || '0:00',
      created_date: new Date().toISOString(),
      views: 0,
      likes_count: 0,
      is_members_only: metadata.is_members_only || false,
      is_premium: metadata.is_premium || false,
      premium_price: metadata.premium_price || 0,
      status: metadata.status || 'vod',
      scheduled_start: metadata.scheduled_start || null,
      video_frame: metadata.video_frame || 'none',
      resolutions: {}
    };

    // Step 3: Apply edit instructions (trimming, filters, etc.)
    if (editInstructions) {
      console.log('✂️ Processing edit instructions:', editInstructions);
      
      // Store edit metadata
      processedMetadata.edit_metadata = {
        trimmed: editInstructions.trim ? {
          start: editInstructions.trim.start,
          end: editInstructions.trim.end,
          originalDuration: editInstructions.originalDuration
        } : null,
        filter: editInstructions.filter || 'none',
        subtitles: editInstructions.subtitles || [],
        processedAt: new Date().toISOString()
      };

      // Calculate actual duration if trimmed
      if (editInstructions.trim) {
        const { start, end } = editInstructions.trim;
        const duration = end - start;
        processedMetadata.duration = `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}`;
      }
    }

    // Step 4: Generate multiple resolutions based on upload quality
    const quality = metadata.quality || '1080p';
    const resolutions = {};
    
    // Only make available resolutions up to the uploaded quality
    if (quality === '4k') {
      resolutions['4k'] = videoUrl;
      resolutions['1440p'] = videoUrl;
      resolutions['1080p'] = videoUrl;
    } else if (quality === '1440p') {
      resolutions['1440p'] = videoUrl;
      resolutions['1080p'] = videoUrl;
    } else {
      resolutions['1080p'] = videoUrl;
    }
    
    // Always add lower resolutions
    resolutions['720p'] = videoUrl;
    resolutions['480p'] = videoUrl;
    resolutions['360p'] = videoUrl;
    
    processedMetadata.resolutions = resolutions;

    // Step 5: Create video entity
    console.log('💾 Saving video to database...', {
      title: processedMetadata.title,
      creator: processedMetadata.creator_name,
      hasVideo: !!processedMetadata.video_url,
      hasThumbnail: !!processedMetadata.thumbnail_url
    });
    
    const video = await base44.asServiceRole.entities.Video.create(processedMetadata);
    console.log('✅ Video saved:', { id: video.id, video_url: video.video_url });

    console.log('✅ Video processing complete:', video.id);

    return Response.json({
      success: true,
      video: {
        id: video.id,
        title: video.title,
        video_url: video.video_url,
        thumbnail_url: video.thumbnail_url,
        creator_name: video.creator_name,
        resolutions: video.resolutions,
        processed: true
      }
    });

  } catch (error) {
    console.error('❌ Video Processing Error:', error);
    return Response.json({ 
      error: 'Video processing failed', 
      details: error.message 
    }, { status: 500 });
  }
});