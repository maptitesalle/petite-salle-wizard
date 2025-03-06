
import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm text-mps-text">
        <span className="font-medium">Étape {currentStep} sur {totalSteps}</span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <div className="h-2 bg-mps-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-mps-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
