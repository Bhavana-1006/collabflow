import React, { useState } from 'react';
import { Building2, Plus, Users, Shield, ArrowRight, Check } from 'lucide-react';
import { workspaceService } from '../services/workspaceService';
import { useWorkspace } from '../context/WorkspaceContext';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/common/Modal';

export const WorkspacesPage = () => {
  const { workspaces, activeWorkspace, setActiveWorkspace, fetchWorkspaces } = useWorkspace();
  const { success, error } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('⚡');
  const [color, setColor] = useState('#6366f1');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await workspaceService.createWorkspace({
        name: name.trim(),
        description: description.trim(),
        icon,
        color,
      });

      if (res.success && res.workspace) {
        success('Workspace Created', `"${res.workspace.name}" is ready`);
        await fetchWorkspaces();
        setActiveWorkspace(res.workspace);
        setName('');
        setDescription('');
        setIsCreateOpen(false);
      }
    } catch (err) {
      error('Creation Failed', err.response?.data?.message || 'Error creating workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-surface-900/80 border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-brand-400" />
            Your Workspaces
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Switch between workspaces or initialize a new collaboration hub for your organization
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          Create Workspace
        </button>
      </div>

      {/* Workspaces Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((ws) => {
          const isActive = activeWorkspace?._id === ws._id;

          return (
            <div
              key={ws._id}
              onClick={() => setActiveWorkspace(ws)}
              className={`group p-6 rounded-2xl border transition-all cursor-pointer shadow-sm relative flex flex-col justify-between ${
                isActive
                  ? 'bg-surface-900 border-brand-500 shadow-xl shadow-brand-500/10'
                  : 'bg-surface-900/70 hover:bg-surface-800 border-slate-800 hover:border-slate-700'
              }`}
            >
              {isActive && (
                <span className="absolute top-4 right-4 flex items-center gap-1 text-[11px] font-bold text-brand-300 bg-brand-500/20 px-2.5 py-0.5 rounded-full border border-brand-500/30">
                  <Check className="w-3 h-3" /> Active
                </span>
              )}

              <div>
                <div className="text-3xl mb-3">{ws.icon || '⚡'}</div>
                <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors tracking-tight">
                  {ws.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                  {ws.description || 'Collaboration workspace for teams.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  {ws.members?.length || 1} team members
                </span>
                <span className="text-brand-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Switch →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Workspace Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Workspace"
        subtitle="Establish an isolated collaboration environment"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Workspace Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Cloud Corp"
              className="w-full bg-surface-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Emoji Icon
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="⚡"
                className="w-full bg-surface-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Theme Accent Color
              </label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full bg-surface-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="#10b981">Emerald Green (Default)</option>
                <option value="#f59e0b">Amber Gold</option>
                <option value="#14b8a6">Teal Mint</option>
                <option value="#f97316">Warm Coral</option>
                <option value="#047857">Forest Jade</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will this workspace be used for?"
              className="w-full bg-surface-950 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
