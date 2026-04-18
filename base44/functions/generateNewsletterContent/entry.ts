import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    // Get trending videos from the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const videos = await base44.asServiceRole.entities.Video.list('-created_date', 20);
    const recentVideos = videos.filter(v => new Date(v.created_date) > sevenDaysAgo);

    const topVideos = [...recentVideos]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);

    const categories = topVideos.reduce((acc, v) => {
      if (!acc.includes(v.category)) acc.push(v.category);
      return acc;
    }, []);

    // Generate AI newsletter content
    const prompt = `Du bist ein Newsletter-Writer für eine Video-Plattform namens 7B Hub. 
Erstelle einen ansprechenden, persönlichen Newsletter mit KI-gesteuerten Empfehlungen.

Top Videos diese Woche:
${topVideos.map((v, i) => `${i + 1}. "${v.title}" (${v.views || 0} Aufrufe, Kategorie: ${v.category})`).join('\n')}

Populäre Kategorien: ${categories.join(', ')}

Schreibe einen Newsletter, der:
1. Mit einer interessanten Eröffnung startet
2. Die 3 Top-Videos mit Emojis und Beschreibungen vorstellt
3. Eine Empfehlung basierend auf Trends gibt
4. Mit einem persönlichen Abschluss endet

Format: Reines HTML, keine Wrapper-Tags`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: prompt
    });

    return Response.json({
      success: true,
      content: aiResponse,
      videoCount: topVideos.length,
      categories: categories
    });

  } catch (error) {
    console.error('Newsletter generation error:', error);
    return Response.json({
      error: error.message,
      success: false
    }, { status: 500 });
  }
});