import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { FileManager } from '../components/files/FileManager';

export const FilesPage = () => {
  const { activeWorkspace } = useWorkspace();

  return (
    <div className="space-y-6">
      <FileManager workspaceId={activeWorkspace?._id} />
    </div>
  );
};
