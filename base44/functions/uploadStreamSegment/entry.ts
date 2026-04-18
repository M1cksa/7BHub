import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const streamId = formData.get('stream_id');
    const segmentIndex = parseInt(formData.get('segment_index') || '0');
    const duration = parseFloat(formData.get('duration') || '2');

    if (!file || !streamId) {
      return Response.json({ error: 'Missing file or stream_id' }, { status: 400 });
    }

    // Upload segment file
    const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });

    // Save segment to database
    await base44.asServiceRole.entities.StreamSegment.create({
      stream_id: streamId,
      segment_index: segmentIndex,
      video_url: file_url,
      duration
    });

    // Update stream's latest segment index
    await base44.asServiceRole.entities.LiveStream.update(streamId, {
      latest_segment_index: segmentIndex
    });

    return Response.json({ 
      success: true, 
      segment_index: segmentIndex,
      video_url: file_url 
    });
  } catch (error) {
    console.error('Upload segment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});