import React from 'react';
import { ClassManagement } from '../../features/classes/ClassManagement';

// Wrapper for the migrated Feature
const AdminTurmas: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <ClassManagement />
    </div>
  );
};

export default AdminTurmas;
