
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { searchFoods, Food } from "@/data/foodDatabase";
import { Search, Plus } from "lucide-react";

interface FoodLoggerProps {
  onAddMeal: (meal: any) => void;
}

export const FoodLogger = ({ onAddMeal }: FoodLoggerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState("breakfast");
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = searchFoods(query);
      setSearchResults(results);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const selectFood = (food: Food) => {
    setSelectedFood(food);
    setSearchQuery(food.name);
    setShowResults(false);
  };

  const calculateNutrition = (food: Food, servings: number) => ({
    calories: Math.round(food.calories * servings),
    protein: Math.round(food.protein * servings * 10) / 10,
    carbs: Math.round(food.carbs * servings * 10) / 10,
    fats: Math.round(food.fats * servings * 10) / 10,
  });

  const handleAddMeal = () => {
    if (!selectedFood) return;

    const nutrition = calculateNutrition(selectedFood, servings);
    
    onAddMeal({
      foodName: selectedFood.name,
      mealType,
      servings,
      servingSize: selectedFood.servingSize,
      ...nutrition,
    });

    // Reset form
    setSearchQuery("");
    setSelectedFood(null);
    setServings(1);
    setShowResults(false);
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
            <Label htmlFor="servings">Servings</Label>
            <Input
              id="servings"
              type="number"
              min="0.1"
              step="0.1"
              value={servings}
              onChange={(e) => setServings(parseFloat(e.target.value) || 1)}
            />
          </div>
        </div>

        <div className="relative">
          <Label htmlFor="foodSearch">Search Food</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              id="foodSearch"
              placeholder="Search for foods..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((food) => (
                <button
                  key={food.id}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  onClick={() => selectFood(food)}
                >
                  <div className="font-medium text-gray-900">{food.name}</div>
                  <div className="text-sm text-gray-600">
                    {food.calories} cal per {food.servingSize} • {food.category}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedFood && (
          <Card className="p-4 bg-gray-50 border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">{selectedFood.name}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Calories:</span>
                <div className="font-medium">{calculateNutrition(selectedFood, servings).calories}</div>
              </div>
              <div>
                <span className="text-gray-600">Protein:</span>
                <div className="font-medium">{calculateNutrition(selectedFood, servings).protein}g</div>
              </div>
              <div>
                <span className="text-gray-600">Carbs:</span>
                <div className="font-medium">{calculateNutrition(selectedFood, servings).carbs}g</div>
              </div>
              <div>
                <span className="text-gray-600">Fats:</span>
                <div className="font-medium">{calculateNutrition(selectedFood, servings).fats}g</div>
              </div>
            </div>
          </Card>
        )}

        <Button 
          onClick={handleAddMeal}
          disabled={!selectedFood}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
        >
          Add to Today's Log
        </Button>
      </div>
    </Card>
  );
};
