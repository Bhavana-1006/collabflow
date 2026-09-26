import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { ChatView } from '../components/chat/ChatView';

export const MessagesPage = () => {
  const { activeWorkspace } = useWorkspace();
  const [searchParams] = useSearchParams();
  const convParam = searchParams.get('conv');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight">
          Real-Time Team Messaging
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Chat in channels, send direct messages, share files, and view live typing indicators
        </p>
      </div>

      <ChatView
        workspaceId={activeWorkspace?._id}
        initialConversationId={convParam}
      />
    </div>
  );
};
