
import React from 'react';
import { Dumbbell } from 'lucide-react';

const GymSection: React.FC = () => (
  <div className="p-8 text-center">
    <Dumbbell className="h-16 w-16 mx-auto mb-4 text-mps-primary opacity-50" />
    <h3 className="text-2xl font-semibold text-mps-text mb-2">Programme d'Entraînement</h3>
    <p className="text-mps-text/70 mb-6">
      Suivez votre plan d'entraînement personnalisé pour atteindre vos objectifs
    </p>
    <div className="border-2 border-dashed border-mps-primary/30 rounded-lg p-8 text-mps-text/50">
      Cette section sera disponible prochainement
    </div>
  </div>
);

export default GymSection;
