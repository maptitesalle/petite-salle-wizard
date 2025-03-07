
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Utensils, Beaker, ActivitySquare, Dumbbell } from 'lucide-react';
import NutritionSection from './NutritionSection';
import SupplementsSection from './SupplementsSection';
import FlexibilitySection from './FlexibilitySection';
import GymSection from './GymSection';

const DashboardTabs: React.FC = () => {
  return (
    <Tabs defaultValue="nutrition" className="w-full">
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="nutrition" className="data-[state=active]:bg-mps-primary data-[state=active]:text-white">
          <Utensils className="mr-2 h-4 w-4" /> Nutrition
        </TabsTrigger>
        <TabsTrigger value="supplements" className="data-[state=active]:bg-mps-primary data-[state=active]:text-white">
          <Beaker className="mr-2 h-4 w-4" /> Compléments
        </TabsTrigger>
        <TabsTrigger value="flexibility" className="data-[state=active]:bg-mps-primary data-[state=active]:text-white">
          <ActivitySquare className="mr-2 h-4 w-4" /> Souplesse
        </TabsTrigger>
        <TabsTrigger value="gym" className="data-[state=active]:bg-mps-primary data-[state=active]:text-white">
          <Dumbbell className="mr-2 h-4 w-4" /> Salle
        </TabsTrigger>
      </TabsList>
      
      <Card>
        <TabsContent value="nutrition" className="mt-0">
          <NutritionSection />
        </TabsContent>
        
        <TabsContent value="supplements" className="mt-0">
          <SupplementsSection />
        </TabsContent>
        
        <TabsContent value="flexibility" className="mt-0">
          <FlexibilitySection />
        </TabsContent>
        
        <TabsContent value="gym" className="mt-0">
          <GymSection />
        </TabsContent>
      </Card>
    </Tabs>
  );
};

export default DashboardTabs;
