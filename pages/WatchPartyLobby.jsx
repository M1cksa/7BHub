import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users } from 'lucide-react';
import CreatePartyDialog from '@/components/watchparty/CreatePartyDialog';
import PartyCard from '@/components/watchparty/PartyCard';
import PageMaintenanceCheck from '@/components/PageMaintenanceCheck';
import PageHeader from '@/components/ui/PageHeader';
import PageShell from '@/components/ui/PageShell';
import SectionTitle from '@/components/ui/SectionTitle';

export default function WatchPartyLobby() {
  const { data: parties = [] } = useQuery({
    queryKey: ['watchParties'],
    queryFn: () => base44.entities.WatchParty.filter({ status: 'active' }, '-created_date', 50),
    refetchInterval: 3000,
  });

  const activeParties = parties.filter(p => (p.participants?.length || 0) < p.max_participants);

  return (
    <PageMaintenanceCheck pageName="WatchPartyLobby">
      <PageShell>
        <PageHeader icon={Users} title="Watch Party" subtitle="Gemeinsam Videos schauen und dabei chatten" accent="violet">
          <CreatePartyDialog />
        </PageHeader>

        <SectionTitle>Aktive Parties ({activeParties.length})</SectionTitle>

        {activeParties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-violet-400" />
            </div>
            <p className="text-white/40 text-sm">Keine aktiven Parties. Erstelle die erste!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {activeParties.map((party, idx) => (
              <PartyCard key={party.id} party={party} index={idx} />
            ))}
          </div>
        )}
      </PageShell>
    </PageMaintenanceCheck>
  );
}