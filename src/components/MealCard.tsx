
import { format } from "date-fns";

interface MealData {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meal_type: string;
  portion_size: number;
  created_at: string;
}

interface MealCardProps {
  meal: MealData;
}

export const MealCard = ({ meal }: MealCardProps) => {
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
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-medium text-gray-900">{meal.name}</p>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getMealTypeColor(meal.meal_type)}`}>
              {meal.meal_type}
            </span>
            <p className="text-xs text-gray-500">
              {format(new Date(meal.created_at), 'h:mm a')}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900">{meal.calories} cal</p>
          <p className="text-xs text-gray-600">
            {meal.portion_size}g
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
  );
};
