import React, { useState, useRef, useEffect } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import { processAIAssistantStep } from '../../services/aiService';
import ComplaintSummaryCard from './ComplaintSummaryCard';
import {
  Bot,
  Send,
  RefreshCw,
  Sparkles,
  Zap,
  Droplets,
  Wifi,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const CHAT_EXAMPLE_PROMPTS = [
  {
    icon: Zap,
    text: 'My classroom fan is not working in Room 204',
    category: 'Electrical',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    icon: Wifi,
    text: 'WiFi is very slow and dropping in the central library',
    category: 'WiFi / Internet',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    icon: Droplets,
    text: 'Water leakage under washbasin in hostel block B washroom',
    category: 'Plumbing',
    color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  },
  {
    icon: ShieldAlert,
    text: 'Broken window latch and door hinge in mechanical lab 301',
    category: 'Infrastructure',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
];

const AIChatbot = ({ onComplaintCreated, onReset }) => {
  const { user } = useAuth();
  const { addComplaint } = useComplaints();
  const navigate = useNavigate();

  // Registered member's first name
  const memberName = user?.name ? user.name.split(' ')[0] : 'there';

  const getInitialGreeting = (name = memberName) => ({
    id: 'msg-initial',
    sender: 'ai',
    text: `Hello ${name}! 👋 I'm your CampusResolve AI Assistant. What campus problem or maintenance issue are you facing today?`,
    timestamp: new Date().toISOString(),
  });

  const [messages, setMessages] = useState(() => [getInitialGreeting(memberName)]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiContext, setAiContext] = useState({ step: 'initial' });
  const [summary, setSummary] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef(null);

  // Update greeting if user changes or on first mount
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'msg-initial') {
        return [getInitialGreeting(memberName)];
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, summary]);

  const handleSendMessage = (textToSend) => {
    const query = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!query) return;

    // Add user message
    const userMsg = {
      id: `msg-${Date.now()}-${Math.random()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Keep a short typing delay before requesting the Gemini-backed assistant.
    setTimeout(async () => {
      try {
        const result = await processAIAssistantStep(query, aiContext);
        setAiContext(result.updatedContext);

        const aiMsg = {
          id: `msg-ai-${Date.now()}-${Math.random()}`,
          sender: 'ai',
          text: result.botReply,
          timestamp: new Date().toISOString(),
          isFraud: result.isFraud,
        };

        setMessages((prev) => [...prev, aiMsg]);

        if (result.isFraud) {
          setSummary(null);
          toast.error('Please review the potentially unrelated complaint', { duration: 3500 });
        } else if (result.complaintSummary) {
          setSummary(result.complaintSummary);
        }
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-ai-${Date.now()}-${Math.random()}`,
            sender: 'ai',
            text: error.message || 'AI analysis is unavailable. Please try again.',
            timestamp: new Date().toISOString(),
          },
        ]);
        setSummary(null);
      } finally {
        setIsTyping(false);
      }
    }, 300);
  };

  const handleEditDetails = () => {
    navigate('/student/complaints?create=true', {
      state: {
        openCreateModal: true,
        prefill: {
          title: summary.title,
          description: summary.description,
          location: summary.location,
          category: summary.category,
        },
      },
    });
  };

  const handleSubmitComplaint = async () => {
    if (!summary) return;
    setIsSubmitting(true);

    try {
      const newTicket = await addComplaint({
        title: summary.title,
        description: summary.description,
        location: summary.location,
        category: summary.category,
        isAiDetected: true,
        student: user,
      });

      setIsSubmitting(false);

      if (onComplaintCreated) {
        onComplaintCreated(newTicket);
      } else {
        navigate(`/student/complaints/${newTicket.id || newTicket.ticketId}`);
      }
    } catch (err) {
      setIsSubmitting(false);
      toast.error(err.message || 'Failed to submit complaint');
    }
  };

  // Complete Reset: clears all conversation history and restores fresh greeting with member name
  const handleReset = () => {
    setMessages([getInitialGreeting(memberName)]);
    setAiContext({ step: 'initial' });
    setSummary(null);
    setInputText('');
    setIsTyping(false);
    if (onReset) onReset();
    toast.success('Conversation reset completely');
  };

  const showExamplePrompts = messages.length <= 1 && !summary;

  return (
    <div className="flex flex-col h-[650px] bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
      {/* Chatbot Header */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-accent-400 flex items-center justify-center text-white shadow-md shadow-brand-500/30">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold tracking-tight">CampusResolve AI Assistant</h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Campus issue intake & AI categorization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-xl text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
            title="Reset Conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-xs mt-0.5 ${
                    msg.isFraud
                      ? 'bg-rose-600'
                      : 'bg-gradient-to-tr from-brand-600 to-accent-600'
                  }`}
                >
                  {msg.isFraud ? <ShieldAlert className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
              )}

              <div
                className={`max-w-md sm:max-w-lg rounded-2xl px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-xs whitespace-pre-line ${
                  isUser
                    ? 'bg-brand-600 text-white rounded-tr-xs'
                    : msg.isFraud
                    ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-tl-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                }`}
              >
                {msg.text}
              </div>

              {isUser && (
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={user?.name || 'User'}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 flex-shrink-0 mt-0.5"
                />
              )}
            </div>
          );
        })}

        {/* Embedded Example Prompts directly inside the chatbot box */}
        {showExamplePrompts && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-brand-50/50 border border-brand-200/80 space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                Example Prompts (Click once to try):
              </span>
              <span className="text-[10px] text-brand-700 font-semibold bg-brand-100/80 px-2 py-0.5 rounded-full">
                College issues only
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CHAT_EXAMPLE_PROMPTS.map((prompt, idx) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(prompt.text)}
                    className="p-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-brand-500 hover:bg-brand-50/50 text-left transition-all group shadow-xs flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${prompt.color}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 group-hover:text-brand-700 truncate">
                        "{prompt.text}"
                      </span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-1 border-t border-brand-100/60">
              <ShieldCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" />
              <span>Gemini AI flags potentially unrelated or spam complaints. Flags are estimates, not proof.</span>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-accent-600 flex items-center justify-center text-white flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white rounded-2xl px-4 py-2.5 border border-slate-200 shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        {/* Real-time Complaint Summary Card embedded inside chat */}
        {summary && (
          <div className="pt-2">
            <ComplaintSummaryCard
              summary={summary}
              onEdit={handleEditDetails}
              onSubmit={handleSubmitComplaint}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your campus problem or location naturally..."
            className="flex-1 rounded-xl border-slate-200 text-xs sm:text-sm py-2.5 px-3.5 focus:ring-brand-500 focus:border-brand-500 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all disabled:opacity-40 shadow-sm shadow-brand-500/20 flex items-center gap-1.5 text-xs"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChatbot;
