import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Loader2, ShoppingCart, Lock, Check, Palette, Star, Wand2, Film, Eye } from 'lucide-react';
import { toast } from 'sonner';
import ShopCard from '@/components/modern/ShopCard';
import UserAvatar from '@/components/UserAvatar';

const RARITY_STYLES = {
  common:    { label: 'Common',    bg: 'bg-gray-500/20',    border: 'border-gray-400/30',   text: 'text-gray-300' },
  rare:      { label: 'Rare',      bg: 'bg-blue-500/20',    border: 'border-blue-400/40',   text: 'text-blue-300' },
  epic:      { label: 'Epic',      bg: 'bg-purple-500/20',  border: 'border-purple-400/40', text: 'text-purple-300' },
  legendary: { label: 'Legendary', bg: 'bg-yellow-500/20',  border: 'border-yellow-400/50', text: 'text-yellow-300' },
  unique:    { label: 'Unique',    bg: 'bg-red-500/20',     border: 'border-red-400/50',    text: 'text-red-300' },
};

const CATEGORY_LABELS = {
  ingame: '🎒 Ausrüstung',
  badge: '🏅 Abzeichen',
  frame: '🖼️ Rahmen',
  theme: '🎨 Theme',
  animation: '✨ Animation',
  collectible: '🗝️ Sammlerstück',
  moment: '📸 Moment',
  creator_card: '🃏 Creator-Karte',
  limited_edition: '🎁 Limited Edition',
  art: '🖼️ Artwork',
};

const INGAME_ITEMS = [
  { id: 'pokeball',  name: 'Pokéball',   icon: '🔴', description: 'Fängt wilde Pokémon. Normale Chance.', price: 80, category: 'ball' },
  { id: 'greatball', name: 'Superball',  icon: '🔵', description: 'Höhere Chance wilde Pokémon zu fangen.', price: 200, category: 'ball' },
  { id: 'ultraball', name: 'Hyperball',  icon: '⚫', description: 'Sehr hohe Chance wilde Pokémon zu fangen.', price: 400, category: 'ball' },
  { id: 'potion',    name: 'Trank',      icon: '🧪', description: 'Heilt 30 HP im Kampf.', price: 100, category: 'item' },
  { id: 'superp',    name: 'Supertrank', icon: '💊', description: 'Heilt 80 HP im Kampf.', price: 250, category: 'item' },
  { id: 'fullheal',  name: 'Heilpulver', icon: '✨', description: 'Heilt alle Statusprobleme.', price: 150, category: 'item' },
  { id: 'xatk',      name: 'X-Angriff',  icon: '⚔️', description: '+20% Angriff (3 Runden)', price: 200, category: 'item' },
  { id: 'xdef',      name: 'X-Verteidigung', icon: '🛡', description: '+20% Verteidigung (3 Runden)', price: 200, category: 'item' },
  { id: 'revive',    name: 'Beleber',    icon: '💫', description: 'Belebt ein besiegtes Pokémon wieder.', price: 500, category: 'item' },
];

// Maps ShopItem category → which AppUser array field to add the item id to
function getOwnershipField(category) {
  switch (category) {
    case 'theme': return 'owned_themes';
    case 'frame': return 'owned_video_frames';
    case 'animation': return 'owned_animations';
    case 'badge': return 'owned_badges';
    default: return 'owned_badges'; // collectible, limited_edition, art, moment, creator_card
  }
}

function isAlreadyOwned(user, item) {
  if (!user) return false;
  const field = getOwnershipField(item.category);
  const owned = user[field] || [];
  // For themes, the stored ID is theme_id (e.g. 'gold'), not the DB item.id
  if (item.category === 'theme') {
    const themeId = item.theme_id || item.id;
    return owned.includes(themeId) || owned.includes(item.id);
  }
  return owned.includes(item.id);
}

export default function PokemonShopSection({ user, setUser, gameCoins, inventory, ballInventory, onBuyGameItem }) {
  const [activeCategory, setActiveCategory] = useState('ingame');
  const queryClient = useQueryClient();

  const { data: allItems = [], isLoading } = useQuery({
    queryKey: ['pokemonShopItems'],
    queryFn: () => base44.entities.ShopItem.filter({ seller_id: 'SYSTEM', status: 'active' }, '-created_date', 200),
  });

  // Filter only Pokémon-themed items
  const pokemonItems = allItems.filter(item => {
    const nameLower = (item.name || '').toLowerCase();
    const descLower = (item.description || '').toLowerCase();
    const imgLower = (item.image_url || '').toLowerCase();
    return (
      imgLower.includes('pokeapi') ||
      imgLower.includes('pokemon') ||
      nameLower.includes('pokémon') ||
      nameLower.includes('pokemon') ||
      nameLower.includes('pikachu') ||
      nameLower.includes('mewtu') ||
      nameLower.includes('mew') ||
      nameLower.includes('glumanda') ||
      nameLower.includes('bisasam') ||
      nameLower.includes('schiggy') ||
      nameLower.includes('glurak') ||
      nameLower.includes('gengar') ||
      nameLower.includes('relaxo') ||
      nameLower.includes('evoli') ||
      nameLower.includes('lugia') ||
      nameLower.includes('ho-oh') ||
      nameLower.includes('togepi') ||
      nameLower.includes('kanto') ||
      nameLower.includes('pokéball') ||
      nameLower.includes('pokeball') ||
      nameLower.includes('meisterball') ||
      nameLower.includes('dragoran') ||
      nameLower.includes('retro') ||
      nameLower.includes('trainer') ||
      nameLower.includes('30 jahre') ||
      nameLower.includes('typ') ||
      descLower.includes('pokémon') ||
      descLower.includes('pokemon')
    );
  });

  const usedCategories = ['ingame', 'all', ...new Set(pokemonItems.map(i => i.category).filter(Boolean))];
  const filtered = activeCategory === 'all'
    ? pokemonItems
    : pokemonItems.filter(i => i.category === activeCategory);

  // Equip/activate an owned item (set the correct active_* field)
  const equipMutation = useMutation({
    mutationFn: async (item) => {
      if (!user) throw new Error('Nicht eingeloggt');
      let updateData = {};
      // For themes: use the theme_id field (e.g. 'gold', 'ocean') stored in the ShopItem,
      // because the app's theme system uses those preset IDs, not the ShopItem's DB id.
      const themeId = item.theme_id || item.id;
      switch (item.category) {
        case 'theme':      updateData = { active_theme: themeId }; break;
        case 'animation':  updateData = { active_animation: item.id }; break;
        case 'frame':      updateData = { frame_style: item.id }; break;
        // Badges change the profile background banner + set active_badge
        case 'badge':      updateData = { active_badge: item.id, active_banner: item.id }; break;
        default: return;
      }
      await base44.entities.AppUser.update(user.id, updateData);
      const updatedUser = { ...user, ...updateData };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event('user-updated'));
      return item;
    },
    onSuccess: (item) => toast.success(`"${item.name}" ausgerüstet! Seite neu laden um das Theme zu sehen.`),
    onError: (e) => toast.error('Fehler', { description: e.message }),
  });

  // Single buy mutation that correctly places items in the right ownership array
  const buyMutation = useMutation({
    mutationFn: async (item) => {
      if (!user) throw new Error('Bitte einloggen!');

      const freshUser = (await base44.entities.AppUser.filter({ id: user.id }, 1))[0];
      if (!freshUser) throw new Error('Nutzer nicht gefunden');

      // Check already owned
      const ownershipField = getOwnershipField(item.category);
      const currentOwned = freshUser[ownershipField] || [];
      // For themes: also check by theme_id to avoid duplicates
      const themeId = item.theme_id || item.id;
      if (item.category === 'theme' && currentOwned.includes(themeId)) throw new Error('Du besitzt dieses Theme bereits!');
      if (item.category !== 'theme' && currentOwned.includes(item.id)) throw new Error('Du besitzt dieses Item bereits!');

      // Check stock
      if (item.stock > 0) {
        // stock > 0 means limited; stock === 0 means unlimited
        // Fetch current stock by checking purchases
        // We just trust the item.stock value here since we can't easily count
      }

      // Check tokens
      if (!freshUser.is_donor && (freshUser.tokens || 0) < item.price) {
        throw new Error(`Nicht genug Coins! Du brauchst ${item.price.toLocaleString()} 🪙`);
      }

      // For themes: store the preset theme_id (e.g. 'gold') not the ShopItem DB id
      const ownedId = item.category === 'theme' ? (item.theme_id || item.id) : item.id;
      const newOwned = [...currentOwned, ownedId];
      const updateData = { [ownershipField]: newOwned };

      if (!freshUser.is_donor && item.price > 0) {
        updateData.tokens = (freshUser.tokens || 0) - item.price;
      }

      await base44.entities.AppUser.update(freshUser.id, updateData);

      // Create Purchase record for history
      await base44.entities.Purchase.create({
        buyer_id: freshUser.id,
        item_id: item.id,
        item_name: item.name,
        price: item.price,
      }).catch(() => {}); // silently fail if Purchase entity doesn't exist

      const updatedUser = { ...freshUser, ...updateData };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event('user-updated'));
      return item;
    },
    onSuccess: (item) => {
      queryClient.invalidateQueries(['pokemonShopItems']);
      toast.success(`"${item.name}" gekauft! 🎉`, { description: `${item.price.toLocaleString()} Coins abgezogen.` });
    },
    onError: (e) => toast.error('Kauf fehlgeschlagen', { description: e.message }),
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #FFD700, #FF6B00)' }}>
          <span className="text-2xl">🎮</span>
        </div>
        <div>
          <h2 className="text-3xl font-black text-white">{activeCategory === 'ingame' ? 'Pokémon Markt' : 'Pokémon 30 Jahre Shop'}</h2>
          <p className="text-white/50 text-sm">{activeCategory === 'ingame' ? 'Tränke, Pokébälle und mehr für dein Abenteuer!' : 'Exklusive Jubiläums-Items — nur während des Events!'}</p>
        </div>
        {user && (
          <div className="ml-auto flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
              🪙 <span className="font-bold">{(user.tokens || 0).toLocaleString()}</span> <span className="text-[10px] text-yellow-500/70 uppercase">Tokens</span>
            </div>
            {gameCoins !== undefined && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                💰 <span className="font-bold">{gameCoins.toLocaleString()}</span> <span className="text-[10px] text-amber-500/70 uppercase">Münzen</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-1">
        {usedCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeCategory === cat
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black'
                : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat === 'all' ? '🎮 Alle' : (CATEGORY_LABELS[cat] || cat)}
          </button>
        ))}
      </div>

      {/* Grid */}
      {activeCategory === 'ingame' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {INGAME_ITEMS.map(item => {
            const count = item.category === 'ball' ? (ballInventory?.[item.id] || 0) : (inventory?.[item.id] || 0);
            return (
              <ShopCard
                key={item.id}
                item={{ ...item, name: item.name, price: item.price }}
                isOwned={false}
                isEquipped={false}
                onBuy={() => onBuyGameItem && onBuyGameItem({ ...item, cost: item.price })}
                onEquip={() => {}}
                userTokens={gameCoins || 0}
              >
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-900/20 to-cyan-900/20 p-4">
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-white/60 bg-black/50 border border-white/10">
                    Ausrüstung
                  </div>
                  <div className="text-6xl mt-4 mb-2">{item.icon}</div>
                  <p className="text-[10px] text-white/50 text-center px-2">{item.description}</p>
                  <div className="absolute bottom-3 left-3 text-[10px] text-white/40 font-medium">
                    Im Besitz: {count}
                  </div>
                </div>
              </ShopCard>
            );
          })}
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <span className="text-4xl block mb-2">🎮</span>
          Keine Pokémon-Items in dieser Kategorie
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(item => {
            const owned = isAlreadyOwned(user, item);
            const rarity = RARITY_STYLES[item.rarity] || RARITY_STYLES.common;
            const isDonorRequired = item.donor_exclusive && !user?.is_donor;

            // Determine if this item is currently equipped
            const isEquipped = (() => {
              if (!owned) return false;
              switch (item.category) {
                case 'theme':     return user?.active_theme === (item.theme_id || item.id);
                case 'animation': return user?.active_animation === item.id;
                case 'frame':     return user?.frame_style === item.id;
                case 'badge':     return user?.active_badge === item.id;
                default: return false;
              }
            })();
            const hasEquipSlot = ['theme', 'animation', 'frame', 'badge'].includes(item.category);

            // Build icon for ShopCard content area (uses item.icon emoji slot)
            const categoryIcon = {
              theme: '🎨', animation: '✨', frame: '🖼️', badge: '🏅',
              collectible: '🗝️', limited_edition: '🎁', art: '🖼️', moment: '📸', creator_card: '🃏'
            }[item.category] || '🎮';

            const displayItem = {
              ...item,
              icon: categoryIcon,
              price: item.donor_exclusive && user?.is_donor ? 0 : item.price,
            };

            return (
              <ShopCard
                key={item.id}
                item={displayItem}
                isOwned={owned}
                isEquipped={isEquipped}
                onBuy={() => buyMutation.mutate(item)}
                onEquip={hasEquipSlot ? () => equipMutation.mutate(item) : () => {}}
                userTokens={user?.tokens || 0}
              >
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-yellow-900/20 to-orange-900/20 p-4">
                  {/* Rarity badge */}
                  <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-black ${rarity.text} border ${rarity.border} bg-black/50`}>
                    {rarity.label}
                  </div>

                  {/* Category */}
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-white/60 bg-black/50 border border-white/10">
                    {CATEGORY_LABELS[item.category] || item.category}
                  </div>

                  {/* Sprite / Image */}
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-28 w-28 object-contain drop-shadow-[0_0_12px_rgba(255,215,0,0.6)] mt-4"
                      style={{ imageRendering: item.image_url.includes('PokeAPI') || item.image_url.includes('pokemon') ? 'pixelated' : 'auto' }}
                    />
                  ) : (
                    <div className="text-6xl mt-4">{categoryIcon}</div>
                  )}

                  {item.stock > 0 && (
                    <div className="absolute bottom-3 left-3 text-[10px] text-white/30 font-medium">
                      Noch {item.stock} verfügbar
                    </div>
                  )}

                  {isDonorRequired && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                      <Lock className="w-2.5 h-2.5" />
                      Spender
                    </div>
                  )}
                </div>
              </ShopCard>
            );
          })}
        </div>
      )}
    </div>
  );
}