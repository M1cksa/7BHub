import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Wrench, Plus, Trash2, Power, PowerOff, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const AVAILABLE_PAGES = [
    { name: 'WatchPartyLobby', title: 'Watch Party' },
    { name: 'Shop', title: 'Shop' },
    { name: 'Shorts', title: 'Shorts' },
    { name: 'Live', title: 'Live Streams' },
    { name: 'Snaps', title: 'Snaps' },
    { name: 'CommunityHub', title: 'Community Hub' },
    { name: 'Agents', title: 'AI Agenten' },
    { name: 'Roadmap', title: 'Roadmap' },
    { name: 'Feedback', title: 'Feedback' },
    { name: 'CreatorProfile', title: 'Creator Profile' },
    { name: 'Profile', title: 'Profil' },
    { name: 'Upload', title: 'Upload' },
    { name: 'UploadSelect', title: 'Upload Auswahl' },
    { name: 'CloudinaryUpload', title: 'Cloudinary Upload' },
    { name: 'GoogleDriveUpload', title: 'Google Drive Upload' },
    { name: 'GumletUpload', title: 'Gumlet Upload' },
    { name: 'UploadShort', title: 'Short Upload' },
    { name: 'GoLive', title: 'Live Stream starten' },
    { name: 'Messages', title: 'Nachrichten' },
    { name: 'Forum', title: 'Forum' },
    { name: 'Clans', title: 'Clans' },
    { name: 'Playlists', title: 'Playlists' },
    { name: 'Premium', title: 'Premium' },
    { name: 'Donate', title: 'Spenden' },
    { name: 'MiniGame', title: 'Mini Game' },
    { name: 'Achievements', title: 'Erfolge' },
    { name: 'Settings', title: 'Einstellungen' },
];

export default function AdminMaintenance() {
    const [user, setUser] = useState(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingPage, setEditingPage] = useState(null);
    const [formData, setFormData] = useState({
        page_name: '',
        page_title: '',
        maintenance_message: 'Diese Funktion ist derzeit wegen Wartungsarbeiten nicht verfügbar.'
    });

    const queryClient = useQueryClient();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
                
                if (currentUser.role !== 'admin') {
                    window.location.href = '/Home';
                }
            } catch (error) {
                window.location.href = '/SignIn';
            }
        };
        loadUser();
    }, []);

    const { data: maintenancePages = [], isLoading } = useQuery({
        queryKey: ['maintenancePages'],
        queryFn: () => base44.entities.PageMaintenance.list('-created_date'),
        enabled: !!user
    });

    const createPageMutation = useMutation({
        mutationFn: (data) => base44.entities.PageMaintenance.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['maintenancePages']);
            toast.success('Seite zur Wartungsliste hinzugefügt');
            setIsAddDialogOpen(false);
            setFormData({
                page_name: '',
                page_title: '',
                maintenance_message: 'Diese Funktion ist derzeit wegen Wartungsarbeiten nicht verfügbar.'
            });
        },
        onError: () => toast.error('Fehler beim Hinzufügen')
    });

    const updatePageMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.PageMaintenance.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['maintenancePages']);
            toast.success('Wartungsstatus aktualisiert');
            setEditingPage(null);
        },
        onError: () => toast.error('Fehler beim Aktualisieren')
    });

    const deletePageMutation = useMutation({
        mutationFn: (id) => base44.entities.PageMaintenance.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['maintenancePages']);
            toast.success('Seite aus Wartungsliste entfernt');
        },
        onError: () => toast.error('Fehler beim Löschen')
    });

    const handleToggleMaintenance = async (page) => {
        const newStatus = !page.is_disabled;
        await updatePageMutation.mutateAsync({
            id: page.id,
            data: {
                is_disabled: newStatus,
                disabled_at: newStatus ? new Date().toISOString() : null,
                disabled_by: newStatus ? user.username : null
            }
        });
    };

    const handleAddPage = () => {
        if (!formData.page_name || !formData.page_title) {
            toast.error('Bitte alle Felder ausfüllen');
            return;
        }

        createPageMutation.mutate(formData);
    };

    const handleUpdateMessage = () => {
        if (!editingPage) return;

        updatePageMutation.mutate({
            id: editingPage.id,
            data: {
                maintenance_message: editingPage.maintenance_message,
                page_title: editingPage.page_title
            }
        });
    };

    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Header */}
                <div className="glass-card rounded-3xl border border-white/10 p-8 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-500/30 flex items-center justify-center">
                                <Wrench className="w-8 h-8 text-orange-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white">Wartungsmodus</h1>
                                <p className="text-white/60 mt-1">Seiten vorübergehend deaktivieren</p>
                            </div>
                        </div>

                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] hover:opacity-90 text-white font-bold">
                                    <Plus className="w-5 h-5 mr-2" />
                                    Seite hinzufügen
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-900 border-white/10">
                                <DialogHeader>
                                    <DialogTitle className="text-white">Seite zur Wartungsliste hinzufügen</DialogTitle>
                                    <DialogDescription className="text-white/60">
                                        Wähle eine Seite aus, die im Wartungsmodus verwaltet werden soll
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 mt-4">
                                    <div>
                                        <label className="text-sm font-medium text-white/80 mb-2 block">Seite auswählen</label>
                                        <select
                                            value={formData.page_name}
                                            onChange={(e) => {
                                                const selected = AVAILABLE_PAGES.find(p => p.name === e.target.value);
                                                setFormData({
                                                    ...formData,
                                                    page_name: selected?.name || '',
                                                    page_title: selected?.title || ''
                                                });
                                            }}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                        >
                                            <option value="">Seite wählen...</option>
                                            {AVAILABLE_PAGES.filter(page => 
                                                !maintenancePages.some(mp => mp.page_name === page.name)
                                            ).map(page => (
                                                <option key={page.name} value={page.name}>
                                                    {page.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-white/80 mb-2 block">Wartungsmeldung</label>
                                        <Textarea
                                            value={formData.maintenance_message}
                                            onChange={(e) => setFormData({ ...formData, maintenance_message: e.target.value })}
                                            className="bg-white/5 border-white/10 text-white"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <Button onClick={() => setIsAddDialogOpen(false)} variant="outline" className="flex-1">
                                            Abbrechen
                                        </Button>
                                        <Button onClick={handleAddPage} className="flex-1 bg-[var(--theme-primary)] hover:opacity-80">
                                            Hinzufügen
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Pages List */}
                <div className="glass-card rounded-3xl border border-white/10 p-6">
                    {isLoading ? (
                        <div className="text-center py-12 text-white/50">Lädt...</div>
                    ) : maintenancePages.length === 0 ? (
                        <div className="text-center py-12">
                            <Wrench className="w-16 h-16 text-white/20 mx-auto mb-4" />
                            <p className="text-white/60">Keine Seiten in der Wartungsliste</p>
                            <p className="text-white/40 text-sm mt-2">Füge Seiten hinzu, um sie im Wartungsmodus zu verwalten</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[600px] pr-4">
                            <div className="space-y-3">
                                {maintenancePages.map((page) => (
                                    <motion.div
                                        key={page.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`glass-card rounded-2xl p-6 border ${
                                            page.is_disabled 
                                                ? 'border-red-500/30 bg-red-500/5' 
                                                : 'border-white/10'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                {editingPage?.id === page.id ? (
                                                    <Input
                                                        value={editingPage.page_title}
                                                        onChange={(e) => setEditingPage({ ...editingPage, page_title: e.target.value })}
                                                        className="bg-white/5 border-white/10 text-white font-bold text-lg mb-2"
                                                    />
                                                ) : (
                                                    <h3 className="text-xl font-bold text-white mb-1">{page.page_title}</h3>
                                                )}
                                                <p className="text-white/50 text-sm font-mono">{page.page_name}</p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {editingPage?.id === page.id ? (
                                                    <>
                                                        <Button
                                                            size="icon"
                                                            onClick={handleUpdateMessage}
                                                            className="bg-green-500 hover:bg-green-600 text-white"
                                                        >
                                                            <Save className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => setEditingPage(null)}
                                                            className="text-white/60 hover:text-white"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => setEditingPage({ ...page })}
                                                        className="text-white/60 hover:text-white"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                )}

                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => deletePageMutation.mutate(page.id)}
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {editingPage?.id === page.id ? (
                                            <Textarea
                                                value={editingPage.maintenance_message}
                                                onChange={(e) => setEditingPage({ ...editingPage, maintenance_message: e.target.value })}
                                                className="bg-white/5 border-white/10 text-white mb-4"
                                                rows={3}
                                            />
                                        ) : (
                                            <p className="text-white/70 mb-4">{page.maintenance_message}</p>
                                        )}

                                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                            <div className="flex items-center gap-3">
                                                <Switch
                                                    checked={page.is_disabled}
                                                    onCheckedChange={() => handleToggleMaintenance(page)}
                                                />
                                                <span className={`font-bold ${page.is_disabled ? 'text-red-400' : 'text-green-400'}`}>
                                                    {page.is_disabled ? 'Deaktiviert' : 'Aktiv'}
                                                </span>
                                            </div>

                                            {page.is_disabled && page.disabled_by && (
                                                <div className="text-xs text-white/40">
                                                    Deaktiviert von {page.disabled_by}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </motion.div>
        </div>
    );
}