import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  ArrowLeft, TrendingUp, Users, Clock, Activity, Sparkles, 
  Play, ThumbsUp, Award, Zap, DollarSign, Gift, MessageCircle, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';

export default function CreatorDashboard() {
  const [user, setUser] = useState(null);
  const [aiInsight, setAiInsight] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [donations, setDonations] = useState([]);
  const [answerText, setAnswerText] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem('app_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const { data: myVideos = [] } = useQuery({
    queryKey: ['myVideos', user?.username],
    queryFn: () => base44.entities.Video.list({ creator_name: user?.username }, '-created_date'),
    enabled: !!user?.username,
  });

  // Fetch Q&A
  useQuery({
    queryKey: ['questions', user?.username],
    queryFn: () => base44.entities.Question.list({ creator_username: user?.username }, '-created_date'),
    enabled: !!user?.username,
    onSuccess: (data) => setQuestions(data)
  });

  // Fetch Donations
  useQuery({
    queryKey: ['donations', user?.username],
    queryFn: () => base44.entities.Donation.filter({ creator_username: user?.username }, '-created_date'),
    enabled: !!user?.username,
    onSuccess: (data) => setDonations(data)
  });

  const handleAnswer = async (qId) => {
     if (!answerText[qId]) return;
     await base44.entities.Question.update(qId, { 
       answer: answerText[qId], 
       is_answered: true 
     });
     setQuestions(prev => prev.map(q => q.id === qId ? { ...q, answer: answerText[qId], is_answered: true } : q));
     setAnswerText(prev => ({ ...prev, [qId]: '' }));
  };

  // Real Chart Data from Videos
  const generateChartData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayVideos = myVideos.filter(v => {
        const vDate = new Date(v.created_date);
        return vDate.toDateString() === date.toDateString();
      });
      const dayViews = dayVideos.reduce((sum, v) => sum + (v.views || 0), 0);
      const dayLikes = dayVideos.reduce((sum, v) => sum + (v.likes_count || 0), 0);
      
      data.push({
        name: date.toLocaleDateString('de-DE', { weekday: 'short' }),
        views: dayViews,
        engagement: dayLikes,
      });
    }
    return data;
  };

  const chartData = generateChartData();

  // Real Metrics
  const totalViews = myVideos.reduce((sum, v) => sum + (v.views || 0), 0);
  const totalLikes = myVideos.reduce((sum, v) => sum + (v.likes_count || 0), 0);
  const totalVideos = myVideos.length;
  const avgViews = totalVideos ? Math.round(totalViews / totalVideos) : 0;
  const totalRevenue = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const { data: followers = [] } = useQuery({
    queryKey: ['followers', user?.username],
    queryFn: () => base44.entities.Follow.filter({ following_username: user?.username }),
    enabled: !!user?.username
  });
  const engagementRate = totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(1) : 0;

  const generateAiAnalysis = async () => {
    setAnalyzing(true);
    try {
      const statsSummary = `
        Total Videos: ${totalVideos}
        Total Views: ${totalViews}
        Total Likes: ${totalLikes}
        Top Video: ${myVideos[0]?.title} (${myVideos[0]?.views} views)
      `;
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist ein Experte für YouTube/Video-Analytics. Analysiere diese Kanal-Statistiken und gib 3 konkrete, motivierende Tipps auf Deutsch, wie der Creator wachsen kann. Sei kurz und knackig. Nutze Emojis.\n\nDaten: ${statsSummary}`,
        add_context_from_internet: false
      });
      setAiInsight(response);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Profile')}>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
                Creator Studio
              </h1>
              <p className="text-white/50">Willkommen zurück, {user.username}!</p>
            </div>
          </div>
          <Button 
            onClick={generateAiAnalysis}
            disabled={analyzing}
            className="hidden md:flex bg-gradient-to-r from-cyan-600 to-teal-600 hover:opacity-90"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {analyzing ? 'Analysiere...' : 'AI Kanal-Analyse'}
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-1 rounded-xl shadow-xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white rounded-lg px-4">Overview</TabsTrigger>
            <TabsTrigger value="monetization" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white rounded-lg px-4">Monetization</TabsTrigger>
            <TabsTrigger value="community" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white rounded-lg px-4">Q&A</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
             {/* AI Insight Card */}
            {aiInsight && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-cyan-900/20 to-teal-900/20 border border-cyan-500/20"
              >
                <h3 className="text-lg font-bold text-cyan-300 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> AI Coach Insights
                </h3>
                <p className="text-white/80 leading-relaxed whitespace-pre-line">
                  {aiInsight}
                </p>
              </motion.div>
            )}

            {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={Activity} 
            label="Total Views" 
            value={totalViews.toLocaleString()} 
            trend="+12%" 
            color="text-cyan-400" 
            bgColor="bg-cyan-500/10" 
          />
          <StatCard 
            icon={ThumbsUp} 
            label="Total Likes" 
            value={totalLikes.toLocaleString()} 
            trend={`${engagementRate}%`}
            color="text-teal-400" 
            bgColor="bg-teal-500/10" 
          />
          <StatCard 
            icon={Users} 
            label="Follower" 
            value={followers.length.toLocaleString()} 
            trend="+12%" 
            color="text-cyan-400" 
            bgColor="bg-cyan-500/10" 
          />
          <StatCard 
            icon={DollarSign} 
            label="Einnahmen" 
            value={`${totalRevenue}€`} 
            trend="+18%" 
            color="text-emerald-400" 
            bgColor="bg-emerald-500/10" 
          />
        </div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Views Chart */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Performance (7 Tage)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1c', border: '1px solid #ffffff20', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#06b6d4" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorViews)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Content Categories Distribution */}
          <div className="p-6 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
               <Play className="w-5 h-5 text-cyan-400" />
               Deine Kategorien
             </h3>
             <div className="space-y-5 flex-1">
                {(() => {
                  const categories = {};
                  myVideos.forEach(v => {
                    categories[v.category] = (categories[v.category] || 0) + 1;
                  });
                  const total = myVideos.length || 1;
                  return Object.entries(categories).map(([cat, count]) => ({
                    c: cat,
                    p: Math.round((count / total) * 100),
                    color: 'bg-cyan-500'
                  }));
                })().map((item) => (
                   <div key={item.c}>
                      <div className="flex justify-between text-sm mb-1.5 text-white/70">
                         <span className="capitalize">{item.c}</span>
                         <span className="font-bold">{item.p}%</span>
                      </div>
                      <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                         <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.p}%` }} />
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Videos / Traffic */}
          <div className="lg:col-span-3 p-6 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Top Videos
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {myVideos.length > 0 ? myVideos.slice(0, 5).map((video, i) => (
                <div key={video.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="w-8 h-8 flex items-center justify-center font-bold text-white/20 group-hover:text-violet-400">
                    #{i + 1}
                  </div>
                  <div className="w-16 h-9 rounded-md bg-white/10 overflow-hidden flex-shrink-0">
                    <img src={video.thumbnail_url} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-white/90">{video.title}</p>
                    <p className="text-xs text-white/50">{video.views} Views</p>
                  </div>
                </div>
              )) : (
                <p className="text-white/30 text-center py-10">Keine Daten verfügbar</p>
              )}
            </div>
          </div>
        </div>
        </TabsContent>

        <TabsContent value="monetization" className="space-y-6">
          <div className="grid grid-cols-1 gap-8">
            {/* Donations */}
            <div className="p-6 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-2xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-400">
                <DollarSign className="w-5 h-5" />
                Letzte Spenden
              </h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                {donations.length > 0 ? donations.map(don => (
                  <div key={don.id} className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-green-300">{don.amount} €</span>
                      <span className="text-xs text-white/40">{new Date(don.created_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <span className="font-medium text-white">{don.donor_username}:</span>
                      <span>{don.message}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-white/30 text-center">Noch keine Spenden erhalten.</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>



        <TabsContent value="community" className="space-y-6">
           <div className="p-6 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-2xl">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-cyan-400">
                <MessageCircle className="w-5 h-5" />
                Q&A - Fragen der Community
              </h3>
              
              <div className="space-y-6">
                {questions.length === 0 && <p className="text-white/30">Keine offenen Fragen.</p>}
                {questions.map(q => (
                  <div key={q.id} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                        {q.asker_username[0]}
                      </div>
                      <div>
                        <p className="text-white font-medium">{q.question}</p>
                        <p className="text-white/40 text-xs mt-1">von {q.asker_username}</p>
                      </div>
                    </div>

                    {q.is_answered ? (
                     <div className="ml-11 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-sm">
                       <span className="text-cyan-300 font-bold block mb-1">Antwort:</span>
                        <span className="text-white/80">{q.answer}</span>
                      </div>
                    ) : (
                      <div className="ml-11 mt-3 flex gap-2">
                        <Input 
                          placeholder="Antworte hier..." 
                          className="bg-black/40 border-white/10"
                          value={answerText[q.id] || ''}
                          onChange={e => setAnswerText({...answerText, [q.id]: e.target.value})}
                        />
                        <Button onClick={() => handleAnswer(q.id)} className="bg-cyan-600 hover:bg-cyan-500">
                          Senden
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
           </div>
        </TabsContent>
        </Tabs>

         <Button 
           onClick={generateAiAnalysis}
           disabled={analyzing}
           className="md:hidden w-full bg-gradient-to-r from-cyan-600 to-teal-600 mt-8"
         >
            <Sparkles className="w-4 h-4 mr-2" />
            {analyzing ? 'Analysiere...' : 'AI Kanal-Analyse'}
          </Button>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, color, bgColor }) {
  return (
    <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/20 transition-colors shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full bg-white/5 ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-white/40 text-sm font-medium mb-1">{label}</p>
        <h4 className="text-2xl font-bold text-white">{value}</h4>
      </div>
    </div>
  );
}