/**
 * API utility v2.3
 * Priority:
 *   1. Runtime config (Cloud Run): window.__RUNTIME_CONFIG__.BACKEND_URL
 *   2. Build-time env (Vercel): import.meta.env.VITE_API_URL
 *   3. Empty string (local dev: Vite proxy)
 */
const API_URL =
  window.__RUNTIME_CONFIG__?.BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  '';
const BASE = `${API_URL}/api/v1`;

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    let msg;
    try { msg = JSON.parse(text).detail || text; } catch { msg = text || `Server error: ${res.status}`; }
    throw new Error(msg);
  }
  const text = await res.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return { content: text }; }
}

export const api = {
  // Tab 1: Content
  generateContent: async (data) => {
    const res = await fetch(`${BASE}/content/generate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Tab 2: Upload
  uploadPdfs: async (files) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    const res = await fetch(`${BASE}/ingestion/upload`, { method: 'POST', body: form });
    return handleResponse(res);
  },

  uploadPdfsStream: (files, onEvent) => {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      files.forEach((f) => form.append('files', f));
      fetch(`${BASE}/ingestion/upload-stream`, { method: 'POST', body: form })
        .then((res) => {
          if (!res.ok) return res.text().then((t) => {
            try { reject(new Error(JSON.parse(t).detail)); } catch { reject(new Error(t || `Error ${res.status}`)); }
          });
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          function read() {
            reader.read().then(({ done, value }) => {
              if (done) { resolve(); return; }
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n\n');
              buffer = lines.pop() || '';
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    onEvent(data);
                    if (data.step === 'done') resolve(data);
                    if (data.step === 'error') reject(new Error(data.message));
                  } catch {}
                }
              }
              read();
            }).catch(reject);
          }
          read();
        }).catch(reject);
    });
  },

  // Tab 3: Documents
  getDocuments: async () => handleResponse(await fetch(`${BASE}/documents/`)),
  getDocumentStats: async () => handleResponse(await fetch(`${BASE}/documents/stats`)),
  deleteDocument: async (id) => handleResponse(await fetch(`${BASE}/documents/${id}`, { method: 'DELETE' })),

  // Tab 4: Chat
  sendMessage: async (data) => {
    const res = await fetch(`${BASE}/chat/message`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  getChatSessions: async () => handleResponse(await fetch(`${BASE}/chat/sessions`)),
  getSessionMessages: async (sessionId) => handleResponse(await fetch(`${BASE}/chat/sessions/${sessionId}/messages`)),
  deleteSession: async (sessionId) => handleResponse(await fetch(`${BASE}/chat/sessions/${sessionId}`, { method: 'DELETE' })),
};
