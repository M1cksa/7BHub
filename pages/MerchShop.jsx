import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Coins, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import AnimatedBackground from '@/components/streaming/AnimatedBackground';
import { toast } from 'sonner';

export default function MerchShop() {
  const [user, setUser] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newMerch, setNewMerch] = useState({
    name: '', description: '', price: 100, image_url: '', category: 'clothing', stock: 100
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const { data: allMerch = [] } = useQuery({
    queryKey: ['merchandise'],
    queryFn: () => base44.entities.Merchandise.list('-created_date', 100)
  });

  const createMerchMutation = useMutation({
    mutationFn: (data) => base44.entities.Merchandise.create({
      ...data,
      creator_username: user.username
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['merchandise']);
      setCreateOpen(false);
      setNewMerch({ name: '', description: '', price: 100, image_url: '', category: 'clothing', stock: 100 });
      toast.success('Merchandise erstellt!');
    }
  });

  const buyMerchMutation = useMutation({
    mutationFn: async (merch) => {
      if ((user.tokens || 0) < merch.price) {
        throw new Error('Nicht genug Coins!');
      }

      await base44.entities.MerchOrder.create({
        buyer_username: user.username,
        merch_id: merch.id,
        merch_name: merch.name,
        quantity: 1,
        total_price: merch.price,
        status: 'completed'
      });

      await base44.entities.AppUser.update(user.id, {
        tokens: (user.tokens || 0) - merch.price
      });

      await base44.entities.Merchandise.update(merch.id, {
        stock: merch.stock - 1
      });

      const updated = { ...user, tokens: (user.tokens || 0) - merch.price };
      localStorage.setItem('app_user', JSON.stringify(updated));
      setUser(updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['merchandise']);
      toast.success('Kauf erfolgreich!');
    },
    onError: (e) => toast.error(e.message)
  });

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pt-24 px-4 pb-20 relative">
      <AnimatedBackground />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-black mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">
                Merch Shop
              </span>
            </h1>
            <p className="text-white/40">Fanartikel von deinen Lieblings-Creatorn</p>
          </div>

          {user && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-pink-600 hover:bg-pink-500">
                  <Plus className="w-5 h-5 mr-2" /> Merch erstellen
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a1a1c] border-white/10 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle>Neues Merchandise</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Name</Label>
                    <Input 
                      value={newMerch.name}
                      onChange={(e) => setNewMerch({...newMerch, name: e.target.value})}
                      className="bg-black/20 border-white/10"
                    />
                  </div>
                  <div>
                    <Label>Beschreibung</Label>
                    <Textarea 
                      value={newMerch.description}
                      onChange={(e) => setNewMerch({...newMerch, description: e.target.value})}
                      className="bg-black/20 border-white/10"
                    />
                  </div>
                  <div>
                    <Label>Bild URL</Label>
                    <Input 
                      value={newMerch.image_url}
                      onChange={(e) => setNewMerch({...newMerch, image_url: e.target.value})}
                      className="bg-black/20 border-white/10"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Preis (Coins)</Label>
                      <Input 
                        type="number"
                        value={newMerch.price}
                        onChange={(e) => setNewMerch({...newMerch, price: parseInt(e.target.value)})}
                        className="bg-black/20 border-white/10"
                      />
                    </div>
                    <div>
                      <Label>Lagerbestand</Label>
                      <Input 
                        type="number"
                        value={newMerch.stock}
                        onChange={(e) => setNewMerch({...newMerch, stock: parseInt(e.target.value)})}
                        className="bg-black/20 border-white/10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Kategorie</Label>
                    <Select value={newMerch.category} onValueChange={(v) => setNewMerch({...newMerch, category: v})}>
                      <SelectTrigger className="bg-black/20 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1c] border-white/10 text-white">
                        <SelectItem value="clothing">Kleidung</SelectItem>
                        <SelectItem value="accessories">Zubehör</SelectItem>
                        <SelectItem value="collectibles">Sammlerstücke</SelectItem>
                        <SelectItem value="digital">Digital</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={() => createMerchMutation.mutate(newMerch)}
                    disabled={!newMerch.name || !newMerch.image_url || createMerchMutation.isPending}
                    className="w-full bg-pink-600 hover:bg-pink-500"
                  >
                    {createMerchMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Erstellen'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {allMerch.length === 0 ? (
          <div className="text-center py-32 text-white/30">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>Noch keine Artikel verfügbar</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allMerch.map((merch, i) => (
              <motion.div
                key={merch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#151517] rounded-2xl border border-white/5 overflow-hidden hover:border-pink-500/30 transition-all"
              >
                <div className="aspect-square bg-white/5">
                  <img src={merch.image_url} className="w-full h-full object-cover" alt={merch.name} />
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-1 truncate">{merch.name}</h3>
                  <p className="text-xs text-white/40 mb-3">von {merch.creator_username}</p>
                  <p className="text-sm text-white/60 mb-4 line-clamp-2">{merch.description}</p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black">{merch.price}</span>
                      <Coins className="w-4 h-4 text-amber-400" />
                    </div>
                    <Button 
                      onClick={() => buyMerchMutation.mutate(merch)}
                      disabled={buyMerchMutation.isPending || merch.stock === 0 || (user?.tokens || 0) < merch.price}
                      size="sm"
                      className="bg-pink-600 hover:bg-pink-500"
                    >
                      {merch.stock === 0 ? 'Ausverkauft' : 'Kaufen'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}