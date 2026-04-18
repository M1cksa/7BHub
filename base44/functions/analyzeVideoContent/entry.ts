import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { videoTitle, videoDescription, thumbnailUrl } = await req.json();

    // Generate AI-powered metadata
    const metadataPrompt = `Analysiere diesen Video-Inhalt und generiere:
1. Einen ansprechenden, SEO-optimierten Titel (max 60 Zeichen)
2. Eine detaillierte, fesselnde Beschreibung (100-200 Wörter)
3. 8-12 relevante Tags/Schlüsselwörter

Video-Informationen:
Titel: ${videoTitle || 'Unbekannt'}
Beschreibung: ${videoDescription || 'Keine Beschreibung'}

Gib die Antwort im folgenden JSON-Format zurück:
{
  "title": "...",
  "description": "...",
  "tags": ["tag1", "tag2", ...],
  "suggestedCategory": "gaming/music/education/entertainment/tech/art/lifestyle/sports"
}`;

    const metadata = await base44.integrations.Core.InvokeLLM({
      prompt: metadataPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          suggestedCategory: { type: "string" }
        }
      }
    });

    // Generate chapter markers based on content
    const chaptersPrompt = `Basierend auf dem Video-Titel "${videoTitle}" und der Beschreibung "${videoDescription}", 
erstelle 5-8 sinnvolle Kapitelmarkierungen mit Zeitstempeln (in Sekunden) und Titeln.

Beispiel für ein 10-Minuten-Video:
{
  "chapters": [
    {"time": 0, "title": "Einleitung"},
    {"time": 120, "title": "Hauptthema"},
    {"time": 300, "title": "Details"},
    {"time": 480, "title": "Zusammenfassung"}
  ]
}

Gib die Kapitel im JSON-Format zurück.`;

    const chaptersData = await base44.integrations.Core.InvokeLLM({
      prompt: chaptersPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          chapters: {
            type: "array",
            items: {
              type: "object",
              properties: {
                time: { type: "number" },
                title: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      ...metadata,
      chapters: chaptersData.chapters || []
    });

  } catch (error) {
    console.error('Video analysis error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});