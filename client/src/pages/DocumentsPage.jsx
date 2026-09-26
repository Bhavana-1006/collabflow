import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, Plus, Search, Clock, Users, ArrowRight, Trash2 } from 'lucide-react';
import { documentService } from '../services/documentService';
import { useWorkspace } from '../context/WorkspaceContext';
import { useToast } from '../context/ToastContext';
import { Avatar } from '../components/common/Avatar';
import { Modal } from '../components/common/Modal';
import { DocumentEditor } from '../components/documents/DocumentEditor';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const DocumentsPage = ({ embeddedProjectId = null }) => {
  const { activeWorkspace } = useWorkspace();
  const { success, error } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const docParam = searchParams.get('doc');

  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(docParam || null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Create Doc Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('📝');
  const [submitting, setSubmitting] = useState(false);

  const fetchDocs = async () => {
    if (!activeWorkspace?._id) return;
    try {
      setLoading(true);
      const res = await documentService.getDocs(activeWorkspace._id, embeddedProjectId);
      if (res.success && res.documents) {
        setDocuments(res.documents);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [activeWorkspace?._id, embeddedProjectId]);

  useEffect(() => {
    if (docParam) {
      setSelectedDocId(docParam);
    }
  }, [docParam]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !activeWorkspace?._id) return;

    setSubmitting(true);
    try {
      const res = await documentService.createDoc({
        workspaceId: activeWorkspace._id,
        projectId: embeddedProjectId || null,
        title: title.trim(),
        icon: icon || '📝',
      });

      if (res.success && res.document) {
        setDocuments((prev) => [res.document, ...prev]);
        setSelectedDocId(res.document._id);
        success('Document Created', title);
        setTitle('');
        setIsModalOpen(false);
      }
    } catch (err) {
      error('Creation Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (e, docId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this document permanently?')) return;
    try {
      await documentService.deleteDoc(docId);
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
      if (selectedDocId === docId) setSelectedDocId(null);
      success('Document Deleted');
    } catch (err) {
      error('Delete Failed');
    }
  };

  // If a document is selected, render the full Collaborative Document Editor
  if (selectedDocId) {
    return (
      <DocumentEditor
        documentId={selectedDocId}
        workspaceId={activeWorkspace?._id}
        onBack={() => {
          setSelectedDocId(null);
          setSearchParams({});
          fetchDocs();
        }}
        onDocumentDeleted={() => {
          setSelectedDocId(null);
          fetchDocs();
        }}
      />
    );
  }

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-surface-900/80 border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-brand-400" />
            Collaborative Documents ({documents.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time live multi-user editing with markdown support and version histories
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          New Document
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search documents by title..."
          className="w-full bg-surface-900 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
        />
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton count={3} type="card" />
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-surface-900/40 rounded-2xl border border-dashed border-slate-800">
          No collaborative documents created yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc._id}
              onClick={() => setSelectedDocId(doc._id)}
              className="group p-6 rounded-2xl bg-surface-900/80 hover:bg-surface-800 border border-slate-800 hover:border-brand-500/40 transition-all cursor-pointer shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-3xl">{doc.icon || '📝'}</span>
                  <button
                    onClick={(e) => handleDelete(e, doc._id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors tracking-tight line-clamp-2">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3 font-mono">
                  {doc.content?.slice(0, 120) || 'Empty document.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Avatar
                    src={doc.lastModifiedBy?.avatar || doc.createdBy?.avatar}
                    name={doc.lastModifiedBy?.name || doc.createdBy?.name}
                    size="xs"
                  />
                  <span className="truncate max-w-[100px]">
                    {doc.lastModifiedBy?.name || doc.createdBy?.name}
                  </span>
                </div>
                <span>{new Date(doc.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Document Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Collaborative Document"
        subtitle="Start a fresh live draft with your team"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Document Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Architecture & Product Roadmap"
              className="w-full bg-surface-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Icon / Emoji
            </label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="📝"
              className="w-full bg-surface-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Document'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
