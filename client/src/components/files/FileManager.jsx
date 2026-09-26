import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  File,
  FileText,
  Image as ImageIcon,
  FileCode,
  Archive,
  Download,
  Trash2,
  Filter,
  Search,
  ExternalLink,
} from 'lucide-react';
import { fileService } from '../../services/fileService';
import { useToast } from '../../context/ToastContext';
import { Avatar } from '../common/Avatar';
import { EmptyState } from '../common/EmptyState';

const CATEGORIES = [
  { id: 'all', label: 'All Files' },
  { id: 'image', label: 'Images' },
  { id: 'pdf', label: 'PDFs' },
  { id: 'document', label: 'Documents' },
  { id: 'code', label: 'Code' },
  { id: 'archive', label: 'Archives' },
];

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const FileManager = ({ workspaceId, projectId }) => {
  const { success, error } = useToast();
  const [files, setFiles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchFiles = async () => {
    if (!workspaceId) return;
    try {
      const res = await fileService.getFiles(workspaceId, projectId, selectedCategory);
      if (res.success && res.files) {
        setFiles(res.files);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [workspaceId, projectId, selectedCategory]);

  const handleUpload = async (e) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setUploading(true);
    try {
      for (const file of uploadedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('workspaceId', workspaceId);
        if (projectId) formData.append('projectId', projectId);

        const res = await fileService.uploadFile(formData);
        if (res.success && res.file) {
          setFiles((prev) => [res.file, ...prev]);
        }
      }
      success('Upload Complete', 'Files uploaded successfully');
    } catch (err) {
      error('Upload Failed', err.response?.data?.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Delete this file permanently?')) return;
    try {
      await fileService.deleteFile(fileId);
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
      success('File Deleted');
    } catch (err) {
      error('Delete Failed');
    }
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (category) => {
    switch (category) {
      case 'image':
        return <ImageIcon className="w-6 h-6 text-pink-400" />;
      case 'pdf':
        return <FileText className="w-6 h-6 text-rose-400" />;
      case 'code':
        return <FileCode className="w-6 h-6 text-emerald-400" />;
      case 'archive':
        return <Archive className="w-6 h-6 text-amber-400" />;
      default:
        return <File className="w-6 h-6 text-brand-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone & Header */}
      <div className="p-6 rounded-2xl bg-surface-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Cloud Storage & Assets</h3>
          <p className="text-xs text-slate-400 mt-1">
            Store documents, images, and deliverables attached to your projects
          </p>
        </div>

        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleUpload}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          <UploadCloud className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload Files'}
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full bg-surface-900 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <EmptyState
          icon={UploadCloud}
          title="No files found"
          description="Upload project mockups, documentation, or deliverables to get started."
          actionLabel="Upload First File"
          onAction={() => fileInputRef.current?.click()}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file._id}
              className="group p-4 bg-surface-900/80 hover:bg-surface-800 border border-slate-800/80 hover:border-slate-700 rounded-2xl transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    {getFileIcon(file.category)}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-brand-300 rounded-lg hover:bg-slate-700"
                      title="Open / Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(file._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* File preview thumbnail if image */}
                {file.category === 'image' && file.url && (
                  <div className="mb-3 rounded-xl overflow-hidden h-28 bg-slate-950 border border-slate-800/60">
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}

                <h4 className="text-sm font-semibold text-white truncate" title={file.name}>
                  {file.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1">{formatBytes(file.size)}</p>
              </div>

              {/* Uploaded by footer */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/60 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Avatar
                    src={file.uploadedBy?.avatar}
                    name={file.uploadedBy?.name}
                    size="xs"
                  />
                  <span className="truncate max-w-[90px]">{file.uploadedBy?.name}</span>
                </div>
                <span>{new Date(file.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
