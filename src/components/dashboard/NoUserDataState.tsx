
import React from 'react';
import { Edit } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const NoUserDataState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-mps-secondary/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl text-mps-primary">Aucune donnée disponible</CardTitle>
          <CardDescription>
            Vous devez compléter le formulaire d'information pour accéder à votre tableau de bord
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button 
            onClick={() => navigate('/wizard')}
            className="bg-mps-primary hover:bg-mps-primary/80"
          >
            <Edit className="mr-2 h-4 w-4" /> Compléter mes informations
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoUserDataState;
