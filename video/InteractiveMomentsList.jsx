import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Zap, Info, Trophy, Target, Star, Flame } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

function MomentCard({ moment, currentUser, isAnswered }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(isAnswered);
  const [votes, setVotes] = useState(() => (moment.options || []).map(() => Math.floor(Math.random() * 40 + 5)));

  const handleAnswer = async (idx) => {
    if (selected !== null || revealed) return;
    setSelected(idx);
    
    const isCorrect = idx === moment.correct_answer;
    setVotes(v => v.map((c, i) => i === idx ? c + 1 : c));

    if (isCorrect && moment.type === 'quiz') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#7c3aed', '#f59e0b', '#10b981']
      });
    }

    if (currentUser) {
      await base44.entities.VideoMomentResponse.create({
        moment_id: moment.id,
        video_id: moment.video_id,
        user_username: currentUser.username,
        answer_index: idx,
        is_correct: isCorrect
      }).catch(() => {});

      if (isCorrect && moment.tokens_reward && !currentUser.is_donor && moment.type === 'quiz') {
        const newTokens = (currentUser.tokens || 0) + moment.tokens_reward;
        await base44.entities.AppUser.update(currentUser.id, { tokens: newTokens }).catch(() => {});
        localStorage.setItem('app_user', JSON.stringify({ ...currentUser, tokens: newTokens }));
        window.dispatchEvent(new Event('user-updated'));
        toast.success(`+${moment.tokens_reward} Tokens für die richtige Antwort! ⚡`);
      }
    }

    setTimeout(() => setRevealed(true), 400);
  };

  const isQuiz = moment.type === 'quiz';
  const isPoll = moment.type === 'poll';
  const isInfo = moment.type === 'info' || moment.type === 'hotspot';
  const totalVotes = votes.reduce((a, b) => a + b, 0);

  if (isInfo) {
    return (
      <div className="bg-white/5 border border-cyan-500/30 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0 border border-cyan-500/40">
            <Info className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-1">{moment.question}</h4>
            {moment.info_text && <p className="text-white/60 text-sm leading-relaxed">{moment.info_text}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: isQuiz ? 'linear-gradient(90deg, #7c3aed, #06b6d4)' : 'linear-gradient(90deg, #3b82f6, #06b6d4)' }} />
      
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: isQuiz ? 'rgba(124,58,237,0.2)' : 'rgba(59,130,246,0.2)' }}>
            {isQuiz ? <Trophy className="w-4 h-4 text-violet-400" /> : <Target className="w-4 h-4 text-blue-400" />}
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">{isQuiz ? 'Quiz' : 'Umfrage'}</h4>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">{moment.question}</p>
          </div>
        </div>
        {isQuiz && moment.tokens_reward > 0 && !revealed && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400">+{moment.tokens_reward}</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        {(moment.options || []).map((opt, idx) => {
          const isSelected = selected === idx;
          const isCorrect = idx === moment.correct_answer;
          const pct = totalVotes > 0 ? Math.round((votes[idx] / totalVotes) * 100) : 0;
          const isWinner = isPoll && revealed && pct === Math.max(...votes.map(v => Math.round((v / totalVotes) * 100)));

          let borderColor = 'rgba(255,255,255,0.1)';
          let bgColor = 'rgba(255,255,255,0.03)';
          let textColor = 'rgba(255,255,255,0.7)';

          if (revealed && isQuiz) {
            if (isCorrect) { borderColor = 'rgba(16,185,129,0.5)'; bgColor = 'rgba(16,185,129,0.1)'; textColor = '#34d399'; }
            else if (isSelected) { borderColor = 'rgba(239,68,68,0.5)'; bgColor = 'rgba(239,68,68,0.1)'; textColor = '#f87171'; }
            else { bgColor = 'rgba(255,255,255,0.01)'; textColor = 'rgba(255,255,255,0.3)'; }
          } else if (isSelected && !revealed) {
            borderColor = 'rgba(124,58,237,0.5)'; bgColor = 'rgba(124,58,237,0.15)';
          } else if (isPoll && revealed && isWinner) {
            borderColor = 'rgba(6,182,212,0.5)'; bgColor = 'rgba(6,182,212,0.1)'; textColor = '#22d3ee';
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={revealed}
              className="relative w-full text-left rounded-xl overflow-hidden transition-all p-3 flex items-center justify-between gap-3"
              style={{ border: `1px solid ${borderColor}`, background: bgColor, color: textColor, cursor: revealed ? 'default' : 'pointer' }}
            >
              {(isPoll || revealed) && (
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-white/5 transition-all duration-1000" 
                  style={{ width: `${pct}%`, background: revealed && isQuiz && isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)' }} 
                />
              )}
              
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 bg-white/10">
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-sm font-medium">{opt}</span>
              </div>

              <div className="relative z-10 flex items-center gap-2 shrink-0">
                {(isPoll || revealed) && <span className="text-xs font-bold opacity-60">{pct}%</span>}
                {revealed && isQuiz && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                {revealed && isQuiz && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400" />}
                {isPoll && isWinner && revealed && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
              </div>
            </button>
          );
        })}
      </div>
      
      {revealed && isQuiz && (
        <div className="px-4 pb-4">
          <div className={`p-2 rounded-lg text-center text-xs font-bold ${selected === moment.correct_answer || isAnswered ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {selected === moment.correct_answer ? 'Richtig beantwortet!' : isAnswered ? 'Bereits beantwortet' : 'Leider falsch!'}
          </div>
        </div>
      )}
    </div>
  );
}

export default function InteractiveMomentsList({ videoId, currentUser }) {
  const { data: moments = [] } = useQuery({
    queryKey: ['moments', videoId],
    queryFn: () => base44.entities.VideoMoment.filter({ video_id: videoId, is_active: true }),
    enabled: !!videoId,
  });

  const { data: responses = [] } = useQuery({
    queryKey: ['moment_responses', videoId, currentUser?.username],
    queryFn: () => currentUser ? base44.entities.VideoMomentResponse.filter({ video_id: videoId, user_username: currentUser.username }) : [],
    enabled: !!videoId && !!currentUser,
  });

  if (!moments.length) return null;

  const answeredIds = new Set(responses.map(r => r.moment_id));

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-violet-400" />
        <h3 className="text-lg font-bold text-white">Interaktive Momente</h3>
        <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-xs font-bold">{moments.length}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {moments.map(moment => (
          <MomentCard 
            key={moment.id} 
            moment={moment} 
            currentUser={currentUser} 
            isAnswered={answeredIds.has(moment.id)} 
          />
        ))}
      </div>
    </div>
  );
}