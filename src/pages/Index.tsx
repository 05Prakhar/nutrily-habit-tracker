
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { FoodLogger } from "@/components/FoodLogger";
import { MacroRings } from "@/components/MacroRings";
import { DailyInsights } from "@/components/DailyInsights";
import { RecentMeals } from "@/components/RecentMeals";
import { DailyTargets } from "@/components/DailyTargets";
import { ProfileSetup } from "@/components/ProfileSetup";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user } = useAuth();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todaysMeals, setTodaysMeals] = useState([]);
  const [dailyGoals, setDailyGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fats: 65
  });

  useEffect(() => {
    const checkUserProfile = async () => {
      if (!user) return;

      try {
        // Check if user has daily goals set up
        const { data: goals, error } = await supabase
          .from('user_daily_goals')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // No goals found, show profile setup
          setShowProfileSetup(true);
        } else if (goals) {
          // User has goals, load them
          setDailyGoals({
            calories: goals.calories,
            protein: goals.protein,
            carbs: goals.carbs,
            fats: goals.fats
          });
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserProfile();
  }, [user]);

  useEffect(() => {
    const loadTodaysMeals = async () => {
      if (!user) return;

      try {
        const today = new Date().toISOString().split('T')[0];
        const { data: meals, error } = await supabase
          .from('user_meals')
          .select('*')
          .eq('user_id', user.id)
          .eq('meal_date', today)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading meals:', error);
          return;
        }

        // Transform database meals to match the expected format
        const transformedMeals = meals?.map((meal) => ({
          id: meal.id,
          foodName: meal.name,
          mealType: 'meal', // Since we don't store meal type in DB yet, use default
          servings: 1,
          servingSize: '100g', // Default serving size
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fats: meal.fats,
          timestamp: new Date(meal.created_at),
        })) || [];

        setTodaysMeals(transformedMeals);
      } catch (error) {
        console.error('Error loading meals:', error);
      }
    };

    loadTodaysMeals();
  }, [user]);

  const addMeal = (meal) => {
    setTodaysMeals(prev => [meal, ...prev]);
  };

  const updateDailyGoals = (goals) => {
    setDailyGoals(goals);
  };

  const getCurrentTotals = () => {
    return todaysMeals.reduce((totals, meal) => ({
      calories: totals.calories + meal.calories,
      protein: totals.protein + meal.protein,
      carbs: totals.carbs + meal.carbs,
      fats: totals.fats + meal.fats
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  const handleProfileSetupComplete = () => {
    setShowProfileSetup(false);
    // Reload goals after setup
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (showProfileSetup) {
    return <ProfileSetup onComplete={handleProfileSetupComplete} />;
  }

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
          <div className="lg:col-span-2 space-y-8">
            <FoodLogger onAddMeal={addMeal} />
            <DailyTargets dailyGoals={dailyGoals} onUpdateGoals={updateDailyGoals} />
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
