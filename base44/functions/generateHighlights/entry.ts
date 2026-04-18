import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { video_id, mood, target_duration = 30 } = await req.json();

    // Get video details
    const videos = await base44.entities.Video.list('-created_date', 100);
    const video = videos.find(v => v.id === video_id);

    if (!video) {
      return Response.json({ error: 'Video not found' }, { status: 404 });
    }

    if (!video.allow_highlights) {
      return Response.json({ error: 'Highlights disabled for this video' }, { status: 403 });
    }

    // AI analysis to find highlight moments
    const prompt = `Analyze this video and suggest ${mood === 'action' ? '3-5 action-packed' : mood === 'funny' ? '3-5 comedic' : mood === 'educational' ? '3-5 informative key' : mood === 'emotional' ? '3-5 emotional' : '3-5 epic'} highlight moments.

Video: "${video.title}"
Description: "${video.description || 'No description'}"
Duration: ${video.duration} seconds
Target highlight length: ${target_duration} seconds each

Return a JSON array of highlights with this structure:
{
  "highlights": [
    {
      "start_time": 0,
      "end_time": 30,
      "title": "Brief engaging title",
      "description": "Why this moment is interesting",
      "confidence_score": 0.95
    }
  ]
}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          highlights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                start_time: { type: "number" },
                end_time: { type: "number" },
                title: { type: "string" },
                description: { type: "string" },
                confidence_score: { type: "number" }
              }
            }
          }
        }
      }
    });

    // Save highlights to database
    const highlightsToCreate = response.highlights.map(h => ({
      video_id: video.id,
      video_title: video.title,
      creator_name: video.creator_name,
      start_time: h.start_time,
      end_time: h.end_time,
      duration: h.end_time - h.start_time,
      mood,
      title: h.title,
      description: h.description,
      thumbnail_url: video.thumbnail_url,
      confidence_score: h.confidence_score,
      status: 'generated'
    }));

    const createdHighlights = await base44.entities.VideoHighlight.bulkCreate(highlightsToCreate);

    return Response.json({
      success: true,
      highlights: createdHighlights,
      count: createdHighlights.length
    });

  } catch (error) {
    console.error('Highlight generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});