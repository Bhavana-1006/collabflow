import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  History,
  Users,
  Eye,
  Edit3,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  Clock,
  Radio,
} from 'lucide-react';
import { documentService } from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { Avatar } from '../common/Avatar';
import { Modal } from '../common/Modal';

export const DocumentEditor = ({
  documentId,
  workspaceId,
  onBack,
  onDocumentDeleted,
}) => {
  const { user } = useAuth();
  const { socket, joinDocument, leaveDocument } = useSocket();
  const { success, error, info } = useToast();

  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [remoteTypingUser, setRemoteTypingUser] = useState(null);
  const [isLiveSyncActive, setIsLiveSyncActive] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  // Version history modal state
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  const saveTimeoutRef = useRef(null);
  const remoteUpdateRef = useRef(false);

  // Fetch document
  useEffect(() => {
    if (!documentId) return;

    const fetchDoc = async () => {
      try {
        const res = await documentService.getDocById(documentId);
        if (res.success && res.document) {
          setDocument(res.document);
          setTitle(res.document.title);
          setContent(res.document.content);
        }
      } catch (err) {
        console.error('Error fetching document:', err);
      }
    };

    fetchDoc();
  }, [documentId]);

  // Real-time Collaborative Document Socket Sync
  useEffect(() => {
    if (!documentId || !socket) return;
    joinDocument(documentId);

    // Other collaborator joins
    const handleCollaboratorJoined = ({ user: joinedUser }) => {
      if (joinedUser && joinedUser.id !== user._id) {
        setCollaborators((prev) => {
          if (prev.some((u) => u.id === joinedUser.id)) return prev;
          return [...prev, joinedUser];
        });
        info('Live Collaborator', `${joinedUser.name} joined this document`);
      }
    };

    const handleCollaboratorLeft = ({ user: leftUser }) => {
      if (leftUser) {
        setCollaborators((prev) => prev.filter((u) => u.id !== leftUser.id));
      }
    };

    // Remote edits received
    const handleDocumentUpdated = ({
      documentId: dId,
      content: newContent,
      title: newTitle,
      user: editorUser,
    }) => {
      if (dId === documentId && editorUser?.id !== user._id) {
        remoteUpdateRef.current = true;
        if (newContent !== undefined) setContent(newContent);
        if (newTitle !== undefined) setTitle(newTitle);
        setRemoteTypingUser(editorUser.name);

        setTimeout(() => {
          remoteUpdateRef.current = false;
          setRemoteTypingUser(null);
        }, 1500);
      }
    };

    socket.on('document:collaborator:joined', handleCollaboratorJoined);
    socket.on('document:collaborator:left', handleCollaboratorLeft);
    socket.on('document:updated', handleDocumentUpdated);

    return () => {
      leaveDocument(documentId);
      socket.off('document:collaborator:joined', handleCollaboratorJoined);
      socket.off('document:collaborator:left', handleCollaboratorLeft);
      socket.off('document:updated', handleDocumentUpdated);
    };
  }, [documentId, socket, user._id]);

  // Handle local content change with real-time broadcast and debounced persistence
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Broadcast instant change over socket
    if (socket && documentId) {
      socket.emit('document:change', {
        documentId,
        content: newContent,
        title,
        user: { id: user._id, name: user.name, avatar: user.avatar },
      });
    }

    // Debounced save to MongoDB backend
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaving(true);
        await documentService.updateDoc(documentId, {
          content: newContent,
          title,
        });
        setSaving(false);
      } catch (err) {
        console.error('Auto-save error:', err);
        setSaving(false);
      }
    }, 1200);
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    if (socket && documentId) {
      socket.emit('document:change', {
        documentId,
        content,
        title: newTitle,
        user: { id: user._id, name: user.name },
      });
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await documentService.updateDoc(documentId, { title: newTitle, content });
      } catch (err) {}
    }, 1000);
  };

  // Open Version History
  const handleOpenVersions = async () => {
    setIsVersionModalOpen(true);
    setLoadingVersions(true);
    try {
      const res = await documentService.getVersions(documentId);
      if (res.success && res.versions) {
        setVersions(res.versions);
      }
    } catch (err) {
      error('Failed to load version history');
    } finally {
      setLoadingVersions(false);
    }
  };

  // Restore Version
  const handleRestoreVersion = async (versionId) => {
    if (!window.confirm('Restore document to this version? Current draft will be preserved as a previous version.')) return;
    try {
      const res = await documentService.restoreVersion(documentId, versionId);
      if (res.success && res.document) {
        setContent(res.document.content);
        setTitle(res.document.title);
        setIsVersionModalOpen(false);
        success('Version Restored', 'Document reverted successfully');

        // Broadcast restored content
        socket?.emit('document:change', {
          documentId,
          content: res.document.content,
          title: res.document.title,
          user: { id: user._id, name: user.name },
        });
      }
    } catch (err) {
      error('Restore Failed');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-surface-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Header Toolbar */}
      <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-surface-950/60">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <span className="text-xl flex-shrink-0">{document?.icon || '📝'}</span>

          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled Document"
            className="text-lg font-bold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-brand-500 focus:outline-none truncate w-full max-w-md transition-colors"
          />
        </div>

        {/* Live Collaborator Presence Indicators */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-surface-950/80 px-3 py-1.5 rounded-full border border-slate-800">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300">
              {collaborators.length + 1} editing live
            </span>
            <div className="flex -space-x-1.5 ml-2">
              <Avatar src={user?.avatar} name={user?.name} size="xs" />
              {collaborators.map((c, i) => (
                <Avatar key={i} src={c.avatar} name={c.name} size="xs" />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                isPreview
                  ? 'bg-brand-600 text-white border-brand-500'
                  : 'bg-surface-950/60 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="hidden sm:inline">{isPreview ? 'Edit' : 'Preview'}</span>
            </button>

            <button
              onClick={handleOpenVersions}
              className="p-2 bg-surface-950/60 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Version History & Rollback"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Versions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Remote typing banner if another user is editing */}
        {remoteTypingUser && (
          <div className="absolute top-20 right-8 z-20 px-3 py-1 bg-brand-950/90 border border-brand-500/50 rounded-full text-xs font-medium text-brand-300 shadow-xl animate-fade-in flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
            {remoteTypingUser} is typing changes...
          </div>
        )}

        {/* Textarea / Preview Container */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {isPreview ? (
            <div className="prose prose-invert max-w-3xl mx-auto space-y-4 text-slate-200">
              <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>
              <div className="whitespace-pre-wrap leading-relaxed">{content}</div>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Start drafting or collaborate live with markdown support..."
              className="w-full h-full max-w-4xl mx-auto bg-transparent text-slate-100 placeholder-slate-600 resize-none focus:outline-none text-base leading-relaxed font-mono"
            />
          )}
        </div>
      </div>

      {/* Version History Modal */}
      <Modal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        title="Document Version History"
        subtitle="View historical snapshots or restore past revisions"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-3">
          {loadingVersions ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading revisions...</div>
          ) : versions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No versions saved yet.</div>
          ) : (
            versions.map((v) => (
              <div
                key={v._id}
                className="p-4 rounded-xl bg-surface-950 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300">
                      Version {v.versionNumber}
                    </span>
                    <span className="text-xs text-slate-400">
                      by <span className="text-slate-200 font-semibold">{v.createdBy?.name}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{v.changeSummary || 'Draft update'}</p>
                  <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(v.createdAt).toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => handleRestoreVersion(v._id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/30 text-xs font-medium transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore
                </button>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};
