
import React from 'react';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoadingStateProps {
  showTimeout: boolean;
  refreshAttempted: boolean;
  onSessionRefresh: () => void;
  onRefresh: () => void;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  showTimeout, 
  refreshAttempted, 
  onSessionRefresh, 
  onRefresh 
}) => {
  return (
    <div className="min-h-screen bg-mps-secondary/30 flex flex-col items-center justify-center">
      <div className="animate-pulse-subtle mb-6">
        <div className="h-12 w-12 rounded-full bg-mps-primary/50 mb-4 mx-auto"></div>
        <div className="h-6 w-48 bg-mps-primary/20 mb-2 rounded"></div>
        <div className="h-4 w-64 bg-mps-primary/10 rounded"></div>
      </div>
      
      {showTimeout && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-mps-text/70 mb-2">Le chargement prend plus de temps que prévu</p>
          <Button 
            variant="default"
            onClick={onSessionRefresh}
            className="flex items-center gap-2"
            disabled={refreshAttempted}
          >
            <RefreshCcw size={16} /> Restaurer la session
          </Button>
          <Button 
            variant="outline" 
            onClick={onRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCcw size={16} /> Rafraîchir la page
          </Button>
        </div>
      )}
    </div>
  );
};

export default LoadingState;
