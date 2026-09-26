import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  LayoutGrid,
  MessageSquare,
  FileText,
  Paperclip,
  Activity as ActivityIcon,
  Calendar,
  Users,
  Settings,
  ArrowLeft,
  Trash2,
} from 'lucide-react';
import { projectService } from '../services/projectService';
import { useWorkspace } from '../context/WorkspaceContext';
import { useToast } from '../context/ToastContext';
import { Avatar } from '../components/common/Avatar';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { ChatView } from '../components/chat/ChatView';
import { FileManager } from '../components/files/FileManager';
import { DocumentsPage } from './DocumentsPage';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const { success, error } = useToast();

  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' | 'chat' | 'docs' | 'files'
  const [loading, setLoading] = useState(true);

  const fetchProject = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const res = await projectService.getProjectById(projectId);
      if (res.success && res.project) {
        setProject(res.project);
      }
    } catch (err) {
      error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const handleDeleteProject = async () => {
    if (!window.confirm(`Permanently delete project "${project?.name}" and all related tasks?`)) return;
    try {
      await projectService.deleteProject(projectId);
      success('Project Deleted');
      navigate('/projects');
    } catch (err) {
      error('Delete Failed');
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} type="card" />;
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-bold text-white">Project Not Found</h3>
        <button
          onClick={() => navigate('/projects')}
          className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Banner & Meta Header */}
      <div className="p-6 rounded-3xl bg-surface-900/80 border border-slate-800 backdrop-blur-md shadow-2xl relative overflow-hidden">
        {project.coverImage && (
          <div className="h-28 -mx-6 -mt-6 mb-5 overflow-hidden bg-slate-950 border-b border-slate-800">
            <img src={project.coverImage} alt={project.name} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => navigate('/projects')}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Back to Projects"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <StatusBadge status={project.status} />
              <PriorityBadge priority={project.priority} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {project.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              {project.description || 'Sprint backlog and real-time collaborative task board.'}
            </p>
          </div>

          {/* Members & Actions */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {(project.members || []).map((m, i) => (
                <Avatar key={i} src={m.avatar} name={m.name} size="sm" status={m.status} showStatus />
              ))}
            </div>

            <button
              onClick={handleDeleteProject}
              className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-colors"
              title="Delete Project"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'kanban'
                ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Kanban Board
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Project Chat
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'docs'
                ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Documents
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'files'
                ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            Assets & Files
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'kanban' && (
        <KanbanBoard
          workspaceId={project.workspace}
          projectId={project._id}
          projectMembers={project.members || []}
        />
      )}

      {activeTab === 'chat' && (
        <ChatView
          workspaceId={project.workspace}
        />
      )}

      {activeTab === 'docs' && (
        <DocumentsPage embeddedProjectId={project._id} />
      )}

      {activeTab === 'files' && (
        <FileManager
          workspaceId={project.workspace}
          projectId={project._id}
        />
      )}
    </div>
  );
};
