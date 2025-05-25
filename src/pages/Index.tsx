
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { FoodLogger } from "@/components/FoodLogger";
import { MacroRings } from "@/components/MacroRings";
import { DailyInsights } from "@/components/DailyInsights";
import { RecentMeals } from "@/components/RecentMeals";

const Index = () => {
  const [todaysMeals, setTodaysMeals] = useState([]);
  const [dailyGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fats: 65
  });

  const addMeal = (meal) => {
    const newMeal = {
      ...meal,
      id: Date.now(),
      timestamp: new Date(),
    };
    setTodaysMeals(prev => [...prev, newMeal]);
  };

  const getCurrentTotals = () => {
    return todaysMeals.reduce((totals, meal) => ({
      calories: totals.calories + meal.calories,
      protein: totals.protein + meal.protein,
      carbs: totals.carbs + meal.carbs,
      fats: totals.fats + meal.fats
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  const currentTotals = getCurrentTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* Hero Section with Macro Rings */}
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Welcome to Nutrily
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Track your nutrition effortlessly, build healthy habits, and visualize your progress with beautiful insights.
            </p>
          </div>
          
          <MacroRings currentTotals={currentTotals} dailyGoals={dailyGoals} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Food Logger - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2">
            <FoodLogger onAddMeal={addMeal} />
          </div>
          
          {/* Sidebar with insights */}
          <div className="space-y-6">
            <DailyInsights currentTotals={currentTotals} dailyGoals={dailyGoals} />
            <RecentMeals meals={todaysMeals} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
