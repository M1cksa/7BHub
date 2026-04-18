import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const streamId = url.searchParams.get('stream_id');
    const fromIndex = parseInt(url.searchParams.get('from_index') || '0');

    if (!streamId) {
      return Response.json({ error: 'Missing stream_id' }, { status: 400 });
    }

    // Get all segments after fromIndex
    const allSegments = await base44.entities.StreamSegment.filter({ stream_id: streamId });
    const segments = allSegments
      .filter(s => s.segment_index >= fromIndex)
      .sort((a, b) => a.segment_index - b.segment_index)
      .slice(0, 10); // Max 10 segments at once

    return Response.json({ segments });
  } catch (error) {
    console.error('Get segments error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});