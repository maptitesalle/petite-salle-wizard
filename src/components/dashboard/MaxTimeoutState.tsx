
import React from 'react';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface MaxTimeoutStateProps {
  refreshAttempted: boolean;
  onSessionRefresh: () => void;
  onRefresh: () => void;
}

const MaxTimeoutState: React.FC<MaxTimeoutStateProps> = ({ 
  refreshAttempted, 
  onSessionRefresh, 
  onRefresh 
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-mps-secondary/30 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-semibold text-mps-primary mb-4">Problème de chargement détecté</h2>
        <p className="mb-6">
          Le chargement de vos données prend plus de temps que prévu. Cela peut être dû à un problème de connexion ou à une erreur temporaire.
        </p>
        <div className="space-y-4">
          <Button 
            variant="default" 
            onClick={onSessionRefresh}
            className="w-full flex items-center justify-center gap-2"
            disabled={refreshAttempted}
          >
            <RefreshCcw size={16} /> Restaurer la session
          </Button>
          <Button 
            variant="default" 
            onClick={onRefresh}
            className="w-full flex items-center justify-center gap-2"
          >
            <RefreshCcw size={16} /> Rafraîchir la page
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/login')}
            className="w-full"
          >
            Retourner à la page de connexion
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MaxTimeoutState;
