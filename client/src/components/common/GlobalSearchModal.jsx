import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FolderKanban, CheckSquare, FileText, MessageSquare, File, Users, X, ArrowRight, Loader2 } from 'lucide-react';
import { searchService } from '../../services/analyticsService';
import { useWorkspace } from '../../context/WorkspaceContext';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    projects: [],
    tasks: [],
    documents: [],
    messages: [],
    files: [],
    users: [],
  });
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ projects: [], tasks: [], documents: [], messages: [], files: [], users: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults({ projects: [], tasks: [], documents: [], messages: [], files: [], users: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchService.globalSearch(activeWorkspace?._id, query);
        if (res.success && res.results) {
          setResults(res.results);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, activeWorkspace?._id]);

  if (!isOpen) return null;

  const handleSelect = (url) => {
    navigate(url);
    onClose();
  };

  const totalResultsCount =
    results.projects.length +
    results.tasks.length +
    results.documents.length +
    results.messages.length +
    results.files.length +
    results.users.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-fade-in" onClick={onClose} />

      {/* Modal box */}
      <div className="relative w-full max-w-2xl bg-surface-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-10 animate-slide-up">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3 bg-surface-950/50">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, tasks, documents, messages, teammates..."
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-base focus:outline-none"
          />
          {loading ? (
            <Loader2 className="w-5 h-5 text-brand-400 animate-spin flex-shrink-0" />
          ) : query ? (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-slate-400 bg-slate-800 rounded border border-slate-700">
              ESC
            </kbd>
          )}
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {query.trim().length >= 2 && totalResultsCount === 0 && !loading && (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm font-medium">No matches found for "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">Try searching with a different keyword</p>
            </div>
          )}

          {/* Projects */}
          {results.projects.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-brand-400" />
                Projects ({results.projects.length})
              </h5>
              <div className="space-y-1">
                {results.projects.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => handleSelect(`/projects/${p._id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || '#10b981' }} />
                      <span className="text-sm font-medium text-white group-hover:text-brand-300">{p.name}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {results.tasks.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                Tasks ({results.tasks.length})
              </h5>
              <div className="space-y-1">
                {results.tasks.map((t) => (
                  <button
                    key={t._id}
                    onClick={() => handleSelect(`/projects/${t.project?._id || t.project}?task=${t._id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-sm font-medium text-white truncate group-hover:text-brand-300">{t.title}</span>
                      {t.project?.name && (
                        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          {t.project.name}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {results.documents.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                Documents ({results.documents.length})
              </h5>
              <div className="space-y-1">
                {results.documents.map((d) => (
                  <button
                    key={d._id}
                    onClick={() => handleSelect(`/documents?doc=${d._id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span>{d.icon || '📝'}</span>
                      <span className="text-sm font-medium text-white group-hover:text-brand-300">{d.title}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {results.messages.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                Messages ({results.messages.length})
              </h5>
              <div className="space-y-1">
                {results.messages.map((m) => (
                  <button
                    key={m._id}
                    onClick={() => handleSelect(`/messages?conv=${m.conversation}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs text-brand-400 font-medium">{m.sender?.name}:</span>
                      <span className="text-sm text-slate-300 truncate">{m.text}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {results.files.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <File className="w-3.5 h-3.5 text-accent-400" />
                Files ({results.files.length})
              </h5>
              <div className="space-y-1">
                {results.files.map((f) => (
                  <button
                    key={f._id}
                    onClick={() => handleSelect('/files')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                  >
                    <span className="text-sm font-medium text-white truncate">{f.name}</span>
                    <ArrowRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Teammates / Users */}
          {results.users.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-pink-400" />
                Teammates ({results.users.length})
              </h5>
              <div className="space-y-1">
                {results.users.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => handleSelect(`/messages?direct=${u._id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold flex items-center justify-center">
                        {u.name[0]}
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-medium text-white group-hover:text-brand-300">{u.name}</span>
                        <span className="text-xs text-slate-400 block">{u.position || u.email}</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">Send message →</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
