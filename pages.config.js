/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Achievements from './pages/Achievements';
import AdManager from './pages/AdManager';
import Admin from './pages/Admin';
import AdminMaintenance from './pages/AdminMaintenance';
import AdminUsers from './pages/AdminUsers';
import Agents from './pages/Agents';
import BattlePass from './pages/BattlePass';
import Changelog from './pages/Changelog';
import ClanDetail from './pages/ClanDetail';
import Clans from './pages/Clans';
import CloudinaryUpload from './pages/CloudinaryUpload';
import CommunityHub from './pages/CommunityHub';
import CreatorDashboard from './pages/CreatorDashboard';
import CreatorProfile from './pages/CreatorProfile';
import Donate from './pages/Donate';
import Feedback from './pages/Feedback';
import ForgotPassword from './pages/ForgotPassword';
import Forum from './pages/Forum';
import ForumThread from './pages/ForumThread';
import Friends from './pages/Friends';
import GoogleDriveUpload from './pages/GoogleDriveUpload';
import GroupChats from './pages/GroupChats';
import Guidelines from './pages/Guidelines';
import GumletUpload from './pages/GumletUpload';
import Home from './pages/Home';
import Imprint from './pages/Imprint';
import Leaderboard from './pages/Leaderboard';
import MerchShop from './pages/MerchShop';
import Messages from './pages/Messages';
import MiniGame from './pages/MiniGame';
import Moderation from './pages/Moderation';
import MyVideos from './pages/MyVideos';
import NeonBossRaid from './pages/NeonBossRaid';
import NeonDash from './pages/NeonDash';
import NeonDashLevelEditor from './pages/NeonDashLevelEditor';
import NeonRacer from './pages/NeonRacer';
import PendingApproval from './pages/PendingApproval';
import PlaylistDetail from './pages/PlaylistDetail';
import Playlists from './pages/Playlists';
import Pokemon30 from './pages/Pokemon30';
import PokemonGame from './pages/PokemonGame';
import Premium from './pages/Premium';
import Privacy from './pages/Privacy';
import ProPass from './pages/ProPass';
import Profile from './pages/Profile';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Roadmap from './pages/Roadmap';
import ServerStatus from './pages/ServerStatus';
import Settings from './pages/Settings';
import Shop from './pages/Shop';
import Shorts from './pages/Shorts';
import SignIn from './pages/SignIn';
import Snaps from './pages/Snaps';
import Support from './pages/Support';
import Terms from './pages/Terms';
import TranscodingDashboard from './pages/TranscodingDashboard';
import Tutorial from './pages/Tutorial';
import Upload from './pages/Upload';
import UploadSelect from './pages/UploadSelect';
import UploadShort from './pages/UploadShort';
import Watch from './pages/Watch';
import WatchParty from './pages/WatchParty';
import WatchPartyLobby from './pages/WatchPartyLobby';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Achievements": Achievements,
    "AdManager": AdManager,
    "Admin": Admin,
    "AdminMaintenance": AdminMaintenance,
    "AdminUsers": AdminUsers,
    "Agents": Agents,
    "BattlePass": BattlePass,
    "Changelog": Changelog,
    "ClanDetail": ClanDetail,
    "Clans": Clans,
    "CloudinaryUpload": CloudinaryUpload,
    "CommunityHub": CommunityHub,
    "CreatorDashboard": CreatorDashboard,
    "CreatorProfile": CreatorProfile,
    "Donate": Donate,
    "Feedback": Feedback,
    "ForgotPassword": ForgotPassword,
    "Forum": Forum,
    "ForumThread": ForumThread,
    "Friends": Friends,
    "GoogleDriveUpload": GoogleDriveUpload,
    "GroupChats": GroupChats,
    "Guidelines": Guidelines,
    "GumletUpload": GumletUpload,
    "Home": Home,
    "Imprint": Imprint,
    "Leaderboard": Leaderboard,
    "MerchShop": MerchShop,
    "Messages": Messages,
    "MiniGame": MiniGame,
    "Moderation": Moderation,
    "MyVideos": MyVideos,
    "NeonBossRaid": NeonBossRaid,
    "NeonDash": NeonDash,
    "NeonDashLevelEditor": NeonDashLevelEditor,
    "NeonRacer": NeonRacer,
    "PendingApproval": PendingApproval,
    "PlaylistDetail": PlaylistDetail,
    "Playlists": Playlists,
    "Pokemon30": Pokemon30,
    "PokemonGame": PokemonGame,
    "Premium": Premium,
    "Privacy": Privacy,
    "ProPass": ProPass,
    "Profile": Profile,
    "Register": Register,
    "ResetPassword": ResetPassword,
    "Roadmap": Roadmap,
    "ServerStatus": ServerStatus,
    "Settings": Settings,
    "Shop": Shop,
    "Shorts": Shorts,
    "SignIn": SignIn,
    "Snaps": Snaps,
    "Support": Support,
    "Terms": Terms,
    "TranscodingDashboard": TranscodingDashboard,
    "Tutorial": Tutorial,
    "Upload": Upload,
    "UploadSelect": UploadSelect,
    "UploadShort": UploadShort,
    "Watch": Watch,
    "WatchParty": WatchParty,
    "WatchPartyLobby": WatchPartyLobby,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};