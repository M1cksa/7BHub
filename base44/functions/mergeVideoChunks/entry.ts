import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chunkUrls, fileName, mimeType } = await req.json();

    if (!chunkUrls || !Array.isArray(chunkUrls) || chunkUrls.length === 0) {
      return Response.json({ error: 'No chunk URLs provided' }, { status: 400 });
    }

    console.log(`🔗 Merging ${chunkUrls.length} chunks for "${fileName}"`);

    // Download and merge chunks using /tmp file
    const tmpPath = `/tmp/${Date.now()}_${fileName || 'video.mp4'}`;
    const file = await Deno.open(tmpPath, { create: true, write: true });
    let totalSize = 0;

    try {
      for (let i = 0; i < chunkUrls.length; i++) {
        console.log(`📥 Downloading chunk ${i + 1}/${chunkUrls.length}...`);
        
        const resp = await fetch(chunkUrls[i]);
        if (!resp.ok) {
          throw new Error(`Failed to download chunk ${i + 1}: HTTP ${resp.status}`);
        }

        const arrayBuf = await resp.arrayBuffer();
        const chunk = new Uint8Array(arrayBuf);
        await file.write(chunk);
        totalSize += chunk.length;
        
        if ((i + 1) % 5 === 0 || i === chunkUrls.length - 1) {
          console.log(`✅ Merged ${i + 1}/${chunkUrls.length} chunks (${(totalSize / 1024 / 1024).toFixed(2)}MB)`);
        }
      }

      file.close();
      console.log(`📤 Uploading merged file (${(totalSize / 1024 / 1024).toFixed(2)}MB)...`);

      // Read the merged file
      const mergedData = await Deno.readFile(tmpPath);
      const blob = new Blob([mergedData], { type: mimeType || 'video/mp4' });
      const uploadFile = new File([blob], fileName || 'video.mp4', { type: mimeType || 'video/mp4' });

      const result = await base44.asServiceRole.integrations.Core.UploadFile({ file: uploadFile });

      // Cleanup temp file
      await Deno.remove(tmpPath).catch(() => {});

      if (!result?.file_url) {
        throw new Error('Final upload failed - no URL returned');
      }

      console.log(`✅ Merge complete: ${result.file_url}`);

      return Response.json({
        success: true,
        file_url: result.file_url,
        total_size: totalSize
      });

    } catch (error) {
      file.close();
      await Deno.remove(tmpPath).catch(() => {});
      throw error;
    }

  } catch (error) {
    console.error('❌ Merge error:', error.message);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});