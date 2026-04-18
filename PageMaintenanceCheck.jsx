import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Wrench, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PageMaintenanceCheck({ pageName, children }) {
    const [loading, setLoading] = useState(true);
    const [maintenanceInfo, setMaintenanceInfo] = useState(null);

    useEffect(() => {
        const checkMaintenance = async () => {
            try {
                const maintenanceRecords = await base44.entities.PageMaintenance.filter({ 
                    page_name: pageName,
                    is_disabled: true 
                });

                if (maintenanceRecords.length > 0) {
                    setMaintenanceInfo(maintenanceRecords[0]);
                }
            } catch (error) {
                console.error('Maintenance check error:', error);
            } finally {
                setLoading(false);
            }
        };

        checkMaintenance();
    }, [pageName]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="text-white/50">Lädt...</div>
            </div>
        );
    }

    if (maintenanceInfo) {
        return (
            <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl w-full"
                >
                    <div className="glass-card rounded-3xl border border-white/10 p-12 text-center shadow-2xl">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                            className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-500/30 flex items-center justify-center mx-auto mb-6"
                        >
                            <Wrench className="w-12 h-12 text-orange-400" />
                        </motion.div>

                        <h1 className="text-4xl font-black text-white mb-4">
                            Wartungsarbeiten
                        </h1>

                        <p className="text-xl text-white/70 mb-8">
                            {maintenanceInfo.maintenance_message}
                        </p>

                        <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
                            <p className="text-white/60 text-sm">
                                Diese Funktion ist vorübergehend nicht verfügbar. Wir arbeiten daran, sie so schnell wie möglich wieder zur Verfügung zu stellen.
                            </p>
                        </div>

                        <Link to={createPageUrl('Home')}>
                            <Button className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] hover:opacity-90 text-white font-bold px-8 py-6 text-lg">
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Zurück zur Startseite
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return <>{children}</>;
}