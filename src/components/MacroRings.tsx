
import { Card } from "@/components/ui/card";

interface MacroRingsProps {
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

const CircularProgress = ({ percentage, color, label, current, goal, unit = "g" }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-900">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">
          {current}{unit} / {goal}{unit}
        </p>
      </div>
    </div>
  );
};

export const MacroRings = ({ currentTotals, dailyGoals }: MacroRingsProps) => {
  const macros = [
    {
      label: "Calories",
      current: currentTotals.calories,
      goal: dailyGoals.calories,
      color: "#10b981", // emerald-500
      unit: "cal"
    },
    {
      label: "Protein",
      current: currentTotals.protein,
      goal: dailyGoals.protein,
      color: "#3b82f6", // blue-500
      unit: "g"
    },
    {
      label: "Carbs",
      current: currentTotals.carbs,
      goal: dailyGoals.carbs,
      color: "#f59e0b", // amber-500
      unit: "g"
    },
    {
      label: "Fats",
      current: currentTotals.fats,
      goal: dailyGoals.fats,
      color: "#ef4444", // red-500
      unit: "g"
    }
  ];

  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <h2 className="text-xl font-semibold text-center mb-6 text-gray-900">
        Today's Progress
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {macros.map((macro) => (
          <CircularProgress
            key={macro.label}
            percentage={Math.min((macro.current / macro.goal) * 100, 100)}
            color={macro.color}
            label={macro.label}
            current={macro.current}
            goal={macro.goal}
            unit={macro.unit}
          />
        ))}
      </div>
    </Card>
  );
};
