import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function UserHeartbeat() {
  // Update last_seen every 60 seconds
  useEffect(() => {
    let interval;
    
    const updatePresence = async () => {
      try {
        const uStr = localStorage.getItem('app_user');
        if (!uStr) return;
        const user = JSON.parse(uStr);
        if (!user?.id) return;
        
        const now = new Date().toISOString();
        
        // Update AppUser
        await base44.auth.updateMe({ last_seen: now });
        
        // Update ClanMember records for this user so others can see they are online
        const memberships = await base44.entities.ClanMember.filter({ username: user.username });
        for (const membership of memberships) {
          await base44.entities.ClanMember.update(membership.id, { last_seen: now });
        }
      } catch (err) {
        console.error('Heartbeat failed:', err);
      }
    };
    
    // Initial call after 5s
    setTimeout(updatePresence, 5000);
    
    // Then every 60s
    interval = setInterval(updatePresence, 60000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  return null;
}