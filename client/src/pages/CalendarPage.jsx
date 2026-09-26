import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { CalendarView } from '../components/calendar/CalendarView';

export const CalendarPage = () => {
  const { activeWorkspace } = useWorkspace();

  return (
    <div className="space-y-6">
      <CalendarView
        workspaceId={activeWorkspace?._id}
        workspaceMembers={activeWorkspace?.members || []}
      />
    </div>
  );
};
