
import React from 'react';
import { useDashboardSession } from '@/hooks/useDashboardSession';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import LoadingState from '@/components/dashboard/LoadingState';
import MaxTimeoutState from '@/components/dashboard/MaxTimeoutState';
import NoUserDataState from '@/components/dashboard/NoUserDataState';

const Dashboard = () => {
  const {
    user,
    userData,
    isLoading,
    showTimeout,
    showMaxTimeout,
    refreshAttempted,
    handleSessionRefresh,
    handleRefresh
  } = useDashboardSession();
  
  // Affichage pour le timeout maximal
  if (showMaxTimeout && isLoading) {
    return (
      <MaxTimeoutState 
        refreshAttempted={refreshAttempted}
        onSessionRefresh={handleSessionRefresh}
        onRefresh={handleRefresh}
      />
    );
  }
  
  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <LoadingState 
        showTimeout={showTimeout}
        refreshAttempted={refreshAttempted}
        onSessionRefresh={handleSessionRefresh}
        onRefresh={handleRefresh}
      />
    );
  }
  
  // Affichage si aucune donnée utilisateur
  if (!userData) {
    return <NoUserDataState />;
  }
  
  return (
    <div className="min-h-screen bg-mps-secondary/30 py-6 px-4">
      <div className="container mx-auto max-w-6xl">
        <DashboardHeader userName={user?.name} />
        <DashboardTabs />
      </div>
    </div>
  );
};

export default Dashboard;
