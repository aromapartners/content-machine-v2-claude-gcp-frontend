import { useState, useEffect, useRef } from 'react';
import {
  Send, Plus, Trash2, MessageCircle, User, Bot, BookOpen,
  Globe, Loader2, ChevronLeft,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '../utils/api';

export default function ChatTab() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const bottomRef = useRef(null);

  const loadSessions = async () => {
    try {
      const res = await api.getChatSessions();
      setSessions(res.sessions || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadMessages = async (sessionId) => {
    try {
      const res = await api.getSessionMessages(sessionId);
      setMessages(res.messages || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadSessions(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const selectSession = (s) => {
    setActiveSession(s.id);
    loadMessages(s.id);
    setShowSidebar(false);
  };

  const newChat = () => {
    setActiveSession(null);
    setMessages([]);
    setInput('');
  };

  const deleteSession = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Xóa phiên chat này?')) return;
    try {
      await api.deleteSession(id);
      if (activeSession === id) newChat();
      await loadSessions();
    } catch (e) {
      alert(e.message);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    setLoading(true);

    setMessages((prev) => [...prev, { role: 'user', content: msg, sources: [] }]);

    try {
      const res = await api.sendMessage({ session_id: activeSession, message: msg });
      if (!activeSession) setActiveSession(res.session_id);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.content, sources: res.sources || [] },
      ]);
      await loadSessions();
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `❌ Lỗi: ${e.message}`, sources: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'block' : 'hidden md:block'} w-full md:w-72 border-r border-slate-100 flex flex-col bg-slate-50/50`}>
        <div className="p-4">
          <button
            onClick={newChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-all"
          >
            <Plus className="w-4 h-4" /> Chat mới
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => selectSession(s)}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm transition-all group ${
                activeSession === s.id
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <MessageCircle className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{s.title}</span>
              </div>
              <button
                onClick={(e) => deleteSession(e, s.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden p-3 border-b border-slate-100">
          <button onClick={() => setShowSidebar(true)} className="flex items-center gap-1 text-sm text-slate-500">
            <ChevronLeft className="w-4 h-4" /> Sessions
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Bot className="w-14 h-14 mb-3 text-slate-300" />
              <p className="font-medium mb-1">RAG Chatbot</p>
              <p className="text-sm text-center max-w-sm">
                Hỏi bất kỳ điều gì. Tôi sẽ tìm câu trả lời từ tài liệu đã upload,
                hoặc tìm kiếm trên internet nếu cần.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div className={`max-w-[75%] ${
                msg.role === 'user'
                  ? 'bg-primary-500 text-white rounded-2xl rounded-br-md px-4 py-3'
                  : 'bg-slate-50 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-100'
              }`}>
                {msg.role === 'user' ? (
                  <p className="text-sm">{msg.content}</p>
                ) : (
                  <div className="markdown-content text-sm">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}

                {msg.sources?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/50 space-y-1">
                    {msg.sources.map((src, j) => (
                      <div key={j} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        {src.type === 'pdf' ? (
                          <><BookOpen className="w-3 h-3" /> {src.file_name}</>
                        ) : (
                          <><Globe className="w-3 h-3" /> {src.title || src.url}</>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-slate-600" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-50 rounded-2xl px-5 py-3 border border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang suy nghĩ...
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter xuống dòng)"
              rows={1}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none resize-none text-sm max-h-32"
              style={{ minHeight: '44px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
