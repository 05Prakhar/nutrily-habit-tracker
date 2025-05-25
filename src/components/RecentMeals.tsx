
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface Meal {
  id: number;
  foodName: string;
  mealType: string;
  servings: number;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  timestamp: Date;
}

interface RecentMealsProps {
  meals: Meal[];
}

export const RecentMeals = ({ meals }: RecentMealsProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'breakfast': return 'text-amber-600 bg-amber-50';
      case 'lunch': return 'text-emerald-600 bg-emerald-50';
      case 'dinner': return 'text-blue-600 bg-blue-50';
      case 'snack': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card className="p-4 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <h3 className="font-semibold text-gray-900 mb-3">Today's Meals</h3>
      
      {meals.length === 0 ? (
        <div className="text-center py-6">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">No meals logged yet today</p>
          <p className="text-gray-500 text-xs">Start by logging your first meal!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meals.slice().reverse().map((meal) => (
            <div key={meal.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900">{meal.foodName}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getMealTypeColor(meal.mealType)}`}>
                      {meal.mealType}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(meal.timestamp)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{meal.calories} cal</p>
                  <p className="text-xs text-gray-600">
                    {meal.servings} × {meal.servingSize}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium text-blue-600">{meal.protein}g</span> protein
                </div>
                <div>
                  <span className="font-medium text-amber-600">{meal.carbs}g</span> carbs
                </div>
                <div>
                  <span className="font-medium text-red-600">{meal.fats}g</span> fats
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
