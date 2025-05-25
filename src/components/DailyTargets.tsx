
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Save } from "lucide-react";

interface DailyTargetsProps {
  dailyGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  onUpdateGoals: (goals: { calories: number; protein: number; carbs: number; fats: number }) => void;
}

export const DailyTargets = ({ dailyGoals, onUpdateGoals }: DailyTargetsProps) => {
  const [calories, setCalories] = useState(dailyGoals.calories);
  const [protein, setProtein] = useState(dailyGoals.protein);
  const [carbs, setCarbs] = useState(dailyGoals.carbs);
  const [fats, setFats] = useState(dailyGoals.fats);

  const handleSave = () => {
    onUpdateGoals({ calories, protein, carbs, fats });
  };

  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Daily Targets</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="targetCalories">Calories</Label>
            <Input
              id="targetCalories"
              type="number"
              min="0"
              value={calories}
              onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="targetProtein">Protein (g)</Label>
            <Input
              id="targetProtein"
              type="number"
              min="0"
              step="0.1"
              value={protein}
              onChange={(e) => setProtein(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="targetCarbs">Carbs (g)</Label>
            <Input
              id="targetCarbs"
              type="number"
              min="0"
              step="0.1"
              value={carbs}
              onChange={(e) => setCarbs(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="targetFats">Fats (g)</Label>
            <Input
              id="targetFats"
              type="number"
              min="0"
              step="0.1"
              value={fats}
              onChange={(e) => setFats(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <Button 
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Targets
        </Button>
      </div>
    </Card>
  );
};
