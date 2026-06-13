import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { getChatbotReply } from '../services/safetyService';

interface Hotspot {
  name: string;
  description: string;
  category: string;
  rating: string;
  distance: string;
}

interface SafetyReport {
  id: string;
  name: string;
  fullName: string;
  rating: number;
  info: string;
  breakdown: {
    crimeRisk: number;
    nightSafety: number;
    touristFriendliness: number;
    womensSafety: number;
    publicTransport: number;
    emergencyServices: number;
  };
  stats: {
    crimeIndex: string;
    violentCrime: string;
    pettyCrime: string;
    policePresence: string;
  };
  emergency: {
    police: string;
    ambulance: string;
    fire: string;
  };
  localNotes: string[];
  dos: string[];
  donts: string[];
  hotspots: Hotspot[];
}

interface ChatbotProps {
  location: SafetyReport;
  onClose: () => void;
}

interface Message {
  text: string;
  sender: 'bot' | 'user';
}

const Chatbot: React.FC<ChatbotProps> = ({ location, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { text: `Hi! Ask me anything about safety, public transport, neighborhoods, or places to visit in ${location.name}.`, sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset chatbot if location changes
  useEffect(() => {
    setMessages([
      { text: `Hi! Ask me anything about safety, public transport, neighborhoods, or places to visit in ${location.name}.`, sender: 'bot' }
    ]);
  }, [location.id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setInput('');
    setLoading(true);

    try {
      // Simulate a short thinking delay for realism
      await new Promise(resolve => setTimeout(resolve, 600));
      const reply = getChatbotReply(userMsg, location);
      setMessages(prev => [...prev, { text: reply, sender: 'bot' }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { text: 'Sorry, I had an error. Please try again.', sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--card-border)] rounded-lg overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 bg-[var(--card-bg)] border-b border-[var(--card-border)] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-[var(--text-primary)]" />
          <div>
            <h3 className="text-xs font-bold text-[var(--text-primary)]">Guide</h3>
            <span className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">{location.name}</span>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
          >
            {/* Avatar */}
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border border-[var(--card-border)] text-xs text-[var(--text-primary)] bg-[var(--card-bg)]`}>
              {msg.sender === 'user' ? <User size={12} /> : <Bot size={12} />}
            </div>
            
            {/* Balloon */}
            <div className={`p-3 rounded-lg text-xs leading-relaxed border ${
              msg.sender === 'user' 
                ? 'bg-[var(--text-primary)] text-[var(--bg-color)] border-transparent rounded-tr-none shadow-sm' 
                : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-primary)] rounded-tl-none shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="self-start flex gap-2.5 items-center">
            <div className="w-6 h-6 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center shrink-0">
              <Bot size={12} className="text-[var(--text-secondary)] animate-pulse" />
            </div>
            <div className="p-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg rounded-tl-none text-xs text-[var(--text-secondary)] flex gap-1 items-center">
              <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)] animate-bounce"></span>
              <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)] animate-bounce delay-150"></span>
              <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)] animate-bounce delay-300"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[var(--card-border)] bg-[var(--card-bg)]">
        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-transparent border border-[var(--card-border)] rounded-lg px-3 py-2 text-xs outline-none focus:border-[var(--text-primary)] text-[var(--text-primary)]"
            required
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="bg-[var(--text-primary)] hover:bg-[var(--text-secondary)] text-[var(--bg-color)] p-2 rounded-lg transition-all disabled:opacity-40 cursor-pointer"
          >
            <Send size={12} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
