import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();

        // Handle entity automation payload
        const videoId = body.event?.entity_id || body.videoId;
        const videoData = body.data;

        if (!videoId) {
            return Response.json({ error: 'Missing videoId' }, { status: 400 });
        }

        console.log(`📹 Creating transcoding job for video: ${videoId}`);

        // Get video if not in payload
        let video = videoData;
        if (!video || !video.video_url) {
            video = await base44.asServiceRole.entities.Video.get(videoId);
            if (!video) {
                return Response.json({ error: 'Video not found' }, { status: 404 });
            }
        }

        // Skip if already has resolutions or is processing
        if (video.status === 'processing' || (video.resolutions && Object.keys(video.resolutions).length > 1)) {
            console.log('⏭️ Video already processing or has resolutions, skipping');
            return Response.json({ success: true, skipped: true });
        }

        // Determine resolutions based on source
        const targetResolutions = body.targetResolutions || ['360p', '480p', '720p', '1080p'];
        const quality = body.quality || 'high';

        // Create job
        const job = await base44.asServiceRole.entities.TranscodingJob.create({
            video_id: videoId,
            video_title: video.title,
            source_url: video.video_url,
            target_resolutions: targetResolutions,
            target_format: 'mp4',
            quality,
            status: 'pending',
            progress: 0
        });

        // Update video status
        await base44.asServiceRole.entities.Video.update(videoId, {
            status: 'processing'
        });

        // Trigger transcoding
        base44.asServiceRole.functions.invoke('transcodeVideo', { jobId: job.id })
            .catch(e => console.error('Failed to start transcoding:', e));

        console.log(`✅ Job ${job.id} queued`);

        return Response.json({
            success: true,
            jobId: job.id,
            videoId
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});