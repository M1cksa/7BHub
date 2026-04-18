import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Send, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function AdminTermsManager() {
    const queryClient = useQueryClient();
    const [config, setConfig] = useState({
        current_version: '1.0',
        upcoming_version: '',
        upcoming_date: '',
        summary_of_changes: '',
        upcoming_full_text: '',
        force_immediate: false
    });
    const [configId, setConfigId] = useState(null);

    const { data: termsConfigs = [] } = useQuery({
        queryKey: ['adminTermsConfig'],
        queryFn: () => base44.entities.TermsConfig.list('-created_date', 1),
    });

    useEffect(() => {
        if (termsConfigs.length > 0) {
            const conf = termsConfigs[0];
            setConfigId(conf.id);
            setConfig({
                current_version: conf.current_version || '1.0',
                upcoming_version: conf.upcoming_version || '',
                upcoming_date: conf.upcoming_date ? conf.upcoming_date.split('T')[0] : '',
                summary_of_changes: conf.summary_of_changes || '',
                upcoming_full_text: conf.upcoming_full_text || '',
                force_immediate: conf.force_immediate || false
            });
        }
    }, [termsConfigs]);

    const saveMutation = useMutation({
        mutationFn: async (data) => {
            const payload = {
                ...data,
                upcoming_date: data.upcoming_date ? new Date(data.upcoming_date).toISOString() : null
            };
            if (configId) {
                return await base44.entities.TermsConfig.update(configId, payload);
            } else {
                return await base44.entities.TermsConfig.create(payload);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminTermsConfig']);
            toast.success('AGB Konfiguration gespeichert');
        },
        onError: (err) => {
            toast.error('Fehler: ' + err.message);
        }
    });

    const sendEmailMutation = useMutation({
        mutationFn: async () => {
            const subject = `Wichtige Änderung unserer AGB ab ${new Date(config.upcoming_date).toLocaleDateString('de-DE')}`;
            const message = `Hallo!\n\nWir werden unsere Allgemeinen Geschäftsbedingungen zum ${new Date(config.upcoming_date).toLocaleDateString('de-DE')} aktualisieren (Version ${config.upcoming_version}).\n\nZusammenfassung der Änderungen:\n${config.summary_of_changes}\n\nBitte logge dich auf der Plattform ein, um den neuen AGB zuzustimmen.\n\nDein 7B Hub Team`;
            const res = await base44.functions.invoke('sendTermsUpdateEmail', { subject, message });
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data.message);
        },
        onError: (err) => {
            toast.error('Fehler beim E-Mail Versand: ' + err.message);
        }
    });

    return (
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-white">AGB & Nutzungsbedingungen</h3>
                    <p className="text-white/60 text-sm">Versionen und Änderungen verwalten</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Aktuelle Version</label>
                    <Input
                        value={config.current_version}
                        onChange={(e) => setConfig({ ...config, current_version: e.target.value })}
                        placeholder="z.B. 1.0"
                        className="bg-black/20 border-white/10 text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Zukünftige Version (Optional)</label>
                    <Input
                        value={config.upcoming_version}
                        onChange={(e) => setConfig({ ...config, upcoming_version: e.target.value })}
                        placeholder="z.B. 1.1"
                        className="bg-black/20 border-white/10 text-white"
                    />
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-white/70 mb-2">In Kraft tretend ab (für zukünftige Version)</label>
                <Input
                    type="date"
                    value={config.upcoming_date}
                    onChange={(e) => setConfig({ ...config, upcoming_date: e.target.value })}
                    className="bg-black/20 border-white/10 text-white"
                />
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-white/70 mb-2">Zusammenfassung der Neuerungen (wird im Popup & E-Mail gezeigt)</label>
                <Textarea
                    value={config.summary_of_changes}
                    onChange={(e) => setConfig({ ...config, summary_of_changes: e.target.value })}
                    placeholder="- Neues Feature X hinzugefügt&#10;- Regel Y angepasst"
                    rows={4}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/40 focus:border-cyan-500/50"
                />
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-white/70 mb-2">Vollständiger Text der zukünftigen AGB (Markdown/Text)</label>
                <Textarea
                    value={config.upcoming_full_text}
                    onChange={(e) => setConfig({ ...config, upcoming_full_text: e.target.value })}
                    placeholder="§1 Geltungsbereich..."
                    rows={12}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/40 focus:border-cyan-500/50 font-mono text-xs"
                />
            </div>

            <div className="flex gap-3">
                <Button 
                    onClick={() => saveMutation.mutate(config)}
                    disabled={saveMutation.isPending}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500"
                >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Speichern
                </Button>
                
                {config.upcoming_version && config.upcoming_date && (
                    <Button 
                        onClick={() => {
                            if (confirm('Möchtest du eine E-Mail mit der Zusammenfassung der neuen AGB an alle Nutzer senden?')) {
                                sendEmailMutation.mutate();
                            }
                        }}
                        disabled={sendEmailMutation.isPending}
                        variant="outline"
                        className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Nutzer per E-Mail informieren
                    </Button>
                )}
            </div>
        </div>
    );
}