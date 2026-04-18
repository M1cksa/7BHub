import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import * as bcrypt from 'npm:bcrypt@5.1.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { password } = await req.json();
    
    if (!password || typeof password !== 'string') {
      return Response.json({ error: 'Password is required' }, { status: 400 });
    }

    // Hash password with bcrypt (salt rounds: 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    return Response.json({ hashedPassword });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});