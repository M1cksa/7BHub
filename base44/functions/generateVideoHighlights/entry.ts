import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { video_id } = await req.json();

    if (!video_id) {
      return Response.json({ error: 'video_id required' }, { status: 400 });
    }

    // Get video details
    const videos = await base44.entities.Video.filter({ id: video_id });
    const video = videos[0];

    if (!video) {
      return Response.json({ error: 'Video not found' }, { status: 404 });
    }

    // Check if user is the creator
    if (video.created_by !== user.email) {
      return Response.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Use AI to analyze video and generate highlight timestamps
    const prompt = `Du bist ein Experte für Video-Analyse. Analysiere das folgende Video und generiere 3-5 interessante Highlight-Momente.

Video Titel: ${video.title}
Beschreibung: ${video.description || 'Keine Beschreibung'}
Kategorie: ${video.category}
Dauer: ${video.duration} Sekunden

Erstelle Highlights basierend auf wahrscheinlich interessanten Momenten. Für jedes Highlight, gib an:
- start_time: Startzeit in Sekunden (zwischen 0 und ${video.duration})
- end_time: Endzeit in Sekunden (max 30 Sekunden nach start_time)
- title: Aussagekräftiger Titel (max 60 Zeichen)
- description: Kurze Beschreibung (max 150 Zeichen)

Wähle Zeitpunkte strategisch verteilt über das Video.`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
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
                description: { type: "string" }
              }
            }
          }
        }
      }
    });

    const highlights = aiResponse.highlights || [];

    // Create highlight entities
    const createdHighlights = [];
    for (const highlight of highlights) {
      // Validate times
      const startTime = Math.max(0, Math.min(highlight.start_time, video.duration - 5));
      const endTime = Math.min(startTime + 30, Math.max(startTime + 5, highlight.end_time), video.duration);

      const created = await base44.entities.VideoHighlight.create({
        video_id: video_id,
        title: highlight.title,
        description: highlight.description,
        start_time: startTime,
        end_time: endTime,
        thumbnail_url: video.thumbnail_url,
        views: 0
      });

      createdHighlights.push(created);
    }

    return Response.json({
      success: true,
      highlights: createdHighlights
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});