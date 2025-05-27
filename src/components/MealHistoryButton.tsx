
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export const MealHistoryButton = () => {
  return (
    <Link to="/meal-history">
      <Button variant="outline" className="flex items-center space-x-2">
        <Calendar className="w-4 h-4" />
        <span>Meal History</span>
      </Button>
    </Link>
  );
};
