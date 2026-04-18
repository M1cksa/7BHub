import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const videoFile = formData.get('video');
    const metadata = JSON.parse(formData.get('metadata'));

    if (!videoFile) {
      return Response.json({ error: 'No video file' }, { status: 400 });
    }

    // Upload directly
    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({
      file: videoFile
    });

    if (!uploadResult?.file_url) {
      throw new Error('No URL returned');
    }

    // Create Video entity
    const video = await base44.asServiceRole.entities.Video.create({
      title: metadata.title,
      description: metadata.description,
      video_url: uploadResult.file_url,
      category: metadata.category,
      creator_name: user.username || 'Unknown',
      creator_avatar: user.avatar_url || '',
      duration: metadata.duration,
      resolutions: {
        '1080p': uploadResult.file_url,
        '720p': uploadResult.file_url,
        '480p': uploadResult.file_url
      }
    });

    return Response.json({ success: true, video });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});