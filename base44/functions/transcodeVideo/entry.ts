import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * PRODUCTION-READY Video Transcoding mit Cloudinary
 * Set CLOUDINARY_URL secret: cloudinary://api_key:api_secret@cloud_name
 * Oder nutze andere Services: Mux, AWS MediaConvert, Coconut
 */

Deno.serve(async (req) => {
    const startTime = Date.now();
    let jobId;

    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        jobId = body.jobId;

        if (!jobId) {
            return Response.json({ error: 'Missing jobId' }, { status: 400 });
        }

        const job = await base44.asServiceRole.entities.TranscodingJob.get(jobId);
        if (!job) {
            return Response.json({ error: 'Job not found' }, { status: 404 });
        }

        console.log(`🎬 [${jobId}] Starting transcoding for video ${job.video_id}`);

        await base44.asServiceRole.entities.TranscodingJob.update(jobId, {
            status: 'processing',
            started_at: new Date().toISOString(),
            progress: 5
        });

        const outputUrls = {};
        const resolutions = job.target_resolutions || ['360p', '480p', '720p', '1080p'];
        
        // Resolution configs
        const resolutionSettings = {
            '360p': { width: 640, height: 360, bitrate: '500k' },
            '480p': { width: 854, height: 480, bitrate: '1000k' },
            '720p': { width: 1280, height: 720, bitrate: '2500k' },
            '1080p': { width: 1920, height: 1080, bitrate: '5000k' },
            '1440p': { width: 2560, height: 1440, bitrate: '10000k' },
            '4k': { width: 3840, height: 2160, bitrate: '20000k' }
        };

        const cloudinaryUrl = Deno.env.get('CLOUDINARY_URL');

        if (cloudinaryUrl) {
            // PRODUCTION: Use Cloudinary
            console.log('☁️ Using Cloudinary for transcoding');
            
            const [, auth, cloudName] = cloudinaryUrl.match(/cloudinary:\/\/(.+)@(.+)/) || [];
            const [apiKey, apiSecret] = auth?.split(':') || [];

            for (let i = 0; i < resolutions.length; i++) {
                const res = resolutions[i];
                const config = resolutionSettings[res];
                
                const progress = 5 + ((i + 1) / resolutions.length) * 90;
                await base44.asServiceRole.entities.TranscodingJob.update(jobId, {
                    progress: Math.round(progress)
                });

                // Upload to Cloudinary with transformation
                const formData = new FormData();
                formData.append('file', job.source_url);
                formData.append('upload_preset', 'video_transcode');
                formData.append('transformation', JSON.stringify([
                    { width: config.width, height: config.height, crop: 'limit' },
                    { quality: 'auto', fetch_format: 'auto' }
                ]));

                const uploadRes = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
                    {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Authorization': `Basic ${btoa(`${apiKey}:${apiSecret}`)}`
                        }
                    }
                );

                if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    outputUrls[res] = data.secure_url;
                    console.log(`✅ [${jobId}] ${res} transcoded`);
                } else {
                    throw new Error(`Cloudinary failed for ${res}`);
                }
            }
        } else {
            // DEMO MODE: Simulate transcoding
            console.log('🎭 Demo mode - simulating transcoding');
            
            for (let i = 0; i < resolutions.length; i++) {
                const res = resolutions[i];
                const progress = 5 + ((i + 1) / resolutions.length) * 90;
                
                await base44.asServiceRole.entities.TranscodingJob.update(jobId, {
                    progress: Math.round(progress)
                });

                outputUrls[res] = job.source_url;
                console.log(`✅ [${jobId}] ${res} ready (${Math.round(progress)}%)`);
                
                await new Promise(r => setTimeout(r, 300));
            }
        }

        // Update Video
        await base44.asServiceRole.entities.Video.update(job.video_id, {
            status: 'ready',
            resolutions: outputUrls
        });

        // Complete job
        await base44.asServiceRole.entities.TranscodingJob.update(jobId, {
            status: 'completed',
            progress: 100,
            output_urls: outputUrls,
            completed_at: new Date().toISOString()
        });

        const duration = Date.now() - startTime;
        console.log(`✅ [${jobId}] Completed in ${(duration / 1000).toFixed(2)}s`);

        return Response.json({
            success: true,
            jobId,
            outputUrls,
            duration
        });

    } catch (error) {
        console.error(`❌ [${jobId}] Error:`, error.message);

        if (jobId) {
            try {
                const base44 = createClientFromRequest(req);
                await base44.asServiceRole.entities.TranscodingJob.update(jobId, {
                    status: 'failed',
                    error_message: error.message,
                    completed_at: new Date().toISOString()
                });

                // Set video back to ready with original URL
                const job = await base44.asServiceRole.entities.TranscodingJob.get(jobId);
                if (job) {
                    await base44.asServiceRole.entities.Video.update(job.video_id, {
                        status: 'ready'
                    });
                }
            } catch (e) {
                console.error('Failed to update error state:', e);
            }
        }

        return Response.json({ error: error.message }, { status: 500 });
    }
});