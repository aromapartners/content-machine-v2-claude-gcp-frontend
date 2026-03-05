import { useState, useEffect } from 'react';
import { Database, Trash2, FileText, RefreshCw, HardDrive, Layers, Loader2 } from 'lucide-react';
import { api } from '../utils/api';

export default function DocumentsTab() {
  const [docs, setDocs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [docRes, statRes] = await Promise.all([api.getDocuments(), api.getDocumentStats()]);
      setDocs(docRes.documents || []);
      setStats(statRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Xóa "${name}" và toàn bộ chunks liên quan?`)) return;
    setDeleting(id);
    try {
      await api.deleteDocument(id);
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setDeleting(null);
    }
  };

  const fmtSize = (b) => {
    if (!b) return '0 B';
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

  const fmtDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tổng tài liệu', value: stats.total_documents, icon: FileText, color: 'text-primary-500 bg-primary-50' },
            { label: 'Tổng chunks', value: stats.total_chunks?.toLocaleString(), icon: Layers, color: 'text-emerald-500 bg-emerald-50' },
            { label: 'Dung lượng', value: fmtSize(stats.total_size_bytes), icon: HardDrive, color: 'text-amber-500 bg-amber-50' },
            { label: 'Hoàn tất', value: stats.completed, icon: Database, color: 'text-blue-500 bg-blue-50' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Danh sách tài liệu</h2>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Database className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">Chưa có tài liệu nào. Hãy upload PDF ở tab Upload.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {docs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{doc.file_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {fmtSize(doc.file_size)} · {doc.chunks_count} chunks · {fmtDate(doc.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${
                    doc.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                    doc.status === 'failed' ? 'bg-red-50 text-red-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {doc.status === 'completed' ? '✓ Hoàn tất' : doc.status === 'failed' ? '✕ Lỗi' : '⏳ Đang xử lý'}
                  </span>
                  <button
                    onClick={() => handleDelete(doc.id, doc.file_name)}
                    disabled={deleting === doc.id}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                  >
                    {deleting === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
