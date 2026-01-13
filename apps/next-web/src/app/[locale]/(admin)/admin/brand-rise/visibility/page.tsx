'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';

import { JobsDashboard } from '@/components/brand-rise/visibility/JobsDashboard';
import { VisibilityPlanDetails } from '@/components/brand-rise/visibility/VisibilityPlanDetails';

const VisibilityPlanPage = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'plan_details'>('dashboard');
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>(undefined);

  const handleViewReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setCurrentView('plan_details');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedReportId(undefined);
  };

  return (
    <Box>
      {currentView === 'dashboard' ? (
        <JobsDashboard onViewReport={handleViewReport} />
      ) : (
        <VisibilityPlanDetails 
            onBack={handleBackToDashboard} 
            reportId={selectedReportId} 
        />
      )}
    </Box>
  );
};

export default VisibilityPlanPage;

