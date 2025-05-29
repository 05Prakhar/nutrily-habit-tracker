
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { MealCalendar } from "@/components/MealCalendar";
import { MealList } from "@/components/MealList";

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

  // Handle date selection with proper state update
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      console.log('Date selected:', date);
      setSelectedDate(date);
    }
  };

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
          <MealCalendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            mealDates={mealDates}
          />
          
          <MealList
            selectedDate={selectedDate}
            mealsForDate={mealsForDate}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default MealHistory;
