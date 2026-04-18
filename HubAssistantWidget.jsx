import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import HubAssistantCharacter from './HubAssistantCharacter';
import { useLocation } from 'react-router-dom';

export default function HubAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const location = useLocation();

  // Seiten, auf denen der Assistant verborgen sein soll
  const hiddenPages = ['/NeonDash', '/NeonRacer', '/VoidRift', '/NeonBossRaid', '/PokemonGame', '/Pokemon30', '/MiniGame', '/ClanDetail/ClanTrainingGame'];
  const shouldHide = hiddenPages.some(page => location.pathname.includes(page));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !conversation) {
      initConversation();
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const initConversation = async () => {
    setInitializing(true);
    try {
      const conv = await base44.agents.createConversation({
        agent_name: 'hub_assistant',
        metadata: { name: 'Hub Assistent Chat' }
      });
      setConversation(conv);
      setMessages([{
        role: 'assistant',
        content: 'Hey! 👋 Ich bin der **7B Hub Assistent**. Ich helfe dir bei allem rund um die Plattform – Videos, Tokens, Games, Battle Pass, Clans und mehr. Was kann ich für dich tun?'
      }]);
    } catch (e) {
      console.error(e);
    }
    setInitializing(false);
  };

  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
      setLoading(false);
    });
    return unsub;
  }, [conversation?.id]);

  const sendMessage = async () => {
    if (!input.trim() || loading || !conversation) return;
    const text = input.trim();
    setInput('');
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    try {
      await base44.agents.addMessage(conversation, { role: 'user', content: text });
    } catch (e) {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (shouldHide) return null;

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
            className="fixed bottom-24 right-4 z-[200] w-[340px] sm:w-[380px] rounded-2xl overflow-hidden flex flex-col shadow-2xl"
            style={{
              background: 'rgba(5,5,15,0.97)',
              border: '1px solid rgba(6,182,212,0.25)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(6,182,212,0.1)',
              maxHeight: '70vh',
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8"
              style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(168,85,247,0.08))' }}>
              <HubAssistantCharacter isOpen={isOpen} isAnimating={true} />
              <div className="flex-1">
                <p className="text-white font-black text-sm leading-tight">7B Hub Assistent</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-white/35 text-[10px]">Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ minHeight: '260px', maxHeight: '420px' }}>
              {initializing ? (
                <div className="flex items-center justify-center h-full py-8">
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                      {msg.role === 'assistant' && (
                        <HubAssistantCharacter isOpen={isOpen} isAnimating={false} />
                      )}
                      <div
                        className={`max-w-[82%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'text-white rounded-br-sm'
                            : 'text-white/85 rounded-bl-sm'
                        }`}
                        style={msg.role === 'user'
                          ? { background: 'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(168,85,247,0.2))', border: '1px solid rgba(6,182,212,0.2)' }
                          : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }
                        }
                      >
                        {msg.role === 'assistant' ? (
                          <ReactMarkdown
                            className="prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-0.5 [&_ul]:my-1 [&_li]:my-0"
                            components={{
                              a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{children}</a>,
                              strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
                              code: ({ children }) => <code className="px-1 py-0.5 rounded bg-white/10 text-cyan-300 text-xs">{children}</code>,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        ) : (
                          <p>{msg.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start gap-2">
                      <div className="w-6 h-6 flex-shrink-0"><HubAssistantCharacter isOpen={isOpen} isAnimating={false} /></div>
                      <div className="px-3 py-2.5 rounded-xl rounded-bl-sm flex items-center gap-1"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        {[0, 1, 2].map(i => (
                          <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400/60"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/8">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Frag mich was..."
                  disabled={loading || initializing}
                  className="flex-1 bg-transparent text-white text-sm placeholder-white/20 outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading || initializing}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                  style={{ background: 'linear-gradient(135deg, #06b6d4, #a855f7)' }}
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        className="fixed bottom-24 right-4 z-[200] w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl"
        style={{
          background: isOpen
            ? 'rgba(20,20,30,0.95)'
            : 'linear-gradient(135deg, #06b6d4, #a855f7)',
          border: isOpen ? '1px solid rgba(255,255,255,0.1)' : 'none',
          boxShadow: isOpen ? 'none' : '0 8px 30px rgba(6,182,212,0.4)',
        }}
        // push above the chat window when open
        animate={isOpen ? { bottom: '26.5rem' } : { bottom: '6rem' }}
        transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
      >
        <AnimatePresence mode="wait">
           {isOpen ? (
             <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
               <ChevronDown className="w-5 h-5 text-white/60" />
             </motion.div>
           ) : (
             <motion.div key="open" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.15 }}>
               <HubAssistantCharacter isOpen={false} isAnimating={false} />
             </motion.div>
           )}
         </AnimatePresence>
      </motion.button>
    </>
  );
}