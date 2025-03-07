
import React from 'react';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
  userName?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName }) => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-mps-primary">Tableau de Bord</h1>
      <p className="text-mps-text/80">
        Bienvenue {userName || 'Membre'}, voici vos recommandations personnalisées
      </p>
      
      <div className="mt-8 flex justify-end">
        <Button 
          variant="outline" 
          onClick={() => navigate('/wizard')}
          className="border-mps-primary text-mps-primary hover:bg-mps-primary/10"
        >
          <Edit className="mr-2 h-4 w-4" /> Mettre à jour mes informations
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
