import React, { useState } from 'react';
import {
  Shield,
  UserPlus,
  Trash2,
  Settings,
  Activity as ActivityIcon,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { workspaceService } from '../../services/workspaceService';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import { Avatar } from '../common/Avatar';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const AdminPanel = () => {
  const { user } = useAuth();
  const { activeWorkspace, fetchWorkspaces, currentRole } = useWorkspace();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('members');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteLoading, setInviteLoading] = useState(false);

  // Workspace Settings Form State
  const [wsName, setWsName] = useState(activeWorkspace?.name || '');
  const [wsDesc, setWsDesc] = useState(activeWorkspace?.description || '');
  const [wsIcon, setWsIcon] = useState(activeWorkspace?.icon || '⚡');
  const [savingSettings, setSavingSettings] = useState(false);

  // Delete Workspace Dialog State
  const [isDeleteWsOpen, setIsDeleteWsOpen] = useState(false);

  if (!activeWorkspace) return null;

  const isOwner = currentRole === 'owner';

  // Handle Invite
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteLoading(true);
    try {
      const res = await workspaceService.inviteMember(activeWorkspace._id, inviteEmail.trim(), inviteRole);
      if (res.success) {
        success('Invitation Sent', `${inviteEmail} added to workspace`);
        setInviteEmail('');
        setIsInviteModalOpen(false);
        fetchWorkspaces();
      }
    } catch (err) {
      error('Invite Failed', err.response?.data?.message || 'Error inviting member');
    } finally {
      setInviteLoading(false);
    }
  };

  // Handle Role Change
  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await workspaceService.updateMemberRole(activeWorkspace._id, userId, newRole);
      if (res.success) {
        success('Role Updated', `Changed role to ${newRole}`);
        fetchWorkspaces();
      }
    } catch (err) {
      error('Update Failed', err.response?.data?.message || 'Could not change role');
    }
  };

  // Handle Remove Member
  const handleRemoveMember = async (userId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from this workspace?`)) return;
    try {
      const res = await workspaceService.removeMember(activeWorkspace._id, userId);
      if (res.success) {
        success('Member Removed');
        fetchWorkspaces();
      }
    } catch (err) {
      error('Remove Failed', err.response?.data?.message || 'Could not remove member');
    }
  };

  // Handle Save Workspace Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await workspaceService.updateWorkspace(activeWorkspace._id, {
        name: wsName,
        description: wsDesc,
        icon: wsIcon,
      });
      if (res.success) {
        success('Settings Saved', 'Workspace configuration updated');
        fetchWorkspaces();
      }
    } catch (err) {
      error('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-surface-900/80 border border-slate-800 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Workspace Administration
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-bold uppercase">
                {currentRole}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage team members, roles, permissions, and settings for {activeWorkspace.name}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02]"
        >
          <UserPlus className="w-4 h-4" />
          Invite Team Member
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'members'
              ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Team Members ({activeWorkspace.members?.length || 1})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'settings'
              ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Workspace Settings
        </button>
      </div>

      {/* Tab: Members List */}
      {activeTab === 'members' && (
        <div className="rounded-2xl bg-surface-900/60 border border-slate-800 overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Position / Role</th>
                  <th className="px-6 py-3.5">Workspace Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(activeWorkspace.members || []).map((m) => {
                  const memberUser = m.user;
                  if (!memberUser) return null;
                  const isThisOwner = activeWorkspace.owner?._id === memberUser._id;

                  return (
                    <tr key={memberUser._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={memberUser.avatar}
                            name={memberUser.name}
                            size="sm"
                            status={memberUser.status}
                            showStatus
                          />
                          <div>
                            <p className="font-semibold text-white">{memberUser.name}</p>
                            <p className="text-xs text-slate-400">{memberUser.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-300">
                        {memberUser.position || 'Team Member'}
                      </td>

                      <td className="px-6 py-4">
                        {isThisOwner ? (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                            👑 Workspace Owner
                          </span>
                        ) : (
                          <select
                            value={m.role}
                            onChange={(e) => handleRoleChange(memberUser._id, e.target.value)}
                            disabled={!isOwner && currentRole !== 'admin'}
                            className="bg-surface-950 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-brand-500 capitalize"
                          >
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={memberUser.status || 'offline'} />
                      </td>

                      <td className="px-6 py-4 text-right">
                        {!isThisOwner && (
                          <button
                            onClick={() => handleRemoveMember(memberUser._id, memberUser.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                            title="Remove Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-6">
          <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-surface-900/60 border border-slate-800 space-y-4 backdrop-blur-md">
            <h4 className="text-base font-bold text-white tracking-tight">Workspace Details</h4>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Workspace Name
              </label>
              <input
                type="text"
                required
                value={wsName}
                onChange={(e) => setWsName(e.target.value)}
                className="w-full bg-surface-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Workspace Icon / Emoji
                </label>
                <input
                  type="text"
                  value={wsIcon}
                  onChange={(e) => setWsIcon(e.target.value)}
                  className="w-full bg-surface-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Created On
                </label>
                <div className="px-3.5 py-2 bg-surface-950/40 rounded-xl text-sm text-slate-400 border border-slate-800">
                  {new Date(activeWorkspace.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={wsDesc}
                onChange={(e) => setWsDesc(e.target.value)}
                className="w-full bg-surface-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all"
              >
                {savingSettings ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Team Member"
        subtitle="Add a collaborator to this workspace by email address"
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="e.g. colleague@company.com"
              className="w-full bg-surface-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Role Permission
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full bg-surface-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="admin">Admin (Can manage projects, tasks, & invite members)</option>
              <option value="member">Member (Full collaboration & editing rights)</option>
              <option value="viewer">Viewer (Read-only access)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={inviteLoading || !inviteEmail.trim()}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
            >
              {inviteLoading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
