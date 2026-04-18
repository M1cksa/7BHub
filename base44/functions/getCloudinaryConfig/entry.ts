import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME');
    const uploadPreset = Deno.env.get('CLOUDINARY_UPLOAD_PRESET');

    if (!cloudName || !uploadPreset) {
      return Response.json({ 
        error: 'Cloudinary not configured',
        message: 'Please set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET in settings' 
      }, { status: 400 });
    }

    console.log('✅ Config loaded:', { cloudName: cloudName.trim(), uploadPreset: uploadPreset.trim() });

    return Response.json({
      cloudName: cloudName.trim(),
      uploadPreset: uploadPreset.trim()
    });

  } catch (error) {
    console.error('Config error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});