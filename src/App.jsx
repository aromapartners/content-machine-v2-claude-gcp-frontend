import { useState } from 'react';
import { Sparkles, FileUp, Database, MessageCircle } from 'lucide-react';
import ContentTab from './components/ContentTab';
import UploadTab from './components/UploadTab';
import DocumentsTab from './components/DocumentsTab';
import ChatTab from './components/ChatTab';

const TABS = [
  { id: 'content', label: 'Tạo Content', icon: Sparkles, color: 'text-amber-500' },
  { id: 'upload', label: 'Upload PDF', icon: FileUp, color: 'text-primary-500' },
  { id: 'documents', label: 'Quản lý Data', icon: Database, color: 'text-emerald-500' },
  { id: 'chat', label: 'RAG Chat', icon: MessageCircle, color: 'text-rose-500' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('content');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">Content Machine</h1>
                <p className="text-[11px] text-slate-400 -mt-0.5">v2.3 · Gemini 3.1 Flash</p>
              </div>
            </div>

            <nav className="flex bg-slate-100 rounded-xl p-1 gap-1">
              {TABS.map(({ id, label, icon: Icon, color }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === id
                      ? 'bg-white shadow-sm text-primary-600'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activeTab === id ? color : ''}`} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/*
        ✅ ALL tabs render simultaneously using display:none/block.
        This prevents unmounting when switching tabs,
        so content generation (Tab 1) keeps running in the background.
      */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div style={{ display: activeTab === 'content' ? 'block' : 'none' }}>
          <ContentTab />
        </div>
        <div style={{ display: activeTab === 'upload' ? 'block' : 'none' }}>
          <UploadTab />
        </div>
        <div style={{ display: activeTab === 'documents' ? 'block' : 'none' }}>
          <DocumentsTab />
        </div>
        <div style={{ display: activeTab === 'chat' ? 'block' : 'none' }}>
          <ChatTab />
        </div>
      </main>
    </div>
  );
}
