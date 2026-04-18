import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Find expired snaps based on 24_hours limit
        const now = new Date().toISOString();
        
        // Since we can't do complex date comparisons in direct filter, we fetch potential snaps and check
        // Or we just get all snaps that are "delivered" or "viewed"
        const snaps = await base44.asServiceRole.entities.Snap.filter({
            status: { $in: ['delivered', 'viewed'] }
        });
        
        let expiredCount = 0;
        
        for (const snap of snaps) {
            let isExpired = false;
            
            if (snap.expiration_type === '24_hours' && snap.expires_at) {
                if (new Date(snap.expires_at) < new Date()) {
                    isExpired = true;
                }
            } else if (snap.expiration_type === 'view_once' && snap.status === 'viewed') {
                // If it's view_once and already viewed, it should be expired
                // Let's give it a small grace period or just expire it directly
                // Actually it's immediately "expired" on the frontend after viewing, 
                // but we clean it up here to ensure it's removed or marked.
                isExpired = true;
            }
            
            if (isExpired) {
                await base44.asServiceRole.entities.Snap.update(snap.id, { status: 'expired' });
                // We could also delete it: await base44.asServiceRole.entities.Snap.delete(snap.id);
                // But marking as expired might be better for tracking. We'll just delete them to save space.
                await base44.asServiceRole.entities.Snap.delete(snap.id);
                expiredCount++;
            }
        }
        
        return Response.json({ success: true, expiredCount });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});