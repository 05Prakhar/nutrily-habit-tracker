
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target } from "lucide-react";

interface DailyInsightsProps {
  currentTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  dailyGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export const DailyInsights = ({ currentTotals, dailyGoals }: DailyInsightsProps) => {
  const getInsights = () => {
    const insights = [];
    
    const caloriePercentage = (currentTotals.calories / dailyGoals.calories) * 100;
    const proteinPercentage = (currentTotals.protein / dailyGoals.protein) * 100;
    
    if (caloriePercentage < 50) {
      insights.push({
        icon: TrendingUp,
        color: "text-amber-600",
        bg: "bg-amber-50",
        title: "Energy Boost Needed",
        message: "You're running low on calories today. Consider a healthy snack!"
      });
    }
    
    if (proteinPercentage > 80) {
      insights.push({
        icon: Target,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        title: "Protein Goal Almost Reached!",
        message: "Great job hitting your protein target. Keep it up!"
      });
    }
    
    if (currentTotals.calories === 0) {
      insights.push({
        icon: TrendingUp,
        color: "text-blue-600",
        bg: "bg-blue-50",
        title: "Start Your Day",
        message: "Log your first meal to begin tracking your nutrition journey!"
      });
    }
    
    return insights;
  };

  const insights = getInsights();
  const remaining = {
    calories: Math.max(0, dailyGoals.calories - currentTotals.calories),
    protein: Math.max(0, dailyGoals.protein - currentTotals.protein),
    carbs: Math.max(0, dailyGoals.carbs - currentTotals.carbs),
    fats: Math.max(0, dailyGoals.fats - currentTotals.fats),
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <h3 className="font-semibold text-gray-900 mb-3">Daily Insights</h3>
        
        {insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className={`p-3 rounded-lg ${insight.bg}`}>
                <div className="flex items-start space-x-3">
                  <insight.icon className={`w-5 h-5 mt-0.5 ${insight.color}`} />
                  <div>
                    <p className={`font-medium ${insight.color}`}>{insight.title}</p>
                    <p className="text-sm text-gray-600">{insight.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-sm">Keep logging to see personalized insights!</p>
        )}
      </Card>

      <Card className="p-4 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <h3 className="font-semibold text-gray-900 mb-3">Remaining Today</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Calories:</span>
            <span className="font-medium">{remaining.calories} cal</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Protein:</span>
            <span className="font-medium">{remaining.protein}g</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Carbs:</span>
            <span className="font-medium">{remaining.carbs}g</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Fats:</span>
            <span className="font-medium">{remaining.fats}g</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
