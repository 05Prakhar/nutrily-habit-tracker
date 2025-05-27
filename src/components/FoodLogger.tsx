
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface FoodLoggerProps {
  onAddMeal: (meal: any) => void;
}

export const FoodLogger = ({ onAddMeal }: FoodLoggerProps) => {
  const { user } = useAuth();
  const [foodName, setFoodName] = useState("");
  const [portionSize, setPortionSize] = useState(100);
  const [mealType, setMealType] = useState("breakfast");
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddMeal = async () => {
    if (!foodName.trim() || !user) return;

    setIsLoading(true);
    
    try {
      // Save to database
      const { data, error } = await supabase
        .from('user_meals')
        .insert({
          user_id: user.id,
          name: foodName.trim(),
          calories,
          protein,
          carbs,
          fats,
          meal_date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving meal:', error);
        toast.error('Failed to save meal');
        return;
      }

      // Create meal object for local state
      const newMeal = {
        id: data.id,
        foodName: foodName.trim(),
        mealType,
        servings: 1,
        servingSize: `${portionSize}g`,
        calories,
        protein,
        carbs,
        fats,
        timestamp: new Date(data.created_at),
      };

      // Add to local state via parent callback
      onAddMeal(newMeal);

      // Reset form
      setFoodName("");
      setPortionSize(100);
      setCalories(0);
      setProtein(0);
      setCarbs(0);
      setFats(0);

      toast.success('Meal logged successfully!');
    } catch (error) {
      console.error('Error adding meal:', error);
      toast.error('Failed to save meal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Log Your Food</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="mealType">Meal Type</Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="portionSize">Portion Size (grams)</Label>
            <Input
              id="portionSize"
              type="number"
              min="1"
              value={portionSize}
              onChange={(e) => setPortionSize(parseInt(e.target.value) || 100)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="foodName">Food Name</Label>
          <Input
            id="foodName"
            placeholder="Enter food name..."
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="calories">Calories</Label>
            <Input
              id="calories"
              type="number"
              min="0"
              value={calories}
              onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="protein">Protein (g)</Label>
            <Input
              id="protein"
              type="number"
              min="0"
              step="0.1"
              value={protein}
              onChange={(e) => setProtein(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="carbs">Carbs (g)</Label>
            <Input
              id="carbs"
              type="number"
              min="0"
              step="0.1"
              value={carbs}
              onChange={(e) => setCarbs(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="fats">Fats (g)</Label>
            <Input
              id="fats"
              type="number"
              min="0"
              step="0.1"
              value={fats}
              onChange={(e) => setFats(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <Button 
          onClick={handleAddMeal}
          disabled={!foodName.trim() || isLoading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
        >
          {isLoading ? "Adding..." : "Add to Today's Log"}
        </Button>
      </div>
    </Card>
  );
};
