
import { Card } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DailyTotals } from "./DailyTotals";
import { MealCard } from "./MealCard";

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

interface MealListProps {
  selectedDate: Date;
  mealsForDate: MealData[];
  loading: boolean;
}

export const MealList = ({ selectedDate, mealsForDate, loading }: MealListProps) => {
  const getTotalNutrition = () => {
    return mealsForDate.reduce((totals, meal) => ({
      calories: totals.calories + meal.calories,
      protein: totals.protein + meal.protein,
      carbs: totals.carbs + meal.carbs,
      fats: totals.fats + meal.fats
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  const totals = getTotalNutrition();

  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Meals for {format(selectedDate, 'MMMM d, yyyy')}
      </h2>

      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <p className="text-gray-600">Loading meals...</p>
        </div>
      ) : mealsForDate.length === 0 ? (
        <div className="text-center py-8">
          <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No meals logged for this date</p>
        </div>
      ) : (
        <div className="space-y-4">
          <DailyTotals totals={totals} />
          
          <div className="space-y-3">
            {mealsForDate.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
