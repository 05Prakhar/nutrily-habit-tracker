
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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

const MealHistory = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [mealsForDate, setMealsForDate] = useState<MealData[]>([]);
  const [mealDates, setMealDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);

  // Load all dates that have meals for highlighting
  useEffect(() => {
    const loadMealDates = async () => {
      if (!user) return;

      try {
        const { data: meals, error } = await supabase
          .from('user_meals')
          .select('meal_date')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error loading meal dates:', error);
          return;
        }

        const uniqueDates = [...new Set(meals?.map(meal => meal.meal_date) || [])];
        setMealDates(uniqueDates.map(date => new Date(date)));
      } catch (error) {
        console.error('Error loading meal dates:', error);
      }
    };

    loadMealDates();
  }, [user]);

  // Load meals for selected date - Fixed to properly handle date changes
  useEffect(() => {
    const loadMealsForDate = async () => {
      if (!user || !selectedDate) return;

      console.log('Loading meals for date:', selectedDate);
      setLoading(true);
      setMealsForDate([]); // Clear previous meals immediately
      
      try {
        // Format date properly to ensure consistent comparison
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        console.log('Formatted date string:', dateString);
        
        const { data: meals, error } = await supabase
          .from('user_meals')
          .select('*')
          .eq('user_id', user.id)
          .eq('meal_date', dateString)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading meals for date:', error);
          return;
        }

        console.log('Loaded meals:', meals);
        setMealsForDate(meals || []);
      } catch (error) {
        console.error('Error loading meals for date:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMealsForDate();
  }, [user, selectedDate]); // This dependency array ensures it runs when selectedDate changes

  const getTotalNutrition = () => {
    return mealsForDate.reduce((totals, meal) => ({
      calories: totals.calories + meal.calories,
      protein: totals.protein + meal.protein,
      carbs: totals.carbs + meal.carbs,
      fats: totals.fats + meal.fats
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
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

  // Handle date selection with proper state update
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      console.log('Date selected:', date);
      setSelectedDate(date);
    }
  };

  const totals = getTotalNutrition();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Meal History
          </h1>
          <p className="text-gray-600 mt-2">
            View your historical meal logs and track your nutrition over time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Select Date</h2>
            </div>
            
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border"
              modifiers={{
                hasMeals: mealDates
              }}
              modifiersStyles={{
                hasMeals: { 
                  backgroundColor: '#10b981', 
                  color: 'white',
                  fontWeight: 'bold'
                }
              }}
            />
            
            <p className="text-sm text-gray-600 mt-4">
              <span className="inline-block w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
              Days with logged meals
            </p>
          </Card>

          {/* Meals for Selected Date */}
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
                {/* Daily Totals */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Daily Totals</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-emerald-600">{totals.calories}</span> calories
                    </div>
                    <div>
                      <span className="font-medium text-blue-600">{totals.protein}g</span> protein
                    </div>
                    <div>
                      <span className="font-medium text-amber-600">{totals.carbs}g</span> carbs
                    </div>
                    <div>
                      <span className="font-medium text-red-600">{totals.fats}g</span> fats
                    </div>
                  </div>
                </div>

                {/* Individual Meals */}
                <div className="space-y-3">
                  {mealsForDate.map((meal) => (
                    <div key={meal.id} className="border border-gray-200 rounded-lg p-3">
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
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MealHistory;
