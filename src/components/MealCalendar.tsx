
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface MealCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date | undefined) => void;
  mealDates: Date[];
}

export const MealCalendar = ({ selectedDate, onDateSelect, mealDates }: MealCalendarProps) => {
  return (
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
        onSelect={onDateSelect}
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
  );
};
