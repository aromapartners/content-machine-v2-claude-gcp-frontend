import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Loader2, X, AlertTriangle } from 'lucide-react';
import { api } from '../utils/api';

const MAX_FILES = 5;

export default function UploadTab() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const fileRef = useRef(null);

  const addFiles = (newFiles) => {
    const pdfs = Array.from(newFiles).filter((f) => f.name.toLowerCase().endsWith('.pdf'));
    setFiles((prev) => [...prev, ...pdfs].slice(0, MAX_FILES));
  };

  const handleDrop = (e) => { e.preventDefault(); addFiles(e.dataTransfer.files); };
  const handleSelect = (e) => { addFiles(e.target.files); if (fileRef.current) fileRef.current.value = ''; };
  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleUpload = async () => {
    if (files.length === 0) return;
    setStatus('uploading');
    setMessage('Đang xử lý... (có thể mất vài phút)');
    setResults([]);

    try {
      // Simple upload — tương thích Vercel serverless
      const res = await api.uploadPdfs(files);
      if (res.results) {
        setResults(res.results.map((r) => ({
          name: r.file_name, ok: r.success,
          msg: r.success
            ? `✓ ${r.file_name} — ${r.chunks_count || 0} chunks`
            : `✕ ${r.file_name} — ${r.message || 'Lỗi'}`,
        })));
      }
      setStatus('done');
      setMessage(`Hoàn tất: ${res.successful || 0}/${res.total_files || files.length} files thành công` +
        (res.failed > 0 ? `, ${res.failed} thất bại` : ''));
    } catch (e) {
      setStatus('error');
      setMessage(e.message);
    }
  };

  const reset = () => {
    setFiles([]); setResults([]); setStatus('idle'); setMessage('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const fmtSize = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Upload & Xử lý PDF</h2>
        <p className="text-sm text-slate-400 mb-6">Tối đa {MAX_FILES} file PDF, mỗi file ≤ 50MB</p>

        <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            files.length > 0 ? 'border-primary-300 bg-primary-50/30' : 'border-slate-300 hover:border-primary-300 hover:bg-slate-50'
          }`}>
          <input ref={fileRef} type="file" accept=".pdf" multiple onChange={handleSelect} className="hidden" />
          {files.length === 0 ? (
            <div className="space-y-2">
              <Upload className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-slate-500 font-medium">Kéo thả file PDF hoặc click để chọn</p>
              <p className="text-sm text-slate-400">Tối đa {MAX_FILES} file, mỗi file ≤ 50MB</p>
            </div>
          ) : (
            <div className="space-y-2">
              <FileText className="w-10 h-10 mx-auto text-primary-400" />
              <p className="text-primary-600 font-medium">{files.length} file đã chọn</p>
              <p className="text-xs text-slate-400">Click để thêm file (tối đa {MAX_FILES})</p>
            </div>
          )}
        </div>

        {files.length > 0 && status === 'idle' && (
          <div className="mt-4 space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{f.name}</p>
                    <p className="text-xs text-slate-400">{fmtSize(f.size)}</p>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="p-1 text-slate-400 hover:text-red-500 rounded transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {files.length >= MAX_FILES && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg text-xs text-amber-600">
                <AlertTriangle className="w-3.5 h-3.5" /> Đã đạt giới hạn {MAX_FILES} file
              </div>
            )}
          </div>
        )}

        {status === 'uploading' && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
              <span>{message}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full animate-pulse w-2/3" />
            </div>
          </div>
        )}

        {status === 'done' && (
          <div className="mt-4 space-y-2">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span className="text-sm text-emerald-700">{message}</span>
            </div>
            {results.map((r, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${r.ok ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                {r.ok ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                <span className="truncate">{r.msg}</span>
              </div>
            ))}
          </div>
        )}

        {status === 'error' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-600">{message}</span>
          </div>
        )}

        <div className="mt-6">
          {status === 'done' || status === 'error' ? (
            <button onClick={reset} className="w-full py-3.5 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-all">
              Upload file khác
            </button>
          ) : (
            <button onClick={handleUpload} disabled={files.length === 0 || status === 'uploading'}
              className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold text-sm hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all">
              {status === 'uploading' ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...</>
                : <><Upload className="w-5 h-5" /> Upload {files.length > 0 ? `${files.length} file` : ''}</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
