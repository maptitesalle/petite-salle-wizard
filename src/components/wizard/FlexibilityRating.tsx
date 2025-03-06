
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface FlexibilityRatingProps {
  name: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}

const FlexibilityRating: React.FC<FlexibilityRatingProps> = ({
  name,
  label,
  value,
  onChange
}) => {
  const handleChange = (newValue: string) => {
    onChange(parseInt(newValue, 10));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="block text-sm font-medium text-mps-text">
        {label}
      </Label>
      <RadioGroup
        id={name}
        value={value ? value.toString() : "0"}
        onValueChange={handleChange}
        className="flex space-x-2"
      >
        <div className="flex items-center space-x-1">
          <RadioGroupItem value="25" id={`${name}-faible`} />
          <Label htmlFor={`${name}-faible`} className="text-sm cursor-pointer">Faible</Label>
        </div>
        <div className="flex items-center space-x-1">
          <RadioGroupItem value="50" id={`${name}-normal`} />
          <Label htmlFor={`${name}-normal`} className="text-sm cursor-pointer">Normal</Label>
        </div>
        <div className="flex items-center space-x-1">
          <RadioGroupItem value="75" id={`${name}-excellent`} />
          <Label htmlFor={`${name}-excellent`} className="text-sm cursor-pointer">Excellent</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default FlexibilityRating;
