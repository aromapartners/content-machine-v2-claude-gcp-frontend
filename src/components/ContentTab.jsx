import { useState } from 'react';
import { Search, Facebook, Music, FileText, Image, Video, Loader2, Sparkles, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '../utils/api';

const PLATFORMS = [
  { id: 'seo', label: 'SEO Blog', desc: 'Bài viết SEO tối ưu', icon: Search },
  { id: 'facebook', label: 'Facebook', desc: 'Post thu hút tương tác', icon: Facebook },
  { id: 'tiktok', label: 'TikTok', desc: 'Kịch bản video viral', icon: Music },
];

const FORMATS = [
  { id: 'text', label: 'Text', icon: FileText },
  { id: 'image', label: 'Image', icon: Image },
  { id: 'video', label: 'Video', icon: Video },
];

export default function ContentTab() {
  const [platform, setPlatform] = useState('seo');
  const [format, setFormat] = useState('text');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await api.generateContent({ platform, format, prompt });
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Config */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          Cấu hình Content
          {loading && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-medium">
              <Loader2 className="w-3 h-3 animate-spin" /> Đang tạo...
            </span>
          )}
        </h2>

        {/* Platform */}
        <label className="text-sm font-medium text-slate-600 mb-3 block">Nền tảng</label>
        <div className="space-y-2 mb-6">
          {PLATFORMS.map(({ id, label, desc, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setPlatform(id)}
              className={`w-full flex items-center gap-4 p-3.5 rounded-xl border-2 transition-all text-left ${
                platform === id
                  ? 'border-primary-400 bg-primary-50/50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${platform === id ? 'text-primary-500' : 'text-slate-400'}`} />
              <div>
                <div className="font-semibold text-sm text-slate-800">{label}</div>
                <div className="text-xs text-slate-400">{desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Format */}
        <label className="text-sm font-medium text-slate-600 mb-3 block">Định dạng</label>
        <div className="flex gap-2 mb-6">
          {FORMATS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setFormat(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                format === id
                  ? 'border-primary-400 bg-primary-50/50 text-primary-600'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Prompt */}
        <label className="text-sm font-medium text-slate-600 mb-2 block">Yêu cầu của bạn</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Viết bài về 3 công thức áp dụng tinh dầu lavender..."
          className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none resize-none text-sm"
        />

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            ✕ {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full mt-4 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold text-sm hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {loading ? 'Đang tạo...' : 'Tạo Content'}
        </button>
      </div>

      {/* Right: Result */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Kết quả</h2>

        {!result && !loading && (
          <div className="flex flex-col items-center justify-center h-80 text-slate-400">
            <Sparkles className="w-12 h-12 mb-3 text-amber-300" />
            <p className="text-sm">Chọn cấu hình và nhập yêu cầu để bắt đầu</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center h-80">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500 mb-3" />
            <p className="text-sm text-slate-500">Đang tạo nội dung...</p>
            <p className="text-xs text-slate-400 mt-1">Bạn có thể chuyển tab — tiến trình vẫn tiếp tục</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {result.media_url && (
              <img src={result.media_url} alt="Generated" className="w-full rounded-xl shadow-sm" />
            )}

            {result.content && (
              <div className="prose prose-sm max-w-none markdown-content">
                <ReactMarkdown>{result.content}</ReactMarkdown>
              </div>
            )}

            {result.sources?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
                  <BookOpen className="w-3.5 h-3.5" /> Nguồn tham khảo
                </div>
                <div className="space-y-1">
                  {result.sources.map((s, i) => (
                    <div key={i} className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg">
                      📄 {s.file_name} <span className="text-slate-300 ml-1">(score: {s.similarity?.toFixed(2)})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
