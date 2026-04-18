import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Coins, Sparkles, Check, Loader2, Star, Wand2, ChevronDown, Film, Palette, Eye, Clock, Gamepad2, Package, Zap, Shield, Crown } from 'lucide-react';
import TempEffectsShop from '@/components/shop/TempEffectsShop';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import AnimatedBackground from '@/components/streaming/AnimatedBackground';
import UserAvatar from '@/components/UserAvatar';
import ProfileAnimation from '@/components/ProfileAnimation';
import MobileBrandHeader from '@/components/mobile/MobileBrandHeader';
import PageTransition from '@/components/mobile/PageTransition';
import ShopCard from '@/components/modern/ShopCard';
import PageMaintenanceCheck from '@/components/PageMaintenanceCheck';
import AppleCard from '@/components/modern/AppleCard';
import FloatingOrb from '@/components/modern/FloatingOrb';
import MinimalButton from '@/components/modern/MinimalButton';
import SectionHeader from '@/components/modern/SectionHeader';
import PokemonPageDecor from '@/components/pokemon/PokemonPageDecor';
import PokemonShopSection from '@/components/pokemon/PokemonShopSection';
import PageHeader from '@/components/ui/PageHeader';
import PageShell from '@/components/ui/PageShell';
import { usePokemonEvent } from '@/components/pokemon/PokemonEventContext';


// Donor-Exclusive Items
const DONOR_EXCLUSIVE_THEMES = [
  { id: 'obsidian', name: 'Obsidian Elite', price: 0, description: '⭐ Spender Exklusiv - Luxuriöses schwarzes Diamant-Design', icon: '💎', colors: ['#000000', '#1a1a1a', '#333333'], preview: 'bg-gradient-to-br from-black via-gray-900 to-black', donor_only: true },
  { id: 'platinum', name: 'Platinum VIP', price: 0, description: '⭐ Spender Exklusiv - Edles Platin-Theme', icon: '🏆', colors: ['#e5e7eb', '#d1d5db', '#9ca3af'], preview: 'bg-gradient-to-br from-gray-300 to-gray-500', donor_only: true },
  { id: 'ruby', name: 'Ruby Crown', price: 0, description: '⭐ Spender Exklusiv - Königliches Rubin-Rot', icon: '👑', colors: ['#450a0a', '#b91c1c', '#dc2626'], preview: 'bg-gradient-to-br from-red-950 to-red-600', donor_only: true },
  { id: 'sapphire', name: 'Sapphire Dream', price: 0, description: '⭐ Spender Exklusiv - Mystischer Saphir-Traum', icon: '💠', colors: ['#0c4a6e', '#0369a1', '#0284c7'], preview: 'bg-gradient-to-br from-blue-950 to-blue-600', donor_only: true },
];

const DONOR_EXCLUSIVE_FRAMES = [
  { id: 'legendary', name: 'Legendary Frame', price: 0, description: '⭐ Spender Exklusiv - Legendärer Glanz', icon: '🌟', gradient: 'from-yellow-400 via-orange-500 to-red-500', preview: 'legendary', donor_only: true },
  { id: 'divine', name: 'Divine Frame', price: 0, description: '⭐ Spender Exklusiv - Göttliche Aura', icon: '✨', gradient: 'from-white via-cyan-200 to-blue-300', preview: 'divine', donor_only: true },
  { id: 'mythic', name: 'Mythic Frame', price: 0, description: '⭐ Spender Exklusiv - Mythische Kraft', icon: '⚡', gradient: 'from-purple-500 via-pink-500 to-red-500', preview: 'mythic', donor_only: true },
];

const DONOR_EXCLUSIVE_ANIMATIONS = [
  { id: 'golden_rain', name: 'Goldregen VIP', price: 0, description: '⭐ Spender Exklusiv - Fallende Goldmünzen', icon: '💰', donor_only: true },
  { id: 'crown_parade', name: 'Kronen-Parade', price: 0, description: '⭐ Spender Exklusiv - Fliegende Kronen', icon: '👑', donor_only: true },
  { id: 'diamond_shower', name: 'Diamanten-Regen', price: 0, description: '⭐ Spender Exklusiv - Fallende Diamanten', icon: '💎', donor_only: true },
];

const DONOR_EXCLUSIVE_VIDEO_FRAMES = [
  { id: 'elite', name: 'Elite Frame', price: 0, description: '⭐ Spender Exklusiv - Elite-Status Rahmen', icon: '👑', gradient: 'from-yellow-300 via-amber-400 to-orange-500', donor_only: true },
  { id: 'vip_gold', name: 'VIP Gold Frame', price: 0, description: '⭐ Spender Exklusiv - VIP Gold-Glanz', icon: '🏆', gradient: 'from-amber-300 via-yellow-400 to-orange-400', donor_only: true },
];

const DONOR_EXCLUSIVE_BANNERS = [
  { id: 'vip_badge', name: 'VIP Badge Banner', price: 0, description: '⭐ Spender Exklusiv - Exklusives VIP-Abzeichen', icon: '🎖️', type: 'vip', donor_only: true },
  { id: 'golden_crown', name: 'Golden Crown Banner', price: 0, description: '⭐ Spender Exklusiv - Goldene Krone', icon: '👑', type: 'crown', donor_only: true },
];

// Website Themes - Expanded!
const THEME_ITEMS = [
  { id: 'default', name: 'Dark Teal', price: 0, description: 'Standard dunkles Design mit türkis Akzenten', icon: '🌙', colors: ['#0a0a0b', '#06b6d4', '#14b8a6'], preview: 'bg-slate-900' },
  { id: 'white', name: 'White Mode', price: 5000, description: 'Helles elegantes Design mit weißem Hintergrund', icon: '☀️', colors: ['#ffffff', '#3b82f6', '#8b5cf6'], preview: 'bg-white' },
  { id: 'rainbow', name: 'Rainbow Mode', price: 6000, description: 'Buntes Regenbogen-Design mit animierten Farbverläufen', icon: '🌈', colors: ['#ec4899', '#f59e0b', '#10b981'], preview: 'bg-gradient-to-r from-pink-500 via-yellow-500 to-green-500' },
  { id: 'dark_neon', name: 'Dark Neon', price: 7500, description: 'Dunkles Theme mit leuchtenden Neon-Akzenten', icon: '⚡', colors: ['#000000', '#ff00ff', '#00ffff'], preview: 'bg-black' },
  { id: 'midnight', name: 'Midnight Blue', price: 8000, description: 'Tiefdunkler Mitternachtshimmel', icon: '🌃', colors: ['#020617', '#4f46e5', '#7c3aed'], preview: 'bg-gradient-to-br from-slate-950 to-indigo-900' },
  { id: 'sunset', name: 'Sunset Vibes', price: 9000, description: 'Warmes Sonnenuntergangs-Farbschema', icon: '🌅', colors: ['#1e293b', '#f97316', '#ec4899'], preview: 'bg-gradient-to-br from-orange-600 to-pink-600' },
  { id: 'ocean', name: 'Ocean Depths', price: 10000, description: 'Beruhigendes Tiefsee-Design', icon: '🌊', colors: ['#0f172a', '#0891b2', '#06b6d4'], preview: 'bg-gradient-to-br from-blue-900 to-cyan-600' },
  { id: 'forest', name: 'Forest Green', price: 11000, description: 'Natürliches Wald-Theme', icon: '🌲', colors: ['#14532d', '#22c55e', '#84cc16'], preview: 'bg-gradient-to-br from-green-900 to-lime-600' },
  { id: 'neon', name: 'Neon City', price: 12000, description: 'Cyberpunk-inspirierte Neon-Lichter', icon: '🌆', colors: ['#000000', '#ec4899', '#a855f7'], preview: 'bg-gradient-to-br from-pink-600 to-purple-700' },
  { id: 'crimson', name: 'Crimson Night', price: 12500, description: 'Dunkelrote mystische Atmosphäre', icon: '🔴', colors: ['#450a0a', '#dc2626', '#f43f5e'], preview: 'bg-gradient-to-br from-red-950 to-rose-700' },
  { id: 'royal', name: 'Royal Purple', price: 13000, description: 'Majestätisches königliches Violett', icon: '👑', colors: ['#2e1065', '#7c3aed', '#8b5cf6'], preview: 'bg-gradient-to-br from-purple-950 to-violet-700' },
  { id: 'galaxy', name: 'Galaxy Space', price: 14000, description: 'Kosmisches Weltraum-Design', icon: '🌌', colors: ['#0c0a1d', '#8b5cf6', '#ec4899'], preview: 'bg-gradient-to-br from-purple-900 to-pink-700' },
  { id: 'cherry', name: 'Cherry Blossom', price: 14500, description: 'Sanfte rosa Kirschblüten', icon: '🌸', colors: ['#fce7f3', '#ec4899', '#f472b6'], preview: 'bg-gradient-to-br from-pink-200 to-rose-400' },
  { id: 'arctic', name: 'Arctic Ice', price: 15000, description: 'Eisiger nordischer Winter', icon: '❄️', colors: ['#0c4a6e', '#22d3ee', '#bae6fd'], preview: 'bg-gradient-to-br from-cyan-950 to-cyan-300' },
  { id: 'volcanic', name: 'Volcanic Fire', price: 16000, description: 'Glühende Lava und Asche', icon: '🌋', colors: ['#1c0808', '#dc2626', '#fb923c'], preview: 'bg-gradient-to-br from-red-950 to-orange-600' },
  { id: 'emerald', name: 'Emerald Dream', price: 17500, description: 'Luxuriöses smaragdgrünes Juwel', icon: '💚', colors: ['#022c22', '#10b981', '#34d399'], preview: 'bg-gradient-to-br from-emerald-950 to-emerald-500' },
  { id: 'stealth', name: 'Stealth Mode', price: 19000, description: 'Minimalistisch dunkles Design', icon: '🥷', colors: ['#000000', '#404040', '#737373'], preview: 'bg-gradient-to-br from-black to-gray-700' },
  { id: 'gold', name: 'Gold Rush', price: 20000, description: 'Luxuriöses goldenes Theme', icon: '✨', colors: ['#713f12', '#eab308', '#fbbf24'], preview: 'bg-gradient-to-br from-yellow-900 to-amber-400' },
  { id: 'hub_2_0', name: 'Hub 2.0', price: 35000, description: 'Offizielles 2.0 Update Theme', icon: '🚀', colors: ['#0f0c29', '#06b6d4', '#d946ef'], preview: 'bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]' },
];

// Expanded Frame Items
const FRAME_ITEMS = [
  { id: 'gold', name: 'Gold Frame', price: 1500, description: 'Klassischer goldener Rahmen', icon: '👑', gradient: 'from-yellow-400 to-amber-600', preview: 'gold' },
  { id: 'neon', name: 'Neon Frame', price: 2000, description: 'Futuristischer Neon-Glow', icon: '⚡', gradient: 'from-cyan-400 to-blue-600', preview: 'neon' },
  { id: 'fire', name: 'Fire Frame', price: 2500, description: 'Flammendes Feuer-Aura', icon: '🔥', gradient: 'from-orange-500 to-red-600', preview: 'fire' },
  { id: 'glitch', name: 'Glitch Frame', price: 3000, description: 'Digitaler Glitch-Effekt', icon: '🌀', gradient: 'from-fuchsia-500 to-purple-600', preview: 'glitch' },
  { id: 'rainbow', name: 'Rainbow Frame', price: 4000, description: 'Animierter Regenbogen', icon: '🌈', gradient: 'from-red-500 via-yellow-500 to-blue-500', preview: 'rainbow' },
  { id: 'diamond', name: 'Diamond Frame', price: 4500, description: 'Kristallklarer Diamant', icon: '💎', gradient: 'from-blue-300 to-cyan-400', preview: 'diamond' },
  { id: 'cyber', name: 'Cyber Frame', price: 5000, description: 'Matrix Cyber-Look', icon: '🤖', gradient: 'from-green-400 to-emerald-600', preview: 'cyber' },
  { id: 'nature', name: 'Nature Frame', price: 5500, description: 'Organischer Naturstein', icon: '🌿', gradient: 'from-emerald-500 to-green-700', preview: 'nature' },
  { id: 'cosmic', name: 'Cosmic Frame', price: 7000, description: 'Galaktischer Weltraum', icon: '🌌', gradient: 'from-purple-600 via-blue-600 to-cyan-500', preview: 'cosmic' },
  { id: 'lightning', name: 'Lightning Frame', price: 8000, description: 'Elektrisierender Blitz', icon: '⚡', gradient: 'from-yellow-300 via-blue-400 to-indigo-600', preview: 'lightning' },
  { id: 'ice', name: 'Ice Frame', price: 9500, description: 'Gefrorener Kristall', icon: '❄️', gradient: 'from-cyan-200 via-blue-300 to-indigo-400', preview: 'ice' },
  { id: 'lava', name: 'Lava Frame', price: 10500, description: 'Glühende Magma-Aura', icon: '🌋', gradient: 'from-red-600 via-orange-500 to-yellow-400', preview: 'lava' },
  { id: 'toxic', name: 'Toxic Frame', price: 12000, description: 'Giftiger Neon-Nebel', icon: '☢️', gradient: 'from-lime-400 via-green-500 to-emerald-600', preview: 'toxic' },
  { id: 'shadow', name: 'Shadow Frame', price: 13000, description: 'Mysteriöser Schatten', icon: '🌑', gradient: 'from-gray-800 via-purple-900 to-black', preview: 'shadow' },
  { id: 'celestial', name: 'Celestial Frame', price: 15000, description: 'Göttlicher Himmels-Glanz', icon: '✨', gradient: 'from-pink-300 via-purple-400 to-blue-400', preview: 'celestial' },
  { id: 'galaxy', name: 'Galaxy Frame', price: 17500, description: 'Endlose Sterne und Nebel', icon: '🌠', gradient: 'from-indigo-900 via-purple-800 to-pink-700', preview: 'galaxy' },
  { id: 'blood', name: 'Blood Moon', price: 20000, description: 'Dunkler Blutmond', icon: '🌙', gradient: 'from-red-900 via-red-700 to-orange-600', preview: 'blood' },
  { id: 'ocean', name: 'Ocean Frame', price: 22500, description: 'Tiefsee-Wellen Aura', icon: '🌊', gradient: 'from-blue-900 via-cyan-700 to-teal-600', preview: 'ocean' },
  { id: 'phoenix', name: 'Phoenix Frame', price: 25000, description: 'Flammende Wiedergeburt', icon: '🔥', gradient: 'from-orange-600 via-red-500 to-yellow-400', preview: 'phoenix' },
  { id: 'dragon', name: 'Dragon Frame', price: 30000, description: 'Mystischer Drachen-Atem', icon: '🐉', gradient: 'from-green-700 via-emerald-600 to-teal-500', preview: 'dragon' },
  { id: 'aurora', name: 'Aurora Frame', price: 37500, description: 'Nordlicht-Spektakel', icon: '🌌', gradient: 'from-green-400 via-blue-500 to-purple-600', preview: 'aurora' },
  { id: 'eternal', name: 'Eternal Flame', price: 45000, description: 'Ewiges heiliges Feuer', icon: '🕯️', gradient: 'from-amber-400 via-orange-600 to-rose-600', preview: 'eternal' },
  { id: 'void', name: 'Void Walker', price: 50000, description: 'Dimensionsreisender', icon: '🕳️', gradient: 'from-purple-950 via-violet-900 to-indigo-950', preview: 'void' },
  { id: 'hub_2_0', name: 'Hub 2.0', price: 37500, description: 'Offizieller 2.0 Rahmen', icon: '🚀', gradient: 'from-cyan-400 via-fuchsia-500 to-cyan-400', preview: 'hub_2_0' },
];

// Expanded Animation Items
const ANIMATION_ITEMS = [
  { id: 'confetti', name: 'Konfetti Explosion', price: 2500, description: 'Bunte Konfetti-Party', icon: '🎉' },
  { id: 'sparkles', name: 'Glitzer-Effekt', price: 3000, description: 'Magische Glitzer-Sterne', icon: '✨' },
  { id: 'hearts', name: 'Herz-Animation', price: 3750, description: 'Romantische Herzen', icon: '❤️' },
  { id: 'fireworks', name: 'Feuerwerk', price: 5000, description: 'Spektakuläres Feuerwerk', icon: '🎆' },
  { id: 'snow', name: 'Schneefall', price: 4500, description: 'Sanfter Schneefall', icon: '❄️' },
  { id: 'stars', name: 'Sternenschauer', price: 5500, description: 'Leuchtende Sterne', icon: '⭐' },
  { id: 'magic', name: 'Magie-Wirbel', price: 7000, description: 'Mystischer Zauber', icon: '🪄' },
  { id: 'money', name: 'Geldregen', price: 9000, description: 'Fallende Münzen', icon: '💰' },
  { id: 'bubbles', name: 'Blasen-Schwarm', price: 6500, description: 'Schwebende Seifenblasen', icon: '🫧' },
  { id: 'butterflies', name: 'Schmetterlinge', price: 7500, description: 'Flatternde Schmetterlinge', icon: '🦋' },
  { id: 'lightning', name: 'Blitz-Gewitter', price: 8000, description: 'Elektrisierende Blitze', icon: '⚡' },
  { id: 'sakura', name: 'Kirschblüten', price: 9500, description: 'Fallende rosa Kirschblüten', icon: '🌸' },
  { id: 'leaves', name: 'Herbstlaub', price: 10000, description: 'Wirbelnde Herbstblätter', icon: '🍂' },
  { id: 'roses', name: 'Rosen-Regen', price: 11000, description: 'Elegante Rosenblätter', icon: '🌹' },
  { id: 'emojis', name: 'Emoji-Chaos', price: 12500, description: 'Wilde Emojis', icon: '😎' },
  { id: 'thunder', name: 'Donner & Blitz', price: 14000, description: 'Episches Gewitter', icon: '⛈️' },
  { id: 'galaxies', name: 'Galaxien-Wirbel', price: 15000, description: 'Rotierende Galaxien', icon: '🌌' },
  { id: 'dragons', name: 'Drachen-Feuer', price: 16000, description: 'Feuerspeiende Drachen', icon: '🐉' },
  { id: 'meteors', name: 'Meteoren-Regen', price: 17500, description: 'Herabfallende Meteoren', icon: '☄️' },
  { id: 'portals', name: 'Portal-Effekt', price: 19000, description: 'Dimensionale Portale', icon: '🌀' },
  { id: 'aurora_dance', name: 'Aurora Tanz', price: 20000, description: 'Tanzende Nordlichter', icon: '🌠' },
  { id: 'cosmic_dust', name: 'Kosmischer Staub', price: 21000, description: 'Wirbelnder Sternenstaub', icon: '✨' },
  { id: 'phoenix_rise', name: 'Phönix Aufstieg', price: 22500, description: 'Wiedergeburt aus Asche', icon: '🔥' },
  { id: 'hub_2_0', name: '2.0 Celebration', price: 25000, description: 'Das offizielle 2.0 Update Feuerwerk', icon: '🚀' },
];

// Profile Banner Items
const BANNER_ITEMS = [
  { id: 'galaxy', name: 'Galaxy Dreams', price: 7500, description: 'Wirbelnde Galaxien und Sterne', icon: '🌌', type: 'galaxy' },
  { id: 'aurora', name: 'Northern Lights', price: 9000, description: 'Tanzende Nordlichter', icon: '🌠', type: 'aurora' },
  { id: 'cyberpunk', name: 'Cyberpunk City', price: 10000, description: 'Neon-beleuchtete Zukunftsstadt', icon: '🏙️', type: 'cyberpunk' },
  { id: 'ocean', name: 'Deep Ocean', price: 9000, description: 'Unterwasser Wellen-Animation', icon: '🌊', type: 'ocean' },
  { id: 'fire', name: 'Eternal Flames', price: 11000, description: 'Lodernde Flammen-Wellen', icon: '🔥', type: 'fire' },
  { id: 'matrix', name: 'Digital Matrix', price: 12500, description: 'Fallende Matrix-Codes', icon: '💻', type: 'matrix' },
  { id: 'space', name: 'Space Travel', price: 14000, description: 'Fliegende Asteroiden im All', icon: '🚀', type: 'space' },
  { id: 'sakura', name: 'Sakura Garden', price: 10000, description: 'Fallende Kirschblüten', icon: '🌸', type: 'sakura' },
  { id: 'neon', name: 'Neon Pulse', price: 15000, description: 'Pulsierende Neon-Wellen', icon: '⚡', type: 'neon' },
  { id: 'dragon', name: 'Dragon Breath', price: 17500, description: 'Feuerspeiender Drache', icon: '🐉', type: 'dragon' },
  { id: 'crystal', name: 'Crystal Cave', price: 16000, description: 'Leuchtende Kristalle', icon: '💎', type: 'crystal' },
  { id: 'volcano', name: 'Lava Flow', price: 19000, description: 'Fließende Lava-Ströme', icon: '🌋', type: 'volcano' },
];

// Expanded Video Frame Items
const VIDEO_FRAME_ITEMS = [
  { id: 'cosmic', name: 'Cosmic Frame', price: 6500, description: 'Galaktischer Rahmen', icon: '🌌', gradient: 'from-purple-600 via-blue-600 to-cyan-500' },
  { id: 'crystal', name: 'Crystal Frame', price: 7500, description: 'Kristalliner Glanz', icon: '💎', gradient: 'from-cyan-300 to-pink-300' },
  { id: 'fire', name: 'Fire Frame', price: 9000, description: 'Lodernde Flammen', icon: '🔥', gradient: 'from-red-600 via-orange-500 to-yellow-400' },
  { id: 'neon', name: 'Neon Frame', price: 10000, description: 'Pulsierende Neon-Lichter', icon: '⚡', gradient: 'from-cyan-400 to-fuchsia-500' },
  { id: 'gold', name: 'Gold Frame', price: 12500, description: 'Majestätischer Gold-Glanz', icon: '👑', gradient: 'from-yellow-300 via-yellow-500 to-amber-600' },
  { id: 'matrix', name: 'Matrix Frame', price: 11000, description: 'Digitaler Matrix-Effekt', icon: '🤖', gradient: 'from-green-400 to-emerald-600' },
  { id: 'ice', name: 'Ice Frame', price: 14000, description: 'Eisiger Kristall', icon: '❄️', gradient: 'from-cyan-200 to-blue-400' },
  { id: 'plasma', name: 'Plasma Frame', price: 15000, description: 'Wirbelnde Plasma-Energie', icon: '🌀', gradient: 'from-pink-500 via-yellow-400 to-cyan-400' },
  { id: 'void', name: 'Void Frame', price: 17500, description: 'Mysteriöse Void-Energie', icon: '🌑', gradient: 'from-purple-900 via-violet-600 to-purple-900' },
  { id: 'emerald', name: 'Emerald Frame', price: 16000, description: 'Smaragdgrüner Glanz', icon: '💚', gradient: 'from-emerald-400 to-green-600' },
  { id: 'royal', name: 'Royal Frame', price: 20000, description: 'Königlicher Purpur', icon: '👑', gradient: 'from-purple-600 via-fuchsia-500 to-pink-500' },
  { id: 'sunset', name: 'Sunset Frame', price: 19000, description: 'Sonnenuntergangs-Glow', icon: '🌅', gradient: 'from-orange-500 via-red-500 to-pink-500' },
  { id: 'aurora', name: 'Aurora Frame', price: 22500, description: 'Nordlicht-Spektakel', icon: '🌈', gradient: 'from-green-400 via-cyan-400 to-purple-500' },
  { id: 'toxic', name: 'Toxic Frame', price: 21000, description: 'Radioaktiver Neon-Glow', icon: '☢️', gradient: 'from-lime-400 to-green-500' },
  { id: 'diamond', name: 'Diamond Frame', price: 30000, description: 'Ultimativer Diamant', icon: '💎', gradient: 'from-blue-200 via-cyan-300 to-blue-400' },
  { id: 'inferno', name: 'Inferno Frame', price: 25000, description: 'Höllisches Feuer', icon: '🔥', gradient: 'from-red-700 via-orange-600 to-yellow-500' },
  { id: 'celestial', name: 'Celestial Frame', price: 27500, description: 'Himmlischer Glanz', icon: '✨', gradient: 'from-pink-400 via-purple-400 to-blue-500' },
];

// Game Upgrades (token boosts for all games)
const GAME_UPGRADE_ITEMS = [
  { id: 'xp_boost_1', name: 'XP Boost I', price: 2000, description: '+50% XP für 24 Stunden in allen Spielen', icon: '⚡', game: 'all', effect: 'xp_boost', value: 1.5, duration: 86400, category: 'boost' },
  { id: 'xp_boost_2', name: 'XP Boost II', price: 5000, description: '+100% XP für 48 Stunden in allen Spielen', icon: '⚡', game: 'all', effect: 'xp_boost', value: 2.0, duration: 172800, category: 'boost' },
  { id: 'token_boost_1', name: 'Token Boost I', price: 3000, description: '+75% Token-Einnahmen für 24h', icon: '🪙', game: 'all', effect: 'token_boost', value: 1.75, duration: 86400, category: 'boost' },
  { id: 'token_boost_2', name: 'Token Boost II', price: 7500, description: '+150% Token-Einnahmen für 72h', icon: '🪙', game: 'all', effect: 'token_boost', value: 2.5, duration: 259200, category: 'boost' },
  { id: 'neon_dash_coins', name: 'Neon Dash Münzregen', price: 1500, description: 'Starte mit 500 Extra-Tokens im Neon Dash', icon: '⚡', game: 'neon_dash', effect: 'start_tokens', value: 500, category: 'neon_dash' },
  { id: 'neon_dash_shield', name: 'Neon Dash Schild Pack', price: 2500, description: '3x Sofort-Schild Aktivierungen', icon: '🛡️', game: 'neon_dash', effect: 'shield_pack', value: 3, category: 'neon_dash' },
  { id: 'neon_dash_dim', name: 'Neon Dimension Pass', price: 4000, description: 'Schalte alle 12 Dimensionen im Neon Dash frei', icon: '🌀', game: 'neon_dash', effect: 'unlock_dimensions', category: 'neon_dash' },
  { id: 'chronosphere_crystals', name: 'Kristall-Paket', price: 2000, description: '+200 Startpunkte im Chronosphere', icon: '💎', game: 'chronosphere', effect: 'start_score', value: 200, category: 'chronosphere' },
  { id: 'starter_token_pack', name: 'Starter Token Pack', price: 0, description: '500 Tokens geschenkt für neue Spieler', icon: '🎁', game: 'all', effect: 'token_gift', value: 500, category: 'free', free: true },
];

// Shop Bundles
const BUNDLE_ITEMS = [
  {
    id: 'starter_bundle',
    name: 'Starter Bundle',
    price: 8000,
    originalPrice: 15000,
    description: 'Perfekt für Einsteiger – Gold Frame + Dark Neon Theme + Konfetti Animation',
    icon: '🎯',
    gradient: 'from-cyan-600 to-blue-700',
    items: [
      { type: 'frame', id: 'gold', name: 'Gold Frame', icon: '👑' },
      { type: 'theme', id: 'dark_neon', name: 'Dark Neon', icon: '⚡' },
      { type: 'animation', id: 'confetti', name: 'Konfetti', icon: '🎉' },
    ],
    badge: '🔥 DEAL',
  },
  {
    id: 'neon_bundle',
    name: 'Neon Gamer Pack',
    price: 15000,
    originalPrice: 28000,
    description: 'Neon City Theme + Lightning Frame + Galaxy Banner + Blitz Animation',
    icon: '⚡',
    gradient: 'from-cyan-500 to-fuchsia-600',
    items: [
      { type: 'theme', id: 'neon', name: 'Neon City', icon: '🌆' },
      { type: 'frame', id: 'lightning', name: 'Lightning Frame', icon: '⚡' },
      { type: 'banner', id: 'neon', name: 'Neon Banner', icon: '⚡' },
      { type: 'animation', id: 'lightning', name: 'Blitz Anim.', icon: '⚡' },
    ],
    badge: '⚡ BESTSELLER',
  },
  {
    id: 'cosmic_bundle',
    name: 'Cosmic Ultimate',
    price: 25000,
    originalPrice: 55000,
    description: 'Galaxy Theme + Cosmic Frame + Aurora Video Frame + Galaxien-Wirbel + Space Banner',
    icon: '🌌',
    gradient: 'from-indigo-600 to-purple-700',
    items: [
      { type: 'theme', id: 'galaxy', name: 'Galaxy Theme', icon: '🌌' },
      { type: 'frame', id: 'cosmic', name: 'Cosmic Frame', icon: '🌌' },
      { type: 'videoframe', id: 'aurora', name: 'Aurora Video', icon: '🌈' },
      { type: 'animation', id: 'galaxies', name: 'Galaxien', icon: '🌌' },
      { type: 'banner', id: 'space', name: 'Space Banner', icon: '🚀' },
    ],
    badge: '🌌 EPIC',
  },
  {
    id: 'fire_bundle',
    name: 'Inferno Pack',
    price: 18000,
    originalPrice: 38000,
    description: 'Volcanic Theme + Dragon Frame + Fire Banner + Feuerwerk Animation + Inferno Video Frame',
    icon: '🔥',
    gradient: 'from-orange-600 to-red-700',
    items: [
      { type: 'theme', id: 'volcanic', name: 'Volcanic', icon: '🌋' },
      { type: 'frame', id: 'dragon', name: 'Dragon Frame', icon: '🐉' },
      { type: 'banner', id: 'fire', name: 'Fire Banner', icon: '🔥' },
      { type: 'animation', id: 'fireworks', name: 'Feuerwerk', icon: '🎆' },
      { type: 'videoframe', id: 'inferno', name: 'Inferno Frame', icon: '🔥' },
    ],
    badge: '🔥 HOT',
  },
  {
    id: 'royal_bundle',
    name: 'Royal Legend',
    price: 35000,
    originalPrice: 90000,
    description: 'Hub 2.0 Theme + Void Frame + Dragon Banner + Portal Animation + Celestial Video Frame + Aurora Frame',
    icon: '👑',
    gradient: 'from-amber-500 to-purple-700',
    items: [
      { type: 'theme', id: 'hub_2_0', name: 'Hub 2.0', icon: '🚀' },
      { type: 'frame', id: 'void', name: 'Void Frame', icon: '🕳️' },
      { type: 'frame', id: 'aurora', name: 'Aurora Frame', icon: '🌌' },
      { type: 'banner', id: 'dragon', name: 'Dragon Banner', icon: '🐉' },
      { type: 'animation', id: 'portals', name: 'Portal Anim.', icon: '🌀' },
      { type: 'videoframe', id: 'celestial', name: 'Celestial Video', icon: '✨' },
    ],
    badge: '👑 LEGENDARY',
  },
];

export default function Shop() {
  const [user, setUser] = useState(null);
  const { isActive: pokemonEventActive } = usePokemonEvent();
  const [activeTab, setActiveTab] = useState(pokemonEventActive ? 'pokemon' : 'donor');
  const [showDonorSection, setShowDonorSection] = useState(false);
  const [previewAnimation, setPreviewAnimation] = useState(null);
  const [previewTheme, setPreviewTheme] = useState(null);
  const [itemsToShow, setItemsToShow] = useState(6);
  const [lightweightMode, setLightweightMode] = useState(() => {
    try {
      return localStorage.getItem('lightweight_mode') === 'true';
    } catch {
      return false;
    }
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const stored = localStorage.getItem('app_user');
      if (stored) {
        const local = JSON.parse(stored);
        try {
          const fresh = await base44.entities.AppUser.filter({ id: local.id }, 1);
          if (fresh.length > 0) {
            let userData = fresh[0];
            
            // Initialize owned_themes if missing
            if (!userData.owned_themes || userData.owned_themes.length === 0) {
              await base44.entities.AppUser.update(userData.id, { 
                owned_themes: ['default'],
                active_theme: 'default'
              });
              userData = { ...userData, owned_themes: ['default'], active_theme: 'default' };
            }
            
            setUser(userData);
            localStorage.setItem('app_user', JSON.stringify(userData));
          }
        } catch (e) {
          console.error("Auth validation failed", e);
        }
      }
    };
    loadUser();
    window.addEventListener('user-updated', loadUser);
    return () => window.removeEventListener('user-updated', loadUser);
  }, []);

  // Buy Theme Mutation
  const buyThemeMutation = useMutation({
    mutationFn: async (theme) => {
      if (!user) throw new Error("Bitte einloggen");
      
      const freshUser = (await base44.entities.AppUser.filter({ id: user.id }, 1))[0];
      if (!freshUser) throw new Error("Benutzer nicht gefunden");
      
      const currentOwnedThemes = Array.isArray(freshUser.owned_themes) && freshUser.owned_themes.length > 0 
        ? freshUser.owned_themes 
        : ['default'];
      
      if (currentOwnedThemes.includes(theme.id)) {
        throw new Error("Du besitzt dieses Theme bereits!");
      }
      
      // Check tokens for paid themes (skip for donors - unlimited)
      if (theme.price > 0 && !freshUser.is_donor) {
        if ((freshUser.tokens || 0) < theme.price) {
          throw new Error(`Nicht genug Coins! Du brauchst ${theme.price} 🪙`);
        }
      }

      const newOwnedThemes = [...currentOwnedThemes, theme.id];
      
      const updateData = {
        owned_themes: newOwnedThemes
      };
      
      // Deduct tokens only if not donor
      if (theme.price > 0 && !freshUser.is_donor) {
        updateData.tokens = (freshUser.tokens || 0) - theme.price;
      }
      
      await base44.entities.AppUser.update(freshUser.id, updateData);

      const updatedUser = { 
        ...freshUser, 
        ...updateData
      };
      
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event('user-updated'));
      return theme;
    },
    onSuccess: (theme) => {
      queryClient.invalidateQueries(['user']);
      toast.success(theme.price === 0 ? "Theme aktiviert!" : "Kauf erfolgreich!", { 
        description: `"${theme.name}" wurde hinzugefügt.` 
      });
    },
    onError: (e) => {
      console.error("Theme buy error:", e);
      toast.error("Fehler", { description: e.message });
    }
  });

  // Equip Theme Mutation
  const equipThemeMutation = useMutation({
    mutationFn: async (themeId) => {
      if (!user) throw new Error("Nicht eingeloggt");
      
      const freshUser = (await base44.entities.AppUser.filter({ id: user.id }, 1))[0];
      if (!freshUser) throw new Error("Benutzer nicht gefunden");
      
      // Check if theme is owned
      const ownedThemes = Array.isArray(freshUser.owned_themes) && freshUser.owned_themes.length > 0 
        ? freshUser.owned_themes 
        : ['default'];
        
      if (!ownedThemes.includes(themeId)) {
        throw new Error("Du besitzt dieses Theme nicht!");
      }
      
      await base44.entities.AppUser.update(freshUser.id, { active_theme: themeId });
      
      const updatedUser = { ...freshUser, active_theme: themeId };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event('user-updated'));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
      setPreviewTheme(null);
      toast.success("Theme ausgerüstet! Lade die Seite neu um es zu sehen.");
    },
    onError: (e) => {
      console.error("Theme equip error:", e);
      toast.error("Fehler", { description: e.message });
    }
  });

  // Uninstall Theme Mutation
  const uninstallThemeMutation = useMutation({
    mutationFn: async (themeId) => {
      if (!user) throw new Error("Nicht eingeloggt");
      if (themeId === 'default') throw new Error("Standard-Theme kann nicht deinstalliert werden!");
      
      const freshUser = (await base44.entities.AppUser.filter({ id: user.id }, 1))[0];
      if (!freshUser) throw new Error("Benutzer nicht gefunden");
      
      const ownedThemes = Array.isArray(freshUser.owned_themes) ? freshUser.owned_themes : ['default'];
      const newOwnedThemes = ownedThemes.filter(t => t !== themeId);
      
      // If active theme is being uninstalled, switch to default
      const newActiveTheme = freshUser.active_theme === themeId ? 'default' : freshUser.active_theme;
      
      await base44.entities.AppUser.update(freshUser.id, { 
        owned_themes: newOwnedThemes,
        active_theme: newActiveTheme
      });
      
      const updatedUser = { ...freshUser, owned_themes: newOwnedThemes, active_theme: newActiveTheme };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event('user-updated'));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
      toast.success("Theme deinstalliert!");
    },
    onError: (e) => {
      console.error("Theme uninstall error:", e);
      toast.error("Fehler", { description: e.message });
    }
  });

  // Buy Frame
  const buyMutation = useMutation({
    mutationFn: async (frame) => {
      if (!user) throw new Error("Bitte einloggen");
      const freshUser = (await base44.entities.AppUser.filter({ id: user.id }, 1))[0];
      if (!freshUser.is_donor && (freshUser.tokens || 0) < frame.price) throw new Error(`Nicht genug Coins!`);
      if ((freshUser.owned_frames || freshUser.owned_badges)?.includes(frame.id)) throw new Error("Bereits besessen!");

      const newOwnedFrames = [...(freshUser.owned_frames || []), frame.id];
      const updateData = {
        owned_frames: newOwnedFrames
      };
      if (!freshUser.is_donor) {
        updateData.tokens = (freshUser.tokens || 0) - frame.price;
      }
      await base44.entities.AppUser.update(freshUser.id, updateData);

      const updatedUser = { ...freshUser, ...updateData, owned_frames: newOwnedFrames };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event('user-updated'));
      return frame;
    },
    onSuccess: (frame) => toast.success(`"${frame.name}" gekauft!`),
    onError: (e) => toast.error(e.message)
  });

  // Equip Frame
  const equipMutation = useMutation({
    mutationFn: async (frameId) => {
      if (!user) throw new Error("Nicht eingeloggt");
      await base44.entities.AppUser.update(user.id, { frame_style: frameId });
      const updatedUser = { ...user, frame_style: frameId };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event('user-updated'));
    },
    onSuccess: () => toast.success("Rahmen ausgerüstet!"),
    onError: (e) => toast.error(e.message)
  });

  // Buy Animation
  const buyAnimationMutation = useMutation({
    mutationFn: async (animation) => {
      if (!user) throw new Error("Bitte einloggen");
      const freshUser = (await base44.entities.AppUser.filter({ id: user.id }, 1))[0];
      if (!freshUser.is_donor && (freshUser.tokens || 0) < animation.price) throw new Error(`Nicht genug Coins!`);
      if (freshUser.owned_animations?.includes(animation.id)) throw new Error("Bereits besessen!");

      const newOwnedAnimations = [...(freshUser.owned_animations || []), animation.id];
      const updateData = {
        owned_animations: newOwnedAnimations
      };
      if (!freshUser.is_donor) {
        updateData.tokens = (freshUser.tokens || 0) - animation.price;
      }
      await base44.entities.AppUser.update(freshUser.id, updateData);

      const updatedUser = { ...freshUser, ...updateData, owned_animations: newOwnedAnimations };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event('user-updated'));
      return animation;
    },
    onSuccess: (animation) => toast.success(`"${animation.name}" gekauft!`),
    onError: (e) => toast.error(e.message)
  });

  // Equip Animation
  const equipAnimationMutation = useMutation({
    mutationFn: async (animationId) => {
      if (!user) throw new Error("Nicht eingeloggt");
      await base44.entities.AppUser.update(user.id, { active_animation: animationId });
      const updatedUser = { ...user, active_animation: animationId };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event('user-updated'));
    },
    onSuccess: () => toast.success("Animation ausgerüstet!"),
    onError: (e) => toast.error(e.message)
  });

  // Buy Video Frame
  const buyVideoFrameMutation = useMutation({
    mutationFn: async (frame) => {
      if (!user) throw new Error("Bitte einloggen");
      const freshUser = (await base44.entities.AppUser.filter({ id: user.id }, 1))[0];
      if (!freshUser.is_donor && (freshUser.tokens || 0) < frame.price) throw new Error(`Nicht genug Coins!`);
      if (freshUser.owned_video_frames?.includes(frame.id)) throw new Error("Bereits besessen!");

      const newOwnedVideoFrames = [...(freshUser.owned_video_frames || []), frame.id];
      const updateData = {
        owned_video_frames: newOwnedVideoFrames
      };
      if (!freshUser.is_donor) {
        updateData.tokens = (freshUser.tokens || 0) - frame.price;
      }
      await base44.entities.AppUser.update(freshUser.id, updateData);

      const updatedUser = { ...freshUser, ...updateData, owned_video_frames: newOwnedVideoFrames };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event('user-updated'));
      return frame;
    },
    onSuccess: (frame) => toast.success(`"${frame.name}" gekauft!`),
    onError: (e) => toast.error(e.message)
  });

  // Buy Banner
  const buyBannerMutation = useMutation({
    mutationFn: async (banner) => {
      if (!user) throw new Error("Bitte einloggen");
      const freshUser = (await base44.entities.AppUser.filter({ id: user.id }, 1))[0];
      if (!freshUser.is_donor && (freshUser.tokens || 0) < banner.price) throw new Error(`Nicht genug Coins!`);
      if (freshUser.owned_banners?.includes(banner.id)) throw new Error("Bereits besessen!");

      const newOwnedBanners = [...(freshUser.owned_banners || []), banner.id];
      const updateData = {
        owned_banners: newOwnedBanners
      };
      if (!freshUser.is_donor) {
        updateData.tokens = (freshUser.tokens || 0) - banner.price;
      }
      await base44.entities.AppUser.update(freshUser.id, updateData);

      const updatedUser = { ...freshUser, ...updateData, owned_banners: newOwnedBanners };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event('user-updated'));
      return banner;
    },
    onSuccess: (banner) => toast.success(`"${banner.name}" gekauft!`),
    onError: (e) => toast.error(e.message)
  });

  // Buy Bundle
  const buyBundleMutation = useMutation({
    mutationFn: async (bundle) => {
      if (!user) throw new Error("Bitte einloggen");
      const freshUser = (await base44.entities.AppUser.filter({ id: user.id }, 1))[0];
      if (!freshUser) throw new Error("Benutzer nicht gefunden");
      if (!freshUser.is_donor && (freshUser.tokens || 0) < bundle.price) throw new Error(`Nicht genug Tokens! Benötigt: ${bundle.price.toLocaleString()} 🪙`);

      const ownedBundleIds = freshUser.owned_bundles || [];
      if (ownedBundleIds.includes(bundle.id)) throw new Error("Bundle bereits gekauft!");

      // Grant all items
      const updatedData = {
        owned_bundles: [...ownedBundleIds, bundle.id],
        owned_themes: [...new Set([...(freshUser.owned_themes || ['default']), ...bundle.items.filter(i => i.type === 'theme').map(i => i.id)])],
        owned_frames: [...new Set([...(freshUser.owned_frames || []), ...bundle.items.filter(i => i.type === 'frame').map(i => i.id)])],
        owned_animations: [...new Set([...(freshUser.owned_animations || []), ...bundle.items.filter(i => i.type === 'animation').map(i => i.id)])],
        owned_video_frames: [...new Set([...(freshUser.owned_video_frames || []), ...bundle.items.filter(i => i.type === 'videoframe').map(i => i.id)])],
        owned_banners: [...new Set([...(freshUser.owned_banners || []), ...bundle.items.filter(i => i.type === 'banner').map(i => i.id)])],
      };
      if (!freshUser.is_donor) updatedData.tokens = (freshUser.tokens || 0) - bundle.price;

      await base44.entities.AppUser.update(freshUser.id, updatedData);
      const updatedUser = { ...freshUser, ...updatedData };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event('user-updated'));
      return bundle;
    },
    onSuccess: (bundle) => toast.success(`🎉 "${bundle.name}" erfolgreich gekauft! Alle Items wurden freigeschaltet.`),
    onError: (e) => toast.error(e.message),
  });

  // Buy Game Upgrade
  const buyGameUpgradeMutation = useMutation({
    mutationFn: async (upgrade) => {
      if (!user) throw new Error("Bitte einloggen");
      if (upgrade.free) {
        const freshUser = (await base44.entities.AppUser.filter({ id: user.id }, 1))[0];
        const owned = freshUser.owned_game_upgrades || [];
        if (owned.includes(upgrade.id)) throw new Error("Bereits eingelöst!");
        const updatedData = { owned_game_upgrades: [...owned, upgrade.id], tokens: (freshUser.tokens || 0) + upgrade.value };
        await base44.entities.AppUser.update(freshUser.id, updatedData);
        const updatedUser = { ...freshUser, ...updatedData };
        localStorage.setItem('app_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        window.dispatchEvent(new Event('user-updated'));
        return upgrade;
      }
      const freshUser = (await base44.entities.AppUser.filter({ id: user.id }, 1))[0];
      if ((freshUser.tokens || 0) < upgrade.price) throw new Error("Nicht genug Tokens!");
      const owned = freshUser.owned_game_upgrades || [];
      if (owned.includes(upgrade.id)) throw new Error("Bereits besessen!");
      const updatedData = {
        owned_game_upgrades: [...owned, upgrade.id],
        tokens: (freshUser.tokens || 0) - upgrade.price,
      };
      await base44.entities.AppUser.update(freshUser.id, updatedData);
      const updatedUser = { ...freshUser, ...updatedData };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event('user-updated'));
      return upgrade;
    },
    onSuccess: (upgrade) => toast.success(`"${upgrade.name}" aktiviert!`),
    onError: (e) => toast.error(e.message),
  });

  // Equip Banner
  const equipBannerMutation = useMutation({
    mutationFn: async (bannerId) => {
      if (!user) throw new Error("Nicht eingeloggt");
      await base44.entities.AppUser.update(user.id, { active_banner: bannerId });
      const updatedUser = { ...user, active_banner: bannerId };
      localStorage.setItem('app_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event('user-updated'));
    },
    onSuccess: () => toast.success("Banner ausgerüstet!"),
    onError: (e) => toast.error(e.message)
  });

  const ownedThemes = (user?.owned_themes?.length > 0) ? user.owned_themes : ['default'];
  const currentTheme = user?.active_theme || 'default';
  const ownedFrames = user?.owned_frames || user?.owned_badges || [];
  const currentFrame = user?.frame_style || 'none';
  const ownedAnimations = user?.owned_animations || [];
  const currentAnimation = user?.active_animation || 'none';
  const ownedVideoFrames = user?.owned_video_frames || [];
  const ownedBanners = user?.owned_banners || [];
  const currentBanner = user?.active_banner || 'none';

  const isDonor = user?.is_donor || false;

  const visibleThemes = useMemo(() => THEME_ITEMS.slice(0, itemsToShow), [itemsToShow]);
  const visibleFrames = useMemo(() => FRAME_ITEMS.slice(0, itemsToShow), [itemsToShow]);
  const visibleAnimations = useMemo(() => ANIMATION_ITEMS.slice(0, itemsToShow), [itemsToShow]);
  const visibleVideoFrames = useMemo(() => VIDEO_FRAME_ITEMS.slice(0, itemsToShow), [itemsToShow]);
  const visibleBanners = useMemo(() => BANNER_ITEMS.slice(0, itemsToShow), [itemsToShow]);

  const hasMoreItems = activeTab === 'themes' ? itemsToShow < THEME_ITEMS.length :
                       activeTab === 'frames' ? itemsToShow < FRAME_ITEMS.length :
                       activeTab === 'animations' ? itemsToShow < ANIMATION_ITEMS.length :
                       activeTab === 'videoframes' ? itemsToShow < VIDEO_FRAME_ITEMS.length :
                       itemsToShow < BANNER_ITEMS.length;

  const loadMore = useCallback(() => setItemsToShow((prev) => prev + 6), []);

  useEffect(() => { setItemsToShow(6); }, [activeTab]);

  return (
    <PageMaintenanceCheck pageName="Shop">
    <PageTransition>
    <div className="text-white relative">
      {!lightweightMode && <ProfileAnimation animationType={previewAnimation} />}
      <PokemonPageDecor page="shop" />
      
      <PageShell maxWidth="7xl">
        <PageHeader icon={ShoppingBag} title="Premium Shop" subtitle="Exklusive Items und Themes" accent="amber">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
            <Coins className="w-4 h-4" />
            <span className="font-semibold">{user?.tokens?.toLocaleString() || 0}</span>
          </div>
        </PageHeader>

        {isDonor && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
            <Star className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-amber-300 text-sm font-medium">VIP Spender — Exklusive Items freigeschaltet</span>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white/[0.04] border border-white/[0.08] p-1 rounded-xl inline-flex gap-1 mb-8 overflow-x-auto hide-scrollbar w-full max-w-full">
          {[
            ...(pokemonEventActive ? [{ id: 'pokemon', label: '🎮 Pokémon 30', icon: Sparkles, gradient: 'from-yellow-500 to-red-500', pokemon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' }] : []),
            ...(isDonor ? [{ id: 'donor', label: '⭐ VIP Shop', icon: Star, gradient: 'from-amber-500 to-orange-600', pokemon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png' }] : []),
            { id: 'rent', label: '⏱️ Mieten', icon: Clock, gradient: 'from-cyan-600 to-teal-600', pokemon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/385.png' },
            { id: 'themes', label: 'Themes', icon: Palette, gradient: 'from-pink-600 to-purple-600', pokemon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png' },
            { id: 'frames', label: 'Rahmen', icon: Star, gradient: 'from-cyan-600 to-teal-600', pokemon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/131.png' },
            { id: 'animations', label: 'Animationen', icon: Wand2, gradient: 'from-violet-600 to-fuchsia-600', pokemon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png' },
            { id: 'videoframes', label: 'Video Frames', icon: Film, gradient: 'from-orange-600 to-red-600', pokemon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png' },
            { id: 'banners', label: 'Banner', icon: Eye, gradient: 'from-emerald-600 to-teal-600', pokemon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png' },
            { id: 'bundles', label: '📦 Bundles', icon: Package, gradient: 'from-amber-600 to-orange-600', pokemon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/175.png' },
            { id: 'games', label: '🎮 Games', icon: Gamepad2, gradient: 'from-lime-600 to-green-700', pokemon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 group ${
                activeTab === tab.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab.pokemon ? (
                <img
                  src={tab.pokemon}
                  alt=""
                  className={`w-5 h-5 object-contain transition-all duration-300 ${activeTab === tab.id ? 'opacity-100 scale-125 drop-shadow-[0_0_4px_rgba(255,255,150,0.8)]' : 'opacity-40 group-hover:opacity-70 group-hover:scale-110'}`}
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <tab.icon className="w-3.5 h-3.5" />
              )}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Donor Exclusive Section */}
        {activeTab === 'donor' && isDonor && (
          <div className="space-y-12">
            {/* Donor Themes */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white">Exklusive Themes</h2>
                  <p className="text-white/50">Nur für VIP-Spender verfügbar</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {DONOR_EXCLUSIVE_THEMES.map((theme) => {
                  const isOwned = ownedThemes.includes(theme.id);
                  const isEquipped = currentTheme === theme.id;
                  return (
                    <ShopCard
                      key={theme.id}
                      item={theme}
                      isOwned={isOwned}
                      isEquipped={isEquipped}
                      onBuy={() => buyThemeMutation.mutate(theme)}
                      onEquip={() => equipThemeMutation.mutate(theme.id)}
                      userTokens={user?.tokens || 0}
                    >
                      <div className={`w-full h-full ${theme.preview} flex items-center justify-center relative overflow-hidden`}>
                        <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">VIP</div>
                        <div className="text-8xl opacity-90">{theme.icon}</div>
                      </div>
                    </ShopCard>
                  );
                })}
              </div>
            </div>

            {/* Donor Frames */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white">Exklusive Rahmen</h2>
                  <p className="text-white/50">Premium VIP Rahmen</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {DONOR_EXCLUSIVE_FRAMES.map((frame) => {
                  const isOwned = ownedFrames.includes(frame.id);
                  const isEquipped = currentFrame === frame.id;
                  return (
                    <ShopCard
                      key={frame.id}
                      item={frame}
                      isOwned={isOwned}
                      isEquipped={isEquipped}
                      onBuy={() => buyMutation.mutate(frame)}
                      onEquip={() => equipMutation.mutate(frame.id)}
                      userTokens={user?.tokens || 0}
                    >
                      <div className={`w-full h-full bg-gradient-to-br ${frame.gradient} flex items-center justify-center p-8 relative`}>
                        <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">VIP</div>
                        <UserAvatar user={{ ...user, frame_style: frame.preview }} size="lg" className="w-32 h-32" />
                      </div>
                    </ShopCard>
                  );
                })}
              </div>
            </div>

            {/* Donor Animations */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white">Exklusive Animationen</h2>
                  <p className="text-white/50">Einzigartige VIP Effekte</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {DONOR_EXCLUSIVE_ANIMATIONS.map((animation) => {
                  const isOwned = ownedAnimations.includes(animation.id);
                  const isEquipped = currentAnimation === animation.id;
                  return (
                    <ShopCard
                      key={animation.id}
                      item={animation}
                      isOwned={isOwned}
                      isEquipped={isEquipped}
                      onBuy={() => buyAnimationMutation.mutate(animation)}
                      onEquip={() => equipAnimationMutation.mutate(animation.id)}
                      userTokens={user?.tokens || 0}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-amber-900/20 to-orange-900/20 flex items-center justify-center relative">
                        <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">VIP</div>
                        <div className="text-9xl opacity-90">{animation.icon}</div>
                      </div>
                    </ShopCard>
                  );
                })}
              </div>
            </div>

            {/* Donor Video Frames */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <Film className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white">Exklusive Video Frames</h2>
                  <p className="text-white/50">Premium Video Rahmen</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {DONOR_EXCLUSIVE_VIDEO_FRAMES.map((frame) => {
                  const isOwned = ownedVideoFrames.includes(frame.id);
                  return (
                    <ShopCard
                      key={frame.id}
                      item={frame}
                      isOwned={isOwned}
                      isEquipped={false}
                      onBuy={() => buyVideoFrameMutation.mutate(frame)}
                      onEquip={() => {}}
                      userTokens={user?.tokens || 0}
                    >
                      <div className={`w-full h-full bg-gradient-to-br ${frame.gradient} flex items-center justify-center p-8 relative`}>
                        <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">VIP</div>
                        <div className="w-full h-full bg-black/80 rounded-2xl flex items-center justify-center border-4 border-white/20 shadow-2xl">
                          <Film className="w-20 h-20 text-white/40" />
                        </div>
                      </div>
                    </ShopCard>
                  );
                })}
              </div>
            </div>

            {/* Donor Banners */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white">Exklusive Banner</h2>
                  <p className="text-white/50">VIP Profil Banner</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {DONOR_EXCLUSIVE_BANNERS.map((banner) => {
                  const isOwned = ownedBanners.includes(banner.id);
                  const isEquipped = currentBanner === banner.id;
                  return (
                    <ShopCard
                      key={banner.id}
                      item={banner}
                      isOwned={isOwned}
                      isEquipped={isEquipped}
                      onBuy={() => buyBannerMutation.mutate(banner)}
                      onEquip={() => equipBannerMutation.mutate(banner.id)}
                      userTokens={user?.tokens || 0}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-amber-900 to-orange-800 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">VIP</div>
                        <div className="text-9xl opacity-40">{banner.icon}</div>
                      </div>
                    </ShopCard>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Temp Effects / Rent Tab */}
        {activeTab === 'rent' && (
          <TempEffectsShop user={user} setUser={setUser} />
        )}

        {/* Pokémon 30 Jahre Shop */}
        {activeTab === 'pokemon' && (
          <PokemonShopSection
            user={user}
            setUser={setUser}
          />
        )}

        {/* Themes Grid - Modern Redesign */}
        {activeTab === 'themes' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleThemes.map((theme) => {
              const isOwned = ownedThemes.includes(theme.id);
              const isEquipped = currentTheme === theme.id;

              return (
                <ShopCard
                  key={theme.id}
                  item={theme}
                  isOwned={isOwned}
                  isEquipped={isEquipped}
                  onBuy={() => buyThemeMutation.mutate(theme)}
                  onEquip={() => equipThemeMutation.mutate(theme.id)}
                  userTokens={user?.tokens || 0}
                >
                  <div className={`w-full h-full ${theme.preview} flex items-center justify-center relative overflow-hidden`}>
                    <div className="text-8xl opacity-90">{theme.icon}</div>
                    <div className="absolute bottom-6 left-6 flex gap-2">
                      {theme.colors.map((color, idx) => (
                        <div 
                          key={idx} 
                          className="w-8 h-8 rounded-full border-2 border-white/30 shadow-lg" 
                          style={{ backgroundColor: color }} 
                        />
                      ))}
                    </div>
                  </div>
                </ShopCard>
              );
            })}
          </div>
        )}

        {/* Frames Grid - Modern Redesign */}
        {activeTab === 'frames' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleFrames.map((frame) => {
              const isOwned = ownedFrames.includes(frame.id);
              const isEquipped = currentFrame === frame.id;

              return (
                <ShopCard
                  key={frame.id}
                  item={frame}
                  isOwned={isOwned}
                  isEquipped={isEquipped}
                  onBuy={() => buyMutation.mutate(frame)}
                  onEquip={() => equipMutation.mutate(frame.id)}
                  userTokens={user?.tokens || 0}
                >
                  <div className={`w-full h-full bg-gradient-to-br ${frame.gradient} flex items-center justify-center p-8`}>
                    <UserAvatar user={{ ...user, frame_style: frame.preview }} size="lg" className="w-32 h-32" />
                  </div>
                </ShopCard>
              );
            })}
          </div>
        )}

        {/* Animations Grid - Modern Redesign */}
        {activeTab === 'animations' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleAnimations.map((animation) => {
              const isOwned = ownedAnimations.includes(animation.id);
              const isEquipped = currentAnimation === animation.id;

              return (
                <ShopCard
                  key={animation.id}
                  item={animation}
                  isOwned={isOwned}
                  isEquipped={isEquipped}
                  onBuy={() => buyAnimationMutation.mutate(animation)}
                  onEquip={() => equipAnimationMutation.mutate(animation.id)}
                  userTokens={user?.tokens || 0}
                >
                  <div className="w-full h-full bg-gradient-to-br from-violet-900/20 to-fuchsia-900/20 flex items-center justify-center relative">
                    <div className="text-9xl opacity-90">{animation.icon}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewAnimation(animation.id);
                      }}
                      className="absolute bottom-6 right-6 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-xl text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Sparkles className="w-4 h-4 inline mr-1" />
                      Vorschau
                    </button>
                  </div>
                </ShopCard>
              );
            })}
          </div>
        )}

        {/* Banners Grid - Modern Redesign */}
        {activeTab === 'banners' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleBanners.map((banner) => {
              const isOwned = ownedBanners.includes(banner.id);
              const isEquipped = currentBanner === banner.id;

              return (
                <ShopCard
                  key={banner.id}
                  item={banner}
                  isOwned={isOwned}
                  isEquipped={isEquipped}
                  onBuy={() => buyBannerMutation.mutate(banner)}
                  onEquip={() => equipBannerMutation.mutate(banner.id)}
                  userTokens={user?.tokens || 0}
                >
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-cyan-500 to-violet-500" />
                    <div className="text-9xl opacity-40">{banner.icon}</div>
                    <div className="absolute bottom-6 right-6 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-xs font-bold text-white/80">
                      {banner.type}
                    </div>
                  </div>
                </ShopCard>
              );
            })}
          </div>
        )}

        {/* Video Frames Grid - Modern Redesign */}
        {activeTab === 'videoframes' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleVideoFrames.map((frame) => {
              const isOwned = ownedVideoFrames.includes(frame.id);

              return (
                <ShopCard
                  key={frame.id}
                  item={frame}
                  isOwned={isOwned}
                  isEquipped={false}
                  onBuy={() => buyVideoFrameMutation.mutate(frame)}
                  onEquip={() => {}}
                  userTokens={user?.tokens || 0}
                >
                  <div className={`w-full h-full bg-gradient-to-br ${frame.gradient} flex items-center justify-center p-8`}>
                    <div className="w-full h-full bg-black/80 rounded-2xl flex items-center justify-center border-4 border-white/20 shadow-2xl">
                      <Film className="w-20 h-20 text-white/40" />
                    </div>
                  </div>
                </ShopCard>
              );
            })}
          </div>
        )}

        {/* Bundles Tab */}
        {activeTab === 'bundles' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
              <Package className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-amber-200 text-sm">Bundles beinhalten mehrere Items zum Sparpreis. Bereits besessene Items werden trotzdem freigeschaltet.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {BUNDLE_ITEMS.map((bundle) => {
                const isOwned = (user?.owned_bundles || []).includes(bundle.id);
                const savings = bundle.originalPrice - bundle.price;
                const savingsPct = Math.round((savings / bundle.originalPrice) * 100);
                return (
                  <motion.div
                    key={bundle.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-2xl overflow-hidden border border-white/10 group"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    {/* Header gradient */}
                    <div className={`h-28 bg-gradient-to-br ${bundle.gradient} flex items-center justify-between px-6 relative overflow-hidden`}>
                      <div className="absolute inset-0 opacity-20 bg-black" />
                      <div className="relative z-10">
                        <span className="text-4xl">{bundle.icon}</span>
                        <h3 className="text-xl font-black text-white mt-1">{bundle.name}</h3>
                      </div>
                      <div className="relative z-10 flex flex-col items-end gap-1">
                        <span className="px-2 py-0.5 rounded-full text-xs font-black bg-white/20 text-white">{bundle.badge}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-black bg-green-500 text-white">-{savingsPct}%</span>
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      <p className="text-white/60 text-sm">{bundle.description}</p>
                      {/* Items list */}
                      <div className="flex flex-wrap gap-2">
                        {bundle.items.map((item, idx) => (
                          <span key={idx} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70">
                            <span>{item.icon}</span> {item.name}
                          </span>
                        ))}
                      </div>
                      {/* Price + buy */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/8">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-amber-400">{bundle.price.toLocaleString()}</span>
                            <Coins className="w-5 h-5 text-amber-400" />
                          </div>
                          <span className="text-xs text-white/30 line-through">{bundle.originalPrice.toLocaleString()} 🪙</span>
                        </div>
                        {isOwned ? (
                          <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/20 text-green-400 text-sm font-bold border border-green-500/30">
                            <Check className="w-4 h-4" /> Gekauft
                          </span>
                        ) : (
                          <button
                            onClick={() => buyBundleMutation.mutate(bundle)}
                            disabled={buyBundleMutation.isPending}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all bg-gradient-to-r ${bundle.gradient} text-white hover:scale-105 active:scale-95 disabled:opacity-50`}
                          >
                            {buyBundleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                            Kaufen
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Games Upgrades Tab */}
        {activeTab === 'games' && (
          <div className="space-y-8">
            <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
              <Gamepad2 className="w-5 h-5 text-green-400 shrink-0" />
              <p className="text-green-200 text-sm">Upgrades und Boosts für alle Spiele auf der Plattform. Einige sind dauerhaft, andere zeitlich begrenzt.</p>
            </div>

            {/* Free starter */}
            {GAME_UPGRADE_ITEMS.filter(u => u.free).map(upgrade => {
              const isOwned = (user?.owned_game_upgrades || []).includes(upgrade.id);
              return (
                <div key={upgrade.id} className="rounded-2xl p-5 border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{upgrade.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white">{upgrade.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white">GRATIS</span>
                      </div>
                      <p className="text-white/50 text-sm">{upgrade.description}</p>
                    </div>
                  </div>
                  {isOwned ? (
                    <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/20 text-green-400 text-sm font-bold border border-green-500/30 shrink-0">
                      <Check className="w-4 h-4" /> Eingelöst
                    </span>
                  ) : (
                    <button onClick={() => buyGameUpgradeMutation.mutate(upgrade)} className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-all hover:scale-105 shrink-0">
                      Einlösen
                    </button>
                  )}
                </div>
              );
            })}

            {/* Boost upgrades */}
            {['boost', 'neon_dash', 'chronosphere'].map(cat => {
              const items = GAME_UPGRADE_ITEMS.filter(u => u.category === cat && !u.free);
              if (!items.length) return null;
              const catLabels = { boost: '⚡ Globale Boosts', neon_dash: '🚀 Neon Dash', chronosphere: '🌍 Chronosphere' };
              const catColors = { boost: 'from-cyan-600 to-blue-700', neon_dash: 'from-violet-600 to-fuchsia-700', chronosphere: 'from-blue-600 to-cyan-700' };
              return (
                <div key={cat}>
                  <h3 className="text-lg font-black text-white mb-4">{catLabels[cat]}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(upgrade => {
                      const isOwned = (user?.owned_game_upgrades || []).includes(upgrade.id);
                      return (
                        <motion.div
                          key={upgrade.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl p-5 border border-white/10 bg-white/[0.03] flex flex-col gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-3xl">{upgrade.icon}</span>
                            <div className="flex-1">
                              <p className="font-bold text-white text-sm">{upgrade.name}</p>
                              <p className="text-white/50 text-xs mt-0.5">{upgrade.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/8">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-amber-400">{upgrade.price.toLocaleString()}</span>
                              <Coins className="w-4 h-4 text-amber-400" />
                            </div>
                            {isOwned ? (
                              <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold">
                                <Check className="w-3 h-3" /> Aktiv
                              </span>
                            ) : (
                              <button
                                onClick={() => buyGameUpgradeMutation.mutate(upgrade)}
                                disabled={buyGameUpgradeMutation.isPending || (user?.tokens || 0) < upgrade.price}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-gradient-to-r ${catColors[cat]} text-white hover:scale-105 disabled:opacity-40`}
                              >
                                <Zap className="w-3 h-3" /> Kaufen
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {hasMoreItems && !['bundles', 'games'].includes(activeTab) && (
          <div className="flex justify-center mt-8">
            <button onClick={loadMore} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/60 hover:text-white text-sm font-medium">
              <ChevronDown className="w-4 h-4" />
              Mehr laden
            </button>
          </div>
        )}
      </PageShell>
    </div>
    </PageTransition>
    </PageMaintenanceCheck>
  );
}